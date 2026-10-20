"""Ajoute le filigrane « JE SUIS KCCiste » dans les photos (incrusté dans le fichier).

Usage : python3 scripts/watermark-photos.py entree.jpg sortie.jpg [...]
À lancer sur les originaux non marqués (sinon le filigrane est appliqué deux fois).
"""
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

TEXT = 'JE SUIS KCCiste'
FONT = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'


def watermark(src: str, dst: str) -> None:
    im = Image.open(src).convert('RGB')
    w, h = im.size
    base = min(w, h)

    # 1. Motif diagonal très discret sur toute l'image (difficile à recadrer).
    size = max(14, int(base * 0.045))
    font = ImageFont.truetype(FONT, size)
    tile = Image.new('L', (w * 2, h * 2), 0)
    d = ImageDraw.Draw(tile)
    tw = d.textlength(TEXT, font=font)
    step_x, step_y = int(tw + size * 3), int(size * 4.2)
    for row, y in enumerate(range(0, h * 2, step_y)):
        for x in range(-step_x + (row % 2) * step_x // 2, w * 2, step_x):
            d.text((x, y), TEXT, font=font, fill=255)
    tile = tile.rotate(28, resample=Image.BICUBIC).crop((w // 2, h // 2, w // 2 + w, h // 2 + h))
    im.paste(Image.new('RGB', im.size, (255, 255, 255)), (0, 0), tile.point(lambda v: v * 34 // 255))

    # 2. Signature lisible en bas à droite.
    size = max(14, int(base * 0.038))
    font = ImageFont.truetype(FONT, size)
    d = ImageDraw.Draw(im)
    tw = d.textlength('© ' + TEXT, font=font)
    x, y = w - tw - size, h - size * 2.1
    shadow = Image.new('L', im.size, 0)
    ImageDraw.Draw(shadow).text((x, y), '© ' + TEXT, font=font, fill=200)
    im.paste(Image.new('RGB', im.size, (8, 16, 36)), (0, 0), shadow.filter(ImageFilter.GaussianBlur(size / 6)))
    gold = Image.new('L', im.size, 0)
    ImageDraw.Draw(gold).text((x, y), '© ' + TEXT, font=font, fill=235)
    im.paste(Image.new('RGB', im.size, (240, 214, 150)), (0, 0), gold)
    im.save(dst, quality=88, optimize=True, progressive=True)


if __name__ == '__main__':
    args = sys.argv[1:]
    for i in range(0, len(args), 2):
        watermark(args[i], args[i + 1])
