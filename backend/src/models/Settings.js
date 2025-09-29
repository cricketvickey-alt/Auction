import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    basePrice: { type: Number, default: 2500 },
    minIncrement: { type: Number, default: 500 },
    maxPlayersPerTeam: { type: Number, default: 15 },
    currentPlayer: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    auctionActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Settings = mongoose.model('Settings', settingsSchema);
