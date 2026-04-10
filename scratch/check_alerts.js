const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Alert = require('../backend/models/alertSchema');

async function checkAlerts() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const alerts = await Alert.find({});
        console.log(`Found ${alerts.length} alerts`);
        if (alerts.length > 0) {
            console.log('Sample alert:', JSON.stringify(alerts[0], null, 2));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAlerts();
