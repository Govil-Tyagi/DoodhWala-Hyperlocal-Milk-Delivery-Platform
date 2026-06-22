import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db';
import routes from './routes';
import rateLimit from 'express-rate-limit';
dotenv.config();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter AFTER cors
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// Health check
app.get('/health', (_, res) => res.json({ status: 'OK', message: 'DoodhWala API running 🐄' }));

// Routes
app.use('/api/v1', routes);

// 404 handler
app.use('*', (_, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Start
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
};

start();

export default app;