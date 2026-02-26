const axios = require('axios');

/**
 * Fetch current weather and 5‑day forecast for given coordinates.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Object} Current weather + forecast list
 */
const getWeatherByCoords = async (lat, lon) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error('OpenWeather API key not configured');

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

/**
 * Calculate average temperature from a forecast list for a given day.
 * @param {Array} list - forecast list from OpenWeather
 * @param {string} targetDate - date string 'YYYY-MM-DD'
 * @returns {number|null} average temperature
 */
const getDailyAvgTemp = (list, targetDate) => {
    const dayForecasts = list.filter(item => item.dt_txt.startsWith(targetDate));
    if (dayForecasts.length === 0) return null;
    const sum = dayForecasts.reduce((acc, item) => acc + item.main.temp, 0);
    return sum / dayForecasts.length;
};

module.exports = { getWeatherByCoords, getDailyAvgTemp };