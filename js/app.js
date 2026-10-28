import { getForecast, searchCity } from "./api.js";
import {
  renderCityMatches,
  renderFavourites,
  renderFavoriteToggle,
  renderLoading,
  renderTemperatureUnit,
  renderTodayDate,
  renderWeather,
  setStatus,
} from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");
const locationButton = document.querySelector("#use-location");
const favouriteButton = document.querySelector("#favorite-toggle");

const FAVOURITES_KEY = "atmos-favourites";
const LAST_VIEWED_KEY = "atmos-last-viewed";

let favourites = [];
let activeLocation = null;
let activeForecast = null;
let searchController = null;
let temperatureUnit = "celsius";

function isSavedLocation(value) {
  return value
    && typeof value.name === "string"
    && typeof value.country === "string"
    && Number.isFinite(value.latitude)
    && Number.isFinite(value.longitude);
}

function readSavedLocations(key) {
  try {
    const savedValue = localStorage.getItem(key);
    if (!savedValue) {
      return [];
    }

    const parsed = JSON.parse(savedValue);
    if (key === FAVOURITES_KEY && !Array.isArray(parsed)) {
      throw new Error("Saved favourites are not a list.");
    }

    const locations = key === FAVOURITES_KEY ? parsed : [parsed];
    if (!locations.every(isSavedLocation)) {
      throw new Error("Saved location data is incomplete or invalid.");
    }
    return locations;
  } catch (error) {
    setStatus(errorMessage, `Could not read saved weather preferences. ${error.message}`);
    return [];
  }
}

function saveValue(key, value, description) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    setStatus(errorMessage, `Could not save ${description}. ${error.message}`);
  }
}

try {
  const savedUnit = localStorage.getItem("atmos-temperature-unit");
  if (savedUnit === "fahrenheit" || savedUnit === "celsius") {
    temperatureUnit = savedUnit;
  }
} catch (error) {
  setStatus(errorMessage, `Could not read your saved temperature unit. ${error.message}`);
}

favourites = readSavedLocations(FAVOURITES_KEY);
const [lastViewed] = readSavedLocations(LAST_VIEWED_KEY);

function renderCurrentWeather() {
  if (activeLocation && activeForecast) {
    renderWeather(activeLocation, activeForecast, temperatureUnit);
  }
}

function refreshFavouriteViews() {
  renderFavoriteToggle(activeLocation, favourites);
  renderFavourites(favourites, activeLocation?.name ?? "", loadFavourite);
}

function showWeather(location, forecast) {
  activeLocation = {
    name: location.name,
    country: location.country ?? "",
    latitude: location.latitude,
    longitude: location.longitude,
  };
  activeForecast = forecast;
  renderCurrentWeather();
  refreshFavouriteViews();
  saveValue(LAST_VIEWED_KEY, activeLocation, "your last viewed city");
}

function restoreForecastAfterLoading() {
  if (activeLocation && activeForecast) {
    renderCurrentWeather();
  } else {
    document.querySelector("#forecast-list").replaceChildren();
  }
}

function beginRequest() {
  searchController?.abort();
  searchController = new AbortController();
  renderCityMatches([], () => {});
  setStatus(errorMessage, "");
  renderLoading();
  return searchController;
}

async function loadForecast(location, controller) {
  renderCityMatches([], () => {});
  setStatus(errorMessage, "");
  renderLoading();

  try {
    const forecast = await getForecast(location.latitude, location.longitude, controller.signal);
    if (controller.signal.aborted || controller !== searchController) {
      return;
    }

    showWeather(location, forecast);
    searchInput.value = "";
    setStatus(statusMessage, `Weather updated for ${location.name}.`);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    restoreForecastAfterLoading();
    setStatus(statusMessage, "");
    setStatus(errorMessage, `Unable to load weather. ${error.message}`);
  }
}

async function searchForCity(cityName) {
  const controller = beginRequest();
  const query = cityName.trim();
  if (!query) {
    restoreForecastAfterLoading();
    setStatus(statusMessage, "Enter a city name to search.");
    return;
  }

  try {
    const cities = await searchCity(query, controller.signal);
    if (controller.signal.aborted || controller !== searchController) {
      return;
    }
    if (cities.length === 0) {
      restoreForecastAfterLoading();
      setStatus(statusMessage, `We couldn't find "${query}". Check the spelling and try another city.`);
      return;
    }
    if (cities.length > 1) {
      restoreForecastAfterLoading();
      renderCityMatches(cities, (city) => loadForecast(city, controller));
      setStatus(statusMessage, "Choose a city from the matching locations.");
      return;
    }

    await loadForecast(cities[0], controller);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    restoreForecastAfterLoading();
    setStatus(statusMessage, "");
    setStatus(errorMessage, `Unable to search for that city. ${error.message}`);
  }
}

function loadFavourite(location) {
  const controller = beginRequest();
  loadForecast(location, controller);
}

function toggleFavourite() {
  if (!activeLocation) {
    return;
  }

  const isFavourite = favourites.some((favourite) =>
    favourite.name === activeLocation.name
    && favourite.country === activeLocation.country
    && favourite.latitude === activeLocation.latitude
    && favourite.longitude === activeLocation.longitude);

  if (isFavourite) {
    favourites = favourites.filter((favourite) =>
      favourite.name !== activeLocation.name
      || favourite.country !== activeLocation.country
      || favourite.latitude !== activeLocation.latitude
      || favourite.longitude !== activeLocation.longitude);
  } else {
    favourites = [...favourites, { ...activeLocation }];
  }

  saveValue(FAVOURITES_KEY, favourites, "your favourites");
  refreshFavouriteViews();
}

function changeTemperatureUnit(unit) {
  temperatureUnit = unit;
  renderTemperatureUnit(unit);
  renderCurrentWeather();

  try {
    localStorage.setItem("atmos-temperature-unit", unit);
    setStatus(errorMessage, "");
  } catch (error) {
    setStatus(errorMessage, `Could not save your temperature unit. ${error.message}`);
  }
}

function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location services are not available in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        name: "My location",
        country: "",
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
    );
  });
}

function locationErrorMessage(error) {
  if (error.code === 1) {
    return "Location permission was denied. Allow location access in your browser settings, or search for a city.";
  }
  if (error.code === 2) {
    return "Your location could not be determined. Try again or search for a city.";
  }
  if (error.code === 3) {
    return "Finding your location timed out. Try again or search for a city.";
  }
  return error.message || "Could not access your location. Search for a city instead.";
}

async function useMyLocation() {
  const controller = beginRequest();
  setStatus(statusMessage, "Waiting for location permission…");
  try {
    const location = await getBrowserLocation();
    if (controller.signal.aborted || controller !== searchController) {
      return;
    }
    await loadForecast(location, controller);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    restoreForecastAfterLoading();
    setStatus(statusMessage, "");
    setStatus(errorMessage, locationErrorMessage(error));
  }
}

async function loadInitialWeather() {
  const controller = beginRequest();
  if (lastViewed) {
    await loadForecast(lastViewed, controller);
    return;
  }

  setStatus(statusMessage, "Finding your location…");
  try {
    const location = await getBrowserLocation();
    if (controller.signal.aborted || controller !== searchController) {
      return;
    }
    await loadForecast(location, controller);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    restoreForecastAfterLoading();
    setStatus(statusMessage, "");
    setStatus(errorMessage, locationErrorMessage(error));
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchForCity(searchInput.value);
});

document.querySelector("#unit-celsius").addEventListener("click", () => changeTemperatureUnit("celsius"));
document.querySelector("#unit-fahrenheit").addEventListener("click", () => changeTemperatureUnit("fahrenheit"));
locationButton.addEventListener("click", useMyLocation);
favouriteButton.addEventListener("click", toggleFavourite);

renderTodayDate(document.querySelector("#today-date"));
renderTemperatureUnit(temperatureUnit);
refreshFavouriteViews();
loadInitialWeather();
