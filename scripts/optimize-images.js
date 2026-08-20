// 실사진 최적화 스크립트 — 대용량 원본을 웹용으로 리사이즈·압축한다.
//
// 사용법:
//   1. media-original/ 폴더에 public/assets/images/ 와 같은 파일명으로 원본을 넣는다.
//      예) media-original/01.png (커버), media-original/02.png ~ 09.png (갤러리),
//          media-original/11.png (약도), media-original/groom/profile.jpg ...
//   2. node scripts/optimize-images.js
//   → 같은 파일명으로 public/assets/images/ 에 최적화본이 생성된다.
//
// 20MB급 PNG 원본도 폭 1600px + 압축으로 보통 1MB 안팎까지 줄어든다.
// (같은 사진이면 PNG보다 JPG 원본이 더 작게 최적화된다)
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'media-original');
const DST = path.join(__dirname, '..', 'public', 'assets', 'images');
const MAX_WIDTH = 1600;       // 모바일 청첩장에 충분한 최대 폭
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;       // palette 기반 손실 압축 (사진용)

async function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (/\.(jpe?g|png|heic|webp)$/i.test(entry.name)) out.push(p);
  }
  return out;
}

(async () => {
  if (!fs.existsSync(SRC)) {
    console.log(`원본 폴더가 없습니다: ${SRC}`);
    console.log('media-original/ 폴더를 만들고 원본 사진을 넣은 뒤 다시 실행하세요.');
    process.exit(0);
  }
  const files = await walk(SRC);
  if (!files.length) {
    console.log('처리할 이미지가 없습니다.');
    process.exit(0);
  }
  for (const file of files) {
    const rel = path.relative(SRC, file);
    const ext = path.extname(rel).toLowerCase();
    const out = path.join(DST, rel);
    fs.mkdirSync(path.dirname(out), { recursive: true });

    const pipeline = sharp(file).rotate() // EXIF 회전 반영
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.png') {
      // 사진 PNG는 palette 손실 압축으로 대폭 축소
      await pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9, palette: true }).toFile(out);
    } else {
      await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(path.join(DST, rel.replace(/\.[^.]+$/, '.jpg')));
    }

    const written = ext === '.png' ? out : path.join(DST, rel.replace(/\.[^.]+$/, '.jpg'));
    const kb = (n) => `${Math.round(fs.statSync(n).size / 1024)}KB`;
    console.log(`${rel} (${kb(file)}) → ${path.relative(path.join(__dirname, '..'), written)} (${kb(written)})`);
  }
  console.log(`\n${files.length}장 최적화 완료`);
})();
