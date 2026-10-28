const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

function getForecastDay(dayOffset) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return dayOffset === 0 ? "Today" : dayFormatter.format(date);
}

function getLocalTime(timeZone) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(new Date());
}

export function renderTodayDate(element) {
  element.textContent = dateFormatter.format(new Date());
}

export function renderWeather(weather) {
  document.querySelector("#current-location").textContent = `${weather.city}, ${weather.country}`;
  document.querySelector("#current-temperature").textContent = `${weather.temperature}°`;
  document.querySelector("#current-condition").textContent = weather.condition;
  document.querySelector("#current-icon").textContent = weather.icon;
  document.querySelector("#current-wind").textContent = weather.wind;
  document.querySelector("#current-time").textContent = getLocalTime(weather.timeZone);

  const forecast = document.querySelector("#forecast-list");
  forecast.replaceChildren(
    ...weather.forecast.map((day) => {
      const card = document.createElement("article");
      card.className = "forecast-card";
      card.setAttribute("aria-label", `${getForecastDay(day.dayOffset)}: ${day.high} degrees high, ${day.low} degrees low`);

      const dayName = document.createElement("span");
      dayName.className = "forecast-day";
      dayName.textContent = getForecastDay(day.dayOffset);

      const icon = document.createElement("span");
      icon.className = "forecast-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = day.icon;

      const temperatures = document.createElement("span");
      temperatures.className = "forecast-temps";
      const high = document.createElement("span");
      high.textContent = `${day.high}°`;
      const low = document.createElement("span");
      low.className = "forecast-low";
      low.textContent = `${day.low}°`;
      temperatures.append(high, low);

      card.append(dayName, icon, temperatures);
      return card;
    }),
  );
}

export function renderFavourites(favourites, activeCity, onSelect) {
  const list = document.querySelector("#favorites-list");
  list.replaceChildren(
    ...favourites.map((weather) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.className = "favorite-button";
      button.type = "button";
      button.setAttribute("aria-current", String(weather.city === activeCity));
      button.setAttribute("aria-label", `Show weather for ${weather.city}, ${weather.country}, ${weather.temperature} degrees`);
      button.addEventListener("click", () => onSelect(weather.city));

      const city = document.createElement("span");
      city.className = "favorite-city";
      const cityName = document.createElement("strong");
      cityName.textContent = weather.city;
      const country = document.createElement("span");
      country.textContent = weather.country;
      city.append(cityName, country);

      const summary = document.createElement("span");
      summary.className = "favorite-weather";
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = weather.icon;
      const temperature = document.createElement("strong");
      temperature.textContent = `${weather.temperature}°`;
      summary.append(icon, temperature);

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
