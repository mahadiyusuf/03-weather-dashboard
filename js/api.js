const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchJson(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new Error(`Could not connect to Open-Meteo: ${error.message}`, { cause: error });
  }

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed (${response.status} ${response.statusText}).`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Open-Meteo returned an invalid response.", { cause: error });
  }
}

export async function searchCity(name, signal) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5`;
  let data;
  try {
    data = await fetchJson(url, signal);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new Error(`City search failed: ${error.message}`, { cause: error });
  }

  return (data.results ?? []).map(({ name: cityName, admin1, country, latitude, longitude, timezone }) => ({
    name: cityName,
    admin1,
    country,
    latitude,
    longitude,
    timezone,
  }));
}

export async function getForecast(latitude, longitude, signal) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
  });
  let forecast;
  try {
    forecast = await fetchJson(`${FORECAST_URL}?${params}`, signal);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new Error(`Weather forecast failed: ${error.message}`, { cause: error });
  }

  if (!forecast.current || !forecast.daily) {
    throw new Error("Open-Meteo did not return current conditions and a daily forecast.");
  }

  return forecast;
}
