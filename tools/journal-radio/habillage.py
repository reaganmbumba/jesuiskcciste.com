"""Habillage sonore original du journal (indicatif, virgule, transition, tapis, fin), synthétisé avec numpy,\ndans le style rythmé des journaux des radios d'information.

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


# Style « journal d'information » (rythmé, comme les journaux des radios d'actualité) :
# pulsation de basse, tic-tac de téléscripteur, ostinato, accords de cuivres frappés.
BPM = 124
T = 60 / BPM  # un temps
DM, SIB, FA, DO = (50, 57, 62, 65, 69), (46, 53, 58, 62, 65), (41, 53, 57, 60, 65), (48, 55, 60, 64, 67)


def scie(f, x, n=12):
    return sum(np.sin(2 * np.pi * f * h * x) / h for h in range(1, n + 1))


def cuivre(notes, d=.6, v=1.0):
    """Accord de cuivres frappé : attaque brillante, corps plus sombre."""
    x = t(d)
    s = np.zeros_like(x)
    for n in notes:
        f = note(n)
        s += scie(f, x, 14) * np.exp(-x * 9) * .6 + scie(f * 1.003, x, 5) * np.exp(-x * 2.5)
    env = np.minimum(1, x / .008) * np.minimum(1, (d - x) / .06)
    return v * s * env / len(notes)


def tic(v=.25):
    x = t(.03)
    n = rng.standard_normal(len(x))
    n = np.diff(n, prepend=0)  # aigu
    return v * n * np.exp(-x * 180)


def basse(n, d=.18, v=.8):
    x = t(d)
    f = note(n)
    s = np.sign(np.sin(2 * np.pi * f * x)) * .5 + np.sin(2 * np.pi * f * x)
    return v * s * np.exp(-x * 9) * np.minimum(1, (d - x) / .02)


def cymbale(d=2.5, v=.25):
    x = t(d)
    n = np.diff(rng.standard_normal(len(x)), prepend=0)
    return v * n * np.exp(-x * 2.2)


def montee(d=1.0, v=.4):
    """Montée de tension : souffle et sinus qui grimpent."""
    x = t(d)
    ph = 2 * np.pi * np.cumsum(200 * 2 ** (3 * x / d)) / SR
    return souffle(d, v) + v * .3 * np.sin(ph) * (x / d) ** 2


def mesures(n_mesures, accords, tics=True, ostinato=True, basse_v=.8, osti_v=.18):
    """Le moteur rythmique : basse en croches, tic-tac en doubles croches, ostinato."""
    s = np.zeros(int(n_mesures * 4 * T * SR) + SR)
    for m in range(n_mesures):
        a = accords[m % len(accords)]
        for c in range(8):  # croches
            debut = (m * 4 + c / 2) * T
            s = poser(s, basse(a[0] - 12 if c % 2 == 0 else a[0], v=basse_v), debut)
        for d in range(16):  # doubles croches
            debut = (m * 4 + d / 4) * T
            if tics:
                s = poser(s, tic(.22 if d % 4 == 0 else .12), debut)
            if ostinato:
                s = poser(s, cloche(note(a[1 + d % 3] + 12), .25, osti_v), debut)
        s = poser(s, frappe(.5, 60, .7), m * 4 * T)
        s = poser(s, frappe(.3, 80, .35), (m * 4 + 2) * T)
    return s


def indicatif():
    s = mesures(2, [DM, DM])
    s = poser(s, montee(4 * T, .45), 4 * T)
    t0 = 8 * T
    s = poser(s, cuivre(DM, 1.2, 1.3), t0)
    s = poser(s, frappe(1.5, 55, 1.2), t0)
    s = poser(s, cymbale(3.0, .3), t0)
    for i, a in enumerate((SIB, DO)):
        s = poser(s, cuivre(a, .35, 1.0), t0 + (2 + i * .75) * T)
        s = poser(s, frappe(.4, 70, .6), t0 + (2 + i * .75) * T)
    t1 = t0 + 4 * T
    s = poser(s, mesures(1, [DM], ostinato=False), t1)
    s = poser(s, cuivre(DM, 2.5, 1.4), t1 + 4 * T)
    s = poser(s, frappe(2.0, 50, 1.3), t1 + 4 * T)
    s = poser(s, cymbale(3.5, .35), t1 + 4 * T)
    s = poser(s, nappe([note(n) for n in DM], 3.0, 1.0, att=.05), t1 + 4 * T)
    return finir(reverb(s, 2.0, .18))


def virgule():
    s = np.zeros(1)
    s = poser(s, souffle(.35, .25), 0)
    s = poser(s, cuivre(DM, .45, 1.0), .35)
    s = poser(s, frappe(.6, 65, .9), .35)
    for i in range(4):
        s = poser(s, tic(.2), .35 + i * T / 4)
    return finir(reverb(s, 1.0, .15), .7)


def transition():
    s = np.zeros(1)
    s = poser(s, montee(1.0, .4), 0)
    for i, a in enumerate((SIB, DO, DM)):
        s = poser(s, cuivre(a, .3 if i < 2 else 1.0, 1.0), 1.0 + i * T / 2)
        s = poser(s, frappe(.4 if i < 2 else 1.0, 70 if i < 2 else 55, .8), 1.0 + i * T / 2)
    s = poser(s, cymbale(2.0, .25), 1.0 + T)
    return finir(reverb(s, 1.5, .18), .8)


def fin():
    s = mesures(2, [DM, SIB], osti_v=.15)
    t0 = 8 * T
    for i, a in enumerate((SIB, DO)):
        s = poser(s, cuivre(a, .4, 1.1), t0 + i * T)
        s = poser(s, frappe(.5, 70, .7), t0 + i * T)
    s = poser(s, cuivre(DM, 3.0, 1.5), t0 + 2 * T)
    s = poser(s, frappe(2.5, 45, 1.4), t0 + 2 * T)
    s = poser(s, cymbale(4.0, .35), t0 + 2 * T)
    s = poser(s, nappe([note(n) for n in DM], 4.0, 1.0, att=.05), t0 + 2 * T)
    return finir(reverb(s, 2.5, .22))


def tapis():
    """Boucle de 4 mesures sous les titres : pulsation et tic-tac, sans cuivres."""
    s = mesures(4, [DM, SIB, FA, DO], basse_v=.7, osti_v=.12)
    n = int(16 * T * SR)
    boucle = s[:n].copy()
    boucle[: len(s) - n] += s[n:]
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
