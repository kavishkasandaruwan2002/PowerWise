const axios = require('axios');

function clamp(num, min, max) {
  if (typeof num !== 'number' || Number.isNaN(num)) return null;
  return Math.min(max, Math.max(min, num));
}

function computeWeatherState({ temperatureC, precipitation }) {
  // Simple + explainable state machine
  if (typeof precipitation === 'number' && precipitation >= 0.2) return 'RAINY';
  if (typeof temperatureC === 'number' && temperatureC >= 30) return 'HOT';
  return 'NORMAL';
}

async function fetchFromOpenMeteo(lat, lon) {
  // Free provider, no API key required
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&timezone=auto`;
  const { data } = await axios.get(url, { timeout: 7000 });

  let temperatureC = null;
  let precipitation = null;

  if (data?.current) {
    if (typeof data.current.temperature_2m === 'number') temperatureC = data.current.temperature_2m;
    if (typeof data.current.precipitation === 'number') precipitation = data.current.precipitation;
  }

  // Backward-compatible fallback fields
  if (temperatureC === null && typeof data?.current_weather?.temperature === 'number') {
    temperatureC = data.current_weather.temperature;
  }
  if (precipitation === null && Array.isArray(data?.hourly?.precipitation) && data.hourly.precipitation.length) {
    if (typeof data.hourly.precipitation[0] === 'number') precipitation = data.hourly.precipitation[0];
  }

  return {
    provider: 'open-meteo',
    temperatureC: clamp(temperatureC, -50, 60),
    precipitation: clamp(precipitation, 0, 200),
    raw: data
  };
}

/**
 * Get current weather state for a location.
 * NO CACHING: Fetches from the 3rd-party API every time.
 * @param {{lat:number, lon:number}} params
 */
async function getWeatherState({ lat, lon }) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('lat and lon must be valid numbers');
  }

  const result = await fetchFromOpenMeteo(latitude, longitude);
  const weatherState = computeWeatherState(result);

  return {
    fromCache: false,
    weatherState,
    temperatureC: result.temperatureC,
    precipitation: result.precipitation,
    provider: result.provider,
    fetchedAt: new Date()
  };
}

module.exports = {
  getWeatherState,
  computeWeatherState
};
