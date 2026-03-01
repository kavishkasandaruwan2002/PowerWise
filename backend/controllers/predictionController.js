const Household = require('../models/Household');
const { getWeatherByCoords, getDailyAvgTemp } = require('../utils/weather');

const getHouseholdWeather = async (req, res) => {
    try {
        const household = req.household;
        if (!household.location?.latitude || !household.location?.longitude) {
            return res.status(400).json({
                success: false,
                message: 'Household location (latitude/longitude) is required for weather data.'
            });
        }
        const weatherData = await getWeatherByCoords(household.location.latitude, household.location.longitude);
        return res.status(200).json({
            success: true,
            data: {
                city: weatherData.city.name,
                country: weatherData.city.country,
                current: weatherData.list[0],
                forecast: weatherData.list.slice(1, 6)
            }
        });
    } catch (err) {
        console.error('Weather API error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch weather data.', error: err.message });
    }
};

const predictConsumption = async (req, res) => {
    try {
        const household = req.household;
        const { month, year } = req.query;
        const now = new Date();
        const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
        const targetYear = year ? parseInt(year) : now.getFullYear();

        const budgets = household.budgets
            .filter(b => b.year < targetYear || (b.year === targetYear && b.month < targetMonth))
            .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

        if (budgets.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Need at least 3 months of historical budgets to make a prediction.'
            });
        }

        let avgTemp = 28; // fallback
        if (household.location?.latitude && household.location?.longitude) {
            try {
                const weatherData = await getWeatherByCoords(household.location.latitude, household.location.longitude);
                const temps = weatherData.list.slice(0, 5).map(item => item.main.temp);
                avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            } catch (err) {
                console.warn('Could not fetch weather for prediction, using default temperature.');
            }
        }

        // Simple linear regression
        const n = budgets.length;
        const sumX = budgets.reduce((acc, _, idx) => acc + idx, 0);
        const sumY = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
        const sumXY = budgets.reduce((acc, b, idx) => acc + idx * b.targetAmount, 0);
        const sumX2 = budgets.reduce((acc, _, idx) => acc + idx * idx, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        let predicted = intercept + slope * n;

        const baselineTemp = 28;
        if (avgTemp > baselineTemp) {
            predicted *= 1 + (avgTemp - baselineTemp) * 0.02;
        } else if (avgTemp < baselineTemp) {
            predicted *= 1 - (baselineTemp - avgTemp) * 0.01;
        }

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
        return res.status(500).json({ success: false, message: 'Prediction failed.', error: err.message });
    }
};

module.exports = { getHouseholdWeather, predictConsumption };