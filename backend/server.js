const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PowerWise API Documentation'
}));

// Define Routes
app.use('/api/appliances', require('./routes/appliances'));
app.use('/api/readings', require('./routes/readings'));

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
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server Error'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = app; // Export for testing
