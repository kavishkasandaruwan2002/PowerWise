const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise');
        console.log('Connected to MongoDB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('--- Users ---');
        users.forEach(u => console.log(`${u.name} (${u.email}) - ${u.role}`));

        const households = await mongoose.connection.db.collection('households').find({}).toArray();
        console.log('--- Households ---');
        households.forEach(h => console.log(`${h.name} - owner: ${h.owner}`));

        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkDB();
