const EnergyTip = require('../models/EnergyTip');
const TipInteraction = require('../models/TipInteraction');
const Appliance = require('../models/Appliance');
const tariffService = require('./tariffService');

function normalize(str) {
  return String(str || '').toLowerCase().trim();
}

function sum(nums) {
  return nums.reduce((acc, n) => acc + (Number(n) || 0), 0);
}

function estimateMonthlyKwh(applianceDoc) {
  const wattage = Number(applianceDoc.wattage) || 0;
  const hours = Number(applianceDoc.dailyUsageHours) || 0;
  const qty = Number(applianceDoc.quantity) || 1;
  return (wattage * hours * 30 * qty) / 1000;
}

function buildHouseholdUsage(appliances) {
  const categoryTotals = {};
  const namedTotals = {};

  for (const a of appliances) {
    const kwh = estimateMonthlyKwh(a);
    const cat = a.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + kwh;

    const key = normalize(a.name);
    namedTotals[key] = (namedTotals[key] || 0) + kwh;
  }

  const totalKwh = sum(Object.values(categoryTotals));
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, kwh]) => ({ category, kwh }))
    .slice(0, 3);

  return { totalKwh, categoryTotals, topCategories, namedTotals };
}

function matchesAnyKeyword(appliances, keywords = []) {
  if (!keywords?.length) return true;
  const keys = keywords.map(normalize).filter(Boolean);
  if (!keys.length) return true;

  return appliances.some(a => {
    const name = normalize(a.name);
    return keys.some(k => name.includes(k));
  });
}

function matchesCategories(usage, requiredCategories = []) {
  if (!requiredCategories?.length) return true;
  return requiredCategories.some(cat => (usage.categoryTotals[cat] || 0) > 0);
}

function matchesIncome(incomeTag, tipIncomeTags = []) {
  const tag = normalize(incomeTag).toUpperCase();
  if (!tipIncomeTags?.length) return true;
  if (tipIncomeTags.includes('ALL')) return true;
  if (!tag) return true; // if unknown, don't filter out
  return tipIncomeTags.includes(tag);
}

function matchesWeather(weatherState, tipWeatherTags = []) {
  if (!tipWeatherTags?.length) return true;
  if (tipWeatherTags.includes('ALL')) return true;
  return tipWeatherTags.includes(weatherState);
}

function estimateKwhSavedForTip(tip, appliances, usage) {
  const model = tip.savingsModel || {};
  const type = model.type || 'PERCENT_OF_CATEGORY';

  // Baseline category consumption
  const cat = tip.category && tip.category !== 'General' ? tip.category : null;
  const categoryBaseline = cat ? (usage.categoryTotals[cat] || 0) : usage.totalKwh;

  if (type === 'FIXED_KWH') {
    return Math.max(0, Number(model.fixedKWhMonthly) || 0);
  }

  if (type === 'PERCENT_OF_CATEGORY') {
    const pct = Math.max(0, Math.min(100, Number(model.percent) || 0));
    return (categoryBaseline * pct) / 100;
  }

  if (type === 'REDUCE_HOURS') {
    const reduceHours = Math.max(0, Math.min(24, Number(model.reduceHoursPerDay) || 0));
    if (reduceHours <= 0) return 0;

    const keyword = normalize(model.applianceKeyword);
    const targets = appliances.filter(a => {
      if (cat && a.category !== cat) return false;
      if (!keyword) return true;
      return normalize(a.name).includes(keyword);
    });

    // Sum savings for each target: wattage * reducedHours * 30 days
    let saved = 0;
    for (const a of targets) {
      const wattage = Number(a.wattage) || 0;
      const qty = Number(a.quantity) || 1;
      saved += (wattage * reduceHours * 30 * qty) / 1000;
    }
    return Math.max(0, saved);
  }

  if (type === 'STANDBY_OFF') {
    // Simplified standby model: save 1-3% of total, unless Standby category exists.
    const standbyBaseline = usage.categoryTotals['Standby'] || 0;
    const base = standbyBaseline > 0 ? standbyBaseline : usage.totalKwh;
    const pct = model.percent ? Number(model.percent) : (standbyBaseline > 0 ? 10 : 2);
    const p = Math.max(0, Math.min(100, pct));
    return (base * p) / 100;
  }

  // fallback
  return 0;
}

function buildExplanation({ tip, usage, weather }) {
  const parts = [];
  const top = usage?.topCategories?.[0];

  if (top?.category) {
    parts.push(`Your highest estimated monthly usage is ${top.category} (~${Number(top.kwh).toFixed(0)} kWh/month).`);
  }

  if (tip.category && tip.category !== 'General') {
    parts.push(`This tip targets ${tip.category} usage.`);
  }

  if (weather?.weatherState === 'HOT') {
    parts.push('Current weather is hot, so cooling-related savings are more relevant now.');
  }

  if (weather?.weatherState === 'RAINY') {
    parts.push('Current weather is rainy, so indoor and lighting usage may be higher now.');
  }

  return parts.join(' ');
}

function scoreTip({ tip, usage, appliances, weather, interaction, incomeTag }) {
  let score = 50;

  const topCategory = usage?.topCategories?.[0]?.category;
  if (topCategory && (tip.requiredCategories || []).includes(topCategory)) score += 20;
  if (topCategory && tip.category === topCategory) score += 10;

  if (
    tip.requiredApplianceKeywords?.length &&
    matchesAnyKeyword(appliances, tip.requiredApplianceKeywords)
  ) {
    score += 15;
  }

  if (tip.weatherTags?.includes('ALL')) score += 2;
  else if (tip.weatherTags?.includes(weather?.weatherState)) score += 10;

  if (tip.incomeTags?.includes(incomeTag)) score += 6;

  if (tip.effortLevel === 'ZERO_COST') score += 6;
  if (tip.effortLevel === 'LOW_COST') score += 2;
  if (tip.effortLevel === 'INVESTMENT') score -= 3;

  if (interaction?.feedback?.rating === 'HELPFUL') score += 8;
  if (interaction?.feedback?.rating === 'NOT_HELPFUL') score -= 20;
  if (interaction?.bookmarked) score += 5;
  if (interaction?.implemented) score -= 15;

  return Math.max(0, Math.min(100, score));
}

async function calculateLkrSavings({ baselineKwhMonthly, kwhSaved }) {
  const safeBaseline = Math.max(0, Number(baselineKwhMonthly) || 0);
  const safeSaved = Math.max(0, Math.min(safeBaseline, Number(kwhSaved) || 0));
  if (safeSaved <= 0) {
    return { lkrSaved: 0, baselineBill: null, newBill: null, tariffPlanId: null };
  }

  try {
    // Use active tariff for both totals.
    const baselineBill = await tariffService.calculateBillWithActiveTariff(safeBaseline);
    const newBill = await tariffService.calculateBillWithActiveTariff(Math.max(0, safeBaseline - safeSaved));

    const lkrSaved = Math.max(0, (baselineBill?.total || 0) - (newBill?.total || 0));
    return {
      lkrSaved: Number(lkrSaved.toFixed(2)),
      baselineBill,
      newBill,
      tariffPlanId: null
    };
  } catch (e) {
    // If tariff data isn't seeded yet, still return kWh estimate.
    return { lkrSaved: null, baselineBill: null, newBill: null, tariffPlanId: null };
  }
}

/**
 * Recommend energy tips for a household.
 * @param {{userId:string, householdId:string, incomeTag?:string, weather:object, limit?:number}} args
 */
async function recommendTips(args) {
  const userId = args.userId;
  const householdId = args.householdId;
  const incomeTag = args.incomeTag || 'ALL';
  const weather = args.weather;
  const limit = Number(args.limit || 5);

  // Fetch household appliances from Component 2 DB
  const appliances = await Appliance.find({ householdId, isActive: true }).lean();
  const usage = buildHouseholdUsage(appliances);

  // Fetch existing interactions (bookmarks, feedback, dismissals)
  const interactions = await TipInteraction.find({ userId, householdId }).lean();
  const interactionMap = new Map(interactions.map(i => [String(i.tipId), i]));

  // Base query for tips
  const allTips = await EnergyTip.find({ isActive: true }).lean();

  const now = new Date();
  const eligible = allTips.filter(tip => {
    const interaction = interactionMap.get(String(tip._id));
    if (interaction?.dismissedUntil && new Date(interaction.dismissedUntil) > now) return false;
    if (!matchesCategories(usage, tip.requiredCategories)) return false;
    if (!matchesAnyKeyword(appliances, tip.requiredApplianceKeywords)) return false;
    if (!matchesIncome(incomeTag, tip.incomeTags)) return false;
    if (!matchesWeather(weather?.weatherState, tip.weatherTags)) return false;
    return true;
  });

  const baselineKwhMonthly = usage.totalKwh;

  const scored = [];
  for (const tip of eligible) {
    const interaction = interactionMap.get(String(tip._id));
    const relevanceScore = scoreTip({
      tip,
      usage,
      appliances,
      weather,
      interaction,
      incomeTag
    });
    const kwhSavedMonthly = estimateKwhSavedForTip(tip, appliances, usage);
    const lkr = await calculateLkrSavings({ baselineKwhMonthly, kwhSaved: kwhSavedMonthly });
    const explanation = buildExplanation({ tip, usage, weather, incomeTag });

    scored.push({
      tip,
      relevanceScore,
      estimatedSavings: {
        kwhMonthly: Number(kwhSavedMonthly.toFixed(2)),
        lkrMonthly: lkr.lkrSaved
      },
      baseline: {
        kwhMonthly: Number(baselineKwhMonthly.toFixed(2)),
        billLkr: lkr.baselineBill?.total ?? null
      },
      explanation,
      interaction: interaction
        ? {
            bookmarked: !!interaction.bookmarked,
            implemented: !!interaction.implemented,
            feedback: interaction.feedback?.rating || null
          }
        : { bookmarked: false, implemented: false, feedback: null }
    });
  }

  scored.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }
    return b.estimatedSavings.kwhMonthly - a.estimatedSavings.kwhMonthly;
  });

  return {
    meta: {
      householdId,
      totalEstimatedKwhMonthly: Number(usage.totalKwh.toFixed(2)),
      topCategories: usage.topCategories,
      weather
    },
    recommendations: scored.slice(0, Math.max(1, Math.min(20, limit)))
  };
}

module.exports = {
  recommendTips,
  estimateKwhSavedForTip,
  buildHouseholdUsage
};
