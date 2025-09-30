# Database Scripts

## Create Indexes

This script creates all recommended MongoDB indexes for optimal query performance.

### Usage

```bash
# From the backend directory
npm run create-indexes

# Or directly
node scripts/createIndexes.js
```

### What It Does

Creates indexes for:

1. **Player Collection**
   - `{ sold: 1 }` - Filter sold/unsold players
   - `{ sold: 1, updatedAt: -1 }` - Find last sold player
   - `{ soldToTeam: 1 }` - Team purchase queries
   - `{ sold: 1, createdAt: 1 }` - Filtered sorting

2. **Team Collection**
   - `{ "purchases.player": 1 }` - Find team by player purchase
   - `{ "purchases.at": -1 }` - Chronological purchase queries

3. **Bid Collection**
   - `{ player: 1, active: 1 }` - Most critical for auction operations
   - `{ active: 1 }` - Reset operations
   - `{ currentTeam: 1 }` - Team-specific bid queries
   - `{ "history.team": 1, "history.at": -1 }` - Bid history analysis

4. **Settings Collection**
   - `{ currentPlayer: 1 }` - Current auction player lookup
   - `{ auctionActive: 1 }` - Auction status filtering

### When to Run

- **Initial Setup**: After first deployment
- **After Schema Changes**: If you modify models
- **Performance Issues**: If queries are slow

### Notes

- Safe to run multiple times (idempotent)
- Requires `.env` file with `MONGO_URI`
- Shows all created indexes at the end
- Indexes already exist from unique constraints: `name`, `code`, `player` (in Bid)

### See Also

- Full documentation: `/MONGODB_INDEXES.md`
- Monitor index usage in MongoDB Compass or Atlas
