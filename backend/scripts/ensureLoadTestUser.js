/**
 * Creates the Artillery load-test user and a household (required for POST /api/readings).
 * Run before load tests: npm run seed:loadtest-user
 * Safe to re-run: it only creates missing user and/or household.
 */
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Household = require('../models/Household');

const LOADTEST_EMAIL = 'loadtest@powerwise.test';
const LOADTEST_PASSWORD = 'LoadTest123!';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email: LOADTEST_EMAIL });
  if (!user) {
    user = await User.create({
      name: 'Artillery Load Test',
      email: LOADTEST_EMAIL,
      password: LOADTEST_PASSWORD,
      incomeBracket: 'middle',
      role: 'user',
    });
    console.log(`Created user: ${LOADTEST_EMAIL}`);
  } else {
    console.log(`User exists: ${LOADTEST_EMAIL}`);
  }

  if (!user.household) {
    const household = await Household.create({
      name: 'Artillery Load Test Household',
      owner: user._id,
      members: [user._id],
      householdSize: 1,
      incomeBracket: user.incomeBracket || 'middle',
      householdType: 'house',
    });
    user.household = household._id;
    await user.save();
    console.log(`Linked household ${household._id} to load-test user (required for /api/readings).`);
  } else {
    console.log(`User already has household: ${user.household}`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
