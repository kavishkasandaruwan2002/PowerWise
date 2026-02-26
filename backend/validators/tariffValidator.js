const Joi = require('joi');

// Schema for tariff blocks
const blockSchema = Joi.object({
  minUsage: Joi.number().min(0).required().messages({
    'number.base': 'minUsage must be a number',
    'number.min': 'minUsage cannot be negative',
    'any.required': 'minUsage is required'
  }),
  maxUsage: Joi.number().min(0).required().messages({
    'number.base': 'maxUsage must be a number',
    'number.min': 'maxUsage cannot be negative',
    'any.required': 'maxUsage is required'
  }),
  ratePerUnit: Joi.number().positive().required().messages({
    'number.base': 'ratePerUnit must be a number',
    'number.positive': 'ratePerUnit must be greater than 0',
    'any.required': 'ratePerUnit is required'
  }),
  description: Joi.string().max(200).optional()
});

// Schema for additional charges
const chargeSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Charge name is required'
  }),
  amount: Joi.number().min(0).required().messages({
    'number.base': 'Charge amount must be a number',
    'number.min': 'Charge amount cannot be negative',
    'any.required': 'Charge amount is required'
  }),
  description: Joi.string().max(200).optional()
});

// Main tariff create schema
const createTariffSchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Tariff name is required'
    }),
  
  provider: Joi.string()
    .trim()
    .max(50)
    .optional()
    .default('CEB')
    .messages({
      'string.max': 'Provider name cannot exceed 50 characters'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  blocks: Joi.array()
    .items(blockSchema)
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one tariff block is required',
      'any.required': 'Tariff blocks are required'
    }),
  
  fixedCharge: Joi.number()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Fixed charge must be a number',
      'number.min': 'Fixed charge cannot be negative'
    }),
  
  fixedChargeDescription: Joi.string()
    .trim()
    .max(100)
    .optional()
    .default('Monthly service charge'),
  
  additionalCharges: Joi.object({
    otherCharges: Joi.array()
      .items(chargeSchema)
      .optional()
      .default([])
  }).optional(),
  
  taxes: Joi.object({
    serviceChargeTax: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .default(0)
      .messages({
        'number.min': 'Tax cannot be negative',
        'number.max': 'Tax cannot exceed 100'
      }),
    
    energyTax: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .default(0)
      .messages({
        'number.min': 'Tax cannot be negative',
        'number.max': 'Tax cannot exceed 100'
      }),
    
    VAT: Joi.number()
      .min(0)
      .max(100)
      .optional()
      .default(0)
      .messages({
        'number.min': 'VAT cannot be negative',
        'number.max': 'VAT cannot exceed 100'
      })
  }).optional(),
  
  effectiveFrom: Joi.date()
    .optional()
    .default(() => new Date()),
  
  effectiveTo: Joi.date()
    .optional()
    .allow(null),
  
  isActive: Joi.boolean()
    .optional()
    .default(true),
  
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
});

// Update tariff schema (all fields optional except what makes sense)
const updateTariffSchema = Joi.object({
  blocks: Joi.array()
    .items(blockSchema)
    .min(1)
    .optional(),
  
  fixedCharge: Joi.number()
    .min(0)
    .optional(),
  
  fixedChargeDescription: Joi.string()
    .trim()
    .max(100)
    .optional(),
  
  additionalCharges: Joi.object({
    otherCharges: Joi.array()
      .items(chargeSchema)
      .optional()
  }).optional(),
  
  taxes: Joi.object({
    serviceChargeTax: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    
    energyTax: Joi.number()
      .min(0)
      .max(100)
      .optional(),
    
    VAT: Joi.number()
      .min(0)
      .max(100)
      .optional()
  }).optional(),
  
  effectiveFrom: Joi.date().optional(),
  effectiveTo: Joi.date().optional().allow(null),
  isActive: Joi.boolean().optional(),
  notes: Joi.string().trim().max(500).optional()
});

/**
 * Validate tariff creation data
 */
function validateCreateTariff(data) {
  return createTariffSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate tariff update data
 */
function validateUpdateTariff(data) {
  return updateTariffSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
}

/**
 * Validate consumption number
 */
function validateConsumption(consumption) {
  const schema = Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Consumption must be a number',
      'number.min': 'Consumption cannot be negative',
      'any.required': 'Consumption is required'
    });
  
  return schema.validate(consumption);
}

/**
 * Validate tariff ID
 */
function validateTariffId(id) {
  const schema = Joi.string()
    .required()
    .messages({
      'any.required': 'Tariff ID is required'
    });
  
  return schema.validate(id);
}

module.exports = {
  validateCreateTariff,
  validateUpdateTariff,
  validateConsumption,
  validateTariffId
};