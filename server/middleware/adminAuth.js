// 관리자 토큰 검증 미들웨어
const crypto = require('crypto');
const { ADMIN_TOKEN } = require('../config');

module.exports = function adminAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!ADMIN_TOKEN || ADMIN_TOKEN === 'change-me-to-a-long-random-string') {
    return res.status(503).json({ error: 'ADMIN_TOKEN이 설정되지 않았습니다 (.env 확인)' });
  }
  const a = Buffer.from(token);
  const b = Buffer.from(ADMIN_TOKEN);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: '인증 실패' });
  }
  next();
};
