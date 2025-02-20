// Obtención de elementos interactivos para manipular en el script
const searchBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');
const tempFill = document.getElementById('tempFill');
const humidityFill = document.getElementById('humidityFill');
const weatherIcon = document.getElementById('weatherIcon');
const windSpeedElem = document.querySelector('.wind');
const sunriseElem = document.querySelector('.sunrise');
const sunsetElem = document.querySelector('.sunset');
const moonLuminosityElem = document.querySelector('.moon-luminosity');
const moonPhaseElem = document.querySelector('.moon-phase');

// Cargar el clima de Las Palmas automáticamente al iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    checkWeather('Las Palmas');
});

// Evento del botón de búsqueda para consultar una ciudad ingresada
searchBtn.addEventListener('click', () => {
    if (!searchBox.value) {
        return alert("Introduzca una ciudad"); // Solicita ciudad si está vacía
    }
    checkWeather(searchBox.value);
});

async function checkWeather(city) {
    // URL de la API con clave y ciudad para obtener el clima
    const apiKey = 'a7a6acf4bb38c97fe6bfa1a3c782bd77';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Actualización de ciudad, temperatura, humedad y otros valores
    document.querySelector('.city').innerHTML = data.name;
    updateIndicators(Math.round(data.main.temp), data.main.humidity);
    updateWeatherIcon(data.weather[0].main);
    windSpeedElem.innerHTML = `${Math.round(data.wind.speed)} km/h`;
    const sunriseTime = data.sys.sunrise;
    const sunsetTime = data.sys.sunset;
    sunriseElem.innerHTML = formatTime(sunriseTime);
    sunsetElem.innerHTML = formatTime(sunsetTime);

    // Cambios de imagen de sol y fondo según el horario
    updateSunImage(sunriseTime, sunsetTime);
    changeBackground(sunriseTime, sunsetTime);

    // Cálculo de la fase lunar y luminosidad
    const { phase, luminosity } = calculateLunarPhase(new Date());
    moonPhaseElem.innerHTML = phase;
    moonLuminosityElem.innerHTML = `${luminosity}%`;
}

function updateSunImage(sunrise, sunset) {
    const currentTime = Math.floor(Date.now() / 1000);
    const sunImage = document.getElementById('sunImage');

    // Verifica si es día o noche para mostrar imagen de salida o puesta del sol
    if (currentTime >= sunrise && currentTime <= sunset) {
        sunImage.src = "images/salida_sol.png";
    } else {
        sunImage.src = "images/atardecer_sol.png";
    }
}

function updateIndicators(temp, humidity) {
    // Calcula ángulos para indicadores gráficos de temperatura y humedad
    const tempAngle = (temp / 60) * 180;
    tempFill.style.transform = `rotate(${tempAngle}deg)`;

    const humidityAngle = (humidity / 100) * 180;
    humidityFill.style.transform = `rotate(${humidityAngle}deg)`;

    // Actualiza textos en los indicadores
    document.querySelector('.temp').innerHTML = `${temp}°C`;
    document.querySelector('.humidity').innerHTML = `${humidity}%`;
}

function updateWeatherIcon(weather) {
    // Cambia el icono según el estado del clima
    const pathImages = "images/";
    if (weather === "Clouds") {
        weatherIcon.src = pathImages + "nubes.png";
    } else if (weather === "Clear") {
        weatherIcon.src = pathImages + "sol.png";
    } else if (weather === "Rain") {
        weatherIcon.src = pathImages + "lluvia.png";
    } else {
        weatherIcon.src = pathImages + "default.png";
    }
}

function formatTime(unixTime) {
    // Convierte tiempo Unix a formato HH:MM
    const date = new Date(unixTime * 1000);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2);
    return `${hours}:${minutes}`;
}

function changeBackground(sunrise, sunset) {
    const currentTime = Math.floor(Date.now() / 1000);
    const body = document.body;

    // Cambia el fondo del sitio según si es día o noche
    if (currentTime >= sunrise && currentTime <= sunset) {
        body.style.backgroundImage = "url('images/fondo_dia.png')";
    } else {
        body.style.backgroundImage = "url('images/fondo_noche.png')";
    }
}

function calculateLunarPhase(date) {
    const lunarCycle = 29.53;
    const knownNewMoon = new Date('2024-10-06T00:00:00Z');

    const diffTime = date - knownNewMoon;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const phaseDay = (diffDays % lunarCycle);

    // Determina fase lunar y luminosidad según la posición en el ciclo
    let phase = "";
    let luminosity = 0;
    if (phaseDay < 1) {
        phase = "Luna Nueva";
        luminosity = 0;
    } else if (phaseDay < 7.4) {
        phase = "Creciente Iluminante";
        luminosity = Math.round((phaseDay / 7.4) * 50);
    } else if (phaseDay < 14.8) {
        phase = "Luna Llena";
        luminosity = 100;
    } else if (phaseDay < 22.1) {
        phase = "Gibosa Menguante";
        luminosity = Math.round(100 - ((phaseDay - 14.8) / 7.4) * 50);
    } else {
        phase = "Luna Menguante";
        luminosity = Math.round((phaseDay - 22.1) / 7.4 * 50);
    }

    return { phase, luminosity };
}
