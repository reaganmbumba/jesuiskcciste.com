"""Habillage sonore original du journal (indicatif, virgule, transition, tapis, fin), synthétisé avec numpy.

Usage : python habillage.py  →  habillage/*.wav (44,1 kHz, mono).
"""
import os, wave

import numpy as np

SR = 44100
rng = np.random.default_rng(1958)


def t(d):
    return np.arange(int(d * SR)) / SR


def note(n):
    """Fréquence d'une note MIDI."""
    return 440.0 * 2 ** ((n - 69) / 12)


def cloche(f, d=2.5, v=1.0):
    x = t(d)
    s = sum(a * np.sin(2 * np.pi * f * m * x) * np.exp(-x * k) for m, a, k in ((1, 1, 2.2), (2, .45, 3.5), (3, .22, 5), (4.2, .12, 7)))
    return v * s * np.minimum(1, x / .004)


def nappe(fs, d, v=1.0, att=.6):
    x = t(d)
    s = np.zeros_like(x)
    for f in fs:
        for det in (-.12, 0, .12):  # léger désaccord : effet chorus
            ff = f * 2 ** (det / 12 / 4)
            s += sum(np.sin(2 * np.pi * ff * h * x + h) / h ** 1.6 for h in range(1, 6))
    env = np.minimum(1, x / att) * np.minimum(1, (d - x) / .8)
    return v * s * env / (len(fs) * 3)


def frappe(d=1.2, f0=90, v=1.0):
    x = t(d)
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 1.5 * np.exp(-x * 30))) / SR
    return v * np.sin(ph) * np.exp(-x * 5)


def souffle(d=1.2, v=.3, monte=True):
    x = t(d)
    n = rng.standard_normal(len(x))
    spec = np.fft.rfft(n)
    fr = np.fft.rfftfreq(len(n), 1 / SR)
    spec *= np.exp(-((fr - 2500) / 2000) ** 2)
    n = np.fft.irfft(spec, len(n))
    n /= np.abs(n).max()
    env = (x / d) ** 2 if monte else np.exp(-x * 4)
    return v * n * env


def reverb(s, d=2.2, mix=.25):
    x = t(d)
    ir = rng.standard_normal(len(x)) * np.exp(-x * 3.2)
    ir[0] = 0
    n = len(s) + len(ir)
    w = np.fft.irfft(np.fft.rfft(s, n) * np.fft.rfft(ir, n), n)
    w = w / (np.abs(w).max() + 1e-9) * np.abs(s).max()
    out = np.concatenate([s, np.zeros(len(ir))])
    return (1 - mix) * out + mix * w


def poser(base, son, debut):
    i = int(debut * SR)
    fin = i + len(son)
    if fin > len(base):
        base = np.concatenate([base, np.zeros(fin - len(base))])
    base[i:fin] += son
    return base


def finir(s, crete=.89):
    s = s / np.abs(s).max() * crete
    # fondu de sortie pour éviter les clics
    k = min(len(s), int(.05 * SR))
    s[-k:] *= np.linspace(1, 0, k)
    return s


def indicatif():
    s = np.zeros(1)
    s = poser(s, frappe(1.5, 70, 1.0), 0)
    s = poser(s, souffle(.6, .25), 0)
    for i, n in enumerate((60, 64, 67, 71, 74, 79)):  # do mi sol si ré sol : accord de do majeur 9
        s = poser(s, cloche(note(n + 12), 2.2, .5), .55 + i * .13)
    s = poser(s, nappe([note(n) for n in (48, 55, 64, 71, 74)], 5.2, 1.4, att=.4), .55)
    s = poser(s, frappe(1.2, 65, .8), 1.35)
    s = poser(s, cloche(note(84), 3.0, .55), 1.35)
    s = poser(s, cloche(note(91), 3.0, .3), 1.35)
    return finir(reverb(s, 2.5, .3))


def virgule():
    s = np.zeros(1)
    s = poser(s, cloche(note(88), 1.4, .6), 0)
    s = poser(s, cloche(note(83), 1.4, .6), .14)
    s = poser(s, souffle(.25, .08, False), 0)
    return finir(reverb(s, 1.2, .25), .6)


def transition():
    s = np.zeros(1)
    s = poser(s, souffle(.9, .35), 0)
    for i, n in enumerate((67, 71, 74, 79, 83)):
        s = poser(s, cloche(note(n + 12), 1.8, .45), .7 + i * .07)
    s = poser(s, frappe(1.0, 75, .8), .95)
    s = poser(s, nappe([note(n) for n in (43, 50, 59, 62)], 2.0, 1.0, att=.1), .95)
    return finir(reverb(s, 1.8, .3), .8)


def fin():
    s = np.zeros(1)
    for i, n in enumerate((79, 74, 71, 67, 64, 60)):
        s = poser(s, cloche(note(n + 12), 2.4, .45), i * .14)
    s = poser(s, frappe(1.6, 60, 1.0), .9)
    s = poser(s, nappe([note(n) for n in (36, 48, 55, 64, 67, 72)], 5.0, 1.5, att=.2), .9)
    s = poser(s, cloche(note(84), 4.0, .5), .9)
    return finir(reverb(s, 3.0, .35))


def tapis():
    """Boucle de 16 s : do, la mineur, fa, sol, avec une pulsation douce à 90 battements par minute."""
    temps = 60 / 90
    accords = [(48, 55, 64, 67), (45, 52, 60, 64), (41, 53, 57, 60), (43, 50, 59, 62)]
    duree = 16 * temps / 4 * 4 / 4 * 4  # quatre mesures de quatre temps
    s = np.zeros(int(duree * SR) + SR * 3)
    for i, a in enumerate(accords):
        s = poser(s, nappe([note(n) for n in a], 4 * temps + .8, 1.0, att=.3), i * 4 * temps)
        s = poser(s, cloche(note(a[3] + 12), 1.5, .12), i * 4 * temps)
    for b in range(16):
        s = poser(s, frappe(.4, 55, .5 if b % 4 == 0 else .25), b * temps)
        s = poser(s, souffle(.08, .05, False), b * temps + temps / 2)
    n = int(duree * SR)
    boucle = s[:n].copy()
    boucle[: len(s) - n] += s[n:]  # la traîne revient au début : boucle sans coupure
    return boucle / np.abs(boucle).max() * .8


def ecrire(nom, s):
    os.makedirs("habillage", exist_ok=True)
    with wave.open(os.path.join("habillage", nom + ".wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(s, -1, 1) * 32767).astype("<i2").tobytes())


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    for nom, f in (("indicatif", indicatif), ("virgule", virgule), ("transition", transition), ("fin", fin), ("tapis", tapis)):
        ecrire(nom, f())
        print(nom)
