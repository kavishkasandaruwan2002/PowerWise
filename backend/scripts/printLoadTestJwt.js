/**
 * Prints a JWT for loadtest@powerwise.test (same signing as POST /api/auth/login).
 * Use before Artillery so scenarios can skip login and avoid bcrypt under load.
 *
 * PowerShell:
 *   $env:LOADTEST_TOKEN = (node scripts/printLoadTestJwt.js).Trim()
 *   npx artillery run artillery.config.yml
 *
 * Bash:
 *   export LOADTEST_TOKEN=$(node scripts/printLoadTestJwt.js)
 *   npx artillery run artillery.config.yml
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');

const LOADTEST_EMAIL = 'loadtest@powerwise.test';

async function main() {
  if (!process.env.JWT_ACCESS_SECRET) {
    console.error('JWT_ACCESS_SECRET is missing from .env');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise';
  await mongoose.connect(uri);

  const user = await User.findOne({ email: LOADTEST_EMAIL });
  if (!user) {
    console.error(`No user ${LOADTEST_EMAIL} — run: npm run seed:loadtest-user`);
    process.exit(1);
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '7d' }
  );

  process.stdout.write(token);
  await mongoose.connection.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
