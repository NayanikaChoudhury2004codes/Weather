import React from 'react';
import { 
  EyeIcon, 
  WindIcon, 
  BeakerIcon,
  SunIcon,
  MoonIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { WeatherData } from '../types/weather';
import { 
  getWeatherBackground, 
  isNightTime, 
  getWeatherAdvice, 
  getClothingRecommendation,
  formatTime,
  generateWeatherStory,
  getWeatherEmoji
} from '../utils/weatherUtils';
import weatherApi from '../services/weatherApi';
import storage from '../utils/storage';

interface CurrentWeatherProps {
  weather: WeatherData;
  onToggleFavorite?: (isFavorite: boolean) => void;
  isFavorite?: boolean;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ 
  weather, 
  onToggleFavorite,
  isFavorite = false 
}) => {
  const isNight = isNightTime(weather.sys.sunrise, weather.sys.sunset, weather.timezone);
  const backgroundClass = getWeatherBackground(weather.weather[0].main, isNight);
  
  const weatherAdvice = getWeatherAdvice(
    weather.main.temp,
    weather.main.feels_like,
    weather.weather[0].main,
    weather.main.humidity,
    weather.wind.speed
  );

  const clothingAdvice = getClothingRecommendation(
    weather.main.temp,
    weather.weather[0].main,
    weather.weather[0].main.toLowerCase().includes('rain')
  );

  const weatherStory = generateWeatherStory(weather);
  const weatherEmoji = getWeatherEmoji(weather.weather[0].main);

  const handleFavoriteToggle = () => {
    if (onToggleFavorite) {
      onToggleFavorite(!isFavorite);
    }
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getVisibilityDescription = (visibility: number): string => {
    if (visibility >= 10000) return 'Excellent';
    if (visibility >= 5000) return 'Good';
    if (visibility >= 2000) return 'Moderate';
    if (visibility >= 1000) return 'Poor';
    return 'Very Poor';
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl shadow-2xl ${backgroundClass} text-white`}>
      {/* Background animations */}
      <div className="absolute inset-0 opacity-20">
        {weather.weather[0].main.toLowerCase() === 'rain' && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-12 bg-white rounded-full rain-animation"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`
                }}
              />
            ))}
          </div>
        )}
        
        {weather.weather[0].main.toLowerCase() === 'snow' && (
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full opacity-80 float-animation"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {weather.weather[0].main.toLowerCase() === 'clear' && !isNight && (
          <div className="absolute top-8 right-8">
            <SunIcon className="w-32 h-32 animate-spin-slow opacity-30" />
          </div>
        )}
        
        {weather.weather[0].main.toLowerCase() === 'clear' && isNight && (
          <div className="absolute top-8 right-8">
            <MoonIcon className="w-32 h-32 animate-pulse-slow opacity-30" />
          </div>
        )}
      </div>

      <div className="relative p-8">
        {/* Header with favorite button */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{weather.name}</h1>
            <p className="text-lg opacity-90">{weather.sys.country}</p>
          </div>
          
          {onToggleFavorite && (
            <button
              onClick={handleFavoriteToggle}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 
                       transition-all duration-200 hover:scale-110"
            >
              {isFavorite ? (
                <HeartIconSolid className="w-6 h-6 text-red-400" />
              ) : (
                <HeartIcon className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Main weather info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <img
                src={weatherApi.getWeatherIconUrl(weather.weather[0].icon, '4x')}
                alt={weather.weather[0].description}
                className="w-24 h-24 float-animation"
              />
              <p className="text-sm capitalize mt-2 opacity-90">
                {weather.weather[0].description}
              </p>
            </div>
            
            <div>
              <div className="text-7xl font-light mb-2">
                {Math.round(weather.main.temp)}°
              </div>
              <div className="text-lg opacity-80">
                Feels like {Math.round(weather.main.feels_like)}°
              </div>
            </div>
          </div>
          
          <div className="text-4xl">
            {weatherEmoji}
          </div>
        </div>

        {/* Weather story */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            📖 Weather Story
          </h3>
          <p className="text-lg leading-relaxed italic">
            {weatherStory}
          </p>
        </div>

        {/* Detailed weather info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <BeakerIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-semibold">{weather.main.humidity}%</div>
            <div className="text-sm opacity-80">Humidity</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <WindIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-semibold">
              {Math.round(weather.wind.speed)} m/s
            </div>
            <div className="text-sm opacity-80">
              {getWindDirection(weather.wind.deg)} Wind
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <EyeIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-semibold">
              {Math.round(weather.visibility / 1000)}km
            </div>
            <div className="text-sm opacity-80">
              {getVisibilityDescription(weather.visibility)}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <BeakerIcon className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <div className="text-2xl font-semibold">{weather.main.pressure}</div>
            <div className="text-sm opacity-80">hPa</div>
          </div>
        </div>

        {/* Sun/Moon times */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3">
            <SunIcon className="w-8 h-8 text-yellow-300" />
            <div>
              <div className="text-lg font-semibold">
                {formatTime(weather.sys.sunrise, weather.timezone)}
              </div>
              <div className="text-sm opacity-80">Sunrise</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-3">
            <MoonIcon className="w-8 h-8 text-blue-300" />
            <div>
              <div className="text-lg font-semibold">
                {formatTime(weather.sys.sunset, weather.timezone)}
              </div>
              <div className="text-sm opacity-80">Sunset</div>
            </div>
          </div>
        </div>

        {/* Smart recommendations */}
        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              🧠 Smart Advice
            </h3>
            <p className="text-lg leading-relaxed">
              {weatherAdvice}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              👔 What to Wear
            </h3>
            <p className="text-lg leading-relaxed">
              {clothingAdvice}
            </p>
          </div>
        </div>

        {/* Temperature range */}
        <div className="mt-6 flex justify-between items-center text-lg">
          <span className="opacity-80">
            L: {Math.round(weather.main.temp_min)}°
          </span>
          <span className="opacity-80">
            H: {Math.round(weather.main.temp_max)}°
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;