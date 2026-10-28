const weatherByCity = {
  london: {
    city: "London",
    country: "United Kingdom",
    temperature: 18,
    condition: "Partly cloudy",
    icon: "⛅",
    wind: 12,
    timeZone: "Europe/London",
    forecast: [
      { dayOffset: 0, icon: "⛅", high: 19, low: 13 },
      { dayOffset: 1, icon: "🌦️", high: 17, low: 12 },
      { dayOffset: 2, icon: "☁️", high: 16, low: 11 },
      { dayOffset: 3, icon: "🌤️", high: 20, low: 12 },
      { dayOffset: 4, icon: "☀️", high: 22, low: 14 },
      { dayOffset: 5, icon: "🌤️", high: 21, low: 14 },
      { dayOffset: 6, icon: "🌧️", high: 17, low: 12 },
    ],
  },
  tokyo: {
    city: "Tokyo",
    country: "Japan",
    temperature: 24,
    condition: "Clear skies",
    icon: "☀️",
    wind: 8,
    timeZone: "Asia/Tokyo",
    forecast: [
      { dayOffset: 0, icon: "☀️", high: 25, low: 18 },
      { dayOffset: 1, icon: "🌤️", high: 26, low: 19 },
      { dayOffset: 2, icon: "☀️", high: 27, low: 19 },
      { dayOffset: 3, icon: "🌦️", high: 23, low: 18 },
      { dayOffset: 4, icon: "☁️", high: 22, low: 17 },
      { dayOffset: 5, icon: "🌤️", high: 24, low: 18 },
      { dayOffset: 6, icon: "☀️", high: 26, low: 19 },
    ],
  },
  "new york": {
    city: "New York",
    country: "United States",
    temperature: 21,
    condition: "Sunny intervals",
    icon: "🌤️",
    wind: 14,
    timeZone: "America/New_York",
    forecast: [
      { dayOffset: 0, icon: "🌤️", high: 22, low: 16 },
      { dayOffset: 1, icon: "☀️", high: 24, low: 17 },
      { dayOffset: 2, icon: "🌦️", high: 20, low: 15 },
      { dayOffset: 3, icon: "☁️", high: 19, low: 14 },
      { dayOffset: 4, icon: "🌤️", high: 22, low: 16 },
      { dayOffset: 5, icon: "☀️", high: 25, low: 18 },
      { dayOffset: 6, icon: "🌤️", high: 23, low: 17 },
    ],
  },
  reykjavik: {
    city: "Reykjavik",
    country: "Iceland",
    temperature: 11,
    condition: "Light rain",
    icon: "🌧️",
    wind: 19,
    timeZone: "Atlantic/Reykjavik",
    forecast: [
      { dayOffset: 0, icon: "🌧️", high: 12, low: 7 },
      { dayOffset: 1, icon: "🌦️", high: 13, low: 8 },
      { dayOffset: 2, icon: "☁️", high: 12, low: 7 },
      { dayOffset: 3, icon: "🌤️", high: 14, low: 8 },
      { dayOffset: 4, icon: "🌧️", high: 11, low: 6 },
      { dayOffset: 5, icon: "☁️", high: 12, low: 7 },
      { dayOffset: 6, icon: "🌦️", high: 13, low: 8 },
    ],
  },
  singapore: {
    city: "Singapore",
    country: "Singapore",
    temperature: 30,
    condition: "Humid and cloudy",
    icon: "🌥️",
    wind: 10,
    timeZone: "Asia/Singapore",
    forecast: [
      { dayOffset: 0, icon: "🌥️", high: 31, low: 26 },
      { dayOffset: 1, icon: "🌦️", high: 30, low: 26 },
      { dayOffset: 2, icon: "⛈️", high: 29, low: 25 },
      { dayOffset: 3, icon: "🌦️", high: 30, low: 26 },
      { dayOffset: 4, icon: "🌤️", high: 31, low: 26 },
      { dayOffset: 5, icon: "🌦️", high: 30, low: 25 },
      { dayOffset: 6, icon: "🌥️", high: 31, low: 26 },
    ],
  },
};

const cityAliases = {
  "new york city": "new york",
  nyc: "new york",
  reykjavik: "reykjavik",
};

function normalizeCity(city) {
  const searchTerm = city.trim().toLocaleLowerCase();
  return cityAliases[searchTerm] ?? searchTerm;
}

export async function getWeather(city) {
  const weather = weatherByCity[normalizeCity(city)];
  if (!weather) {
    throw new Error(`No placeholder forecast found for "${city.trim()}". Try London, Tokyo, New York, Reykjavik, or Singapore.`);
  }

  return weather;
}

export async function getFavouriteCities() {
  return ["London", "Tokyo", "New York", "Reykjavik"].map((city) => weatherByCity[normalizeCity(city)]);
}
