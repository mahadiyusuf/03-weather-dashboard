import { getWeatherCode } from "./weatherCodes.js";

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  timeZone: "UTC",
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function getForecastDay(date, index) {
  if (index === 0) {
    return "Today";
  }

  return dayFormatter.format(new Date(`${date}T00:00:00Z`));
}

function formatLocalTime(time) {
  return time?.split("T")[1]?.slice(0, 5) ?? "—";
}

function formatTemperature(value, unit) {
  const temperature = unit === "fahrenheit" ? (value * 9) / 5 + 32 : value;
  return `${Math.round(temperature)}°${unit === "fahrenheit" ? "F" : "C"}`;
}

export function renderTodayDate(element) {
  element.textContent = dateFormatter.format(new Date());
}

export function renderWeather(location, forecast, unit) {
  const { current, daily } = forecast;
  const currentConditions = getWeatherCode(current.weather_code);
  const locationName = location.country
    ? `${location.name}, ${location.country}`
    : location.name;

  document.querySelector("#current-location").textContent = locationName;
  document.querySelector("#current-temperature").textContent = formatTemperature(current.temperature_2m, unit);
  document.querySelector("#current-condition").textContent = currentConditions.label;
  document.querySelector("#current-icon").textContent = currentConditions.emoji;
  document.querySelector("#current-wind").textContent = Math.round(current.wind_speed_10m);
  document.querySelector("#current-humidity").textContent = `${Math.round(current.relative_humidity_2m)}%`;
  document.querySelector("#current-time").textContent = formatLocalTime(current.time);

  const forecastList = document.querySelector("#forecast-list");
  forecastList.replaceChildren(
    ...daily.time.map((date, index) => {
      const conditions = getWeatherCode(daily.weather_code[index]);
      const dayName = getForecastDay(date, index);
      const high = formatTemperature(daily.temperature_2m_max[index], unit);
      const low = formatTemperature(daily.temperature_2m_min[index], unit);
      const card = document.createElement("article");
      card.className = "forecast-card";
      card.setAttribute("aria-label", `${dayName}: ${high} high, ${low} low, ${conditions.label}`);

      const dayLabel = document.createElement("span");
      dayLabel.className = "forecast-day";
      dayLabel.textContent = dayName;

      const icon = document.createElement("span");
      icon.className = "forecast-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = conditions.emoji;

      const temperatures = document.createElement("span");
      temperatures.className = "forecast-temps";
      const highLabel = document.createElement("span");
      highLabel.textContent = high;
      const lowLabel = document.createElement("span");
      lowLabel.className = "forecast-low";
      lowLabel.textContent = low;
      temperatures.append(highLabel, lowLabel);

      card.append(dayLabel, icon, temperatures);
      return card;
    }),
  );
}

export function renderCityMatches(cities, onSelect) {
  const list = document.querySelector("#city-matches");
  const input = document.querySelector("#city-search");
  list.replaceChildren(
    ...cities.map((city) => {
      const item = document.createElement("li");
      item.setAttribute("role", "presentation");
      const button = document.createElement("button");
      button.className = "city-match-button";
      button.type = "button";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.textContent = [city.name, city.admin1, city.country].filter(Boolean).join(", ");
      button.addEventListener("click", () => onSelect(city));
      item.append(button);
      return item;
    }),
  );
  list.hidden = cities.length === 0;
  input.setAttribute("aria-expanded", String(cities.length > 0));
}

export function renderTemperatureUnit(unit) {
  document.querySelector("#unit-celsius").setAttribute("aria-pressed", String(unit === "celsius"));
  document.querySelector("#unit-fahrenheit").setAttribute("aria-pressed", String(unit === "fahrenheit"));
}

export function renderFavourites(favourites, activeCity, onSelect) {
  const list = document.querySelector("#favorites-list");
  list.replaceChildren(
    ...favourites.map((favourite) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.className = "favorite-button";
      button.type = "button";
      button.setAttribute("aria-current", String(favourite.name === activeCity));
      button.setAttribute("aria-label", `Show weather for ${favourite.name}`);
      button.addEventListener("click", () => onSelect(favourite.name));

      const city = document.createElement("span");
      city.className = "favorite-city";
      const cityName = document.createElement("strong");
      cityName.textContent = favourite.name;
      const country = document.createElement("span");
      country.textContent = favourite.country;
      city.append(cityName, country);

      const summary = document.createElement("span");
      summary.className = "favorite-weather";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "↗";
      const action = document.createElement("strong");
      action.textContent = "View";
      summary.append(icon, action);

      button.append(city, summary);
      item.append(button);
      return item;
    }),
  );

  document.querySelector("#favorites-count").textContent = String(favourites.length).padStart(2, "0");
}

export function setStatus(messageElement, message) {
  messageElement.textContent = message;
  messageElement.hidden = !message;
}
