const Joi = require('joi');

const createTipSchema = Joi.object({
  title: Joi.string().trim().max(120).required(),
  description: Joi.string().trim().max(1200).required(),
  category: Joi.string()
    .valid('Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other', 'General')
    .default('General'),
  requiredApplianceKeywords: Joi.array().items(Joi.string().trim().max(40)).default([]),
  requiredCategories: Joi.array()
    .items(Joi.string().valid('Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other', 'General'))
    .default([]),
  incomeTags: Joi.array().items(Joi.string().valid('LOW', 'MID', 'HIGH', 'ALL')).default(['ALL']),
  weatherTags: Joi.array().items(Joi.string().valid('HOT', 'RAINY', 'NORMAL', 'ALL')).default(['ALL']),
  timeTags: Joi.array().items(Joi.string().valid('DAY', 'NIGHT', 'PEAK', 'ALL')).default(['ALL']),
  effortLevel: Joi.string().valid('ZERO_COST', 'LOW_COST', 'INVESTMENT').default('ZERO_COST'),
  savingsModel: Joi.object({
    type: Joi.string().valid('PERCENT_OF_CATEGORY', 'FIXED_KWH', 'REDUCE_HOURS', 'STANDBY_OFF').default('PERCENT_OF_CATEGORY'),
    percent: Joi.number().min(0).max(100),
    fixedKWhMonthly: Joi.number().min(0),
    reduceHoursPerDay: Joi.number().min(0).max(24),
    applianceKeyword: Joi.string().trim().max(40)
  }).default({ type: 'PERCENT_OF_CATEGORY', percent: 5 }),
  isActive: Joi.boolean().default(true)
});

const interactionFeedbackSchema = Joi.object({
  rating: Joi.string().valid('HELPFUL', 'NOT_HELPFUL', 'NEUTRAL').required(),
  comment: Joi.string().trim().max(500).allow('', null)
});

const dismissSchema = Joi.object({
  days: Joi.number().integer().min(1).max(60).default(14)
});

module.exports = {
  createTipSchema,
  interactionFeedbackSchema,
  dismissSchema
};
