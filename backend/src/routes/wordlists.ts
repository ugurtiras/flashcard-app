import express from 'express';
import pool from '../db';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: any;
}

// Create word list
router.post('/', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO word_lists (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, description || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's word lists
router.get('/', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM word_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single word list with cards
router.get('/:id', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const listResult = await pool.query(
      'SELECT * FROM word_lists WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (listResult.rows.length === 0) {
      return res.status(404).json({ message: 'Word list not found' });
    }

    const cardsResult = await pool.query(
      'SELECT * FROM cards WHERE list_id = $1 ORDER BY created_at ASC',
      [id]
    );

    res.json({
      list: listResult.rows[0],
      cards: cardsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update word list
router.put('/:id', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'UPDATE word_lists SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, description, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Word list not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete word list
router.delete('/:id', verifyToken as any, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM word_lists WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Word list not found' });
    }

    res.json({ message: 'Word list deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
