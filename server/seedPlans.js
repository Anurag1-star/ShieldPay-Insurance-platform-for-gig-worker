import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan } from './models/Plan.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shieldpay';

const seedPlans = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const plansCount = await Plan.countDocuments();
    if (plansCount === 0) {
      await Plan.insertMany([
        {
          planId: 'lite',
          name: 'Shield Lite',
          coverageAmount: 1500,
          weeklyPremium: 49,
          features: [
            'Basic rain disruption coverage',
            'Up to ₹1,500 continuous payout',
            '24/7 basic support',
            'No cancellation fees'
          ]
        },
        {
          planId: 'pro',
          name: 'Shield Pro',
          coverageAmount: 3000,
          weeklyPremium: 99,
          features: [
            'All weather disruption coverage',
            'Accident protection included',
            'Instant 15-min payouts',
            'Priority support queue'
          ]
        },
        {
          planId: 'max',
          name: 'Shield Max',
          coverageAmount: 6000,
          weeklyPremium: 179,
          features: [
            'Comprehensive coverage',
            'Medical emergency fund access',
            'Zero deductible claims',
            'Dedicated account manager',
            'Family protection plan'
          ]
        }
      ]);
      console.log('✅ Default plans seeded successfully.');
    } else {
      console.log('Plans already exist in database.');
    }
  } catch (error) {
    console.error('Error seeding plans:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedPlans();
