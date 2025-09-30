# Excel Player Import Guide

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install the `xlsx` package needed for Excel import.

### 2. Prepare Your Excel File

You have two options:

#### Option A: Use the Template
1. Open `backend/data/players_template.csv` in Excel
2. Add your player data following the format
3. Save as `backend/data/players.xlsx`

#### Option B: Use Your Own Excel File
Make sure your Excel has these columns (names can be different, see step 3):

**Required:**
- Player Name
- Batch (1-30)
- House (Aravali, Shivalik, Udaigiri, or Nilgiri)
- Role/Strength (Batsman, Bowler, All rounder, etc.)

**Optional:**
- Phone Number
- Matches Played
- Total Runs
- Total Wickets
- Base Price
- Photo URL

### 3. Configure Column Mapping (if needed)

If your Excel column names are different, edit `backend/scripts/importPlayers.js`:

```javascript
const COLUMN_MAPPING = {
  name: 'Name',              // Change 'Name' to your column name
  batch: 'Batch',            // Change 'Batch' to your column name
  house: 'House',            // Change 'House' to your column name
  phoneNumber: 'Phone',      // Change 'Phone' to your column name
  totalMatchPlayed: 'Matches',
  totalScore: 'Runs',
  totalWicket: 'Wickets',
  strength: 'Role',          // Change 'Role' to your column name
  basePrice: 'Base Price',
  photoUrl: 'Photo URL',
};
```

### 4. Test Import (Recommended)

```bash
npm run import-players -- --dry-run
```

This will:
- ✅ Validate your data
- ✅ Show what will be imported
- ❌ NOT save anything to database

### 5. Import for Real

```bash
npm run import-players
```

## Column Mapping Examples

### Example 1: Your Excel has different column names

Your Excel:
```
Player Name | Year | Team      | Contact       | Role
John Doe    | 12   | Aravali   | 9876543210   | Batsman
```

Update mapping:
```javascript
const COLUMN_MAPPING = {
  name: 'Player Name',      // ← Changed
  batch: 'Year',            // ← Changed
  house: 'Team',            // ← Changed
  phoneNumber: 'Contact',   // ← Changed
  strength: 'Role',
  // ... rest stays same
};
```

### Example 2: Your Excel is missing some columns

Your Excel only has:
```
Name | Batch | House | Role
```

Update mapping (set missing columns to empty string):
```javascript
const COLUMN_MAPPING = {
  name: 'Name',
  batch: 'Batch',
  house: 'House',
  phoneNumber: '',           // ← No phone column
  totalMatchPlayed: '',      // ← No matches column
  totalScore: '',            // ← No runs column
  totalWicket: '',           // ← No wickets column
  strength: 'Role',
  basePrice: '',             // ← No price column (will use default 1000)
  photoUrl: '',              // ← No photo column
};
```

## Valid Values Reference

### Houses (case-insensitive)
- Aravali
- Shivalik
- Udaigiri
- Nilgiri

### Strengths/Roles (script will normalize these)
- Batsman
- BattingAllrounder (or "Batting Allrounder")
- Bowler
- Bowling allrounder (or "Bowling Allrounder")
- All rounder (or "All Rounder" or "Allrounder")

### Batch
- Must be a number between 1 and 30

## Advanced Usage

### Import from a different file
```bash
npm run import-players -- path/to/your/file.xlsx
```

### Allow duplicate players
By default, players with the same name and batch are skipped. To import duplicates:
```bash
npm run import-players -- --allow-duplicates
```

### Combine options
```bash
npm run import-players -- data/my_players.xlsx --dry-run
```

## Troubleshooting

### Error: "Cannot find module 'xlsx'"
**Solution:** Run `npm install` in the backend directory

### Error: "Invalid house"
**Solution:** 
- Check spelling: must be exactly Aravali, Shivalik, Udaigiri, or Nilgiri
- Remove extra spaces
- Check for hidden characters

### Error: "Invalid strength"
**Solution:**
- Use one of the valid values listed above
- The script tries to normalize variations, but check spelling

### Error: "File not found"
**Solution:**
- Make sure your Excel file is in `backend/data/players.xlsx`
- Or specify the full path: `npm run import-players -- /full/path/to/file.xlsx`

### Players are being skipped
**Solution:**
- By default, duplicate players (same name + batch) are skipped
- Use `--allow-duplicates` flag to import them anyway
- Or delete existing players from the database first

## Example Output

### Successful Import
```
📂 Reading Excel file: ./data/players.xlsx
📊 Found 5 rows in sheet: Sheet1

✓ Connected to MongoDB

✓ Row 2: Imported: Virat Kohli (Aravali, Batch 12)
✓ Row 3: Imported: MS Dhoni (Shivalik, Batch 15)
✓ Row 4: Imported: Jasprit Bumrah (Udaigiri, Batch 10)
✓ Row 5: Imported: Hardik Pandya (Nilgiri, Batch 14)
✓ Row 6: Imported: Ravindra Jadeja (Aravali, Batch 13)

============================================================
IMPORT SUMMARY
============================================================
Total rows:      5
✅ Imported:     5
⏭️  Skipped:      0
❌ Errors:       0

✅ Import completed successfully!
```

### With Errors
```
📂 Reading Excel file: ./data/players.xlsx
📊 Found 3 rows in sheet: Sheet1

✓ Connected to MongoDB

✓ Row 2: Imported: Virat Kohli (Aravali, Batch 12)
❌ Row 3: Invalid house (must be one of: Aravali, Shivalik, Udaigiri, Nilgiri)
⏭️  Row 4: Skipping existing player: MS Dhoni (Batch 15)

============================================================
IMPORT SUMMARY
============================================================
Total rows:      3
✅ Imported:     1
⏭️  Skipped:      1
❌ Errors:       1

ERROR DETAILS:
  - Row 3: Invalid house (must be one of: Aravali, Shivalik, Udaigiri, Nilgiri)
```

## Need Help?

1. Check `backend/data/README.md` for detailed column descriptions
2. Use the template: `backend/data/players_template.csv`
3. Always test with `--dry-run` first
4. Check the error messages - they tell you exactly what's wrong

## What's Next?

After importing players:
1. Go to the Players Admin page in the app
2. Verify all players were imported correctly
3. You can edit individual players if needed
4. Set the current player in the Admin screen to start the auction!
