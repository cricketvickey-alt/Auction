import 'dotenv/config';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { Player } from '../src/models/Player.js';

/**
 * Excel Import Script for Players
 * 
 * Usage:
 * 1. Place your Excel file in backend/data/players.xlsx
 * 2. Update the COLUMN_MAPPING below to match your Excel columns
 * 3. Run: npm run import-players
 */

// ============================================
// CONFIGURE YOUR COLUMN MAPPING HERE
// ============================================
const COLUMN_MAPPING = {
  name: 'Name',                                                            // Excel column name for player name
  batch: 'Batch',                                                          // Excel column name for batch number
  house: 'House',                                                          // Excel column name for house
  phoneNumber: 'Enter the Phone number (Must be registered with  CricHeroes   App)',  // Excel column name for phone number (note: extra spaces)
  totalMatchPlayed: 'Matches',                                             // Excel column name for matches played (if exists)
  totalScore: 'Runs',                                                      // Excel column name for total runs (if exists)
  totalWicket: 'Wickets',                                                  // Excel column name for total wickets (if exists)
  strength: 'Select your playing strength',                                // Excel column name for player role/strength
  basePrice: 'Base Price',                                                 // Excel column name for base price (optional)
  photoUrl: 'Photo URL',                                                   // Excel column name for photo URL (optional)
};

// Valid values for house and strength
const VALID_HOUSES = ['Aravali', 'Shivalik', 'Udaigiri', 'Nilgiri'];
const VALID_STRENGTHS = ['Batsman', 'BattingAllrounder', 'Bowler', 'Bowling allrounder', 'All rounder'];

// Strength mapping (if your Excel uses different terms)
const STRENGTH_MAPPING = {
  // Exact matches from your Excel
  'Batsman': 'Batsman',
  'Batting All rounder': 'BattingAllrounder',
  'Bowling All rounder': 'Bowling allrounder',
  'All rounder': 'All rounder',
  'Bowling': 'Bowler',
  
  // Alternative formats (for flexibility)
  'BattingAllrounder': 'BattingAllrounder',
  'Batting Allrounder': 'BattingAllrounder',
  'Bowler': 'Bowler',
  'Bowling Allrounder': 'Bowling allrounder',
  'Bowling allrounder': 'Bowling allrounder',
  'All Rounder': 'All rounder',
  'Allrounder': 'All rounder',
};

// ============================================
// SCRIPT LOGIC (Don't modify unless needed)
// ============================================

function normalizeStrength(strength) {
  if (!strength) return null;
  const normalized = STRENGTH_MAPPING[strength] || strength;
  return VALID_STRENGTHS.includes(normalized) ? normalized : null;
}

function normalizeHouse(house) {
  if (!house) return null;
  // Case-insensitive match
  const found = VALID_HOUSES.find(h => h.toLowerCase() === house.toLowerCase());
  return found || null;
}

function parseNumber(value, defaultValue = 0) {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

function parseRow(row, rowIndex) {
  const errors = [];
  
  // Required fields
  const name = row[COLUMN_MAPPING.name]?.toString().trim();
  if (!name) errors.push(`Row ${rowIndex}: Missing name`);
  
  const batch = parseNumber(row[COLUMN_MAPPING.batch]);
  if (batch < 1 || batch > 31) errors.push(`Row ${rowIndex}: Invalid batch (must be 1-31)`);
  
  const house = normalizeHouse(row[COLUMN_MAPPING.house]);
  if (!house) errors.push(`Row ${rowIndex}: Invalid house (must be one of: ${VALID_HOUSES.join(', ')})`);
  
  const strength = normalizeStrength(row[COLUMN_MAPPING.strength]);
  if (!strength) errors.push(`Row ${rowIndex}: Invalid strength (must be one of: ${VALID_STRENGTHS.join(', ')})`);
  
  if (errors.length > 0) {
    return { errors };
  }
  
  // Optional fields
  const phoneNumber = row[COLUMN_MAPPING.phoneNumber]?.toString().trim() || '';
  const totalMatchPlayed = parseNumber(row[COLUMN_MAPPING.totalMatchPlayed], 0);
  const totalScore = parseNumber(row[COLUMN_MAPPING.totalScore], 0);
  const totalWicket = parseNumber(row[COLUMN_MAPPING.totalWicket], 0);
  const basePrice = parseNumber(row[COLUMN_MAPPING.basePrice], 1000);
  const photoUrl = row[COLUMN_MAPPING.photoUrl]?.toString().trim() || '';
  
  // Debug: Log phone number if present
  if (phoneNumber) {
    console.log(`  Phone: ${phoneNumber}`);
  }
  
  return {
    player: {
      name,
      batch,
      house,
      phoneNumber,
      totalMatchPlayed,
      totalScore,
      totalWicket,
      strength,
      basePrice,
      photoUrl,
      sold: false,
    }
  };
}

async function importPlayers(filePath, options = {}) {
  const { dryRun = false, skipExisting = true } = options;
  
  console.log('📂 Reading Excel file:', filePath);
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`📊 Found ${data.length} rows in sheet: ${sheetName}`);
  console.log('');
  
  const results = {
    total: data.length,
    success: 0,
    skipped: 0,
    errors: [],
  };
  
  for (let i = 0; i < data.length; i++) {
    const rowIndex = i + 2; // Excel row (1-indexed + header row)
    const row = data[i];
    
    const parsed = parseRow(row, rowIndex);
    
    if (parsed.errors) {
      results.errors.push(...parsed.errors);
      continue;
    }
    
    const { player } = parsed;
    
    try {
      // Check if player already exists
      if (skipExisting) {
        const existing = await Player.findOne({ name: player.name, batch: player.batch });
        if (existing) {
          console.log(`⏭️  Row ${rowIndex}: Skipping existing player: ${player.name} (Batch ${player.batch})`);
          results.skipped++;
          continue;
        }
      }
      
      if (dryRun) {
        console.log(`✓ Row ${rowIndex}: Would import: ${player.name} (${player.house}, Batch ${player.batch})`);
        results.success++;
      } else {
        await Player.create(player);
        console.log(`✓ Row ${rowIndex}: Imported: ${player.name} (${player.house}, Batch ${player.batch})`);
        results.success++;
      }
    } catch (error) {
      const errorMsg = `Row ${rowIndex}: Failed to import ${player.name}: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      results.errors.push(errorMsg);
    }
  }
  
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const allowDuplicates = args.includes('--allow-duplicates');
  
  // Get file path (first non-flag argument)
  const filePath = args.find(arg => !arg.startsWith('--')) || './data/players.xlsx';
  
  console.log('');
  console.log('='.repeat(60));
  console.log('PLAYER IMPORT SCRIPT');
  console.log('='.repeat(60));
  console.log('');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be saved');
    console.log('');
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    console.log('');
    
    const results = await importPlayers(filePath, {
      dryRun,
      skipExisting: !allowDuplicates,
    });
    
    console.log('');
    console.log('='.repeat(60));
    console.log('IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total rows:      ${results.total}`);
    console.log(`✅ Imported:     ${results.success}`);
    console.log(`⏭️  Skipped:      ${results.skipped}`);
    console.log(`❌ Errors:       ${results.errors.length}`);
    console.log('');
    
    if (results.errors.length > 0) {
      console.log('ERROR DETAILS:');
      results.errors.forEach(err => console.log(`  - ${err}`));
      console.log('');
    }
    
    if (dryRun) {
      console.log('💡 Run without --dry-run to actually import the data');
    } else if (results.success > 0) {
      console.log('✅ Import completed successfully!');
    }
    
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    
    process.exit(results.errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('');
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
