# Player Data Import

This directory contains data files for importing players into the auction system.

## Excel/CSV Template

Use `players_template.csv` as a reference for the required columns.

### Required Columns

| Column Name | Description | Valid Values | Example |
|------------|-------------|--------------|---------|
| **Name** | Player name | Any text | "Virat Kohli" |
| **Batch** | Batch number | 1-30 | 12 |
| **House** | House name | Aravali, Shivalik, Udaigiri, Nilgiri | "Aravali" |
| **Role** | Player role/strength | Batsman, BattingAllrounder, Bowler, Bowling allrounder, All rounder | "Batsman" |

### Optional Columns

| Column Name | Description | Default | Example |
|------------|-------------|---------|---------|
| **Phone** | Phone number | Empty | "+91 9876543210" |
| **Matches** | Total matches played | 0 | 50 |
| **Runs** | Total runs scored | 0 | 2500 |
| **Wickets** | Total wickets taken | 0 | 85 |
| **Base Price** | Starting price | 1000 | 1500 |
| **Photo URL** | Player photo URL | Empty | "https://..." |

## How to Import

### Step 1: Prepare Your Excel File

1. Create an Excel file (.xlsx) or CSV file with your player data
2. Ensure column names match the template (or update the mapping in the script)
3. Save the file as `backend/data/players.xlsx`

### Step 2: Configure Column Mapping (if needed)

If your Excel columns have different names, edit `backend/scripts/importPlayers.js`:

```javascript
const COLUMN_MAPPING = {
  name: 'Player Name',        // Change to match your column
  batch: 'Year',              // Change to match your column
  house: 'Team',              // Change to match your column
  // ... etc
};
```

### Step 3: Test Import (Dry Run)

```bash
cd backend
npm run import-players -- --dry-run
```

This will validate your data without saving anything.

### Step 4: Import for Real

```bash
npm run import-players
```

### Advanced Options

```bash
# Import from a different file
npm run import-players -- path/to/your/file.xlsx

# Allow duplicate players (by default, duplicates are skipped)
npm run import-players -- --allow-duplicates

# Dry run with custom file
npm run import-players -- data/my_players.xlsx --dry-run
```

## Troubleshooting

### Common Errors

**"Invalid house"**
- Make sure house names are exactly: Aravali, Shivalik, Udaigiri, or Nilgiri
- Check for extra spaces or typos

**"Invalid strength"**
- Valid values: Batsman, BattingAllrounder, Bowler, Bowling allrounder, All rounder
- The script will try to normalize variations (e.g., "All Rounder" → "All rounder")

**"Invalid batch"**
- Batch must be a number between 1 and 30

**"Missing name"**
- Every player must have a name

### Tips

1. **Use the template**: Start with `players_template.csv` and modify it
2. **Test first**: Always run with `--dry-run` first
3. **Check duplicates**: By default, players with the same name and batch are skipped
4. **Phone numbers**: Can be in any format (e.g., "+91 1234567890" or "1234567890")
5. **Empty cells**: Optional fields can be left empty

## Example Import Output

```
📂 Reading Excel file: ./data/players.xlsx
📊 Found 5 rows in sheet: Sheet1

✓ Connected to MongoDB

✓ Row 2: Imported: Virat Kohli (Aravali, Batch 12)
✓ Row 3: Imported: MS Dhoni (Shivalik, Batch 15)
⏭️  Row 4: Skipping existing player: Jasprit Bumrah (Batch 10)
✓ Row 5: Imported: Hardik Pandya (Nilgiri, Batch 14)
✓ Row 6: Imported: Ravindra Jadeja (Aravali, Batch 13)

============================================================
IMPORT SUMMARY
============================================================
Total rows:      5
✅ Imported:     4
⏭️  Skipped:      1
❌ Errors:       0

✅ Import completed successfully!
```
