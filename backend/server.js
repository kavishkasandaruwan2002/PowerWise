const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
