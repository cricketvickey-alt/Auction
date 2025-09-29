import express from 'express';
import { Player } from '../models/Player.js';
import { Team } from '../models/Team.js';
import { Settings } from '../models/Settings.js';
import { Bid } from '../models/Bid.js';

let ioRef = null;
export function initAuctionSockets(io) {
  ioRef = io;
}

export function getIO() {
  return ioRef;
}

function emitAll(event, payload) {
  if (ioRef) ioRef.emit(event, payload);
}

// helper: compute team remaining wallet and slots
async function getTeamState(team) {
  const spent = team.purchases?.reduce((s, p) => s + p.price, 0) || 0;
  const remaining = Math.max(0, team.wallet - spent);
  const remainingSlots = team.remainingSlots();
  return { remaining, remainingSlots };
}

function computeMaxAllowedBid(remainingWallet, remainingSlots, basePrice) {
  // Keep at least basePrice for each of the remainingSlots - 1 (after buying current player)
  const others = Math.max(0, (remainingSlots || 0) - 1);
  const max = remainingWallet - (others * basePrice);
  return Math.max(0, max);
}

const router = express.Router();

async function getLastSold() {
  const last = await Player.findOne({ sold: true }).sort({ updatedAt: -1 }).populate('soldToTeam', 'name');
  if (!last) return null;
  return { playerName: last.name, teamName: last.soldToTeam?.name || null, price: last.soldPrice || null, playerId: String(last._id) };
}

// Public: current auction state for user screen
router.get('/state', async (req, res) => {
  const settings = await Settings.findOne({});
  const player = settings?.currentPlayer ? await Player.findById(settings.currentPlayer) : null;
  const bid = player ? await Bid.findOne({ player: player._id, active: true }).populate('currentTeam', 'name logoUrl') : null;
  const lastSold = !player ? await getLastSold() : null;
  res.json({
    basePrice: settings?.basePrice || 2500,
    minIncrement: settings?.minIncrement || 500,
    player,
    currentBid: bid ? { amount: bid.currentAmount, teamName: bid.currentTeam?.name || null, teamLogoUrl: bid.currentTeam?.logoUrl || null } : null,
    lastSold,
  });
});

// Team Owner: validate team code and get team info
router.post('/team/login', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const team = await Team.findOne({ code });
  if (!team) return res.status(404).json({ error: 'invalid code' });
  const settings = await Settings.findOne({});
  const teamState = await getTeamState(team);
  const player = settings?.currentPlayer ? await Player.findById(settings.currentPlayer) : null;
  let bidInfo = null;
  if (player) {
    const bid = await Bid.findOne({ player: player._id, active: true }).populate('currentTeam', 'name logoUrl');
    bidInfo = bid ? { amount: bid.currentAmount, teamName: bid.currentTeam?.name || null, teamLogoUrl: bid.currentTeam?.logoUrl || null } : null;
  }
  const lastSold = !player ? await getLastSold() : null;
  res.json({
    team: { id: team._id, name: team.name, wallet: team.wallet, maxPlayers: team.maxPlayers, ...teamState },
    basePrice: settings?.basePrice || 2500,
    minIncrement: settings?.minIncrement || 500,
    player,
    currentBid: bidInfo,
    lastSold,
  });
});

// Team Owner: place a raise bid using team code
router.post('/bid/raise', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const team = await Team.findOne({ code });
  if (!team) return res.status(404).json({ error: 'invalid code' });

  const settings = await Settings.findOne({});
  if (!settings?.currentPlayer) return res.status(400).json({ error: 'no active player' });
  const basePrice = settings.basePrice || 2500;
  const minIncrement = settings.minIncrement || 500;

  const player = await Player.findById(settings.currentPlayer);
  if (!player || player.sold) return res.status(400).json({ error: 'player not available' });

  // get or create bid record
  let bid = await Bid.findOne({ player: player._id, active: true });
  if (!bid) {
    bid = new Bid({ player: player._id, currentAmount: player.basePrice || basePrice, currentTeam: null, history: [], active: true });
  }

  const teamState = await getTeamState(team);
  const maxAllowed = computeMaxAllowedBid(teamState.remaining, teamState.remainingSlots, basePrice);

  const nextAmount = (bid.currentAmount || basePrice) + minIncrement;
  if (nextAmount > maxAllowed) {
    return res.status(400).json({ error: 'Max bid reached', maxAllowed });
  }

  bid.currentAmount = nextAmount;
  bid.currentTeam = team._id;
  bid.history.push({ team: team._id, amount: nextAmount });
  await bid.save();

  const enriched = await Bid.findById(bid._id).populate('currentTeam', 'name logoUrl');
  emitAll('bid_updated', { playerId: String(player._id), amount: enriched.currentAmount, teamName: enriched.currentTeam?.name || null, teamLogoUrl: enriched.currentTeam?.logoUrl || null });

  res.json({ ok: true, currentBid: { amount: enriched.currentAmount, teamName: enriched.currentTeam?.name || null, teamLogoUrl: enriched.currentTeam?.logoUrl || null }, maxAllowed });
});

export async function setCurrentPlayer(playerId) {
  const settings = (await Settings.findOne({})) || new Settings({});
  settings.currentPlayer = playerId;
  await settings.save();
  await Bid.deleteMany({ player: playerId }); // reset bid state for player
}

export default router;
