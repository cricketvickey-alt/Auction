import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    batch: { type: Number, min: 1, max: 31, required: true },
    house: { type: String, enum: ['Aravali', 'Shivalik', 'Udaigiri', 'Nilgiri'], required: true },
    phoneNumber: { type: String },
    totalMatchPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalWicket: { type: Number, default: 0 },
    strength: { type: String, enum: ['Batsman', 'BattingAllrounder', 'Bowler', 'Bowling allrounder', 'All rounder'], required: true },
    basePrice: { type: Number, default: 1000 },
    photoUrl: { type: String },
    // Team role flags
    isCaptain: { type: Boolean, default: false },
    isIcon: { type: Boolean, default: false },
    isRetained: { type: Boolean, default: false },
    isTraded: { type: Boolean, default: false },
    // auction state helpers
    sold: { type: Boolean, default: false },
    soldToTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    soldPrice: { type: Number },
  },
  { timestamps: true }
);

export const Player = mongoose.model('Player', playerSchema);
