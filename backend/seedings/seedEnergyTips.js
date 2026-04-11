const mongoose = require('mongoose');
require('dotenv').config();

const EnergyTip = require('../models/EnergyTip');

const energyTips = [
  {
    title: 'Set your AC temperature to 26°C',
    description:
      'Increasing the thermostat a little can reduce cooling electricity usage while keeping rooms comfortable.',
    category: 'Cooling',
    requiredApplianceKeywords: ['ac', 'air conditioner'],
    requiredCategories: ['Cooling'],
    incomeTags: ['LOW', 'MID', 'HIGH', 'ALL'],
    weatherTags: ['HOT', 'ALL'],
    timeTags: ['DAY', 'PEAK', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'PERCENT_OF_CATEGORY',
      percent: 8,
    },
    isActive: true,
  },
  {
    title: 'Clean AC filters regularly',
    description:
      'Dirty filters reduce airflow and make air conditioners work harder, increasing electricity consumption.',
    category: 'Cooling',
    requiredApplianceKeywords: ['ac', 'air conditioner'],
    requiredCategories: ['Cooling'],
    incomeTags: ['ALL'],
    weatherTags: ['HOT', 'ALL'],
    timeTags: ['ALL'],
    effortLevel: 'LOW_COST',
    savingsModel: {
      type: 'PERCENT_OF_CATEGORY',
      percent: 6,
    },
    isActive: true,
  },
  {
    title: 'Reduce fan usage by 2 hours during cooler periods',
    description:
      'Use natural ventilation when possible and reduce fan runtime during cooler morning or evening hours.',
    category: 'Cooling',
    requiredApplianceKeywords: ['fan'],
    requiredCategories: ['Cooling'],
    incomeTags: ['ALL'],
    weatherTags: ['NORMAL', 'RAINY', 'ALL'],
    timeTags: ['DAY', 'NIGHT', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'REDUCE_HOURS',
      reduceHoursPerDay: 2,
      applianceKeyword: 'fan',
    },
    isActive: true,
  },
  {
    title: 'Replace old bulbs with LED bulbs',
    description:
      'LED bulbs use much less electricity and last longer than incandescent or CFL bulbs.',
    category: 'Lighting',
    requiredApplianceKeywords: ['bulb', 'light', 'lamp'],
    requiredCategories: ['Lighting'],
    incomeTags: ['LOW', 'MID', 'HIGH', 'ALL'],
    weatherTags: ['ALL'],
    timeTags: ['NIGHT', 'ALL'],
    effortLevel: 'LOW_COST',
    savingsModel: {
      type: 'PERCENT_OF_CATEGORY',
      percent: 18,
    },
    isActive: true,
  },
  {
    title: 'Switch off unused lights during the day',
    description:
      'Make use of daylight and avoid leaving lights on in rooms that are not being used.',
    category: 'Lighting',
    requiredApplianceKeywords: ['bulb', 'light', 'lamp'],
    requiredCategories: ['Lighting'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['DAY', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'PERCENT_OF_CATEGORY',
      percent: 10,
    },
    isActive: true,
  },
  {
    title: 'Boil only the water you need in the kettle',
    description:
      'Heating more water than necessary wastes electricity, especially when done several times a day.',
    category: 'Cooking',
    requiredApplianceKeywords: ['kettle'],
    requiredCategories: ['Cooking'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['DAY', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'REDUCE_HOURS',
      reduceHoursPerDay: 0.2,
      applianceKeyword: 'kettle',
    },
    isActive: true,
  },
  {
    title: 'Turn off rice cooker warm mode when not needed',
    description:
      'Keeping food on warm mode for long periods increases unnecessary electricity usage.',
    category: 'Cooking',
    requiredApplianceKeywords: ['rice cooker'],
    requiredCategories: ['Cooking'],
    incomeTags: ['LOW', 'MID', 'HIGH', 'ALL'],
    weatherTags: ['ALL'],
    timeTags: ['ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'REDUCE_HOURS',
      reduceHoursPerDay: 1,
      applianceKeyword: 'rice cooker',
    },
    isActive: true,
  },
  {
    title: 'Unplug chargers when not in use',
    description:
      'Phone and laptop chargers can still draw a small amount of power when left plugged in unnecessarily.',
    category: 'Standby',
    requiredApplianceKeywords: ['charger'],
    requiredCategories: ['Standby', 'Other'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'STANDBY_OFF',
      percent: 5,
    },
    isActive: true,
  },
  {
    title: 'Switch off devices at the plug to reduce standby power',
    description:
      'TVs, routers, set-top boxes, and chargers can consume electricity even when not actively used.',
    category: 'Standby',
    requiredCategories: ['Standby', 'Entertainment', 'Other'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'STANDBY_OFF',
      percent: 10,
    },
    isActive: true,
  },
  {
    title: 'Turn the TV off fully instead of leaving it in standby',
    description:
      'Televisions left in standby mode continue to consume electricity over time.',
    category: 'Entertainment',
    requiredApplianceKeywords: ['tv', 'television'],
    requiredCategories: ['Entertainment'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['NIGHT', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'REDUCE_HOURS',
      reduceHoursPerDay: 1,
      applianceKeyword: 'tv',
    },
    isActive: true,
  },
  {
    title: 'Use sleep mode and power saving settings on entertainment devices',
    description:
      'Enable built-in energy-saving settings on TVs, gaming consoles, and streaming devices.',
    category: 'Entertainment',
    requiredApplianceKeywords: ['tv', 'console', 'decoder', 'set top box'],
    requiredCategories: ['Entertainment'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'PERCENT_OF_CATEGORY',
      percent: 7,
    },
    isActive: true,
  },
  {
    title: 'Run full-load cooking and heating appliances only when needed',
    description:
      'Avoid repeated short runs of appliances such as electric ovens and heaters when a single efficient run will do.',
    category: 'General',
    requiredCategories: ['Cooking', 'Other', 'General'],
    incomeTags: ['ALL'],
    weatherTags: ['ALL'],
    timeTags: ['PEAK', 'ALL'],
    effortLevel: 'ZERO_COST',
    savingsModel: {
      type: 'FIXED_KWH',
      fixedKWhMonthly: 12,
    },
    isActive: true,
  },
];

async function seedEnergyTips() {
  try {
    const mongoUri = process.env.MONGODB_URI ||'mongodb://localhost:27017/powerwise';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    let inserted = 0;
    let updated = 0;

    for (const tip of energyTips) {
      const existing = await EnergyTip.findOne({ title: tip.title });

      if (existing) {
        await EnergyTip.updateOne({ _id: existing._id }, { $set: tip });
        updated += 1;
        console.log(`↺ Updated: ${tip.title}`);
      } else {
        await EnergyTip.create(tip);
        inserted += 1;
        console.log(`✓ Inserted: ${tip.title}`);
      }
    }

    const total = await EnergyTip.countDocuments();
    console.log('\n--- Energy Tip Seed Summary ---');
    console.log(`Inserted: ${inserted}`);
    console.log(`Updated: ${updated}`);
    console.log(`Total tips in database: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Energy tip seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

seedEnergyTips();