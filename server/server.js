import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Plan } from './models/Plan.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Health Check for Debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      has_mongo: !!process.env.MONGODB_URI,
      has_jwt: !!process.env.JWT_SECRET,
      node_env: process.env.NODE_ENV
    }
  });
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ CRITICAL: MONGODB_URI environment variable is not defined!');
}

mongoose.connect(MONGODB_URI || 'mongodb://127.0.0.1:27017/shieldpay')
  .then(() => console.log('✅ Connected to MongoDB server'))
  .catch(err => {
    console.error('❌ MongoDB connection error details:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
      console.error('💡 TIP: If this is on Vercel, ensure you have whitelisted all IPs (0.0.0.0/0) in MongoDB Atlas.');
    }
  });

const JWT_SECRET = process.env.JWT_SECRET || 'shieldpay-super-secret-key-2026';

// --- AUTH ROUTES ---

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, platform, password, workerId } = req.body;
    
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, phone, platform, password: hashedPassword, workerId });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        workerId: user.workerId,
        platform: user.platform,
        role: user.role,
        activePlan: user.activePlan
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        workerId: user.workerId,
        platform: user.platform,
        role: user.role,
        activePlan: user.activePlan
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// GET Current User Data (Protected Route)
app.get('/api/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// --- ADMIN ROUTES ---

// Update current user's plan (Self-Service)
app.put('/api/users/me/plan', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const { activePlan } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { activePlan },
      { new: true }
    );
    
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan' });
  }
});

// --- ADMIN ROUTES ---

// --- PLAN ROUTES ---

// Get all plans (Public)
app.get('/api/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

// Update plan details (Admin Only)
app.put('/api/plans/:id', isAdmin, async (req, res) => {
  try {
    const { coverageAmount, weeklyPremium, features, name, isActive } = req.body;
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { coverageAmount, weeklyPremium, features, name, isActive },
      { new: true }
    );
    if (!updatedPlan) return res.status(404).json({ message: 'Plan not found' });
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plan' });
  }
});

// --- PUBLIC ANALYTICS ---
app.get('/api/public/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const plans = await Plan.find();
    const users = await User.find({ role: 'user' });
    
    const planStats = plans.map(p => ({
      name: p.name,
      count: users.filter(u => u.activePlan?.planId === p.planId && u.activePlan?.status === 'active').length
    }));

    const platformStats = {
      zomato: users.filter(u => u.platform === 'zomato').length,
      swiggy: users.filter(u => u.platform === 'swiggy').length
    };

    res.json({ totalUsers, planStats, platformStats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch public stats' });
  }
});

// --- ADMIN ANALYTICS ---
app.get('/api/admin/stats', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const plans = await Plan.find();
    
    // Revenue and Plan distribution
    const users = await User.find({ role: 'user' });
    const planStats = plans.map(p => {
      const count = users.filter(u => u.activePlan?.planId === p.planId && u.activePlan?.status === 'active').length;
      return {
        name: p.name,
        count,
        revenue: count * p.weeklyPremium
      };
    });

    const totalRevenue = planStats.reduce((sum, p) => sum + p.revenue, 0);
    
    // Platform distribution
    const platformStats = {
      zomato: users.filter(u => u.platform === 'zomato').length,
      swiggy: users.filter(u => u.platform === 'swiggy').length
    };

    res.json({
      totalUsers,
      totalRevenue,
      planStats,
      platformStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// Middleware to check admin role
async function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all users
app.get('/api/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user details
app.put('/api/users/:id', isAdmin, async (req, res) => {
  try {
    const { name, phone, platform, role, activePlan, workerId } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, platform, role, activePlan, workerId },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user' });
  }
});

const PORT = process.env.PORT || 5000;

// Only listen if not in Vercel environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ShieldPay API Backend running on http://127.0.0.1:${PORT}`);
  });
}

export default app;
