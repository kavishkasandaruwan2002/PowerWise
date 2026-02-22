import User from '../models/User.js';
import Household from '../models/Household.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import AppError from '../utils/AppError.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { clientUrl } from '../config/env.js';

export const registerUser = async (userData) => {
    console.log('📝 ===== REGISTRATION STARTED =====');
    console.log('1. Received userData:', JSON.stringify(userData, null, 2));

    try {
        const { email, password, firstName, lastName, household } = userData;

        // Validate required fields
        if (!email || !password || !firstName || !lastName || !household) {
            console.log('❌ Missing required fields');
            throw new AppError('Missing required fields', 400);
        }

        console.log('2. Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            throw new AppError('User already exists with this email', 400);
        }
        console.log('✅ No existing user found');

        console.log('3. Creating household with data:', JSON.stringify(household, null, 2));
        const newHousehold = await Household.create(household);
        console.log('✅ Household created successfully:', {
            id: newHousehold._id,
            address: newHousehold.address,
            size: newHousehold.size
        });

        console.log('4. Creating user with data:', {
            email,
            firstName,
            lastName,
            householdId: newHousehold._id
        });

        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            householdId: newHousehold._id,
        });

        console.log('✅ User created successfully:', {
            id: user._id,
            email: user.email,
            role: user.role
        });

        console.log('📝 ===== REGISTRATION COMPLETED SUCCESSFULLY =====');
        return user;

    } catch (error) {
        console.log('❌ ===== REGISTRATION FAILED =====');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        if (error.code) console.log('Error code:', error.code);
        if (error.errors) console.log('Validation errors:', error.errors);
        throw error; // Re-throw to be caught by catchAsync
    }
};