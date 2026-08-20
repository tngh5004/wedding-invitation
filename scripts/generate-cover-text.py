# 커버 텍스트 이미지 생성
# 웹폰트(마루부리) 다운로드 전에도 첫 화면 문구가 같은 글씨체로 보이도록,
# 폰트 글리프 패스를 추출해 이미지(SVG)로 만든다.
# 실행: python3 scripts/generate-cover-text.py && node scripts/svg-to-png.js
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = os.path.join(os.path.dirname(__file__), '..')
FONT = os.path.join(ROOT, 'public/assets/fonts/MaruBuri-SemiBold.woff2')
OUT_SVG = os.path.join(ROOT, 'public/assets/images/cover-text.svg')

# (텍스트, 폰트크기(px, @2x), 색상, 자간(em))
LINES = [
    ('김수호♥홍소연', 69, '#31352f', 0.10),
    ('두 사람, 결혼합니다', 58, '#31352f', 0.06),
    ('2026년 12월 19일 토요일 낮 12시', 50, '#7d837a', 0.02),
    ('경기교총웨딩하우스', 50, '#7d837a', 0.02),
]
WIDTH = 860           # frame 430px 의 2배 (레티나)
PAD_TOP, PAD_BOTTOM = 70, 84
GAP = [22, 30, 18]    # 줄 사이 간격

font = TTFont(FONT)
cmap = font.getBestCmap()
glyph_set = font.getGlyphSet()
upem = font['head'].unitsPerEm
ascent = font['hhea'].ascent / upem
descent = abs(font['hhea'].descent) / upem


def line_paths(text, size, spacing_em):
    """텍스트 한 줄 → (path 목록, 총 폭). path 좌표는 px, y는 baseline 기준 아래가 +."""
    scale = size / upem
    spacing = size * spacing_em
    x = 0.0
    paths = []
    for ch in text:
        if ch == ' ':
            x += size * 0.30 + spacing
            continue
        gname = cmap[ord(ch)]
        glyph = glyph_set[gname]
        pen = SVGPathPen(glyph_set)
        glyph.draw(pen)
        d = pen.getCommands()
        if d:
            paths.append((d, x, ch))
        x += glyph.width * scale + spacing
    return paths, x - spacing, scale


parts = []
y = PAD_TOP
for i, (text, size, color, spacing) in enumerate(LINES):
    paths, width, scale = line_paths(text, size, spacing)
    baseline = y + ascent * size
    offset_x = (WIDTH - width) / 2
    for d, gx, ch in paths:
        # 글리프 좌표계(y 위가 +, unitsPerEm) → SVG 픽셀 좌표(y 아래가 +)
        fill = 'hotpink' if ch == '♥' else color  # 하트는 핫핑크
        parts.append(
            f'<path transform="translate({offset_x + gx:.1f},{baseline:.1f}) scale({scale:.6f},{-scale:.6f})" '
            f'fill="{fill}" d="{d}"/>'
        )
    y = baseline + descent * size + (GAP[i] if i < len(GAP) else 0)

HEIGHT = int(y + PAD_BOTTOM)
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" '
    f'viewBox="0 0 {WIDTH} {HEIGHT}">'
    f'<rect width="100%" height="100%" fill="#ffffff"/>' + ''.join(parts) + '</svg>'
)
with open(OUT_SVG, 'w', encoding='utf-8') as fp:
    fp.write(svg)
print(f'생성: {os.path.relpath(OUT_SVG, ROOT)} ({WIDTH}x{HEIGHT})')
