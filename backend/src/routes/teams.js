import express from 'express';
import { Team } from '../models/Team.js';

const router = express.Router();

// List teams with basic info
router.get('/', async (req, res) => {
  const teams = await Team.find({}).select('name wallet maxPlayers purchases createdAt updatedAt');
  res.json(
    teams.map((t) => ({
      id: t._id,
      name: t.name,
      wallet: t.wallet,
      maxPlayers: t.maxPlayers,
      purchases: t.purchases?.length || 0,
      remainingSlots: t.remainingSlots(),
    }))
  );
});

// Get team detail
router.get('/:id', async (req, res) => {
  const t = await Team.findById(req.params.id).populate('purchases.player', 'name batch house strength photoUrl');
  if (!t) return res.status(404).json({ error: 'not found' });
  res.json(t);
});

// Create a team
router.post('/', async (req, res) => {
  try {
    const t = await Team.create(req.body);
    res.status(201).json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Update team (wallet, maxPlayers, name)
router.put('/:id', async (req, res) => {
  try {
    const allowed = (({ name, wallet, maxPlayers, code }) => ({ name, wallet, maxPlayers, code }))(req.body);
    const t = await Team.findByIdAndUpdate(req.params.id, allowed, { new: true });
    if (!t) return res.status(404).json({ error: 'not found' });
    res.json(t);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
