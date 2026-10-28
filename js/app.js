import { getForecast, searchCity } from "./api.js";
import { renderFavourites, renderTodayDate, renderWeather, setStatus } from "./ui.js";

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

async function searchForCity(cityName) {
  setStatus(errorMessage, "");
  setStatus(statusMessage, "Loading…");

  try {
    const cities = await searchCity(cityName);
    if (cities.length === 0) {
      setStatus(statusMessage, `We couldn't find "${cityName}". Check the spelling and try another city.`);
      return;
    }

    const city = cities[0];
    const forecast = await getForecast(city.latitude, city.longitude);
    renderWeather(city, forecast);
    activeCity = city.name;
    renderFavourites(favourites, activeCity, searchForCity);
    searchInput.value = "";
    setStatus(statusMessage, `Weather updated for ${city.name}.`);
  } catch (error) {
    setStatus(statusMessage, "");
    setStatus(errorMessage, `Unable to load weather. ${error.message}`);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchForCity(searchInput.value.trim());
});

renderTodayDate(document.querySelector("#today-date"));
renderFavourites(favourites, activeCity, searchForCity);
searchForCity("London");
