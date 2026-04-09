/**
 * Seed Script for Tariff Data
 * 
 * Usage:
 * 1. Create file: backend/scripts/seedTariffs.js
 * 2. Copy this content
 * 3. Run: node backend/scripts/seedTariffs.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const TariffPlan = require('../models/TariffPlan');

const domesticTariffs = [
  {
    name: 'Domestic Consumer - Block Tariff 2025',
    provider: 'CEB',
    description: 'Standard domestic tariff with progressive block pricing',
    blocks: [
      {
        minUsage: 0,
        maxUsage: 30,
        ratePerUnit: 2.50,
        description: 'First 30 kWh per month'
      },
      {
        minUsage: 30,
        maxUsage: 60,
        ratePerUnit: 3.50,
        description: '31-60 kWh per month'
      },
      {
        minUsage: 60,
        maxUsage: 90,
        ratePerUnit: 4.50,
        description: '61-90 kWh per month'
      },
      {
        minUsage: 90,
        maxUsage: 180,
        ratePerUnit: 5.50,
        description: '91-180 kWh per month'
      },
      {
        minUsage: 180,
        maxUsage: 10000,
        ratePerUnit: 7.50,
        description: 'Above 180 kWh per month'
      }
    ],
    fixedCharge: 150,
    fixedChargeDescription: 'Monthly service charge',
    additionalCharges: {
      otherCharges: [
        {
          name: 'Public Building Levy',
          amount: 25,
          description: 'Mandatory levy for public utilities'
        }
      ]
    },
    taxes: {
      serviceChargeTax: 10,
      energyTax: 5,
      VAT: 8
    },
    effectiveFrom: new Date('2025-01-01'),
    effectiveTo: null,
    isActive: true,
    currency: 'LKR',
    version: 1,
    notes: 'Updated tariff effective from January 2025'
  },
  {
    name: 'Domestic Consumer - Block Tariff 2024',
    provider: 'CEB',
    description: 'Previous domestic tariff (archived)',
    blocks: [
      {
        minUsage: 0,
        maxUsage: 30,
        ratePerUnit: 2.25,
        description: 'First 30 kWh per month'
      },
      {
        minUsage: 30,
        maxUsage: 60,
        ratePerUnit: 3.25,
        description: '31-60 kWh per month'
      },
      {
        minUsage: 60,
        maxUsage: 90,
        ratePerUnit: 4.25,
        description: '61-90 kWh per month'
      },
      {
        minUsage: 90,
        maxUsage: 180,
        ratePerUnit: 5.25,
        description: '91-180 kWh per month'
      },
      {
        minUsage: 180,
        maxUsage: 10000,
        ratePerUnit: 7.00,
        description: 'Above 180 kWh per month'
      }
    ],
    fixedCharge: 150,
    fixedChargeDescription: 'Monthly service charge',
    additionalCharges: {
      otherCharges: [
        {
          name: 'Public Building Levy',
          amount: 25,
          description: 'Mandatory levy'
        }
      ]
    },
    taxes: {
      serviceChargeTax: 10,
      energyTax: 5,
      VAT: 8
    },
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: new Date('2024-12-31'),
    isActive: false,
    currency: 'LKR',
    version: 1,
    notes: 'Previous tariff - archived for historical reference'
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/budget-app';
    
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Optional: Clear existing tariffs
    // await TariffPlan.deleteMany({});
    // console.log('✓ Cleared existing tariffs');

    // Insert tariffs
    const result = await TariffPlan.insertMany(domesticTariffs);
    console.log(`✓ Created ${result.length} tariff plans`);

    // Display created tariffs
    console.log('\n--- Created Tariffs ---');
    result.forEach(tariff => {
      console.log(`\n📋 ${tariff.name}`);
      console.log(`   Provider: ${tariff.provider}`);
      console.log(`   Status: ${tariff.isActive ? '✓ Active' : '✗ Inactive'}`);
      console.log(`   Effective: ${tariff.effectiveFrom.toISOString().split('T')[0]} - ${tariff.effectiveTo ? tariff.effectiveTo.toISOString().split('T')[0] : 'Ongoing'}`);
      console.log(`   Fixed Charge: Rs. ${tariff.fixedCharge}`);
      console.log(`   Blocks: ${tariff.blocks.length}`);
    });

    // Test calculation
    console.log('\n--- Test Bill Calculation ---');
    const activeTariff = result.find(t => t.isActive);
    if (activeTariff) {
      const testLevels = [30, 60, 85, 150, 200];
      console.log(`\n${activeTariff.name}:`);
      testLevels.forEach(consumption => {
        const bill = activeTariff.calculateBill(consumption);
        console.log(`  ${consumption} kWh → Rs. ${bill.total}`);
      });
    }

    console.log('\n✓ Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run seeding
seedDatabase();