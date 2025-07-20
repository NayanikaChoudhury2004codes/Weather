import { format, fromUnixTime, addDays, isWithinInterval } from 'date-fns';

export const getWeatherBackground = (weatherMain: string, isNight: boolean = false): string => {
  const weather = weatherMain.toLowerCase();
  
  if (isNight) {
    switch (weather) {
      case 'clear':
        return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900';
      case 'clouds':
        return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
      case 'rain':
      case 'drizzle':
        return 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800';
      case 'snow':
        return 'bg-gradient-to-br from-blue-800 via-slate-700 to-gray-800';
      case 'thunderstorm':
        return 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900';
      default:
        return 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800';
    }
  }

  switch (weather) {
    case 'clear':
      return 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500';
    case 'clouds':
      return 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
    case 'rain':
    case 'drizzle':
      return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
    case 'snow':
      return 'bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300';
    case 'thunderstorm':
      return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900';
    case 'mist':
    case 'fog':
    case 'haze':
      return 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500';
    default:
      return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
  }
};

export const isNightTime = (sunrise: number, sunset: number, timezone: number): boolean => {
  const now = new Date();
  const currentHour = now.getUTCHours() + (timezone / 3600);
  const sunriseHour = new Date(sunrise * 1000).getUTCHours() + (timezone / 3600);
  const sunsetHour = new Date(sunset * 1000).getUTCHours() + (timezone / 3600);
  
  return currentHour < sunriseHour || currentHour > sunsetHour;
};

export const getWeatherAdvice = (temp: number, feelsLike: number, weather: string, humidity: number, windSpeed: number): string => {
  const advice: string[] = [];
  
  // Temperature advice
  if (temp <= 0) {
    advice.push("🧥 Bundle up! It's freezing outside.");
  } else if (temp <= 10) {
    advice.push("🧥 Wear a warm jacket and layers.");
  } else if (temp <= 20) {
    advice.push("👕 A light jacket or sweater would be perfect.");
  } else if (temp <= 30) {
    advice.push("👕 Comfortable weather for light clothing.");
  } else {
    advice.push("🌞 Stay cool! Light, breathable fabrics recommended.");
  }

  // Feels like temperature
  const tempDiff = Math.abs(temp - feelsLike);
  if (tempDiff > 5) {
    if (feelsLike > temp) {
      advice.push(`🌡️ It feels ${Math.round(tempDiff)}°C warmer due to humidity.`);
    } else {
      advice.push(`❄️ Wind chill makes it feel ${Math.round(tempDiff)}°C cooler.`);
    }
  }

  // Weather-specific advice
  const weatherLower = weather.toLowerCase();
  if (weatherLower.includes('rain')) {
    advice.push("☔ Don't forget your umbrella!");
  } else if (weatherLower.includes('snow')) {
    advice.push("❄️ Watch out for slippery conditions.");
  } else if (weatherLower.includes('clear') && temp > 25) {
    advice.push("🧴 Apply sunscreen before going out.");
  } else if (weatherLower.includes('thunderstorm')) {
    advice.push("⛈️ Stay indoors if possible. Avoid outdoor activities.");
  }

  // Humidity advice
  if (humidity > 80) {
    advice.push("💧 High humidity - stay hydrated and avoid strenuous outdoor activities.");
  } else if (humidity < 30) {
    advice.push("🏜️ Low humidity - moisturize and drink plenty of water.");
  }

  // Wind advice
  if (windSpeed > 20) {
    advice.push("💨 Very windy conditions - secure loose items.");
  } else if (windSpeed > 10) {
    advice.push("🍃 Breezy conditions - perfect for outdoor activities.");
  }

  return advice.join(' ');
};

export const getClothingRecommendation = (temp: number, weather: string, isRaining: boolean): string => {
  let clothing = '';
  
  if (temp <= 0) {
    clothing = "Heavy winter coat, thermal layers, warm boots, gloves, and hat";
  } else if (temp <= 10) {
    clothing = "Warm jacket, sweater, long pants, closed shoes";
  } else if (temp <= 20) {
    clothing = "Light jacket or cardigan, long or short sleeves";
  } else if (temp <= 30) {
    clothing = "T-shirt, light pants or shorts, comfortable shoes";
  } else {
    clothing = "Light, breathable clothing, shorts, sandals";
  }

  if (isRaining) {
    clothing += ", waterproof jacket, umbrella";
  }

  if (weather.toLowerCase().includes('snow')) {
    clothing += ", waterproof boots, warm accessories";
  }

  return clothing;
};

export const formatTime = (timestamp: number, timezone: number): string => {
  const date = fromUnixTime(timestamp);
  const localDate = new Date(date.getTime() + (timezone * 1000));
  return format(localDate, 'HH:mm');
};

export const formatDate = (timestamp: number): string => {
  return format(fromUnixTime(timestamp), 'EEE, MMM dd');
};

export const getAirQualityLevel = (aqi: number): { level: string; color: string; description: string } => {
  if (aqi === 1) return { level: 'Good', color: 'text-green-600', description: 'Air quality is satisfactory' };
  if (aqi === 2) return { level: 'Fair', color: 'text-yellow-600', description: 'Air quality is acceptable' };
  if (aqi === 3) return { level: 'Moderate', color: 'text-orange-600', description: 'Some health concerns for sensitive people' };
  if (aqi === 4) return { level: 'Poor', color: 'text-red-600', description: 'Health warnings of emergency conditions' };
  if (aqi === 5) return { level: 'Very Poor', color: 'text-purple-600', description: 'Health alert: everyone may experience more serious health effects' };
  return { level: 'Unknown', color: 'text-gray-600', description: 'Air quality data unavailable' };
};

export const getUVIndexLevel = (uvIndex: number): { level: string; color: string; advice: string } => {
  if (uvIndex <= 2) return { level: 'Low', color: 'text-green-600', advice: 'No protection needed' };
  if (uvIndex <= 5) return { level: 'Moderate', color: 'text-yellow-600', advice: 'Some protection needed' };
  if (uvIndex <= 7) return { level: 'High', color: 'text-orange-600', advice: 'Protection essential' };
  if (uvIndex <= 10) return { level: 'Very High', color: 'text-red-600', advice: 'Extra protection needed' };
  return { level: 'Extreme', color: 'text-purple-600', advice: 'Avoid being outside' };
};

export const groupForecastByDay = (forecastList: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  
  forecastList.forEach(item => {
    const date = format(fromUnixTime(item.dt), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(item);
  });
  
  return grouped;
};

export const getHourlyForecast = (forecastList: any[], hours: number = 24) => {
  return forecastList.slice(0, Math.ceil(hours / 3));
};

export const getDailyForecast = (forecastList: any[]) => {
  const grouped = groupForecastByDay(forecastList);
  const daily: any[] = [];
  
  Object.keys(grouped).forEach(date => {
    const dayData = grouped[date];
    const temps = dayData.map(item => item.main.temp);
    const weatherCounts: { [key: string]: number } = {};
    
    dayData.forEach(item => {
      const weather = item.weather[0].main;
      weatherCounts[weather] = (weatherCounts[weather] || 0) + 1;
    });
    
    const dominantWeather = Object.keys(weatherCounts).reduce((a, b) => 
      weatherCounts[a] > weatherCounts[b] ? a : b
    );
    
    daily.push({
      date,
      temp_min: Math.min(...temps),
      temp_max: Math.max(...temps),
      weather: dayData.find(item => item.weather[0].main === dominantWeather).weather[0],
      humidity: Math.round(dayData.reduce((sum, item) => sum + item.main.humidity, 0) / dayData.length),
      wind_speed: Math.round(dayData.reduce((sum, item) => sum + item.wind.speed, 0) / dayData.length),
    });
  });
  
  return daily.slice(0, 7); // Return next 7 days
};

export const generateWeatherStory = (weatherData: any): string => {
  const { name, weather, main, wind } = weatherData;
  const weatherDesc = weather[0].description;
  const temp = Math.round(main.temp);
  const feelsLike = Math.round(main.feels_like);
  
  const stories = [
    `In the heart of ${name}, ${weatherDesc} paints the sky while the temperature settles at a comfortable ${temp}°C. `,
    `${name} awakens to ${weatherDesc}, with the air carrying whispers of ${temp}°C. `,
    `The city of ${name} embraces ${weatherDesc} today, as thermometers dance around ${temp}°C. `,
  ];
  
  const story = stories[Math.floor(Math.random() * stories.length)];
  
  if (Math.abs(temp - feelsLike) > 3) {
    return story + `Though it feels more like ${feelsLike}°C due to atmospheric conditions. `;
  }
  
  if (wind.speed > 5) {
    return story + `Gentle winds at ${Math.round(wind.speed)} m/s add a refreshing touch to the atmosphere.`;
  }
  
  return story + `The air is still and peaceful, perfect for a moment of reflection.`;
};

export const getWeatherEmoji = (weatherMain: string): string => {
  const weather = weatherMain.toLowerCase();
  switch (weather) {
    case 'clear': return '☀️';
    case 'clouds': return '☁️';
    case 'rain': return '🌧️';
    case 'drizzle': return '🌦️';
    case 'thunderstorm': return '⛈️';
    case 'snow': return '❄️';
    case 'mist':
    case 'fog': return '🌫️';
    case 'haze': return '😶‍🌫️';
    default: return '🌤️';
  }
};