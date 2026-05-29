import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';

const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10).max(10),
  password: z.string().min(6),
  role: z.enum(['customer', 'doodhwala']).default('customer'),
  address: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6),
});

const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ phone: data.phone });
    if (existing) {
      res.status(400).json({ success: false, message: 'Phone already registered' });
      return;
    }
    const user = await User.create(data);
    const token = generateToken(user._id.toString(), user.role);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { token, user: { id: user._id, name: user.name, role: user.role, phone: user.phone } },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ phone: data.phone, isActive: true });
    if (!user || !(await user.comparePassword(data.password))) {
      res.status(401).json({ success: false, message: 'Invalid phone or password' });
      return;
    }
    const token = generateToken(user._id.toString(), user.role);
    res.json({
      success: true,
      message: 'Login successful',
      data: { token, user: { id: user._id, name: user.name, role: user.role, phone: user.phone } },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMe = async (req: Request & { user?: { userId: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'User fetched', data: user });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
