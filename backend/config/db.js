const mongoose = require('mongoose');

function resolveMongoUri() {
    if (process.env.NODE_ENV === 'test') {
        return (
            process.env.MONGO_TEST_URI ||
            'mongodb://localhost:27017/powerwise_test'
        );
    }
    return process.env.MONGODB_URI || 'mongodb://localhost:27017/powerwise';
}

const connectDB = async () => {
    try {
        const mongoURI = resolveMongoUri();

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        //process.exit(1);
    }
};

module.exports = connectDB;