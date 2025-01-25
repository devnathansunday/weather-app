$ = (x) => {
  return document.getElementById(x);
};

const apiKey = "7648da2175db11cc5e9b5d68627ee01b";
const weather = $("weather");
const temp = $("temp");
const weatherInfo = $("weather-info");
const weatherIcon = $("weather-icon");
const city = $("city");
const hourlyForecast = $("hourly-forecast");
const cityEntered = $("city-name");
const currentCityDate = $("current-city-date");
const form = $("weather-form");
const openSearchBtn = $("openSearchBtn");
const closeSearchBtn = $("closeSearchBtn");
const loader = $("load-screen");
const errorMessage = $("errorMessage");
const cityDetails = $("city-name-date");
const hourlyForecastSection = $("hourly-forcast-section");
const mainContainer = document.querySelector("main");
const angleUp = document.querySelector(".fa-angle-up");
const notification = $("notification");
const hr = $("top-hr");
const oops = $("name");

function clearFields() {
  weatherInfo.innerHTML = "";
  temp.innerHTML = "";
  hourlyForecast.innerHTML = "";
  cityEntered.innerHTML = "";
  weatherIcon.innerHTML = "";
  currentCityDate.innerHTML = "";
}

function toggleHourlyForecast() {
  if (window.getComputedStyle(hourlyForecastSection).bottom === "-225px") {
    hourlyForecastSection.style.bottom = "0";
    hourlyForecastSection.style.backgroundColor = "#ddd";
    angleUp.style.transform = "rotate(180deg)";
  } else {
    hourlyForecastSection.style.backgroundColor = "";
    hourlyForecastSection.style.bottom = "-225px";
    angleUp.style.transform = "rotate(0deg)";
  }
}

document.addEventListener("click", function (event) {
  if (!event.target.closest("#hourly-forcast-section")) {
    hourlyForecastSection.style.backgroundColor = "";
    hourlyForecastSection.style.bottom = "-225px";
    angleUp.style.transform = "rotate(0deg)";
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearFields();
  showLoader();
  setTimeout(() => {
    getWeather();
    city.value = "";
  }, 100);
});

function displayErrorMsg() {
  oops.style.display = "block";
  notification.style.display = "block";
  notification.style.textAlign = "center";
  notification.style.color = "#f7dc6f";
  hr.style.display = "block";
}

async function getWeather(lat, lon) {
  let url;

  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  } else {
    const city = document.getElementById("city").value.trim();
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  }

  const forecastUrl =
    lat && lon
      ? `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`
      : `https://api.openweathermap.org/data/2.5/forecast?q=${document
          .getElementById("city")
          .value.trim()}&appid=${apiKey}`;

  try {
    const responses = await Promise.all([fetch(url), fetch(forecastUrl)]);
    const [currentWeatherResponse, forecastResponse] = responses;

    if (!currentWeatherResponse.ok || !forecastResponse.ok) {
      throw new Error(
        `HTTP error! status: ${currentWeatherResponse.status} or ${forecastResponse.status}`
      );
    }
    const [currentWeatherData, forecastData] = await Promise.all([
      currentWeatherResponse.json(),
      forecastResponse.json(),
    ]);
    displayWeather(currentWeatherData);
    displayCityTime(currentWeatherData);
    displaHourlyForecast(forecastData.list);
    cityDetails.style.display = "block";
    weather.style.display = "flex";
    mainContainer.style.gap = "60px";
    mainContainer.style.paddingBottom = "100px";
    oops.style.display = "none";
    notification.style.display = "none";
    notification.style.textAlign = "";
    notification.style.color = "";
    notification.textContent = "";
    hr.style.display = "none";
  } catch (error) {
    cityDetails.style.display = "";
    weather.style.display = "";
    weatherIcon.style.display = "";
    mainContainer.style.gap = "0";
    mainContainer.style.paddingBottom = "";

    if (error.message.includes("404")) {
      displayErrorMsg();
      notification.textContent = "City not found";
    } else if (error.message.includes("400")) {
      displayErrorMsg();
      notification.textContent = "Invalid request";
    } else if (error.message.includes("401")) {
      displayErrorMsg();
      notification.textContent = "Unauthorized access";
    } else {
      displayErrorMsg();
      oops.style.display = "block";
      notification.textContent = `An error occurred (${error.message})`;
    }
  } finally {
    setTimeout(() => {
      hideLoader();
    }, 500);
  }
}

function getDefaultWeather() {
  showLoader();
  clearFields();
  oops.style.display = "none";
  notification.style.display = "none";
  hr.style.display = "none";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(lat, lon);
    },
    () => {
      console.error("Error getting user's location");
      notification.style.textAlign = "";
      notification.style.color = "";
      notification.textContent =
        "We couldn't access your location. Try enabling location services & try again or searching for a city.";
      weather.style.display = "none";
      cityDetails.style.display = "";
      mainContainer.style.gap = "0";
      oops.style.display = "block";
      notification.style.display = "block";
      hr.style.display = "block";

      setTimeout(() => {
        hideLoader();
      }, 3000);
    }
  );
}

document.addEventListener("DOMContentLoaded", function () {
  showLoader();
  requestAnimationFrame(getDefaultWeather);
});

function displayWeather(data) {
  if (data.cod === "404") {
    weatherInfo.innerHTML = `<p>${data.message}</p>`;
    temp.innerHTML = "Nan";
    weatherIcon.src = "";
    weatherIcon.alt = "";
    cityEntered.innerHTML = "Nan";
  } else {
    weatherIcon.style.display = "block";
    const cityName = data.name;
    const temperature = Math.round(data.main.temp - 273.15);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    const descriptionHtml = `<p class="description">${description}</p>`;
    weatherInfo.innerHTML = descriptionHtml ? descriptionHtml : "";
    temp.innerHTML = temperature
      ? `<p class="temperature">${temperature}°</p>`
      : "No data";
    cityEntered.innerHTML = cityName
      ? `<h1 class="cityName">${cityName}</h1>`
      : "No data";
    weatherIcon.src = iconUrl ? iconUrl : "";
    weatherIcon.alt = description ? description : "";
    $("weather-icon").src = iconUrl;
  }
}

function displaHourlyForecast(hourlyData) {
  const next24Hours = hourlyData.slice(0, 8);

  next24Hours.forEach((item) => {
    const dateTime = new Date(item.dt * 1000);
    const hour = dateTime.getHours();
    const temperature = Math.round(item.main.temp - 273.15);
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    const hourlyItemHtml = `
      <div class="hourly-item">
        <p>${hour % 12 === 0 ? 12 : hour % 12}:00${hour >= 12 ? "PM" : "AM"}</p>
        <img src="${iconUrl}" alt="hourly weather icon">
        <p>${temperature}°C</p>
      </div>
      <hr>
    `;
    hourlyForecast.innerHTML += hourlyItemHtml;
  });
}

function displayCityTime(data) {
  const timestamp = data.dt;
  const timezoneOffset = data.timezone;
  const localTime = new Date((timestamp + timezoneOffset) * 1000);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedTime = localTime.toLocaleString("en-US", options);
  currentCityDate.innerHTML = `<p>${formattedTime}</p>`;
}

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}
