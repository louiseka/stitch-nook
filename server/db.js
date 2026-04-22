const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = createClient({ url: `file:${path.join(dataDir, 'patterns.db')}` });

async function initDb() {
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at    DATETIME DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS patterns (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id           INTEGER NOT NULL REFERENCES users(id),
      title             TEXT    NOT NULL,
      author            TEXT,
      difficulty        TEXT    CHECK(difficulty IN ('beginner','intermediate','advanced')),
      description       TEXT,
      instructions      TEXT    NOT NULL,
      instruction_terms TEXT    DEFAULT 'us',
      materials         TEXT,
      created_at        DATETIME DEFAULT (datetime('now')),
      updated_at        DATETIME DEFAULT (datetime('now'))
    )`,
  ], 'write');

  // Add columns for databases that existed before this migration
  try {
    await db.execute(`ALTER TABLE patterns ADD COLUMN instruction_terms TEXT DEFAULT 'us'`);
  } catch {
    // Column already exists — safe to ignore
  }
}

module.exports = { db, initDb };
