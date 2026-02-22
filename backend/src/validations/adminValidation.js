import Joi from 'joi';

export const adminRegisterSchema = Joi.object({
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
    adminSecret: Joi.string().required().messages({
        'any.required': 'Admin secret key is required',
    }),
    household: Joi.object({
        address: Joi.string().optional(),
        size: Joi.number().integer().min(1).optional(),
        incomeLevel: Joi.string().valid('low', 'middle', 'high').optional(),
        type: Joi.string().valid('apartment', 'boarding', 'rural', 'other').optional(),
        tariffType: Joi.string().valid('domestic', 'religious', 'small_business').optional(),
        monthlyBudget: Joi.number().min(0).optional(),
    }).optional(),
});

export const updateRoleSchema = Joi.object({
    role: Joi.string().valid('family_user', 'admin', 'utility_agent').required()
});

export const assignHouseholdSchema = Joi.object({
    userId: Joi.string().required(),
    householdId: Joi.string().required()
});