import mongoose from 'mongoose';
import { mongoUri } from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('DB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;