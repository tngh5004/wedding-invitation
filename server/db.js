// better-sqlite3 초기화, WAL 모드, 스키마 생성
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./config');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS rsvp (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  side         TEXT NOT NULL CHECK(side IN ('groom','bride')),
  name         TEXT NOT NULL,
  attending    TEXT NOT NULL CHECK(attending IN ('yes','no')),
  guest_count  INTEGER NOT NULL DEFAULT 1 CHECK(guest_count BETWEEN 0 AND 20),
  meal         TEXT,
  phone        TEXT,
  message      TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  ip_hash      TEXT
);

CREATE TABLE IF NOT EXISTS guestbook (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  message     TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  is_hidden   INTEGER NOT NULL DEFAULT 0,
  ip_hash     TEXT
);
CREATE INDEX IF NOT EXISTS idx_gb_created ON guestbook(created_at DESC);
`);

// DB 파일 권한 제한 (소유자만 읽기/쓰기)
try { fs.chmodSync(DB_PATH, 0o600); } catch (_) { /* 무시 */ }

module.exports = db;
