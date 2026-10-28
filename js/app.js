import { getFavouriteCities, getWeather } from "./api.js";
import { renderFavourites, renderTodayDate, renderWeather, setStatus } from "./ui.js";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#city-search");
const statusMessage = document.querySelector("#status-message");
const errorMessage = document.querySelector("#error-message");

let favourites = [];
let activeCity = "London";

function showWeather(weather) {
  activeCity = weather.city;
  renderWeather(weather);
  renderFavourites(favourites, activeCity, searchForCity);
}

async function searchForCity(city) {
  setStatus(errorMessage, "");
  setStatus(statusMessage, "Finding your forecast...");

  try {
    const weather = await getWeather(city);
    showWeather(weather);
    searchInput.value = "";
    setStatus(statusMessage, `Showing placeholder weather for ${weather.city}.`);
  } catch (error) {
    setStatus(statusMessage, "");
    setStatus(errorMessage, error.message);
  }
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchForCity(searchInput.value);
});

renderTodayDate(document.querySelector("#today-date"));
favourites = await getFavouriteCities();
const initialWeather = await getWeather(activeCity);
showWeather(initialWeather);
