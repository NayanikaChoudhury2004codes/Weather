import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { 
  SunIcon, 
  MoonIcon, 
  CogIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import WeeklyForecast from './components/WeeklyForecast';
import { WeatherData, ForecastData, FavoriteCity } from './types/weather';
import weatherApi from './services/weatherApi';
import storage from './utils/storage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function WeatherApp() {
  const [currentCity, setCurrentCity] = useState<string>('London');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => storage.getSettings().isDarkMode);
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() => storage.getFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Load initial city from storage
  useEffect(() => {
    const lastLocation = storage.getLastLocation();
    if (lastLocation) {
      setCurrentCity(lastLocation.city);
      setCoordinates({ lat: lastLocation.lat, lon: lastLocation.lon });
    }
  }, []);

  // Dark mode handling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.updateSettings({ isDarkMode });
  }, [isDarkMode]);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (storage.shouldShowInstallPrompt()) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Fetch current weather
  const { data: weatherData, isLoading: weatherLoading, error: weatherError } = useQuery({
    queryKey: ['weather', currentCity, coordinates],
    queryFn: async () => {
      try {
        let data: WeatherData;
        if (coordinates) {
          data = await weatherApi.getCurrentWeatherByCoords(coordinates.lat, coordinates.lon);
        } else {
          data = await weatherApi.getCurrentWeather(currentCity);
        }
        
        // Cache the data
        storage.cacheWeatherData(currentCity, data);
        
        return data;
      } catch (error) {
        // Try to get cached data
        const cached = storage.getCachedWeatherData(currentCity);
        if (cached) {
          return cached.data;
        }
        throw error;
      }
    },
    enabled: !!currentCity,
  });

  // Fetch forecast
  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', currentCity, coordinates],
    queryFn: async () => {
      try {
        let data: ForecastData;
        if (coordinates) {
          data = await weatherApi.getForecastByCoords(coordinates.lat, coordinates.lon);
        } else {
          data = await weatherApi.getForecast(currentCity);
        }
        return data;
      } catch (error) {
        // Try to get cached data
        const cached = storage.getCachedWeatherData(currentCity);
        if (cached?.forecast) {
          return cached.forecast;
        }
        throw error;
      }
    },
    enabled: !!currentCity,
  });

  const handleCitySelect = (city: string, lat?: number, lon?: number) => {
    setCurrentCity(city);
    setError(null);
    
    if (lat && lon) {
      setCoordinates({ lat, lon });
      storage.setLastLocation({ lat, lon, city });
    } else {
      setCoordinates(null);
    }
  };

  const handleLocationRequest = async () => {
    try {
      const location = await weatherApi.getCurrentLocation();
      setCoordinates(location);
      
      // Get city name from coordinates
      const weather = await weatherApi.getCurrentWeatherByCoords(location.lat, location.lon);
      setCurrentCity(weather.name);
      storage.setLastLocation({ ...location, city: weather.name });
      setError(null);
    } catch (error) {
      setError('Unable to get your location. Please search for a city manually.');
    }
  };

  const handleToggleFavorite = (isFavorite: boolean) => {
    if (!weatherData) return;

    const cityId = `${weatherData.coord.lat}-${weatherData.coord.lon}`;
    
    if (isFavorite) {
      const favorite: FavoriteCity = {
        id: cityId,
        name: weatherData.name,
        country: weatherData.sys.country,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        lastUpdated: Date.now(),
      };
      storage.addFavorite(favorite);
      setFavorites(prev => [...prev, favorite]);
    } else {
      storage.removeFavorite(cityId);
      setFavorites(prev => prev.filter(fav => fav.id !== cityId));
    }
  };

  const handleFavoriteClick = (favorite: FavoriteCity) => {
    setCurrentCity(favorite.name);
    setCoordinates({ lat: favorite.lat, lon: favorite.lon });
    setShowFavorites(false);
    storage.setLastLocation({ lat: favorite.lat, lon: favorite.lon, city: favorite.name });
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      storage.setInstallPromptDismissed();
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    storage.setInstallPromptDismissed();
  };

  const isFavorite = weatherData 
    ? storage.isFavorite(`${weatherData.coord.lat}-${weatherData.coord.lon}`)
    : false;

  const isLoading = weatherLoading || forecastLoading;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                ⛅ WeatherWise
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                         transition-colors duration-200"
                title="Favorites"
              >
                <HeartIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
                         transition-colors duration-200"
                title="Toggle dark mode"
              >
                {isDarkMode ? (
                  <SunIcon className="w-6 h-6" />
                ) : (
                  <MoonIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ArrowDownTrayIcon className="w-6 h-6" />
              <div>
                <div className="font-semibold">Install WeatherWise</div>
                <div className="text-sm opacity-90">Get the app for a better experience</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleInstallApp}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 
                         transition-colors duration-200"
              >
                Install
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchBar
          onCitySelect={handleCitySelect}
          onLocationRequest={handleLocationRequest}
          className="max-w-2xl mx-auto"
        />
      </div>

      {/* Favorites Panel */}
      {showFavorites && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Favorite Cities
            </h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(favorite => (
                  <button
                    key={favorite.id}
                    onClick={() => handleFavoriteClick(favorite)}
                    className="p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-xl 
                             hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {favorite.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {favorite.country}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No favorite cities yet. Add some by clicking the heart icon!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {(error || weatherError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-800 dark:text-red-200">
                {error || 'Failed to fetch weather data. Please try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Content */}
      {!isLoading && weatherData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-8">
          {/* Current Weather */}
          <CurrentWeather
            weather={weatherData}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
          />

          {/* Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecastData && (
              <>
                <HourlyForecast forecast={forecastData} />
                <WeeklyForecast forecast={forecastData} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// App wrapper with QueryClient
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WeatherApp />
    </QueryClientProvider>
  );
}

export default App;