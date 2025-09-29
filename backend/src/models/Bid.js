import mongoose from 'mongoose';

const bidHistorySchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    amount: { type: Number, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bidSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true, unique: true },
    currentAmount: { type: Number, required: true },
    currentTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    history: [bidHistorySchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Bid = mongoose.model('Bid', bidSchema);
