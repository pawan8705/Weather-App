let cityInput = document.querySelector(".city-input");
let searchButton = document.querySelector(".search-btn");
let currentWeatherdDiv = document.querySelector(".current-weather");
let weatherCardDiv = document.querySelector(".weather-cards");
let locationBtn = document.querySelector(".location-btn")

// API key for OpenWeatherMap API
let API_KEY = "5681d45080db070374e0907b1e58b5e5";

let createWeatherCard = (cityName, weatherItem, Index) => {
  if (Index === 0) {

    // HTML for main weather card 
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
  } else {

    // HTML for the other five day forecast card 
    return `<li class="card">
              <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
              <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather">
              <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
              <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
              <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
  }
}

let getWeatherDetails = (cityName, lat, lon) => {
  let WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

    // Filter the forecasts to get only foecast per day
    let uniqueForecastDays = [];
    let fiveDaysForecast = data.list.filter(forecast => {
      let forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDate)) {
        return uniqueForecastDays.push(forecastDate);
      }
    });

    //Clearing previous weather data
    cityInput.value = "";
    weatherCardDiv.innerHTML = "";
    currentWeatherdDiv.innerHTML = "";

    // Creating weather cards and adding them to the DOM 
    fiveDaysForecast.forEach((weatherItem, Index) => {
      if (Index === 0) {
        currentWeatherdDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, Index));
      } else {
        weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, Index));
      }
    });
  }).catch(() => {
    alert("An error occurred while fetching the weather forecast!");
  });
}

let getCityCoordinates = () => {

  // Get user entered city name and remove extra spaces
  let cityName = cityInput.value.trim();

  // Return if cityName is empty
  if (!cityName) return;
  let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Get entered city coordinates (latitude, logitude, and name) from the API response
  fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {

    // Return if cityName is empty
    if (!cityName) return;
    let { name, lat, lon } = data[0];
    getWeatherDetails(name, lat, lon);
  }).catch(() => {
    alert("An error occurred while fetching the coordinates!");
  });
}

let getuserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(position => {
    let { latitude, longitude } = position.coords;
    let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

    // Get city name from coordinates using reverse geocoding API
    fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
      let { name } = data[0];
      getWeatherDetails(name, latitude, longitude);
    }).catch(() => {
      alert("An error occurred while fetching the city!");
    });
  },
    error => {
      if (error.code === error.PERMISSION_DENIED) {
        alert("Geolocation request denied. Please reset location permission to grant access again.")
      }
    }
  );
}

locationBtn.addEventListener("click", getuserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
