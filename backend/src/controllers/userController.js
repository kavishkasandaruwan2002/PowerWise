import * as userService from '../services/userService.js';
import * as budgetService from '../services/budgetService.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/User.js';
//http://localhost:3000/api/v1/users/profile
export const getProfile = catchAsync(async (req, res, next) => {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
});
//http://localhost:3000/api/v1/users/update-profile
export const updateProfile = catchAsync(async (req, res, next) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ status: 'success', data: { user } });
});
//http://localhost:3000/api/v1/users/change-password
export const changePassword = catchAsync(async (req, res, next) => {
    await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({ status: 'success', message: 'Password changed successfully' });
});
//http://localhost:3000/api/v1/users/delete-account
export const deleteAccount = catchAsync(async (req, res, next) => {
    await userService.deleteAccount(req.user.id);
    res.status(204).send();
});
//http://localhost:3000/api/v1/users/budget-history
export const getBudgetHistory = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);
    const history = await budgetService.getBudgetHistory(user.householdId);
    res.status(200).json({ status: 'success', data: history });
});
//http://localhost:3000/api/v1/users/update-budget
export const updateBudget = catchAsync(async (req, res, next) => {
    const { budgetAmount } = req.body;
    const user = await User.findById(req.user.id);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const household = await budgetService.updateBudget(user.householdId, budgetAmount, month, year);
    res.status(200).json({ status: 'success', data: { household } });
});

// Admin controllers
//http://localhost:3000/api/v1/users/all-users
export const getAllUsers = catchAsync(async (req, res, next) => {
    const result = await userService.getAllUsers(req.query);
    res.status(200).json({ status: 'success', data: result });
});
//http://localhost:3000/api/v1/users/update-role/:id
export const updateUserRole = catchAsync(async (req, res, next) => {
    const user = await userService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ status: 'success', data: { user } });
});
//http://localhost:3000/api/v1/users/assign-user-to-household
export const assignUserToHousehold = catchAsync(async (req, res, next) => {
    const { userId, householdId } = req.body;
    const user = await userService.assignUserToHousehold(userId, householdId);
    res.status(200).json({ status: 'success', data: { user } });
});