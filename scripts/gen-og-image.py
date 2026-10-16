"""生成站点的 og:image 分享图（1200x630 PNG）。"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
BG = (7, 8, 12)          # --c-bg dark
FG = (233, 235, 242)     # --c-fg dark
VIOLET = (155, 140, 255) # --c-violet dark
MUTED = (154, 162, 180)  # --c-fg-muted dark
SUBTLE = (107, 115, 133) # --c-fg-subtle dark

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img, "RGBA")

# 极光光晕（复用站点 Hero 的紫色氛围）
glow = Image.new("RGB", (W, H), (0, 0, 0))
gdraw = ImageDraw.Draw(glow)
gdraw.ellipse([-160, -260, 700, 420], fill=(46, 34, 120))
gdraw.ellipse([820, -180, 1480, 330], fill=(30, 44, 96))
glow = glow.filter(ImageFilter.GaussianBlur(140))
img = Image.blend(img, Image.composite(glow, img, glow.convert("L").point(lambda v: min(255, v * 2))), 0.55)
draw = ImageDraw.Draw(img, "RGBA")

# 细网格点纹（低调）
for x in range(60, W, 64):
    for y in range(60, H, 64):
        draw.ellipse([x, y, x + 2, y + 2], fill=(255, 255, 255, 14))

# 字体：微软雅黑（粗体 + 常规）
f_bold = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 150)
f_sub = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 44)
f_mono = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 30)
f_mono_s = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 26)

# 顶部 eyebrow：站点标识（中文部分用雅黑，避免豆腐块）
f_eyebrow = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 28)
draw.text((80, 84), "VOID.CLOUD 中文文档", font=f_eyebrow, fill=SUBTLE)
draw.line([(80, 138), (80 + 330, 138)], fill=VIOLET, width=3)

# 主标题：Void 字标 + 副标题
draw.text((76, 190), "Void", font=f_bold, fill=FG)
# 字标后的紫色圆点（呼应站点 Logo）
draw.ellipse([76 + 400, 268, 76 + 400 + 30, 298], fill=VIOLET)

draw.text((80, 390), "Cloudflare Workers 上的全栈框架", font=f_sub, fill=MUTED)
draw.text((80, 452), "由 Vite 驱动 · 类型从数据库查询一路贯穿到 UI", font=f_sub, fill=MUTED)

# 底部命令行装饰
draw.rounded_rectangle([80, 530, 640, 586], radius=12, outline=(255, 255, 255, 26), width=1)
draw.text((104, 544), "$ npx void init", font=f_mono_s, fill=VIOLET)

# 右侧竖向色带
draw.rectangle([W - 14, 0, W, H], fill=VIOLET)

img.save("C:/Users/bbylw/Desktop/void/public/og.png", "PNG", optimize=True)
print("saved", img.size)
