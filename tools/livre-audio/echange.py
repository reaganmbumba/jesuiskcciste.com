"""Échange chiffré entre Claude et le serveur GitHub qui fabrique les voix du livre.

Le livre « Le KCCisme » est protégé par un code : son texte ne doit jamais apparaître en
clair dans le dépôt (public). Le serveur crée donc une clé à usage unique, publie sa partie
publique, attend le texte chiffré pour cette clé, fabrique les voix, puis renvoie chaque
chapitre chiffré avec la même clé de session.

  serveur : python echange.py serveur BRANCHE      (lancé par .github/workflows/livre-audio.yml)
  client  : python echange.py chiffrer CLE_SERVEUR.txt narration.json texte.enc cle-client.bin
            python echange.py dechiffrer cle-client.bin CLE_SERVEUR.txt dossier-sortie/ dossier-mp3/
"""
import asyncio, base64, gzip, io, json, os, subprocess, sys, tarfile, time

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey, X25519PublicKey
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

ICI = os.path.dirname(os.path.abspath(__file__))
ECH = os.path.join(ICI, "echange")
VOIX = {"LUI": ["fr-FR-RemyMultilingualNeural", "fr-FR-HenriNeural"],
        "ELLE": ["fr-FR-VivienneMultilingualNeural", "fr-FR-DeniseNeural"]}
RAW = serialization.Encoding.Raw, serialization.PublicFormat.Raw


def cle_session(prive: X25519PrivateKey, publique_b64: str) -> bytes:
    commun = prive.exchange(X25519PublicKey.from_public_bytes(base64.b64decode(publique_b64)))
    return HKDF(hashes.SHA256(), 32, None, b"livre-audio-kccisme").derive(commun)


def sceller(cle: bytes, donnees: bytes) -> bytes:
    iv = os.urandom(12)
    return iv + AESGCM(cle).encrypt(iv, donnees, None)


def ouvrir(cle: bytes, blob: bytes) -> bytes:
    return AESGCM(cle).decrypt(blob[:12], blob[12:], None)


def git(*args, capture=False):
    r = subprocess.run(["git", *args], check=True, capture_output=capture)
    return r.stdout if capture else None


def pousser(branche, message):
    git("add", ECH)
    git("commit", "-q", "-m", message)
    for _ in range(5):
        try:
            git("pull", "-q", "--rebase", "origin", branche)
            git("push", "-q", "origin", f"HEAD:{branche}")
            return
        except subprocess.CalledProcessError:
            time.sleep(5)
    raise RuntimeError("push impossible")


async def dire(texte, qui, sortie, sem):
    import edge_tts
    async with sem:
        for essai in range(4):
            for voix in VOIX[qui]:
                try:
                    await edge_tts.Communicate(texte, voix, rate="-4%").save(sortie)
                    if os.path.getsize(sortie) > 1000:
                        return
                except Exception as e:
                    print(f"{voix} : {e}", file=sys.stderr)
            await asyncio.sleep(3 + 5 * essai)
        raise RuntimeError(f"aucune voix pour : {texte[:60]}")


def serveur(branche):
    run = os.environ.get("GITHUB_RUN_ID", "local")
    prive = X25519PrivateKey.generate()
    os.makedirs(ECH, exist_ok=True)
    pub = base64.b64encode(prive.public_key().public_bytes(*RAW)).decode()
    open(os.path.join(ECH, f"cle-serveur-{run}.txt"), "w").write(pub + "\n")
    pousser(branche, f"Livre audio : clé publique du serveur ({run})")
    print("clé publique publiée, attente du texte chiffré…", flush=True)
    chemin = f"tools/livre-audio/echange/texte-{run}.enc"
    fin = time.time() + 45 * 60
    while time.time() < fin:
        git("fetch", "-q", "origin", branche)
        try:
            blob = json.loads(git("show", f"FETCH_HEAD:{chemin}", capture=True))
            break
        except subprocess.CalledProcessError:
            time.sleep(15)
    else:
        raise SystemExit("texte chiffré jamais reçu")
    git("pull", "-q", "--rebase", "origin", branche)
    cle = cle_session(prive, blob["client"])
    chapitres = json.loads(gzip.decompress(ouvrir(cle, base64.b64decode(blob["data"]))))
    sortie = os.path.join(ECH, f"sortie-{run}")
    os.makedirs(sortie, exist_ok=True)
    travail = "/tmp/voix"
    os.makedirs(travail, exist_ok=True)

    async def tout():
        sem = asyncio.Semaphore(4)
        for ch in chapitres:
            d = os.path.join(travail, ch["id"])
            os.makedirs(d, exist_ok=True)
            await asyncio.gather(*[dire(s["texte"], s["voix"], os.path.join(d, f"{i:03d}.mp3"), sem) for i, s in enumerate(ch["segments"])])
            tampon = io.BytesIO()
            with tarfile.open(fileobj=tampon, mode="w") as tar:
                tar.add(d, arcname=ch["id"])
            open(os.path.join(sortie, ch["id"] + ".enc"), "wb").write(sceller(cle, tampon.getvalue()))
            print("chapitre prêt :", ch["id"], flush=True)

    asyncio.run(tout())
    open(os.path.join(sortie, "FINI"), "w").write("ok\n")
    pousser(branche, f"Livre audio : voix chiffrées ({run})")


def chiffrer(cle_serveur, narration, sortie, cle_client):
    prive = X25519PrivateKey.generate()
    open(cle_client, "wb").write(prive.private_bytes(serialization.Encoding.Raw, serialization.PrivateFormat.Raw, serialization.NoEncryption()))
    cle = cle_session(prive, open(cle_serveur).read().strip())
    donnees = gzip.compress(open(narration, "rb").read())
    blob = {"client": base64.b64encode(prive.public_key().public_bytes(*RAW)).decode(),
            "data": base64.b64encode(sceller(cle, donnees)).decode()}
    json.dump(blob, open(sortie, "w"))


def dechiffrer(cle_client, cle_serveur, dossier, cible):
    prive = X25519PrivateKey.from_private_bytes(open(cle_client, "rb").read())
    cle = cle_session(prive, open(cle_serveur).read().strip())
    os.makedirs(cible, exist_ok=True)
    for f in sorted(os.listdir(dossier)):
        if f.endswith(".enc"):
            with tarfile.open(fileobj=io.BytesIO(ouvrir(cle, open(os.path.join(dossier, f), "rb").read()))) as tar:
                tar.extractall(cible, filter="data")
            print(f)


if __name__ == "__main__":
    {"serveur": serveur, "chiffrer": chiffrer, "dechiffrer": dechiffrer}[sys.argv[1]](*sys.argv[2:])
