import Joi from 'joi';

export const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required',
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last name is required',
    }),
    household: Joi.object({
        address: Joi.string().optional(),
        size: Joi.number().integer().min(1).optional(),
        incomeLevel: Joi.string().valid('low', 'middle', 'high').optional(),
        type: Joi.string().valid('apartment', 'boarding', 'rural', 'other').optional(),
        tariffType: Joi.string().valid('domestic', 'religious', 'small_business').optional(),
        monthlyBudget: Joi.number().min(0).optional(),
    }).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    household: Joi.object({
        address: Joi.string().optional(),
        size: Joi.number().integer().min(1).optional(),
        incomeLevel: Joi.string().valid('low', 'middle', 'high').optional(),
        type: Joi.string().valid('apartment', 'boarding', 'rural', 'other').optional(),
        tariffType: Joi.string().valid('domestic', 'religious', 'small_business').optional(),
        monthlyBudget: Joi.number().min(0).optional(),
    }).optional(),
}).min(1);

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

export const budgetUpdateSchema = Joi.object({
    budgetAmount: Joi.number().min(0).required(),
});