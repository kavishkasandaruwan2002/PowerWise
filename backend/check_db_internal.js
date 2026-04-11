const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function checkDB() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise');
        console.log('✅ Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log(`\n--- Users (${users.length}) ---`);
        users.forEach(u => console.log(`[${u.role.toUpperCase()}] ${u.name} (${u.email})`));

        const households = await mongoose.connection.db.collection('households').find({}).toArray();
        console.log(`\n--- Households (${households.length}) ---`);
        households.forEach(h => console.log(`${h.name} - owner id: ${h.owner}`));

        await mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error during DB check:', err.message);
    }
}

checkDB();
