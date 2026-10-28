# Atmos Weather Dashboard

Atmos is a responsive weather dashboard built with plain HTML, CSS, and JavaScript ES modules. It presents current conditions and a seven-day forecast for searched cities or the device's current location.

## Features

- Search cities and choose between matching locations.
- View current temperature, weather condition, wind speed, humidity, local time, and a seven-day forecast.
- Switch between Celsius and Fahrenheit; the selection is remembered in `localStorage`.
- Save and remove favourite locations with the star button on the current-weather card.
- Select a saved favourite to load its latest forecast.
- Use the browser's location permission to load weather for the current coordinates.
- Restore the last viewed location on the next visit.
- Responsive glass-style layout, loading skeletons, and accessible loading/error announcements.

## API

Weather and city data come from [Open-Meteo](https://open-meteo.com/), which does not require an API key:

- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

The browser makes these requests directly. Location access is optional and is requested through the browser's Geolocation API.

## Run locally

Serve this folder with a local HTTP server, then open its URL in a browser. ES modules and browser geolocation work best from `localhost` or another secure context.

## Screenshot

Add a dashboard screenshot at `screenshots/dashboard.png` and it will appear here:

![Atmos dashboard screenshot](screenshots/dashboard.png)

## What I learned

- Using `async`/`await`, `fetch`, and `AbortController` to coordinate dependent API requests and cancel outdated searches.
- Mapping Open-Meteo WMO weather codes into readable conditions and icons.
- Rendering external data safely with DOM elements and `textContent` instead of treating API strings as HTML.
- Converting units in the browser and persisting preferences and saved locations with `localStorage`.
- Handling geolocation permission states and building responsive, accessible UI states.
