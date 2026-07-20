// 임시 플레이스홀더 이미지 생성 스크립트
// 실사진 준비 전까지 사용할, 중앙에 번호(1~n)가 적힌 이미지를 생성한다.
// 실행: npm run placeholders
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

// 이미지 슬롯 정의 — content.json 이 참조하는 모든 이미지
// num: 중앙에 표시할 전역 번호(1~n), label: 하단 소형 라벨
const SLOTS = [
  { file: 'cover.jpg',            w: 1080, h: 1440, num: 1,  label: '커버' },
  { file: 'groom/profile.jpg',    w: 800,  h: 1000, num: 2,  label: '신랑' },
  { file: 'bride/profile.jpg',    w: 800,  h: 1000, num: 3,  label: '신부' },
  { file: 'groom/parents.jpg',    w: 1000, h: 750,  num: 4,  label: '신랑측 혼주' },
  { file: 'bride/parents.jpg',    w: 1000, h: 750,  num: 5,  label: '신부측 혼주' },
  { file: 'map-sketch.jpg',       w: 1080, h: 720,  num: 6,  label: '약도' },
  ...Array.from({ length: 12 }, (_, i) => ({
    file: `gallery/${String(i + 1).padStart(2, '0')}.jpg`,
    w: 1080, h: 1080,
    num: 7 + i,
    label: `갤러리 ${i + 1}`,
  })),
];

function svgFor(slot, color) {
  const fontSize = Math.round(Math.min(slot.w, slot.h) * 0.42);
  const labelSize = Math.round(Math.min(slot.w, slot.h) * 0.055);
  return `<svg width="${slot.w}" height="${slot.h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color.bg}"/>
  <text x="50%" y="50%" font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
        font-weight="bold" fill="${color.fg}" text-anchor="middle" dominant-baseline="central">${slot.num}</text>
  <text x="50%" y="${slot.h - labelSize * 1.6}" font-family="Helvetica, Arial, sans-serif" font-size="${labelSize}"
        fill="${color.fg}" text-anchor="middle">${slot.label} (${slot.w}×${slot.h})</text>
</svg>`;
}

(async () => {
  for (const slot of SLOTS) {
    const color = COLORS[(slot.num - 1) % COLORS.length];
    const out = path.join(ROOT, slot.file);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await sharp(Buffer.from(svgFor(slot, color))).jpeg({ quality: 82 }).toFile(out);
    console.log(`생성: ${path.relative(path.join(__dirname, '..'), out)} (#${slot.num})`);
  }
  console.log(`\n총 ${SLOTS.length}장 생성 완료 (번호 1~${SLOTS.length})`);
})();
