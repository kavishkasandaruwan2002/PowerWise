const Joi = require('joi');

// Record consumption schema
const recordConsumptionSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  consumption: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Consumption must be a number',
      'number.min': 'Consumption cannot be negative',
      'any.required': 'Consumption is required'
    }),
  
  readingDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Reading date must be a valid date'
    }),
  
  readingTime: Joi.string()
    .trim()
    .pattern(/^\d{2}:\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Reading time must be in HH:MM format'
    }),
  
  period: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .optional()
    .default('daily')
    .messages({
      'any.only': 'Period must be one of: daily, weekly, monthly'
    }),
  
  meterReading: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Meter reading must be a number',
      'number.min': 'Meter reading cannot be negative'
    }),
  
  previousMeterReading: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Previous meter reading must be a number'
    }),
  
  meterId: Joi.string()
    .trim()
    .optional(),
  
  isEstimated: Joi.boolean()
    .optional()
    .default(false),
  
  estimationReason: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.max': 'Estimation reason cannot exceed 200 characters'
    }),
  
  isManualEntry: Joi.boolean()
    .optional()
    .default(true),
  
  sourceSystem: Joi.string()
    .valid('smartMeter', 'manualEntry', 'api', 'import')
    .optional()
    .default('manualEntry')
    .messages({
      'any.only': 'Source system must be one of: smartMeter, manualEntry, api, import'
    }),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

// Update consumption schema
const updateConsumptionSchema = Joi.object({
  consumption: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Consumption must be a number',
      'number.min': 'Consumption cannot be negative'
    }),
  
  readingDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Reading date must be a valid date'
    }),
  
  readingTime: Joi.string()
    .trim()
    .pattern(/^\d{2}:\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Reading time must be in HH:MM format'
    }),
  
  period: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .optional()
    .messages({
      'any.only': 'Period must be one of: daily, weekly, monthly'
    }),
  
  meterReading: Joi.number()
    .min(0)
    .optional(),
  
  previousMeterReading: Joi.number()
    .min(0)
    .optional(),
  
  isEstimated: Joi.boolean()
    .optional(),
  
  estimationReason: Joi.string()
    .trim()
    .max(200)
    .optional(),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
});

// Bulk import schema
const bulkImportSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  records: Joi.array()
    .items(
      Joi.object({
        consumption: Joi.number().min(0).required(),
        readingDate: Joi.date().required(),
        readingTime: Joi.string().trim().optional(),
        period: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
        meterReading: Joi.number().min(0).optional(),
        notes: Joi.string().trim().max(500).optional()
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one record is required',
      'any.required': 'Records array is required'
    })
});

// Comparison schema
const compareSchema = Joi.object({
  householdId: Joi.string()
    .required()
    .messages({
      'any.required': 'Household ID is required'
    }),
  
  period1Start: Joi.date()
    .required()
    .messages({
      'any.required': 'Period 1 start date is required'
    }),
  
  period1End: Joi.date()
    .required()
    .greater(Joi.ref('period1Start'))
    .messages({
      'any.required': 'Period 1 end date is required',
      'date.greater': 'Period 1 end date must be after start date'
    }),
  
  period2Start: Joi.date()
    .required()
    .messages({
      'any.required': 'Period 2 start date is required'
    }),
  
  period2End: Joi.date()
    .required()
    .greater(Joi.ref('period2Start'))
    .messages({
      'any.required': 'Period 2 end date is required',
      'date.greater': 'Period 2 end date must be after start date'
    })
});

/**
 * Validate record consumption
 */
function validateRecordConsumption(data) {
  return recordConsumptionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate update consumption
 */
function validateUpdateConsumption(data) {
  return updateConsumptionSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate bulk import
 */
function validateBulkImport(data) {
  return bulkImportSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate comparison
 */
function validateComparison(data) {
  return compareSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
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
  validateRecordConsumption,
  validateUpdateConsumption,
  validateBulkImport,
  validateComparison,
  validateHouseholdId,
  validateDateRange
};