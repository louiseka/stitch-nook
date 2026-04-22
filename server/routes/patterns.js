const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function parseMaterials(raw) {
  try {
    const parsed = JSON.parse(raw);
    return { hookSize: parsed.hookSize || '', yarnWeight: parsed.yarnWeight || '', yarnColours: parsed.yarnColours || '' };
  } catch {
    // Legacy plain-text materials — treat as a note only
    return { hookSize: '', yarnWeight: '', yarnColours: raw || '' };
  }
}

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.execute(`
      SELECT p.id, p.user_id, p.title, p.author, p.difficulty, p.description, p.materials, p.created_at, u.username
      FROM patterns p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows.map(r => ({ ...r, ...parseMaterials(r.materials), user_id: Number(r.user_id), id: Number(r.id) })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.execute({
      sql: `SELECT p.*, u.username FROM patterns p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      args: [req.params.id],
    });
    if (!rows[0]) return res.status(404).json({ error: 'Pattern not found' });
    const p = rows[0];
    const mat = parseMaterials(p.materials);
    res.json({ ...p, ...mat, id: Number(p.id), user_id: Number(p.user_id) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  const { title, author, difficulty, description, instructions, instruction_terms, hookSize, yarnWeight, yarnColours } = req.body;
  if (!title || !instructions || !difficulty || !description || !hookSize || !yarnWeight || !yarnColours) {
    return res.status(400).json({ error: 'Pattern name, difficulty, description, materials and instructions are required' });
  }
  const materials = JSON.stringify({ hookSize, yarnWeight, yarnColours });
  try {
    const result = await db.execute({
      sql: `INSERT INTO patterns (user_id, title, author, difficulty, description, instructions, instruction_terms, materials)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [req.user.id, title, author || null, difficulty, description, instructions, instruction_terms || 'us', materials],
    });
    const { rows } = await db.execute({
      sql: `SELECT p.*, u.username FROM patterns p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      args: [result.lastInsertRowid],
    });
    const p = rows[0];
    const mat = parseMaterials(p.materials);
    res.status(201).json({ ...p, ...mat, id: Number(p.id), user_id: Number(p.user_id) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { rows: existing } = await db.execute({ sql: 'SELECT * FROM patterns WHERE id = ?', args: [req.params.id] });
    if (!existing[0]) return res.status(404).json({ error: 'Pattern not found' });
    if (Number(existing[0].user_id) !== req.user.id) return res.status(403).json({ error: 'Not your pattern' });

    const { title, author, difficulty, description, instructions, instruction_terms, hookSize, yarnWeight, yarnColours } = req.body;
    if (!title || !instructions || !difficulty || !description || !hookSize || !yarnWeight || !yarnColours) {
      return res.status(400).json({ error: 'Pattern name, difficulty, description, materials and instructions are required' });
    }
    const materials = JSON.stringify({ hookSize, yarnWeight, yarnColours });

    await db.execute({
      sql: `UPDATE patterns SET title=?, author=?, difficulty=?, description=?, instructions=?, instruction_terms=?, materials=?, updated_at=datetime('now') WHERE id=?`,
      args: [title, author || null, difficulty, description, instructions, instruction_terms || 'us', materials, req.params.id],
    });

    const { rows } = await db.execute({
      sql: `SELECT p.*, u.username FROM patterns p JOIN users u ON p.user_id = u.id WHERE p.id = ?`,
      args: [req.params.id],
    });
    const p = rows[0];
    const mat = parseMaterials(p.materials);
    res.json({ ...p, ...mat, id: Number(p.id), user_id: Number(p.user_id) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.execute({ sql: 'SELECT * FROM patterns WHERE id = ?', args: [req.params.id] });
    if (!rows[0]) return res.status(404).json({ error: 'Pattern not found' });
    if (Number(rows[0].user_id) !== req.user.id) return res.status(403).json({ error: 'Not your pattern' });

    await db.execute({ sql: 'DELETE FROM patterns WHERE id = ?', args: [req.params.id] });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
