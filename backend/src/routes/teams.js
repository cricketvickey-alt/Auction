import express from 'express';
import { Team } from '../models/Team.js';

const router = express.Router();

// List teams with basic info (include remaining and logo)
router.get('/', async (req, res) => {
  const teams = await Team.find({}).select('name wallet maxPlayers purchases logoUrl createdAt updatedAt');
  res.json(
    teams.map((t) => {
      const spent = (t.purchases || []).reduce((s, p) => s + (p.price || 0), 0);
      const remaining = Math.max(0, (t.wallet || 0) - spent);
      console.log(`Team ${t.name}: wallet=${t.wallet}, purchases=${t.purchases?.length || 0}, spent=${spent}, remaining=${remaining}`);
      return {
        id: t._id,
        name: t.name,
        logoUrl: t.logoUrl || null,
        wallet: t.wallet,
        remaining,
        maxPlayers: t.maxPlayers,
        purchases: t.purchases?.length || 0,
        remainingSlots: t.remainingSlots(),
      };
    })
  );
});

// Get team detail
router.get('/:id', async (req, res) => {
  const t = await Team.findById(req.params.id).populate('purchases.player', 'name batch house strength photoUrl phoneNumber isCaptain isIcon isRetained isTraded');
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
