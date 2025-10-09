import 'dotenv/config';
import { connectDB } from '../src/utils/db.js';
import { AdminUser } from '../src/models/AdminUser.js';

/**
 * Create initial admin user
 * Usage: node scripts/createAdminUser.js
 */

async function createAdminUser() {
  try {
    await connectDB();
    console.log('Connected to database');

    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@auction.com';
    const password = process.argv[4] || 'admin123';
    const role = process.argv[5] || 'super_admin';

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      console.log('❌ User with this username or email already exists');
      process.exit(1);
    }

    // Create admin user
    const user = await AdminUser.create({
      username,
      email,
      password,
      role
    });

    console.log('✅ Admin user created successfully!');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log('\nYou can now login at /admin/login');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();
