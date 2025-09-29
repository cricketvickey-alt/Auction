import express from 'express';
import { Player } from '../models/Player.js';

const router = express.Router();

// List players (filter options: sold)
router.get('/', async (req, res) => {
  const { sold } = req.query;
  const filter = {};
  if (sold === 'true') filter.sold = true;
  if (sold === 'false') filter.sold = false;
  const players = await Player.find(filter).sort({ createdAt: 1 });
  res.json(players);
});

// Get a player
router.get('/:id', async (req, res) => {
  const p = await Player.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
});

// Create player
router.post('/', async (req, res) => {
  try {
    const p = await Player.create(req.body);
    res.status(201).json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update player
router.put('/:id', async (req, res) => {
  try {
    const p = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ error: 'not found' });
    res.json(p);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
