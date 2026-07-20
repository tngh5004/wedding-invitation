// rate limit 설정 — 쓰기와 읽기를 분리
const rateLimit = require('express-rate-limit');

// 쓰기: IP당 10분에 5회 (RSVP/방명록 작성)
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.' },
});

// 읽기: IP당 1분에 60회
const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.' },
});

module.exports = { writeLimiter, readLimiter };
