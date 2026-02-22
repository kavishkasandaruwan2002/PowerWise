import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import specs from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; // Add this import
import globalErrorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Rate limiting
const limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000,
    message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', adminRoutes); // Add admin routes
app.use('/api/v1/public', publicRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;