import mongoose from 'mongoose';
import app from './src/app.js';
import { port, mongoUri } from './src/config/env.js';

mongoose.connect(mongoUri).then(() => {
    console.log('✅ DB connected successfully');
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📚 API Docs: http://localhost:${port}/api-docs`);
    });
}).catch(err => {
    console.error('❌ DB connection error:', err);
    process.exit(1);
});