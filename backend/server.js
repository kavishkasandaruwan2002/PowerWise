const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { swaggerUi, specs } = require('./config/swagger');

require('dotenv').config();//load env var

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());


//=============name feat/comp here ========
// Define Routes
app.use('/api/appliances', require('./routes/appliances'));
app.use('/api/readings', require('./routes/readings'));


//============================tariff calc=================
const tariffRoutes = require('./routes/tariffRoutes');
app.use('/api/v1/tariffs', tariffRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});


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
