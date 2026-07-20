// 실사진 최적화 스크립트
// media-original/ 폴더의 원본 사진을 최적화해 public/assets/images/ 에 배치한다.
// 사용법:
//   1. media-original/ 아래에 public/assets/images/ 와 같은 구조로 원본을 넣는다.
//      예) media-original/gallery/01.jpg, media-original/cover.jpg
//   2. node scripts/optimize-images.js
//   → 같은 상대 경로로 public/assets/images/ 에 리사이즈·압축본이 생성된다 (jpg 유지 + webp 병행 생성).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'media-original');
const DST = path.join(__dirname, '..', 'public', 'assets', 'images');
const MAX_WIDTH = 1600;       // 모바일 청첩장에 충분한 최대 폭
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 78;

async function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(p));
    else if (/\.(jpe?g|png|heic)$/i.test(entry.name)) out.push(p);
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
    const base = rel.replace(/\.(jpe?g|png|heic)$/i, '');
    const outJpg = path.join(DST, `${base}.jpg`);
    const outWebp = path.join(DST, `${base}.webp`);
    fs.mkdirSync(path.dirname(outJpg), { recursive: true });

    const pipeline = sharp(file).rotate() // EXIF 회전 반영
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });
    await pipeline.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(outJpg);
    await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(outWebp);

    const kb = (n) => `${Math.round(fs.statSync(n).size / 1024)}KB`;
    console.log(`${rel} → ${base}.jpg (${kb(outJpg)}), ${base}.webp (${kb(outWebp)})`);
  }
  console.log(`\n${files.length}장 최적화 완료`);
})();
