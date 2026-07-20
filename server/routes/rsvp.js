// RSVP(참석여부) API
const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const { writeLimiter } = require('../middleware/rateLimit');
const { validateRsvp, isBot, ipHash } = require('../middleware/validate');

const router = express.Router();

const insertStmt = db.prepare(`
  INSERT INTO rsvp (side, name, attending, guest_count, meal, phone, message, ip_hash)
  VALUES (@side, @name, @attending, @guest_count, @meal, @phone, @message, @ip_hash)
`);

// 참석여부 등록 (공개)
router.post('/', writeLimiter, (req, res) => {
  if (isBot(req.body)) return res.json({ ok: true }); // 봇은 조용히 무시
  const { errors, value } = validateRsvp(req.body || {});
  if (errors.length) return res.status(400).json({ error: '입력값 오류', fields: errors });
  insertStmt.run({ ...value, ip_hash: ipHash(req) });
  res.status(201).json({ ok: true });
});

// 전체 명단 조회 (관리자)
router.get('/', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM rsvp ORDER BY created_at DESC').all();
  res.json({ rows });
});

// 참석 집계 (관리자)
router.get('/summary', adminAuth, (req, res) => {
  const summary = db.prepare(`
    SELECT side,
           SUM(CASE WHEN attending='yes' THEN 1 ELSE 0 END) AS attending_entries,
           SUM(CASE WHEN attending='yes' THEN guest_count ELSE 0 END) AS attending_guests,
           SUM(CASE WHEN attending='no' THEN 1 ELSE 0 END) AS not_attending
    FROM rsvp GROUP BY side
  `).all();
  res.json({ summary });
});

module.exports = router;
