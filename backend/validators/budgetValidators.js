const Joi = require('joi');

// Alert threshold schema
const alertThresholdSchema = Joi.object({
  consumption: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Consumption threshold must be a number',
      'number.min': 'Consumption threshold cannot be negative'
    }),
  
  billAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Bill amount threshold must be a number',
      'number.min': 'Bill amount threshold cannot be negative'
    }),
  
  percentageOfBudget: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .default(80)
    .messages({
      'number.base': 'Percentage must be a number',
      'number.min': 'Percentage cannot be negative',
      'number.max': 'Percentage cannot exceed 100'
    })
});

// Create budget schema
const createBudgetSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  monthlyLimit: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Monthly limit must be a number',
      'number.positive': 'Monthly limit must be greater than 0',
      'any.required': 'Monthly limit is required'
    }),
  
  alertThresholds: alertThresholdSchema.optional(),
  
  startDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),
  
  endDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'End date must be a valid date'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

// Update budget schema
const updateBudgetSchema = Joi.object({
  monthlyLimit: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.base': 'Monthly limit must be a number',
      'number.positive': 'Monthly limit must be greater than 0'
    }),
  
  alertThresholds: alertThresholdSchema.optional(),
  
  status: Joi.string()
    .valid('active', 'paused', 'completed', 'exceeded')
    .optional()
    .messages({
      'any.only': 'Status must be one of: active, paused, completed, exceeded'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});



// Consumption update schema
const consumptionSchema = Joi.object({
  consumption: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Consumption must be a number',
      'number.min': 'Consumption cannot be negative',
      'any.required': 'Consumption is required'
    })
});

/**
 * Validate budget creation
 */
function validateCreateBudget(data) {
  return createBudgetSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate budget update
 */
function validateUpdateBudget(data) {
  return updateBudgetSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate consumption
 */
function validateConsumption(data) {
  return consumptionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate household ID
 */
function validateHouseholdId(id) {
  const schema = Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    });
  
  return schema.validate(id);
}

/**
 * Validate budget ID
 */
function validateBudgetId(id) {
  const schema = Joi.string()
    .required()
    .messages({
      'any.required': 'Budget ID is required'
    });
  
  return schema.validate(id);
}

/**
 * Validate date range
 */
function validateDateRange(startDate, endDate) {
  const schema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required().greater(Joi.ref('startDate'))
  });
  
  return schema.validate({ startDate, endDate });
}

module.exports = {
  validateCreateBudget,
  validateUpdateBudget,
  validateConsumption,
  validateHouseholdId,
  validateBudgetId,
  validateDateRange
};