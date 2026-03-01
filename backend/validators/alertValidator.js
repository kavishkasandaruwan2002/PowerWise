const Joi = require('joi');

//types
const ALERT_TYPES = ['budget_threshold', 'budget_exceeded', 'usage_spike', 'bill_prediction', 'anomaly', 'tariff_change'];
const SEVERITIES = ['info', 'warning', 'critical'];
const SOURCE_MODULES = ['budget', 'consumption', 'prediction', 'spike_detection', 'tariff'];

//create al
const createAlertSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  userId: Joi.string()
    .required()
    .messages({
      'any.required': 'User ID is required'
    }),
  
  type: Joi.string()
    .valid(...ALERT_TYPES)
    .required()
    .messages({
      'any.only': `Alert type must be one of: ${ALERT_TYPES.join(', ')}`,
      'any.required': 'Alert type is required'
    }),
  
  title: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Title cannot exceed 200 characters'
    }),
  
  message: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Message cannot exceed 1000 characters'
    }),
  
  severity: Joi.string()
    .valid(...SEVERITIES)
    .optional()
    .default('warning')
    .messages({
      'any.only': `Severity must be one of: ${SEVERITIES.join(', ')}`
    }),
  
  sourceModule: Joi.string()
    .valid(...SOURCE_MODULES)
    .required()
    .messages({
      'any.only': `Source module must be one of: ${SOURCE_MODULES.join(', ')}`,
      'any.required': 'Source module is required'
    }),
  
  relatedId: Joi.string()
    .optional(),
  
  relatedData: Joi.object()
    .optional(),
  
  displayUntil: Joi.date()
    .optional()
    .messages({
      'date.base': 'Display until must be a valid date'
    })
});

//mark as read schema
const markAsReadSchema = Joi.object({
  isRead: Joi.boolean()
    .optional()
});

//alert schema
const resolveAlertSchema = Joi.object({
  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

const alertFilterSchema = Joi.object({
  type: Joi.string()
    .valid(...ALERT_TYPES)
    .optional(),
  
  severity: Joi.string()
    .valid(...SEVERITIES)
    .optional(),
  
  isRead: Joi.boolean()
    .optional(),
  
  limit: Joi.number()
    .min(1)
    .max(500)
    .optional()
    .default(50),
  
  skip: Joi.number()
    .min(0)
    .optional()
    .default(0)
});

//date range schema
const dateRangeSchema = Joi.object({
  startDate: Joi.date()
    .required()
    .messages({
      'any.required': 'Start date is required'
    }),
  
  endDate: Joi.date()
    .required()
    .greater(Joi.ref('startDate'))
    .messages({
      'any.required': 'End date is required',
      'date.greater': 'End date must be after start date'
    })
});

function validateCreateAlert(data) {
  return createAlertSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

function validateMarkAsRead(data) {
  return markAsReadSchema.validate(data, {
    abortEarly: false
  });
}

function validateResolveAlert(data) {
  return resolveAlertSchema.validate(data, {
    abortEarly: false
  });
}

function validateFilters(data) {
  return alertFilterSchema.validate(data, {
    abortEarly: false
  });
}

function validateDateRange(data) {
  return dateRangeSchema.validate(data, {
    abortEarly: false
  });
}

function validateHouseholdId(id) {
  const schema = Joi.string().required();
  return schema.validate(id);
}

function validateAlertId(id) {
  const schema = Joi.string().required();
  return schema.validate(id);
}

module.exports = {
  validateCreateAlert,
  validateMarkAsRead,
  validateResolveAlert,
  validateFilters,
  validateDateRange,
  validateHouseholdId,
  validateAlertId,
  ALERT_TYPES,
  SEVERITIES,
  SOURCE_MODULES
};