const https = require('https');

const OPENWEATHER_BASE = 'https://api.openweathermap.org';

const buildAlerts = (humidity, temp, rainChance) => {
  const alerts = [];

  if (humidity >= 85) {
    alerts.push({
      id: 'humidity',
      type: 'warning',
      message: 'Humidity is high today. Fungal disease pressure is elevated.',
    });
  }

  if (temp >= 34) {
    alerts.push({
      id: 'heat',
      type: 'danger',
      message: 'Afternoon heat stress is likely. Irrigate sensitive crops early.',
    });
  }

  if (rainChance >= 0.6) {
    alerts.push({
      id: 'rain',
      type: 'warning',
      message: 'Rain is likely. Keep foliage dry and improve airflow where possible.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      type: 'info',
      message: 'Conditions are stable. Keep monitoring leaf moisture and airflow.',
    });
  }

  return alerts;
};

const buildRisks = (humidity, rainChance) => [
  {
    crop: 'Tomato',
    level: humidity > 82 || rainChance > 0.5 ? 'High' : 'Medium',
    likelyDisease: 'Late Blight',
    action: 'Scout lower canopy and prune to improve airflow.',
  },
  {
    crop: 'Potato',
    level: humidity > 85 || rainChance > 0.6 ? 'Critical' : 'High',
    likelyDisease: 'Early Blight',
    action: 'Inspect foliage and avoid overhead irrigation.',
  },
  {
    crop: 'Wheat',
    level: humidity > 70 ? 'Medium' : 'Low',
    likelyDisease: 'Rust',
    action: 'Monitor leaves for pustules and keep spacing adequate.',
  },
  {
    crop: 'Rice',
    level: humidity > 80 || rainChance > 0.5 ? 'High' : 'Medium',
    likelyDisease: 'Blast',
    action: 'Reduce prolonged leaf wetness and avoid excess nitrogen.',
  },
];

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`OpenWeather error ${res.statusCode}: ${raw}`));
          }
          try {
            resolve(JSON.parse(raw));
          } catch (err) {
            reject(new Error('Failed to parse weather response.'));
          }
        });
      })
      .on('error', (err) => reject(err));
  });

const toTitleCase = (value) =>
  value
    .split(' ')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : word))
    .join(' ');

const getLocalDateKey = (timestampSeconds, timezoneOffsetSeconds) => {
  const date = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000);
  return date.toISOString().slice(0, 10);
};

const getWeekdayShort = (timestampSeconds, timezoneOffsetSeconds) => {
  const dayIndex = new Date((timestampSeconds + timezoneOffsetSeconds) * 1000).getUTCDay();
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];
};

async function getWeatherForLocation(location) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured.');
  }

  const geoUrl = `${OPENWEATHER_BASE}/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
  const geoResults = await fetchJson(geoUrl);
  const geo = Array.isArray(geoResults) ? geoResults[0] : null;

  if (!geo) {
    throw new Error('Location not found. Try a nearby city or district.');
  }

  const { lat, lon, name, state, country } = geo;
  const currentUrl = `${OPENWEATHER_BASE}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const forecastUrl = `${OPENWEATHER_BASE}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

  const [current, forecast] = await Promise.all([fetchJson(currentUrl), fetchJson(forecastUrl)]);

  const timezoneOffset = forecast?.city?.timezone ?? current?.timezone ?? 0;
  const list = Array.isArray(forecast?.list) ? forecast.list : [];

  const nextDaySamples = list.slice(0, 8);
  const avgHumidity =
    nextDaySamples.reduce((sum, item) => sum + (item.main?.humidity || 0), 0) /
    (nextDaySamples.length || 1);
  const rainChance = Math.max(...nextDaySamples.map((item) => Number(item.pop || 0)), 0);

  const grouped = {};
  for (const item of list) {
    const key = getLocalDateKey(item.dt, timezoneOffset);
    if (!grouped[key]) {
      grouped[key] = {
        day: getWeekdayShort(item.dt, timezoneOffset),
        tempHigh: item.main?.temp ?? 0,
        tempLow: item.main?.temp ?? 0,
        humidityTotal: item.main?.humidity ?? 0,
        count: 1,
      };
    } else {
      grouped[key].tempHigh = Math.max(grouped[key].tempHigh, item.main?.temp ?? grouped[key].tempHigh);
      grouped[key].tempLow = Math.min(grouped[key].tempLow, item.main?.temp ?? grouped[key].tempLow);
      grouped[key].humidityTotal += item.main?.humidity ?? 0;
      grouped[key].count += 1;
    }
  }

  const forecastDays = Object.keys(grouped)
    .slice(0, 7)
    .map((key) => {
      const entry = grouped[key];
      const humidityAvg = entry.count ? Math.round(entry.humidityTotal / entry.count) : 0;
      return {
        day: entry.day,
        tempHigh: Math.round(entry.tempHigh),
        tempLow: Math.round(entry.tempLow),
        humidity: humidityAvg,
      };
    });

  const currentHumidity = current?.main?.humidity ?? Math.round(avgHumidity);
  const currentTemp = current?.main?.temp ?? 0;

  return {
    current: {
      temp: Math.round(currentTemp),
      feelsLike: Math.round(current?.main?.feels_like ?? currentTemp),
      humidity: Math.round(currentHumidity),
      windSpeed: Math.round((current?.wind?.speed ?? 0) * 3.6),
      condition: toTitleCase(current?.weather?.[0]?.description || 'Clear'),
      location: [name, state || country].filter(Boolean).join(', '),
    },
    forecast: forecastDays,
    alerts: buildAlerts(currentHumidity, currentTemp, rainChance),
    diseaseRisks: buildRisks(currentHumidity, rainChance),
  };
}

module.exports = { getWeatherForLocation };
