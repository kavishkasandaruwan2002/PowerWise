import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('You are not logged in. Please log in to access.', 401));
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        if (user.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password. Please log in again.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        next(new AppError('Invalid token or authentication failed.', 401));
    }
};