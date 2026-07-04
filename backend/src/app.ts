import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import sessionRoutes from './routes/session.routes';
import collectionRoutes from './routes/collection.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // Required so browser sends HttpOnly refreshToken cookie cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Cookie parser - needed to read req.cookies.refreshToken
app.use(cookieParser());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
const morganFormat = env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.info(message.trim()) }
  })
);

// Rate limiting
app.use(apiLimiter);

// Root route (removes 404 noise on GET /)
app.get('/', (_req, res) => {
  res.status(200).json({ name: 'BookVault API', version: '1.0.0', status: 'running' });
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler (must be last)
app.use(errorHandler);

export default app;
