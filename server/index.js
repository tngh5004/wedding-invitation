// 모바일 청첩장 서버 진입점
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const { PORT } = require('./config');

const app = express();

// Cloudflare Tunnel 뒤에서 동작 — 프록시 1홉 신뢰 (rate limit의 IP 식별용)
app.set('trust proxy', 1);

app.use(helmet({
  // 같은 오리진 정적 자산만 사용하므로 기본 CSP에서 필요한 것만 완화
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", 'https://map.kakao.com', 'https://map.naver.com'],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));

app.use(express.json({ limit: '10kb' }));

// API 라우트
app.use('/api/rsvp', require('./routes/rsvp'));
app.use('/api/guestbook', require('./routes/guestbook'));

// 헬스체크
app.get('/healthz', (req, res) => res.json({ ok: true }));

// 정적 파일 (HTTP Range 자동 지원 — iOS 동영상 재생 필수)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir, {
  setHeaders(res, filePath) {
    // 이미지/영상은 장기 캐시, HTML/JSON은 짧게
    if (/\.(jpe?g|png|webp|avif|mp4|webm)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30일
    } else if (/\.(html|json)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5분
    }
  },
}));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(PORT, () => {
  console.log(`청첩장 서버 실행 중: http://localhost:${PORT}`);
});
