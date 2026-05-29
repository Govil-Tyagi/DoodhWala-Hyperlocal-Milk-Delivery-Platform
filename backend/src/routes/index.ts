import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { createSchedule, getMySchedules, getTodaySchedule, getActiveDoodhwalas } from '../controllers/scheduleController';
import { createOrder, getMyOrders, getDoodhwalaOrders, updateOrderStatus, cancelOrder } from '../controllers/orderController';
import { createSubscription, getMySubscriptions, pauseSubscription, cancelSubscription } from '../controllers/subscriptionController';

const router = Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);

// Schedule (doodhwala only)
router.post('/schedules', authenticate, authorize('doodhwala'), createSchedule);
router.get('/schedules/my', authenticate, authorize('doodhwala'), getMySchedules);
router.get('/schedules/today', authenticate, authorize('doodhwala'), getTodaySchedule);
router.get('/schedules/active', authenticate, authorize('customer'), getActiveDoodhwalas);

// Orders
router.post('/orders', authenticate, authorize('customer'), createOrder);
router.get('/orders/my', authenticate, authorize('customer'), getMyOrders);
router.get('/orders/doodhwala', authenticate, authorize('doodhwala'), getDoodhwalaOrders);
router.patch('/orders/:id/status', authenticate, authorize('doodhwala'), updateOrderStatus);
router.patch('/orders/:id/cancel', authenticate, authorize('customer'), cancelOrder);

// Subscriptions
router.post('/subscriptions', authenticate, authorize('customer'), createSubscription);
router.get('/subscriptions/my', authenticate, authorize('customer'), getMySubscriptions);
router.patch('/subscriptions/:id/pause', authenticate, pauseSubscription);
router.patch('/subscriptions/:id/cancel', authenticate, cancelSubscription);

export default router;
