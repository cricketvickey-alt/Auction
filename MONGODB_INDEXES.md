# MongoDB Index Recommendations

## Overview
This document outlines the recommended indexes for optimal query performance in the Cricket Auction App.

---

## 1. **Player Collection**

### Current Indexes
- `_id` (automatic)
- `createdAt`, `updatedAt` (from timestamps)

### Recommended Indexes

```javascript
// Index for filtering sold/unsold players (used in player list)
db.players.createIndex({ "sold": 1 })

// Compound index for finding last sold player (used in getLastSold)
db.players.createIndex({ "sold": 1, "updatedAt": -1 })

// Index for filtering by soldToTeam (useful for team-specific queries)
db.players.createIndex({ "soldToTeam": 1 })

// Optional: Compound index for filtering and sorting
db.players.createIndex({ "sold": 1, "createdAt": 1 })

// Optional: Text index for player name search (if you add search functionality)
db.players.createIndex({ "name": "text" })
```

### Why These Indexes?
- **`sold`**: Frequently queried in `/api/players?sold=true/false`
- **`sold + updatedAt`**: Used in `getLastSold()` to find most recently sold player
- **`soldToTeam`**: Useful for team purchase history queries
- **`sold + createdAt`**: Supports filtered sorting in player list

---

## 2. **Team Collection**

### Current Indexes
- `_id` (automatic)
- `name` (unique, automatic)
- `code` (unique, automatic)
- `createdAt`, `updatedAt` (from timestamps)

### Recommended Indexes

```javascript
// Code is already unique indexed (automatic from schema)
// Name is already unique indexed (automatic from schema)

// Index for purchases array queries (if you query by player purchases)
db.teams.createIndex({ "purchases.player": 1 })

// Optional: If you query by purchase date
db.teams.createIndex({ "purchases.at": -1 })
```

### Why These Indexes?
- **`name` & `code`**: Already indexed as unique fields (automatic)
- **`purchases.player`**: Useful if you need to find which team bought a specific player
- **`purchases.at`**: Useful for chronological purchase queries

---

## 3. **Bid Collection**

### Current Indexes
- `_id` (automatic)
- `player` (unique, automatic from schema)
- `createdAt`, `updatedAt` (from timestamps)

### Recommended Indexes

```javascript
// Player is already unique indexed (automatic from schema)

// Compound index for finding active bids by player (most common query)
db.bids.createIndex({ "player": 1, "active": 1 })

// Index for active bids only
db.bids.createIndex({ "active": 1 })

// Index for currentTeam (useful for team-specific bid queries)
db.bids.createIndex({ "currentTeam": 1 })

// Compound index for history queries
db.bids.createIndex({ "history.team": 1, "history.at": -1 })
```

### Why These Indexes?
- **`player + active`**: Most queries are `Bid.findOne({ player: playerId, active: true })`
- **`active`**: Used in reset operations `Bid.deleteMany({ active: true })`
- **`currentTeam`**: Useful for finding all bids by a specific team
- **`history.team + history.at`**: Useful for bid history analysis

---

## 4. **Settings Collection**

### Current Indexes
- `_id` (automatic)
- `createdAt`, `updatedAt` (from timestamps)

### Recommended Indexes

```javascript
// Index for currentPlayer (frequently accessed)
db.settings.createIndex({ "currentPlayer": 1 })

// Optional: Index for auctionActive status
db.settings.createIndex({ "auctionActive": 1 })
```

### Why These Indexes?
- **`currentPlayer`**: Frequently queried to get current auction player
- **`auctionActive`**: Useful if you filter by auction status
- **Note**: Since there's typically only 1 settings document, indexes may not be critical

---

## Implementation Script

Create a file `backend/scripts/createIndexes.js`:

```javascript
import 'dotenv/config';
import mongoose from 'mongoose';
import { Player } from '../src/models/Player.js';
import { Team } from '../src/models/Team.js';
import { Bid } from '../src/models/Bid.js';
import { Settings } from '../src/models/Settings.js';

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Player indexes
    console.log('Creating Player indexes...');
    await Player.collection.createIndex({ sold: 1 });
    await Player.collection.createIndex({ sold: 1, updatedAt: -1 });
    await Player.collection.createIndex({ soldToTeam: 1 });
    await Player.collection.createIndex({ sold: 1, createdAt: 1 });
    console.log('✓ Player indexes created');

    // Team indexes
    console.log('Creating Team indexes...');
    await Team.collection.createIndex({ 'purchases.player': 1 });
    await Team.collection.createIndex({ 'purchases.at': -1 });
    console.log('✓ Team indexes created');

    // Bid indexes
    console.log('Creating Bid indexes...');
    await Bid.collection.createIndex({ player: 1, active: 1 });
    await Bid.collection.createIndex({ active: 1 });
    await Bid.collection.createIndex({ currentTeam: 1 });
    await Bid.collection.createIndex({ 'history.team': 1, 'history.at': -1 });
    console.log('✓ Bid indexes created');

    // Settings indexes
    console.log('Creating Settings indexes...');
    await Settings.collection.createIndex({ currentPlayer: 1 });
    await Settings.collection.createIndex({ auctionActive: 1 });
    console.log('✓ Settings indexes created');

    console.log('\n✅ All indexes created successfully!');
    
    // List all indexes
    console.log('\n--- Player Indexes ---');
    console.log(await Player.collection.getIndexes());
    console.log('\n--- Team Indexes ---');
    console.log(await Team.collection.getIndexes());
    console.log('\n--- Bid Indexes ---');
    console.log(await Bid.collection.getIndexes());
    console.log('\n--- Settings Indexes ---');
    console.log(await Settings.collection.getIndexes());

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();
```

---

## Usage

1. **Create the script**:
   ```bash
   # File already created above
   ```

2. **Run the script**:
   ```bash
   cd backend
   node scripts/createIndexes.js
   ```

3. **Add to package.json** (optional):
   ```json
   {
     "scripts": {
       "create-indexes": "node scripts/createIndexes.js"
     }
   }
   ```

---

## Performance Impact

### Before Indexes
- Full collection scans on filtered queries
- Slow queries as data grows
- O(n) complexity for most lookups

### After Indexes
- Index-based lookups
- Faster queries (especially with large datasets)
- O(log n) complexity for indexed queries

---

## Monitoring

### Check Index Usage
```javascript
// In MongoDB shell or Compass
db.players.aggregate([{ $indexStats: {} }])
db.teams.aggregate([{ $indexStats: {} }])
db.bids.aggregate([{ $indexStats: {} }])
db.settings.aggregate([{ $indexStats: {} }])
```

### Explain Query Plans
```javascript
// Example: Check if index is being used
db.players.find({ sold: true }).explain("executionStats")
db.bids.find({ player: ObjectId("..."), active: true }).explain("executionStats")
```

---

## Priority Indexes (Must Have)

If you can only create a few indexes, prioritize these:

1. **Bid**: `{ player: 1, active: 1 }` - Most critical for auction operations
2. **Player**: `{ sold: 1, updatedAt: -1 }` - For finding last sold player
3. **Team**: Already has `code` and `name` unique indexes (automatic)
4. **Bid**: `{ active: 1 }` - For reset operations

---

## Notes

- Indexes use disk space and slow down writes slightly
- For small datasets (<10k documents), indexes may not show significant improvement
- Monitor index usage and remove unused indexes
- Compound indexes can serve multiple query patterns
- Unique indexes (name, code, player in Bid) are automatically created by Mongoose

---

## Maintenance

### Drop Unused Indexes
```javascript
db.collection.dropIndex("indexName")
```

### Rebuild Indexes
```javascript
db.collection.reIndex()
```

### Check Index Size
```javascript
db.collection.stats()
```
