// 입력 검증 헬퍼 + IP 해시
const crypto = require('crypto');
const { LIMITS, IP_SALT } = require('../config');

function clean(str, maxLen) {
  if (typeof str !== 'string') return null;
  const s = str.trim();
  if (!s || s.length > maxLen) return null;
  // 제어문자 제거 (개행/탭은 허용)
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

// honeypot: 폼의 숨김 필드(website)가 채워져 있으면 봇으로 간주
function isBot(body) {
  return typeof body.website === 'string' && body.website.length > 0;
}

function ipHash(req) {
  // Cloudflare Tunnel 뒤에서는 CF-Connecting-IP 헤더가 실제 IP
  const ip = req.get('CF-Connecting-IP') || req.ip || '';
  return crypto.createHash('sha256').update(IP_SALT + ip).digest('hex').slice(0, 16);
}

function validateRsvp(body) {
  const errors = [];
  const side = ['groom', 'bride'].includes(body.side) ? body.side : null;
  const attending = ['yes', 'no'].includes(body.attending) ? body.attending : null;
  const name = clean(body.name, LIMITS.name);
  let guestCount = Number(body.guest_count);
  if (!Number.isInteger(guestCount) || guestCount < 0 || guestCount > LIMITS.guestCountMax) guestCount = null;

  if (!side) errors.push('side');
  if (!attending) errors.push('attending');
  if (!name) errors.push('name');
  if (guestCount === null) errors.push('guest_count');

  const meal = body.meal ? clean(body.meal, LIMITS.meal) : null;
  const phone = body.phone ? clean(body.phone, LIMITS.phone) : null;
  const message = body.message ? clean(body.message, LIMITS.message) : null;

  return { errors, value: { side, attending, name, guest_count: guestCount, meal, phone, message } };
}

function validateGuestbook(body) {
  const errors = [];
  const name = clean(body.name, LIMITS.name);
  const message = clean(body.message, LIMITS.message);
  if (!name) errors.push('name');
  if (!message) errors.push('message');
  return { errors, value: { name, message } };
}

module.exports = { validateRsvp, validateGuestbook, isBot, ipHash };
