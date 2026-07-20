// 방명록 API
const express = require('express');
const db = require('../db');
const adminAuth = require('../middleware/adminAuth');
const { writeLimiter, readLimiter } = require('../middleware/rateLimit');
const { validateGuestbook, isBot, ipHash } = require('../middleware/validate');

const router = express.Router();

const insertStmt = db.prepare(
  'INSERT INTO guestbook (name, message, ip_hash) VALUES (@name, @message, @ip_hash)'
);

// 방명록 작성 (공개)
router.post('/', writeLimiter, (req, res) => {
  if (isBot(req.body)) return res.json({ ok: true });
  const { errors, value } = validateGuestbook(req.body || {});
  if (errors.length) return res.status(400).json({ error: '입력값 오류', fields: errors });
  const info = insertStmt.run({ ...value, ip_hash: ipHash(req) });
  res.status(201).json({ ok: true, id: info.lastInsertRowid });
});

// 방명록 목록 (공개, 숨김 제외, 이름+메시지+시각만 노출)
router.get('/', readLimiter, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const rows = db.prepare(`
    SELECT id, name, message, created_at FROM guestbook
    WHERE is_hidden = 0 ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?
  `).all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM guestbook WHERE is_hidden = 0').get().c;
  res.json({ rows, total, limit, offset });
});

// 방명록 숨김 (관리자, 소프트 삭제)
router.delete('/:id', adminAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) return res.status(400).json({ error: '잘못된 id' });
  const info = db.prepare('UPDATE guestbook SET is_hidden = 1 WHERE id = ?').run(id);
  res.json({ ok: true, changed: info.changes });
});

module.exports = router;
