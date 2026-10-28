import { getForecast, searchCity } from "./api.js";
import {
  renderCityMatches,
  renderFavourites,
  renderTemperatureUnit,
  renderTodayDate,
  renderWeather,
  setStatus,
} from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

const favourites = [
  { name: "London", country: "United Kingdom" },
  { name: "Tokyo", country: "Japan" },
  { name: "New York", country: "United States" },
  { name: "Reykjavik", country: "Iceland" },
];

let activeCity = "";
let activeLocation = null;
let activeForecast = null;
let searchController = null;
let temperatureUnit = "celsius";

try {
  const savedUnit = localStorage.getItem("atmos-temperature-unit");
  if (savedUnit === "fahrenheit" || savedUnit === "celsius") {
    temperatureUnit = savedUnit;
  }
} catch (error) {
  setStatus(errorMessage, `Could not read your saved temperature unit. ${error.message}`);
}

function showWeather(location, forecast) {
  activeCity = location.name;
  activeLocation = location;
  activeForecast = forecast;
  renderWeather(location, forecast, temperatureUnit);
  renderFavourites(favourites, activeCity, searchForCity);
}

async function loadForecast(location, controller) {
  renderCityMatches([], () => {});
  setStatus(errorMessage, "");
  setStatus(statusMessage, "Loading…");

  try {
    const forecast = await getForecast(location.latitude, location.longitude, controller.signal);
    if (controller.signal.aborted) {
      return;
    }

    showWeather(location, forecast);
    searchInput.value = "";
    setStatus(statusMessage, `Weather updated for ${location.name}.`);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    setStatus(statusMessage, "");
    setStatus(errorMessage, `Unable to load weather. ${error.message}`);
  }
}

async function searchForCity(cityName) {
  searchController?.abort();
  const controller = new AbortController();
  searchController = controller;
  renderCityMatches([], () => {});
  setStatus(errorMessage, "");

  const query = cityName.trim();
  if (!query) {
    setStatus(statusMessage, "Enter a city name to search.");
    return;
  }

  setStatus(statusMessage, "Loading…");
  try {
    const cities = await searchCity(query, controller.signal);
    if (controller.signal.aborted) {
      return;
    }
    if (cities.length === 0) {
      setStatus(statusMessage, `We couldn't find "${query}". Check the spelling and try another city.`);
      return;
    }
    if (cities.length > 1) {
      renderCityMatches(cities, (city) => loadForecast(city, controller));
      setStatus(statusMessage, "Choose a city from the matching locations.");
      return;
    }

    await loadForecast(cities[0], controller);
  } catch (error) {
    if (controller.signal.aborted || error.name === "AbortError") {
      return;
    }

    setStatus(statusMessage, "");
    setStatus(errorMessage, `Unable to search for that city. ${error.message}`);
  }
}

function changeTemperatureUnit(unit) {
  temperatureUnit = unit;
  renderTemperatureUnit(unit);
  if (activeLocation && activeForecast) {
    renderWeather(activeLocation, activeForecast, temperatureUnit);
  }

  try {
    localStorage.setItem("atmos-temperature-unit", unit);
    setStatus(errorMessage, "");
  } catch (error) {
    setStatus(errorMessage, `Could not save your temperature unit. ${error.message}`);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchForCity(searchInput.value);
});

document.querySelector("#unit-celsius").addEventListener("click", () => changeTemperatureUnit("celsius"));
document.querySelector("#unit-fahrenheit").addEventListener("click", () => changeTemperatureUnit("fahrenheit"));

renderTodayDate(document.querySelector("#today-date"));
renderTemperatureUnit(temperatureUnit);
renderFavourites(favourites, activeCity, searchForCity);
searchForCity("London");
