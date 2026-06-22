import { Response } from 'express';
import { z } from 'zod';
import Schedule from '../models/Schedule';
import { AuthRequest } from '../middleware/auth';

const scheduleSchema = z.object({
  date: z.string(),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/),
  availableQuantity: z.number().positive(),
  pricePerLitre: z.number().positive(),
});

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = scheduleSchema.parse(req.body);
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const existing = await Schedule.findOne({ doodhwalaId: req.user!.userId, date });
    if (existing) {
      const updated = await Schedule.findByIdAndUpdate(existing._id, { ...data, date }, { new: true });
      res.json({ success: true, message: 'Schedule updated', data: updated });
      return;
    }
    const schedule = await Schedule.create({ ...data, date, doodhwalaId: req.user!.userId });
    res.status(201).json({ success: true, message: 'Schedule created', data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMySchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schedules = await Schedule.find({ doodhwalaId: req.user!.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json({ success: true, message: 'Schedules fetched', data: schedules });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTodaySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const schedule = await Schedule.findOne({ doodhwalaId: req.user!.userId, date: today, isActive: true });
    res.json({ success: true, message: 'Today schedule', data: schedule });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getActiveDoodhwalas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await Schedule.find({
      date: { $gte: today },
      isActive: true,
    })
      .sort({ date: 1 })
      .populate('doodhwalaId', 'name phone address');

    res.json({ success: true, message: 'Active doodhwalas', data: schedules });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};