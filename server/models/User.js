import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  workerId: { type: String, default: null },
  platform: { type: String, required: true, enum: ['zomato', 'swiggy'] },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
  activePlan: {
    planId: { type: String, enum: ['lite', 'pro', 'max', null], default: null },
    coverageAmount: { type: Number, default: 0 },
    weeklyPremium: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }
  }
});

export const User = mongoose.model('User', userSchema);
