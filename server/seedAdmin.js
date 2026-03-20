import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shieldpay';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Check if an admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('An admin user already exists with phone:', adminExists.phone);
      console.log('Username/Phone: ' + adminExists.phone + ', Password: (Use the one you set or run this script to reset an admin)');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Super Admin',
      phone: '9999999999',
      platform: 'zomato', 
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully.');
    console.log('--- CREDENTIALS ---');
    console.log('Phone/Username: 9999999999');
    console.log('Password: admin123');
    console.log('-------------------');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
