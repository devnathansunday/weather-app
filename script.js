$=(x)=>{return document.getElementById(x)};

const apiKey = '7648da2175db11cc5e9b5d68627ee01b';
const temp = $('temp');
const weatherInfo = $('weather-info');
const weatherIcon = $('weather-icon');
const city = $('city');
const hourlyForecast = $('hourly-forecast');
const cityEntered = $('city-name');
const currentCityDate = $('current-city-date');
const form = $('weather-form');
const openSearchBtn = $('openSearchBtn');
const closeSearchBtn = $('closeSearchBtn');
const loader = $('load-screen');
const errorMessage = $('errorMessage');
const startBtn = $('start-button');
const notBox = $('notBox');

function toggleSearchInput() {
  if (getComputedStyle(city).visibility === 'hidden') {
    city.style.visibility = 'visible';
    city.style.width = '150px';
    city.style.height = '35px';
    city.style.padding = '0 10px';
    form.style.borderRadius = '5px';
    openSearchBtn.style.display = "none";
    closeSearchBtn.style.display = 'block';
    setTimeout(() => {
      city.focus();
    }, 500);
  } else {
    city.style.visibility = '';
    city.style.width = '';
    city.style.height = '';
    city.style.padding = '';
    form.style.borderRadius = '';
    openSearchBtn.style.display = '';
    closeSearchBtn.style.display = '';
  }
}

document.addEventListener('click', function(event) {
  if (!event.target.closest('#city') && !event.target.closest('#openSearchBtn') && !event.target.closest('#closeSearchBtn')) {
    city.style.visibility = '';
    city.style.width = '';
    city.style.height = '';
    city.style.padding = '';
    form.style.borderRadius = '';
    openSearchBtn.style.display = '';
    closeSearchBtn.style.display = '';
  }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  showLoader();
  errorMessage.style.display = "none";
  weatherInfo.innerHTML = "";
  temp.innerHTML = "";
  hourlyForecast.innerHTML = "";
  cityEntered.innerHTML = "";
  weatherIcon.innerHTML = "";
  currentCityDate.innerHTML = "";
  setTimeout(() => {
    getWeather();
    toggleSearchInput();
    city.value = "";
  }, 100);
});

function getWeather(lat, lon) {
  let url;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  } else {
    const city = document.getElementById('city').value.trim();
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  }
  
  const forecastUrl = lat && lon ? 
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}` : 
  `https://api.openweathermap.org/data/2.5/forecast?q=${document.getElementById('city').value.trim()}&appid=${apiKey}`;
  
  // const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  
  Promise.all([fetch(url), fetch(forecastUrl)])
  .then(([currentWeatherResponse, forecastResponse]) => {
      if (!currentWeatherResponse.ok || !forecastResponse.ok) {
        throw new Error(`HTTP error! status: ${currentWeatherResponse.status} or ${forecastResponse.status}`);
      }
      return Promise.all([currentWeatherResponse.json(), forecastResponse.json()]);
    })
    .then(([currentWeatherData, forecastData]) => {
      displayWeather(currentWeatherData);
      displayCityTime(currentWeatherData);
      displaHourlyForecast(forecastData.list);
    })
    .catch((error) => {
      weatherIcon.style.display = "";
      errorMessage.style.display = "block";
      if (error.message.includes("404")) {
        errorMessage.textContent = "Error fetching data";
      } else if (error.message.includes("400")) {
        errorMessage.textContent = "Invalid request";
      } else if (error.message.includes("401")) {
        errorMessage.textContent = "Unauthorized access";
      } else {
        errorMessage.textContent = `An error occurred (${error.message})`;
      }      
    })
    
    .finally(() => {
      setTimeout(() => {
        hideLoader();
      }, 500);
    });
  }
  
  function getDefaultWeather() {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeather(lat, lon);
    }, (error) => {
      displayErrorMessage("Error getting user's location. Please try again.");
      console.error("Error getting user's location:", error);
    });
  }

  function checkLocationAccess() {
    if (localStorage.getItem('locationAllowed') === 'true') {
      notBox.style.display = 'none';
      return true; 
    } else {
      notBox.style.display = "flex";
      return false; 
    }
  }
  
  function runApp() {
    if (checkLocationAccess()) {
      document.addEventListener('DOMContentLoaded', function() {
        showLoader();
        requestAnimationFrame(getDefaultWeather);
      });
    } else {
      startBtn.addEventListener('click', function() {
        notBox.style.display = 'none';
        localStorage.setItem('locationAllowed', 'true');
        showLoader();
        requestAnimationFrame(getDefaultWeather);
      });
    }
  }
  
  runApp(); 

  function displayWeather(data) {
    if (data.cod === "404") {
        weatherInfo.innerHTML = `<p>${data.message}</p>`;
        temp.innerHTML = 'no data';
        weatherIcon.src = '';
        weatherIcon.alt = '';
        cityEntered.innerHTML = 'City not found';
      } else {
        weatherIcon.style.display = "block";
        const cityName = data.name;
        const temperature = Math.round(data.main.temp - 273.15);
        const description = data.weather[0].description;
        const temperatureHtml = `
        <p class="temperature">${temperature}°</p>`;
        const iconCode = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

      const weatherHtml = `<h1 class="cityName">${cityName}</h1>`;
      const descriptionHtml = `<p class="description">${description}</p>`
      weatherInfo.innerHTML = descriptionHtml ? descriptionHtml : '';
      temp.innerHTML = temperature ? `<p class="temperature">${temperature}°</p>` : 'No data';
      cityEntered.innerHTML = cityName ? `<h1 class="cityName">${cityName}</h1>` : 'No data';
      weatherIcon.src = iconUrl ? iconUrl : '';
      weatherIcon.alt = description ? description : '';  
      $("weather-icon").src = iconUrl;
    }
}

function displaHourlyForecast(hourlyData) {
  const next24Hours = hourlyData.slice(0, 6);

  next24Hours.forEach(item => {
    const dateTime = new Date(item.dt * 1000);
    const hour = dateTime.getHours();
    const temperature = Math.round(item.main.temp - 273.15);
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    const hourlyItemHtml = `
      <div class="hourly-item">
        <p>${hour % 12 === 0 ? 12 : hour % 12}:00${hour >= 12 ? 'PM' : 'AM'}</p>
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
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
  };
  const formattedTime = localTime.toLocaleString('en-US', options);
  currentCityDate.innerHTML = `<p>${formattedTime}</p>`;
}

function showLoader() {
  loader.style.display = "flex";
}

function hideLoader() {
  loader.style.display = "none";
}