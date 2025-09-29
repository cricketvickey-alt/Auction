import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    price: { type: Number, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }, // simple code access
    wallet: { type: Number, default: 100000 },
    maxPlayers: { type: Number, default: 15 }, // can be overridden per team
    purchases: [purchaseSchema],
  },
  { timestamps: true }
);

teamSchema.methods.remainingSlots = function () {
  return Math.max(0, this.maxPlayers - (this.purchases?.length || 0));
};

export const Team = mongoose.model('Team', teamSchema);
