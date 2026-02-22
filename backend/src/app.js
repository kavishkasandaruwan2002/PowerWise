import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import specs from "./config/swagger.js";
import AppError from './utils/AppError.js';
import globalErrorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Security
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

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 404 handler
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;