import mongoose from 'mongoose';
import app from './src/app.js';
import { port, mongoUri } from './src/config/env.js';

mongoose.connect(mongoUri).then(() => {
    console.log('DB connected');
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});