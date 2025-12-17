import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/payment';
import downloadRoutes from './routes/download';
import { errorHandler } from './middleware/errorHandler';
import './models/database';

const app: Application = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use('/api', limiter);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ResumePro Server API',
    version: '1.0.0',
    endpoints: {
      payment: {
        createOrder: 'POST /api/payment/create-order',
        verifyPayment: 'POST /api/payment/verify',
      },
      download: {
        getResume: 'GET /api/download/:token',
        resendLink: 'POST /api/download/resend',
      },
    },
  });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/payment', paymentRoutes);
app.use('/api/download', downloadRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 ResumePro Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
