import 'dotenv/config';
import mongoose from 'mongoose';
import { Player } from '../src/models/Player.js';
import { Team } from '../src/models/Team.js';
import { Bid } from '../src/models/Bid.js';
import { Settings } from '../src/models/Settings.js';

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    console.log('');

    // Player indexes
    console.log('Creating Player indexes...');
    await Player.collection.createIndex({ sold: 1 });
    console.log('  ✓ { sold: 1 }');
    await Player.collection.createIndex({ sold: 1, updatedAt: -1 });
    console.log('  ✓ { sold: 1, updatedAt: -1 }');
    await Player.collection.createIndex({ soldToTeam: 1 });
    console.log('  ✓ { soldToTeam: 1 }');
    await Player.collection.createIndex({ sold: 1, createdAt: 1 });
    console.log('  ✓ { sold: 1, createdAt: 1 }');
    console.log('');

    // Team indexes
    console.log('Creating Team indexes...');
    await Team.collection.createIndex({ 'purchases.player': 1 });
    console.log('  ✓ { "purchases.player": 1 }');
    await Team.collection.createIndex({ 'purchases.at': -1 });
    console.log('  ✓ { "purchases.at": -1 }');
    console.log('');

    // Bid indexes
    console.log('Creating Bid indexes...');
    await Bid.collection.createIndex({ player: 1, active: 1 });
    console.log('  ✓ { player: 1, active: 1 }');
    await Bid.collection.createIndex({ active: 1 });
    console.log('  ✓ { active: 1 }');
    await Bid.collection.createIndex({ currentTeam: 1 });
    console.log('  ✓ { currentTeam: 1 }');
    await Bid.collection.createIndex({ 'history.team': 1, 'history.at': -1 });
    console.log('  ✓ { "history.team": 1, "history.at": -1 }');
    console.log('');

    // Settings indexes
    console.log('Creating Settings indexes...');
    await Settings.collection.createIndex({ currentPlayer: 1 });
    console.log('  ✓ { currentPlayer: 1 }');
    await Settings.collection.createIndex({ auctionActive: 1 });
    console.log('  ✓ { auctionActive: 1 }');
    console.log('');

    console.log('✅ All indexes created successfully!');
    console.log('');
    
    // List all indexes
    console.log('='.repeat(60));
    console.log('PLAYER COLLECTION INDEXES');
    console.log('='.repeat(60));
    const playerIndexes = await Player.collection.getIndexes();
    Object.keys(playerIndexes).forEach(key => {
      console.log(`  ${key}:`, JSON.stringify(playerIndexes[key]));
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('TEAM COLLECTION INDEXES');
    console.log('='.repeat(60));
    const teamIndexes = await Team.collection.getIndexes();
    Object.keys(teamIndexes).forEach(key => {
      console.log(`  ${key}:`, JSON.stringify(teamIndexes[key]));
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('BID COLLECTION INDEXES');
    console.log('='.repeat(60));
    const bidIndexes = await Bid.collection.getIndexes();
    Object.keys(bidIndexes).forEach(key => {
      console.log(`  ${key}:`, JSON.stringify(bidIndexes[key]));
    });
    console.log('');

    console.log('='.repeat(60));
    console.log('SETTINGS COLLECTION INDEXES');
    console.log('='.repeat(60));
    const settingsIndexes = await Settings.collection.getIndexes();
    Object.keys(settingsIndexes).forEach(key => {
      console.log(`  ${key}:`, JSON.stringify(settingsIndexes[key]));
    });
    console.log('');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
