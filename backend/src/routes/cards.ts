import express from 'express';
import pool from '../db';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: any;
}

// Create card
router.post('/', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { list_id, front, front_example, back } = req.body;
    const userId = req.user.id;

    if (!list_id || !front || !back) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify ownership
    const listCheck = await pool.query(
      'SELECT user_id FROM word_lists WHERE id = $1',
      [list_id]
    );

    if (listCheck.rows.length === 0 || listCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'INSERT INTO cards (list_id, front, front_example, back) VALUES ($1, $2, $3, $4) RETURNING *',
      [list_id, front, front_example || null, back]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update card
router.put('/:id', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { front, front_example, back } = req.body;
    const userId = req.user.id;

    // Verify ownership through word list
    const cardCheck = await pool.query(
      'SELECT c.* FROM cards c JOIN word_lists wl ON c.list_id = wl.id WHERE c.id = $1 AND wl.user_id = $2',
      [id, userId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const result = await pool.query(
      'UPDATE cards SET front = $1, front_example = $2, back = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [front, front_example, back, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete card
router.delete('/:id', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const cardCheck = await pool.query(
      'SELECT c.* FROM cards c JOIN word_lists wl ON c.list_id = wl.id WHERE c.id = $1 AND wl.user_id = $2',
      [id, userId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await pool.query('DELETE FROM cards WHERE id = $1', [id]);

    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
