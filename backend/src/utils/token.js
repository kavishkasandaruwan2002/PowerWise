import jwt from 'jsonwebtoken';
import { jwt as jwtConfig } from '../config/env.js';

export const signAccessToken = (userId) => {
    return jwt.sign({ id: userId }, jwtConfig.accessSecret, {
        expiresIn: jwtConfig.accessExpire,
    });
};

export const signRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, jwtConfig.refreshSecret, {
        expiresIn: jwtConfig.refreshExpire,
    });
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, jwtConfig.accessSecret);
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, jwtConfig.refreshSecret);
};