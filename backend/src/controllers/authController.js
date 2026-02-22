import * as authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res, next) => {
    console.log('📝 AuthController: Register endpoint called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    try {
        const user = await authService.registerUser(req.body);
        console.log('✅ Registration successful for user:', user.email);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: { user }
        });
    } catch (error) {
        console.log('❌ AuthController: Registration failed');
        console.log('Error:', error);
        next(error);
    }
});

// ... rest of your controller functions

export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);
    res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: { user, accessToken, refreshToken },
    });
});

export const refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;
    const accessToken = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: { accessToken }
    });
});

export const logout = catchAsync(async (req, res, next) => {
    await authService.logout(req.user.id);
    res.status(204).send();
});

export const forgotPassword = catchAsync(async (req, res, next) => {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
        status: 'success',
        message: 'Password reset token sent to email'
    });
});

export const resetPassword = catchAsync(async (req, res, next) => {
    await authService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
    });
});