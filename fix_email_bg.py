from pathlib import Path
from PIL import Image
import base64

src = Path(r"C:\Users\breys\OneDrive\Desktop\Elyron\backend\src\modules\mail\correoimg\correo.png")
out = Path(r"C:\Users\breys\OneDrive\Desktop\Elyron\backend\src\modules\mail\correoimg\correo-small.jpg")

target = Path(r"C:\Users\breys\OneDrive\Desktop\Elyron\backend\src\modules\mail\email-background.ts")

img = Image.open(src).convert("RGB")
max_w = 600
w, h = img.size
if w > max_w:
    ratio = max_w / w
    img = img.resize((max_w, max(1, int(h * ratio))), Image.LANCZOS)

img.save(out, quality=72, optimize=True)

data = "data:image/jpeg;base64," + base64.b64encode(out.read_bytes()).decode("ascii")
target.write_text("export const EMAIL_BACKGROUND = '" + data + "';\n", encoding="utf-8")
print("done", out.stat().st_size, len(data))
