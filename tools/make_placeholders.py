"""Regenerates the temporary placeholder images. Run from the portfolio folder:  python3 tools/make_placeholders.py
Every file is a stand-in: replace it with your real asset using the same path."""
from PIL import Image, ImageDraw, ImageFont
import os
S = 3  # supersample for smooth edges
IV, SAGE, FOREST, TERRA, CHAR = (244,240,231), (168,181,160), (38,59,50), (197,139,105), (41,43,39)

def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def silhouette(path, w, h, full_body):
    im = Image.new("RGBA", (w*S, h*S), (0,0,0,0)); d = ImageDraw.Draw(im)
    fill = SAGE + (255,); shade = tuple(int(c*0.88) for c in SAGE) + (255,)
    def E(b, f=fill): d.ellipse([v*S for v in b], fill=f)
    def P(pts, f=fill): d.polygon([(x*S, y*S) for x, y in pts], fill=f)
    def R(b, r, f=fill): d.rounded_rectangle([v*S for v in b], radius=r*S, fill=f)
    cx = w*0.52
    if full_body:
        hr = w*0.085; hy = h*0.12
        E((cx-hr, hy-hr*1.15, cx+hr, hy+hr*1.15))                 # head
        R((cx-hr*0.4, hy+hr, cx+hr*0.4, hy+hr*1.9), 8)             # neck
        P([(cx-w*0.17, h*0.20), (cx+w*0.17, h*0.20), (cx+w*0.14, h*0.52), (cx-w*0.14, h*0.52)])  # torso
        R((cx-w*0.14, h*0.50, cx-w*0.005, h*0.93), 18, shade)      # legs
        R((cx+w*0.005, h*0.50, cx+w*0.14, h*0.93), 18, shade)
        R((cx-w*0.16, h*0.92, cx-w*0.0, h*0.96), 14, shade); R((cx+w*0.0, h*0.92, cx+w*0.16, h*0.96), 14, shade)
        R((cx+w*0.15, h*0.21, cx+w*0.22, h*0.52), 18)              # relaxed arm
        # presenting arm: shoulder -> elbow -> hand reaching left at name height (hand ~ x 4%, y 55%)
        d.line([(cx-w*0.15)*S, h*0.23*S, (cx-w*0.30)*S, h*0.40*S], fill=fill, width=int(w*0.075*S))
        d.line([(cx-w*0.30)*S, h*0.40*S, (cx-w*0.46)*S, h*0.55*S], fill=fill, width=int(w*0.065*S))
        E((cx-w*0.49, h*0.535, cx-w*0.43, h*0.575))
    else:
        hr = w*0.17; hy = h*0.19
        E((cx-hr, hy-hr*1.2, cx+hr, hy+hr*1.2))
        R((cx-hr*0.45, hy+hr, cx+hr*0.45, hy+hr*1.9), 14)
        P([(cx-w*0.46, h), (cx-w*0.40, h*0.50), (cx-w*0.12, h*0.44), (cx+w*0.12, h*0.44), (cx+w*0.40, h*0.50), (cx+w*0.46, h)])
    im = im.resize((w, h), Image.LANCZOS)
    d2 = ImageDraw.Draw(im); f = font(max(14, w//34))
    for i, t in enumerate(("TEMPORARY PLACEHOLDER", "replace this transparent PNG")):
        tw = d2.textlength(t, font=f); d2.text((cx-tw/2, h*(0.66 if not full_body else 0.30)+i*(w//28)), t, fill=FOREST+(255,), font=f)
    im.save(path, optimize=True)

def screenshot(path, n, tint, w=1200, h=900, label="Placeholder screenshot"):
    im = Image.new("RGB", (w, h), IV); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w, 64], fill=FOREST)
    for i in range(3): d.ellipse([28+i*30, 22, 44+i*30, 38], fill=TERRA if i == 0 else SAGE)
    d.rectangle([0, 64, 220, h], fill=tint)
    for i in range(7): d.rounded_rectangle([28, 110+i*56, 190, 130+i*56], 8, fill=IV)
    d.rounded_rectangle([270, 110, w-60, 330], 18, fill=tint)
    for i in range(3): d.rounded_rectangle([270+i*((w-330)//3), 370, 270+i*((w-330)//3)+(w-330)//3-24, 560], 14, fill=SAGE if i != 1 else TERRA)
    for i in range(4): d.rounded_rectangle([270, 600+i*50, w-60-(i*120), 620+i*50], 8, fill=(220,216,206))
    f = font(34); d.text((270, 150), f"{label} {n}", fill=FOREST, font=f)
    d.text((270, 205), "Replace with a real screenshot (same filename)", fill=CHAR, font=font(26))
    im.save(path, optimize=True)

def certificate(path, w=1754, h=1240):
    im = Image.new("RGB", (w, h), (252, 250, 245)); d = ImageDraw.Draw(im)
    d.rectangle([40, 40, w-40, h-40], outline=FOREST, width=6); d.rectangle([62, 62, w-62, h-62], outline=SAGE, width=2)
    def c(t, y, size, col=FOREST):
        f = font(size); d.text(((w-d.textlength(t, font=f))/2, y), t, fill=col, font=f)
    c("CERTIFICATE PLACEHOLDER", 220, 70); c("Replace with your internship certificate", 330, 36, CHAR)
    for y in (520, 620, 720): d.line([(w*0.2, y), (w*0.8, y)], fill=SAGE, width=3)
    d.line([(w*0.2, 1020), (w*0.4, 1020)], fill=CHAR, width=2); d.line([(w*0.6, 1020), (w*0.8, 1020)], fill=CHAR, width=2)
    d.ellipse([w/2-70, 940, w/2+70, 1080], outline=TERRA, width=6)
    im.save(path, optimize=True)

b = "assets/images"
silhouette(f"{b}/hero-portrait.png", 900, 1100, False)
silhouette(f"{b}/about-portrait.png", 800, 1500, True)
for n, t in enumerate([SAGE, (200,175,150), (150,170,160)], 1):
    screenshot(f"{b}/project-{n}/cover.png", n, t)
    for k in (1, 2): screenshot(f"{b}/project-{n}/screenshot-{k}.png", f"{n}.{k}", t, 900, 675, "Screenshot")
certificate(f"{b}/internship-certificate/certificate.png")
print("placeholders written")
