const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { swaggerUi, specs } = require('./config/swagger');

require('dotenv').config();

const app = express();


connectDB();

// Init Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Swagger Documentations
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PowerWise API Documentation'
}));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/households', require('./routes/householdRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/prediction', require('./routes/predictionRoutes'));
app.use('/api/appliances', require('./routes/appliances'));
app.use('/api/readings', require('./routes/readings'));

// ======================= Tariff Routes =======================
const tariffRoutes = require('./routes/tariffRoutes');
app.use('/api/v1/tariffs', tariffRoutes);

// Budget Module Routes
const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/v1/budgets', budgetRoutes);

// Consumption Module Routes
const consumptionRoutes = require('./routes/consumptionRoutes');
app.use('/api/v1/consumption', consumptionRoutes);

// Bill Prediction Module Routes
const billPredictionRoutes = require('./routes/billPredictionRoutes');
app.use('/api/v1/predictions', billPredictionRoutes);

// Alert Module Routes
const alertRoutes = require('./routes/alertRoutes');
app.use('/api/v1/alerts', alertRoutes);

// Usage Spike Detection Routes
const usageSpikeRoutes = require('./routes/usageSpikeRoutes');
app.use('/api/v1/usage', usageSpikeRoutes);

// Energy Tips Routes
app.use('/api/v1/tips', require('./routes/tips'));
app.use('/api/v1/admin-tips', require('./routes/adminTips'));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'PowerWise API is running',
        version: '1.0.0',
        documentation: `http://localhost:${process.env.PORT || 5000}/api-docs`,
        endpoints: {
            appliances: '/api/appliances',
            readings: '/api/readings',
            efficiency: '/api/appliances/efficiency',
            carbon: '/api/appliances/carbon',
            anomalies: '/api/readings/anomalies',
            compare: '/api/readings/compare',
            docs: '/api-docs'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Server Error'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app;