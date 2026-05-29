import { Response } from 'express';
import { z } from 'zod';
import Subscription from '../models/Subscription';
import { AuthRequest } from '../middleware/auth';

const subscriptionSchema = z.object({
  doodhwalaId: z.string(),
  dailyQuantity: z.number().min(0.5),
  pricePerLitre: z.number().positive(),
  startDate: z.string(),
});

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = subscriptionSchema.parse(req.body);
    const existing = await Subscription.findOne({
      customerId: req.user!.userId,
      doodhwalaId: data.doodhwalaId,
      status: 'active',
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'Active subscription already exists' });
      return;
    }
    const subscription = await Subscription.create({
      ...data,
      customerId: req.user!.userId,
      startDate: new Date(data.startDate),
    });
    res.status(201).json({ success: true, message: 'Subscription created!', data: subscription });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMySubscriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const subscriptions = await Subscription.find({ customerId: req.user!.userId })
      .populate('doodhwalaId', 'name phone address')
      .sort({ createdAt: -1 });
    res.json({ success: true, message: 'Subscriptions fetched', data: subscriptions });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const pauseSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user!.userId },
      { status: 'paused' },
      { new: true }
    );
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.json({ success: true, message: 'Subscription paused', data: sub });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user!.userId },
      { status: 'cancelled', endDate: new Date() },
      { new: true }
    );
    if (!sub) {
      res.status(404).json({ success: false, message: 'Subscription not found' });
      return;
    }
    res.json({ success: true, message: 'Subscription cancelled', data: sub });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
