# Your Excel Format - Quick Reference

## ✅ Column Mapping Configured

The import script is now configured to read your Excel file with these exact column names:

| Your Excel Column | Maps To | Required | Example |
|------------------|---------|----------|---------|
| **Name** | Player name | ✅ Yes | "Virat Kohli" |
| **Batch** | Batch number | ✅ Yes | 12 |
| **House** | House name | ✅ Yes | "Aravali" |
| **Enter the Phone number (Must be registered with CricHeroes App)** | Phone number | ⚠️ Optional | "+91 9876543210" |
| **Select your playing strength** | Player strength | ✅ Yes | "Batsman" |

## ✅ Valid Values

### Houses (must be exactly one of these)
- Aravali
- Shivalik
- Udaigiri
- Nilgiri

### Playing Strength (your Excel format)
Your Excel uses these values (all supported):
- **Batsman** → Batsman
- **Batting All rounder** → BattingAllrounder
- **Bowling All rounder** → Bowling allrounder
- **All rounder** → All rounder
- **Bowling** → Bowler

### Batch
- Must be a number between 1 and 30

## 🚀 How to Import

### Step 1: Install Dependencies (first time only)
```bash
cd backend
npm install
```

### Step 2: Place Your Excel File
Save your Excel file as:
```
backend/data/players.xlsx
```

### Step 3: Test Import (Recommended)
```bash
npm run import-players -- --dry-run
```

This will show you what will be imported WITHOUT actually saving anything.

### Step 4: Import for Real
```bash
npm run import-players
```

## 📋 Example Excel Data

Your Excel should look like this:

| Name | Batch | House | Enter the Phone number (Must be registered with CricHeroes App) | Select your playing strength |
|------|-------|-------|----------------------------------------------------------------|------------------------------|
| Virat Kohli | 12 | Aravali | +91 9876543210 | Batsman |
| MS Dhoni | 15 | Shivalik | +91 9876543211 | Batting All rounder |
| Jasprit Bumrah | 10 | Udaigiri | +91 9876543212 | Bowling |
| Hardik Pandya | 14 | Nilgiri | +91 9876543213 | All rounder |
| Ravindra Jadeja | 13 | Aravali | +91 9876543214 | Bowling All rounder |

## ⚠️ Common Issues

### "Invalid strength"
**Problem:** The strength value doesn't match expected format

**Solution:** Make sure you use exactly these values:
- Batsman
- Batting All rounder
- Bowling All rounder
- All rounder
- Bowling

### "Invalid house"
**Problem:** House name is misspelled or has extra spaces

**Solution:** Use exactly: Aravali, Shivalik, Udaigiri, or Nilgiri

### "Invalid batch"
**Problem:** Batch is not a number or is outside 1-30 range

**Solution:** Batch must be a whole number between 1 and 30

### "Missing name"
**Problem:** Name column is empty

**Solution:** Every player must have a name

## 💡 Tips

1. **Phone numbers are optional** - If a player doesn't have a phone number, leave the cell empty
2. **Test first** - Always run with `--dry-run` first to catch errors
3. **Check spelling** - House and strength values must match exactly
4. **No extra columns needed** - The script will ignore any extra columns in your Excel
5. **Duplicates are skipped** - Players with the same name and batch won't be imported twice

## 📊 What Gets Imported

From your Excel, the script will import:
- ✅ Player name
- ✅ Batch number
- ✅ House
- ✅ Phone number (if provided)
- ✅ Playing strength

Default values (since your Excel doesn't have these columns):
- Matches played: 0
- Total runs: 0
- Total wickets: 0
- Base price: 1000
- Photo URL: (empty)

You can edit these values later in the Players Admin page!

## 🎯 Next Steps After Import

1. Go to the Players Admin page in your app
2. Verify all players imported correctly
3. You can add/edit:
   - Matches played
   - Total runs
   - Total wickets
   - Base price
   - Photo URL
4. Start your auction!

## Need Help?

If you see errors during import:
1. Check the error message - it tells you exactly which row and what's wrong
2. Fix the issue in your Excel
3. Run `--dry-run` again to verify
4. Import when everything looks good
