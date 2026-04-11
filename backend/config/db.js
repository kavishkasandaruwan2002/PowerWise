const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI =
            process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise';

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        //process.exit(1);
    }
};

module.exports = connectDB;