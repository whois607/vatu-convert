"""Draw the app icons (run once)."""
import os
from PIL import Image, ImageDraw, ImageFont

here = os.path.dirname(os.path.abspath(__file__))
for size in (192, 512):
    im = Image.new("RGB", (size, size), "#0d1117")
    d = ImageDraw.Draw(im)
    pad = size * 0.14
    d.ellipse([pad, pad, size - pad, size - pad], outline="#3fb950", width=max(4, size // 28))
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(size * 0.42))
    except OSError:
        font = ImageFont.load_default()
    d.text((size / 2, size / 2), "Vt", fill="#e6edf3", font=font, anchor="mm")
    im.save(os.path.join(here, f"icon-{size}.png"))
print("icons written")
