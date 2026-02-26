const Household = require('../models/Household');
const { getWeatherByCoords, getDailyAvgTemp } = require('../utils/weather');

// ── Get current weather and forecast for a household ───────────────────────
const getHouseholdWeather = async (req, res) => {
    try {
        const household = req.household; // from householdAccess middleware
        if (!household.location || !household.location.latitude || !household.location.longitude) {
            return res.status(400).json({
                success: false,
                message: 'Household location (latitude/longitude) is required for weather data.'
            });
        }

        const weatherData = await getWeatherByCoords(
            household.location.latitude,
            household.location.longitude
        );

        return res.status(200).json({
            success: true,
            data: {
                city: weatherData.city.name,
                country: weatherData.city.country,
                current: weatherData.list[0], // first entry is nearest current time
                forecast: weatherData.list.slice(1, 6) // next 5 entries (approx 5 days)
            }
        });
    } catch (err) {
        console.error('Weather API error:', err.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data.',
            error: err.message
        });
    }
};

// ── Predict next month's consumption based on past budgets + weather ───────
const predictConsumption = async (req, res) => {
    try {
        const household = req.household;
        const { month, year } = req.query; // optional: month/year to predict for

        // Use current month if not specified
        const now = new Date();
        const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
        const targetYear = year ? parseInt(year) : now.getFullYear();

        // Need at least 3 past budgets for a simple trend
        const budgets = household.budgets
            .filter(b => b.year < targetYear || (b.year === targetYear && b.month < targetMonth))
            .sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
            });

        if (budgets.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Need at least 3 months of historical budgets to make a prediction.'
            });
        }

        // Get weather forecast for the target month (average temperature)
        // For simplicity, we'll use the current forecast for the target month's typical weather
        // In a real system, you might fetch historical weather data from a different API.
        let avgTemp = 28; // fallback default
        if (household.location?.latitude && household.location?.longitude) {
            try {
                const weatherData = await getWeatherByCoords(
                    household.location.latitude,
                    household.location.longitude
                );
                // Use forecast for the target month (rough approximation)
                // We'll just take the average of the next 5 days as a placeholder
                const temps = weatherData.list.slice(0, 5).map(item => item.main.temp);
                avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            } catch (err) {
                console.warn('Could not fetch weather for prediction, using default temperature.');
            }
        }

        // Very simple prediction model: linear regression based on past target amounts
        // (In reality, you'd also factor in weather, household size, etc.)
        const n = budgets.length;
        const sumX = budgets.reduce((acc, b, idx) => acc + idx, 0); // 0,1,2,...
        const sumY = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
        const sumXY = budgets.reduce((acc, b, idx) => acc + idx * b.targetAmount, 0);
        const sumX2 = budgets.reduce((acc, _, idx) => acc + idx * idx, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Next index = n
        let predicted = intercept + slope * n;

        // Adjust based on temperature: if hotter than baseline, increase consumption
        const baselineTemp = 28; // could be derived from historical averages
        if (avgTemp > baselineTemp) {
            predicted *= 1 + (avgTemp - baselineTemp) * 0.02; // +2% per degree above baseline
        } else if (avgTemp < baselineTemp) {
            predicted *= 1 - (baselineTemp - avgTemp) * 0.01; // -1% per degree below
        }

        // Ensure non‑negative
        predicted = Math.max(0, Math.round(predicted));

        return res.status(200).json({
            success: true,
            prediction: {
                month: targetMonth,
                year: targetYear,
                estimatedAmount: predicted,
                basedOnMonths: budgets.length,
                averageTemperature: avgTemp.toFixed(1),
                notes: 'Prediction based on past budgets and weather trend.'
            }
        });
    } catch (err) {
        console.error('Prediction error:', err);
        return res.status(500).json({
            success: false,
            message: 'Prediction failed.',
            error: err.message
        });
    }
};

module.exports = { getHouseholdWeather, predictConsumption };