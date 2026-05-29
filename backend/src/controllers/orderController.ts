import { Response } from 'express';
import { z } from 'zod';
import Order from '../models/Order';
import Schedule from '../models/Schedule';
import { AuthRequest } from '../middleware/auth';

const orderSchema = z.object({
  scheduleId: z.string(),
  quantity: z.number().min(0.5),
  note: z.string().optional(),
});

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = orderSchema.parse(req.body);
    const schedule = await Schedule.findById(data.scheduleId);
    if (!schedule || !schedule.isActive) {
      res.status(404).json({ success: false, message: 'Schedule not found or inactive' });
      return;
    }
    if (data.quantity > schedule.availableQuantity) {
      res.status(400).json({ success: false, message: 'Not enough quantity available' });
      return;
    }
    const totalAmount = data.quantity * schedule.pricePerLitre;
    const order = await Order.create({
      customerId: req.user!.userId,
      doodhwalaId: schedule.doodhwalaId,
      scheduleId: data.scheduleId,
      quantity: data.quantity,
      totalAmount,
      date: schedule.date,
      note: data.note,
    });
    // Reduce available quantity
    schedule.availableQuantity -= data.quantity;
    await schedule.save();

    res.status(201).json({ success: true, message: 'Order placed!', data: order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', error: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ customerId: req.user!.userId })
      .populate('doodhwalaId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, message: 'Orders fetched', data: orders });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getDoodhwalaOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orders = await Order.find({ doodhwalaId: req.user!.userId, date: today })
      .populate('customerId', 'name phone address')
      .sort({ createdAt: -1 });
    res.json({ success: true, message: "Today's orders", data: orders });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['confirmed', 'delivered', 'cancelled'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }
    const order = await Order.findOneAndUpdate(
      { _id: id, doodhwalaId: req.user!.userId },
      { status },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, message: 'Order updated', data: order });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: id, customerId: req.user!.userId, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or cannot be cancelled' });
      return;
    }
    // Restore quantity
    await Schedule.findByIdAndUpdate(order.scheduleId, {
      $inc: { availableQuantity: order.quantity },
    });
    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
