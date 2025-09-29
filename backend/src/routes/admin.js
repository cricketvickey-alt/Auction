import express from 'express';
import { Settings } from '../models/Settings.js';
import { Player } from '../models/Player.js';
import { Bid } from '../models/Bid.js';
import { Team } from '../models/Team.js';
import { getIO } from './auction.js';

const router = express.Router();

// Get settings
router.get('/settings', async (req, res) => {
  const settings = (await Settings.findOne({})) || new Settings({});
  res.json(settings);
});

// Update settings (minIncrement, basePrice, maxPlayersPerTeam)
router.put('/settings', async (req, res) => {
  const { minIncrement, basePrice, maxPlayersPerTeam } = req.body;
  const settings = (await Settings.findOne({})) || new Settings({});
  if (minIncrement !== undefined) settings.minIncrement = minIncrement;
  if (basePrice !== undefined) settings.basePrice = basePrice;
  if (maxPlayersPerTeam !== undefined) settings.maxPlayersPerTeam = maxPlayersPerTeam;
  await settings.save();
  const ioInst = getIO();
  if (ioInst) ioInst.emit('settings_updated', { minIncrement: settings.minIncrement, basePrice: settings.basePrice });
  res.json(settings);
});

// Set current player (starts/resets bidding for that player)
router.post('/current-player', async (req, res) => {
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId required' });
  const player = await Player.findById(playerId);
  if (!player) return res.status(404).json({ error: 'player not found' });
  const settings = (await Settings.findOne({})) || new Settings({});
  settings.currentPlayer = player._id;
  await settings.save();
  await Bid.deleteMany({ player: player._id });
  const ioInst = getIO();
  if (ioInst) ioInst.emit('current_player_changed', { playerId: String(player._id) });
  res.json({ ok: true, player });
});

// Sell current player to highest bidder
router.post('/sell', async (req, res) => {
  const settings = await Settings.findOne({});
  if (!settings?.currentPlayer) return res.status(400).json({ error: 'no active player to sell' });
  const player = await Player.findById(settings.currentPlayer);
  if (!player) return res.status(404).json({ error: 'player not found' });

  const bid = await Bid.findOne({ player: player._id, active: true }).populate('currentTeam');
  if (!bid || !bid.currentTeam) return res.status(400).json({ error: 'no bids placed' });

  // mark player sold and record purchase
  player.sold = true;
  player.soldToTeam = bid.currentTeam._id;
  player.soldPrice = bid.currentAmount;
  await player.save();

  // Add purchase to team
  const team = await Team.findById(bid.currentTeam._id);
  team.purchases.push({ player: player._id, price: bid.currentAmount });
  // wallet remains as initial budget; remaining is computed as wallet - sum(purchases)
  await team.save();

  // deactivate bid
  bid.active = false;
  await bid.save();

  // clear current player in settings
  settings.currentPlayer = null;
  await settings.save();

  const ioInst = getIO();
  if (ioInst) ioInst.emit('player_sold', { playerId: String(player._id), teamName: team.name, price: bid.currentAmount });

  res.json({ ok: true, playerId: player._id, team: { id: team._id, name: team.name }, price: bid.currentAmount });
});

// Reset live auction: clear current player and active bids
router.post('/reset', async (req, res) => {
  const settings = (await Settings.findOne({})) || new Settings({});
  settings.currentPlayer = null;
  await settings.save();
  await Bid.deleteMany({ active: true });
  const ioInst = getIO();
  if (ioInst) ioInst.emit('current_player_changed', { playerId: null });
  res.json({ ok: true });
});

// Adjust team wallet directly
router.put('/team/:id/wallet', async (req, res) => {
  const { amount } = req.body; // absolute wallet amount
  if (amount === undefined) return res.status(400).json({ error: 'amount required' });
  const team = await Team.findByIdAndUpdate(req.params.id, { wallet: amount }, { new: true });
  if (!team) return res.status(404).json({ error: 'team not found' });
  res.json(team);
});

export default router;
