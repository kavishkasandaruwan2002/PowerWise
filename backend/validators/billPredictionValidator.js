const Joi = require('joi');

// Create prediction schema
const createPredictionSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  budgetId: Joi.string()
    .optional()
    .messages({
      'string.base': 'Budget ID must be a string'
    })
});

// Compare prediction schema
const comparePredictionSchema = Joi.object({
  actualConsumption: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Actual consumption must be a number',
      'number.min': 'Actual consumption cannot be negative',
      'any.required': 'Actual consumption is required'
    }),
  
  actualBill: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Actual bill must be a number',
      'number.min': 'Actual bill cannot be negative',
      'any.required': 'Actual bill is required'
    })
});

// Update status schema
const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('provisional', 'confirmed', 'outdated')
    .required()
    .messages({
      'any.only': 'Status must be one of: provisional, confirmed, outdated',
      'any.required': 'Status is required'
    })
});

// Date range schema
const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .required()
    .messages({
      'any.required': 'Start date is required',
      'date.base': 'Start date must be a valid date'
    }),
  
  endDate: Joi.date()
    .required()
    .greater(Joi.ref('startDate'))
    .messages({
      'any.required': 'End date is required',
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    })
});

/**
 * Validate create prediction
 */
function validateCreatePrediction(data) {
  return createPredictionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate compare prediction
 */
function validateComparePrediction(data) {
  return comparePredictionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate update status
 */
function validateUpdateStatus(data) {
  return updateStatusSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate date range
 */
function validateDateRange(data) {
  return dateRangeSchema.validate(data, {
    abortEarly: false
  });
}

/**
 * Validate household ID
 */
function validateHouseholdId(id) {
  const schema = Joi.string().required();
  return schema.validate(id);
}

/**
 * Validate prediction ID
 */
function validatePredictionId(id) {
  const schema = Joi.string().required();
  return schema.validate(id);
}

/**
 * Validate months parameter
 */
function validateMonths(months) {
  const schema = Joi.number()
    .min(1)
    .max(60)
    .default(12);
  return schema.validate(months);
}

module.exports = {
  validateCreatePrediction,
  validateComparePrediction,
  validateUpdateStatus,
  validateDateRange,
  validateHouseholdId,
  validatePredictionId,
  validateMonths
};