// 임시 플레이스홀더 이미지 생성 스크립트
// 실사진 준비 전까지 사용할, 중앙에 번호가 적힌 이미지를 생성한다.
// 실행: npm run placeholders
//
// 번호 체계 (실사진 교체 시 같은 파일명으로 덮어쓰면 됨):
//   01.png       커버 (링크 공유 썸네일 겸용) — 갤러리 마지막에도 재사용됨
//   02~09.png    갤러리 8장
//   11.png       약도
//   groom/, bride/  프로필·혼주 사진 (이름 기반, 번호 없음)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'assets', 'images');

// 파스텔 톤 배경색 순환
const COLORS = [
  { bg: '#F5E6E8', fg: '#B08A8F' }, // 연분홍
  { bg: '#E8EFF5', fg: '#8A9BB0' }, // 연하늘
  { bg: '#EFF5E8', fg: '#96AC85' }, // 연연두
  { bg: '#F5F0E6', fg: '#B0A183' }, // 연베이지
  { bg: '#EEE8F5', fg: '#9C8AB0' }, // 연보라
];

const SLOTS = [
  { file: '01.png', w: 1080, h: 1440, num: 1,  label: '커버 · 공유 썸네일' },
  ...Array.from({ length: 8 }, (_, i) => ({
    file: `${String(i + 2).padStart(2, '0')}.png`,
    w: 1080, h: 1080,
    num: i + 2,
    label: `갤러리 ${i + 1}`,
  })),
  { file: '11.png', w: 1080, h: 720, num: 11, label: '약도' },
  { file: 'groom/profile.jpg', w: 800,  h: 1000, num: 0, label: '신랑' },
  { file: 'bride/profile.jpg', w: 800,  h: 1000, num: 0, label: '신부' },
  { file: 'groom/parents.jpg', w: 1000, h: 750,  num: 0, label: '신랑측 혼주' },
  { file: 'bride/parents.jpg', w: 1000, h: 750,  num: 0, label: '신부측 혼주' },
];

function svgFor(slot, color) {
  const text = slot.num > 0 ? String(slot.num) : slot.label.slice(0, 2);
  const fontSize = Math.round(Math.min(slot.w, slot.h) * (slot.num > 0 ? 0.42 : 0.2));
  const labelSize = Math.round(Math.min(slot.w, slot.h) * 0.055);
  return `<svg width="${slot.w}" height="${slot.h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color.bg}"/>
  <text x="50%" y="50%" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
        font-weight="bold" fill="${color.fg}" text-anchor="middle" dominant-baseline="central">${text}</text>
  <text x="50%" y="${slot.h - labelSize * 1.6}" font-family="Helvetica, Arial, sans-serif" font-size="${labelSize}"
        fill="${color.fg}" text-anchor="middle">${slot.label} (${slot.w}×${slot.h})</text>
</svg>`;
}

(async () => {
  let i = 0;
  for (const slot of SLOTS) {
    const color = COLORS[i++ % COLORS.length];
    const out = path.join(ROOT, slot.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const pipeline = sharp(Buffer.from(svgFor(slot, color)));
    if (out.endsWith('.png')) await pipeline.png({ compressionLevel: 9 }).toFile(out);
    else await pipeline.jpeg({ quality: 82 }).toFile(out);
    console.log(`생성: ${path.relative(path.join(__dirname, '..'), out)}`);
  }
  console.log(`\n총 ${SLOTS.length}장 생성 완료`);
})();
