"""Generates assets/audio/page-flip-{1,2,3}.{mp3,ogg}: a soft, natural paper page-turn timed to the 900 ms book flip.
Layers: fibrous peel-off crackle (0-150 ms) -> soft air swish that peaks as the page passes vertical (~45%) ->
gentle paper-on-paper settle with a little rustle (~88%). No tonal thump, no hard highs.
Needs numpy + scipy + ffmpeg.  Run:  python3 tools/make_page_flip_sound.py
To use a real recording instead, replace the files (keep the names)."""
import numpy as np, subprocess, wave, os
from scipy.signal import butter, sosfilt
SR = 44100
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'audio')
DUR = 0.9

def band(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], btype='band', fs=SR, output='sos'), x)
def lowp(x, f, o=2): return sosfilt(butter(o, f, btype='low', fs=SR, output='sos'), x)
def bell(t, c, w): return np.exp(-0.5 * ((t - c) / w) ** 2)

def grain(r, n, density, smooth_hz):
    """fibrous texture: noise gated by sparse, smoothed random bursts"""
    g = (r.random(n) < density / SR) * r.random(n)
    g = lowp(g, smooth_hz, 1)
    return g / (g.max() + 1e-9)

def flip(seed):
    r = np.random.default_rng(seed); n = int(SR * DUR); t = np.arange(n) / SR
    N = lambda: r.standard_normal(n)
    j = lambda a: a * (1 + 0.12 * (r.random() - 0.5))             # per-variant timing/level variation
    # 1 peel-off: soft crackle as the page lifts from the stack
    peel = band(N(), 1200, 5200) * grain(r, n, 420, 900) * bell(t, j(0.07), 0.05) * 0.55
    # 2 swish: air moving past the sheet, bright band drifts up then down, smooth and quiet
    sw = np.zeros(n)
    for (lo, hi), c, w, g in [((350, 900), 0.30, 0.16, 0.50), ((900, 2200), 0.38, 0.14, 0.70),
                               ((2200, 4200), 0.42, 0.12, 0.45), ((4200, 6500), 0.46, 0.09, 0.18)]:
        sw += band(N(), lo, hi) * bell(t, j(c), w) * g
    sw *= 0.8 + 0.2 * lowp(r.standard_normal(n), 14, 1) / 0.25     # slow organic flutter, not a fixed LFO
    # 3 paper texture riding on the swish
    tex = band(N(), 1500, 6000) * grain(r, n, 260, 700) * bell(t, j(0.42), 0.17) * 0.30
    # 4 settle: page lays on the other page (soft, muffled slap) + small rustle
    slap = band(N(), 180, 1800) * bell(t, j(0.80), 0.014) * 1.0
    rust = band(N(), 1500, 5000) * grain(r, n, 300, 800) * bell(t, j(0.84), 0.04) * 0.30
    y = peel + sw + tex + slap + rust
    y = lowp(y, 7500, 2)                                           # take the edge off
    y *= np.minimum(1, t / 0.006) * np.minimum(1, (DUR - t) / 0.10)
    return (y / np.max(np.abs(y)) * 0.55).astype(np.float32)

os.makedirs(OUT, exist_ok=True)
for i, seed in enumerate([5, 17, 29], 1):
    y = flip(seed); wav = os.path.join(OUT, f'page-flip-{i}.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
    for ext, codec in (('mp3', ['-c:a', 'libmp3lame', '-b:a', '112k']), ('ogg', ['-c:a', 'libvorbis', '-q:a', '4'])):
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav] + codec + [os.path.join(OUT, f'page-flip-{i}.{ext}')], check=True)
    os.remove(wav)
print('done')
