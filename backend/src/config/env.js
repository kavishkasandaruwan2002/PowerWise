import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 5000;
export const mongoUri = process.env.MONGODB_URI;
export const jwt = {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpire: process.env.JWT_ACCESS_EXPIRE,
    refreshExpire: process.env.JWT_REFRESH_EXPIRE,
};
export const email = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
};
export const clientUrl = process.env.CLIENT_URL;
export const adminSecret = process.env.ADMIN_SECRET_KEY || 'your-super-secret-admin-key-change-this';