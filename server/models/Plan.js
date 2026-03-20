import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  planId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  coverageAmount: { type: Number, required: true },
  weeklyPremium: { type: Number, required: true },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true }
});

export const Plan = mongoose.model('Plan', planSchema);
