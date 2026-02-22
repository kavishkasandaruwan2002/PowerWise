const Joi = require('joi');

/**
 * Generic validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({
                success: false,
                error: messages.length === 1 ? messages[0] : messages
            });
        }
        next();
    };
};

/**
 * Validation middleware for partial updates (PUT/PATCH)
 * Makes all fields optional
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validateUpdate = (schema) => {
    return (req, res, next) => {
        // Fork the schema to make everything optional for updates
        const updateSchema = schema.fork(
            Object.keys(schema.describe().keys),
            (field) => field.optional()
        );

        const { error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({
                success: false,
                error: messages.length === 1 ? messages[0] : messages
            });
        }
        next();
    };
};

// ─── Validation Schemas ────────────────────────────────────────────

const schemas = {
    // Create appliance - all required fields must be present
    appliance: Joi.object({
        name: Joi.string().trim().max(100).required()
            .messages({ 'any.required': 'Appliance name is required' }),
        category: Joi.string()
            .valid('Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other')
            .required()
            .messages({ 'any.only': 'Category must be one of: Cooling, Lighting, Cooking, Standby, Entertainment, Other' }),
        wattage: Joi.number().min(1).max(10000).required()
            .messages({
                'number.min': 'Wattage must be at least 1W',
                'number.max': 'Wattage cannot exceed 10,000W'
            }),
        dailyUsageHours: Joi.number().min(0).max(24).required()
            .messages({
                'number.min': 'Daily usage hours cannot be negative',
                'number.max': 'Daily usage hours cannot exceed 24'
            }),
        efficiencyRating: Joi.string()
            .valid('Old', 'Standard', 'EnergySaving')
            .default('Standard'),
        purchaseYear: Joi.number()
            .min(1990)
            .max(new Date().getFullYear())
            .optional()
            .allow(null),
        brand: Joi.string().allow('', null).optional(),
        model: Joi.string().allow('', null).optional(),
        isActive: Joi.boolean().default(true)
    }),

    // Submit meter reading
    reading: Joi.object({
        householdId: Joi.string().optional(), // Will be auto-set from JWT if not provided
        readingValue: Joi.number().min(0).required()
            .messages({
                'any.required': 'Reading value is required',
                'number.min': 'Reading value cannot be negative'
            }),
        readingType: Joi.string()
            .valid('Monthly', 'Weekly', 'Custom')
            .default('Monthly'),
        readingDate: Joi.date().max('now').default(Date.now)
            .messages({ 'date.max': 'Reading date cannot be in the future' }),
        notes: Joi.string().max(500).allow('', null).optional()
    })
};

module.exports = { validate, validateUpdate, schemas };
