const API_KEY = "cff39e11059ab94f71051911f9deddc5";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const HISTORY_KEY = "weatherHistory";
const MAX_HISTORY = 5;

// DOM Elements
const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherDisplay = document.getElementById("weather-display");

// Elements to update
const cityName = document.getElementById("city-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");

// History element (if it exists)
const historyContainer = document.getElementById("search-history");

async function getWeather(city) {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        showLoading();
        hideError();
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found");
            }
            throw new Error("Failed to fetch weather data");
        }
        
        const data = await response.json();
        displayWeather(data);
        saveToHistory(city);
        cityInput.value = "";
        
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    // Update all the DOM elements with weather data
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    
    // Safety check for weather array
    if (data.weather && data.weather[0]) {
        description.textContent = data.weather[0].description;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIcon.alt = data.weather[0].description;
    }
    
    feelsLike.textContent = `Feels Like: ${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    wind.textContent = `Wind: ${data.wind.speed} m/s`;
    pressure.textContent = `Pressure: ${data.main.pressure} hPa`;
    
    weatherDisplay.classList.remove("hidden");
}

function showLoading() {
    loading.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
}

function hideLoading() {
    loading.classList.add("hidden");
}

function showError(message) {
    error.textContent = message;
    error.classList.remove("hidden");
}

function hideError() {
    error.classList.add("hidden");
}

function saveToHistory(city) {
    // Get existing history
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    
    // Remove duplicate if city already exists
    history = history.filter(c => c.toLowerCase() !== city.toLowerCase());
    
    // Add city to the beginning
    history.unshift(city);
    
    // Keep only the last MAX_HISTORY items
    history = history.slice(0, MAX_HISTORY);
    
    // Save to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // Update display
    displayHistory(history);
}

function loadHistory() {
    // Load from localStorage
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    displayHistory(history);
}

function displayHistory(history) {
    // Only display if history container exists
    if (!historyContainer) return;
    
    historyContainer.innerHTML = "";
    
    if (history.length === 0) {
        historyContainer.innerHTML = "<p>No search history yet</p>";
        return;
    }
    
    history.forEach(city => {
        const button = document.createElement("button");
        button.textContent = city;
        button.classList.add("history-btn");
        button.addEventListener("click", () => {
            getWeather(city);
        });
        historyContainer.appendChild(button);
    });
}

// Event Listeners
form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

// Initialize
loadHistory();
