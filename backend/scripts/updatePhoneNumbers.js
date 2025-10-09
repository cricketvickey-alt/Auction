import 'dotenv/config';
import xlsx from 'xlsx';
import { connectDB } from '../src/utils/db.js';
import { Player } from '../src/models/Player.js';

/**
 * Update phone numbers for existing players from Excel
 * Usage: node scripts/updatePhoneNumbers.js
 */

const EXCEL_FILE = './data/players.xlsx';
const PHONE_COLUMN = 'Enter the Phone number (Must be registered with  CricHeroes   App)';

async function updatePhoneNumbers() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Read Excel file
    const workbook = xlsx.readFile(EXCEL_FILE);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} rows in Excel file`);

    let updated = 0;
    let notFound = 0;
    let alreadyHasPhone = 0;

    for (const row of data) {
      const name = row['Name']?.toString().trim();
      const batch = parseInt(row['Batch']);
      const phoneNumber = row[PHONE_COLUMN]?.toString().trim() || '';

      if (!name || !batch) {
        console.log('Skipping row - missing name or batch');
        continue;
      }

      // Find player by name and batch (try both flat and nested structure)
      let player = await Player.findOne({ 
        name: name,
        batch: batch 
      });

      if (!player) {
        console.log(`❌ Player not found: ${name} (Batch ${batch})`);
        notFound++;
        continue;
      }

      // Check if already has phone number
      if (player.phoneNumber && player.phoneNumber !== '') {
        console.log(`✓ ${name} already has phone: ${player.phoneNumber}`);
        alreadyHasPhone++;
        continue;
      }

      // Update phone number
      if (phoneNumber) {
        player.phoneNumber = phoneNumber;
        await player.save();
        console.log(`✅ Updated ${name}: ${phoneNumber}`);
        updated++;
      } else {
        console.log(`⚠️  ${name} has no phone number in Excel`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Updated: ${updated}`);
    console.log(`Already had phone: ${alreadyHasPhone}`);
    console.log(`Not found: ${notFound}`);
    console.log(`Total processed: ${data.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updatePhoneNumbers();
