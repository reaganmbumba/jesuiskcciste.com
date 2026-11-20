import re, subprocess, unicodedata, numpy as np, soundfile as sf, torch, torchaudio
from faster_whisper import WhisperModel

def norm(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z]', '', w)
PAT = re.compile(r'^(de|d|l)?[jg]e?h?o?vah?$')

m = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=4)
segs, _ = m.transcribe("/tmp/a16.wav", language="fr", beam_size=1, vad_filter=True, word_timestamps=True, condition_on_previous_text=False)
words = [w for s in segs for w in (s.words or [])]
hits = [w for w in words if PAT.match(norm(w.word))]
print("mots", len(words), "remplacements", len(hits), flush=True)

orig, sr = sf.read("/tmp/orig.wav", dtype="float32")     # (n, 2) 44.1 kHz
a16, _ = sf.read("/tmp/a16.wav", dtype="float32")
knn = torch.hub.load('bshall/knn-vc', 'knn_vc', prematched=True, trust_repo=True, pretrained=True, device='cpu')

def piper(voice, text, out):
    subprocess.run(["piper", "-m", f"/tmp/v/fr_FR-{voice}-medium.onnx", "-f", out], input=text.encode(), check=True, capture_output=True)

def pitch(x):
    if len(x) < 1600: return 0.0
    f = torchaudio.functional.detect_pitch_frequency(torch.tensor(x)[None], 16000).squeeze().numpy()
    f = f[(f > 70) & (f < 400)]
    return float(np.median(f)) if len(f) else 0.0

for v in ("tom", "siwis"):
    piper(v, "Yahwé.", f"/tmp/src_{v}.wav")
    y, r = torchaudio.load(f"/tmp/src_{v}.wav"); torchaudio.save(f"/tmp/src_{v}16.wav", torchaudio.functional.resample(y, r, 16000), 16000)

def trim(x, thr=0.02):
    idx = np.where(np.abs(x) > thr * np.abs(x).max())[0]
    return x[idx[0]:idx[-1] + 1] if len(idx) else x

out = orig.copy(); log = []
for k, w in enumerate(hits):
    s, e = max(0, w.start - 0.03), w.end + 0.03
    i0, i1 = int(s * 16000), int(e * 16000)
    ref = np.concatenate([a16[max(0, i0 - 16000 * 8):i0], a16[i1:i1 + 16000 * 8]])
    sf.write("/tmp/ref.wav", ref, 16000)
    voice = "siwis" if pitch(a16[i0:i1]) > 165 else "tom"
    q = knn.get_features(f"/tmp/src_{voice}16.wav")
    ms = knn.get_matching_set(["/tmp/ref.wav"])
    y = knn.match(q, ms, topk=4).numpy()
    y = trim(y)
    # même durée que le mot remplacé : la suite de l'audio ne bouge pas
    L = i1 - i0
    y = torch.tensor(y)[None]
    rate = max(0.7, min(1.4, y.shape[1] / max(1, L)))
    y = torchaudio.functional.resample(y, 16000, int(round(16000 / rate))).squeeze().numpy()  # étirement simple
    y = torchaudio.functional.resample(torch.tensor(y)[None], int(round(16000 / rate)), 16000).squeeze().numpy() if False else y
    y = torch.tensor(y)[None]
    y = torchaudio.functional.resample(y, 16000, sr).squeeze().numpy()
    a0, a1 = int(s * sr), int(e * sr); n = a1 - a0
    if len(y) > n: y = y[:n]
    pad = n - len(y); y = np.pad(y, (pad // 2, pad - pad // 2))
    seg = out[a0:a1].mean(1)
    rms_o = np.sqrt((seg ** 2).mean()) + 1e-6; rms_y = np.sqrt((y ** 2).mean()) + 1e-6
    y = y * (rms_o / rms_y)
    f = int(0.025 * sr); ramp = np.linspace(0, 1, f)
    env = np.ones(n); env[:f] = ramp; env[-f:] = ramp[::-1]
    y2 = np.stack([y, y], 1)
    out[a0:a1] = out[a0:a1] * (1 - env)[:, None] + y2 * env[:, None]
    log.append(f"{int(w.start//60):02d}:{w.start%60:05.2f}  {w.word.strip()}  ({voice})")
    print(k + 1, "/", len(hits), flush=True)

sf.write("/tmp/out.wav", np.clip(out, -1, 1), sr)
open("/tmp/list.txt", "w").write("\n".join(log) + "\n")
