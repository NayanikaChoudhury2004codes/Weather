import { FavoriteCity, WeatherData, ForecastData } from '../types/weather';

const STORAGE_KEYS = {
  FAVORITES: 'weather-app-favorites',
  WEATHER_CACHE: 'weather-app-cache',
  SETTINGS: 'weather-app-settings',
  LAST_LOCATION: 'weather-app-last-location',
} as const;

export interface CachedWeatherData {
  data: WeatherData;
  forecast?: ForecastData;
  timestamp: number;
  city: string;
}

export interface UserSettings {
  isDarkMode: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
  language: string;
  notifications: boolean;
}

class StorageService {
  // Favorites management
  getFavorites(): FavoriteCity[] {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  addFavorite(city: FavoriteCity): void {
    try {
      const favorites = this.getFavorites();
      const exists = favorites.find(fav => fav.id === city.id);
      
      if (!exists) {
        favorites.push({
          ...city,
          lastUpdated: Date.now(),
        });
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }

  removeFavorite(cityId: string): void {
    try {
      const favorites = this.getFavorites();
      const updated = favorites.filter(fav => fav.id !== cityId);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }

  isFavorite(cityId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === cityId);
  }

  // Weather data caching
  cacheWeatherData(city: string, data: WeatherData, forecast?: ForecastData): void {
    try {
      const cache = this.getWeatherCache();
      cache[city.toLowerCase()] = {
        data,
        forecast,
        timestamp: Date.now(),
        city,
      };
      localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache));
    } catch (error) {
      console.error('Error caching weather data:', error);
    }
  }

  getCachedWeatherData(city: string): CachedWeatherData | null {
    try {
      const cache = this.getWeatherCache();
      const cached = cache[city.toLowerCase()];
      
      if (cached) {
        // Check if cache is still valid (30 minutes)
        const isValid = Date.now() - cached.timestamp < 30 * 60 * 1000;
        return isValid ? cached : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached weather data:', error);
      return null;
    }
  }

  private getWeatherCache(): { [key: string]: CachedWeatherData } {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.WEATHER_CACHE);
      return cache ? JSON.parse(cache) : {};
    } catch (error) {
      console.error('Error getting weather cache:', error);
      return {};
    }
  }

  clearWeatherCache(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.WEATHER_CACHE);
    } catch (error) {
      console.error('Error clearing weather cache:', error);
    }
  }

  // Settings management
  getSettings(): UserSettings {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        isDarkMode: false,
        temperatureUnit: 'celsius',
        language: 'en',
        notifications: true,
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        isDarkMode: false,
        temperatureUnit: 'celsius',
        language: 'en',
        notifications: true,
      };
    }
  }

  updateSettings(newSettings: Partial<UserSettings>): void {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  // Last location
  setLastLocation(location: { lat: number; lon: number; city: string }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
    } catch (error) {
      console.error('Error setting last location:', error);
    }
  }

  getLastLocation(): { lat: number; lon: number; city: string } | null {
    try {
      const location = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error('Error getting last location:', error);
      return null;
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  }

  exportData(): string {
    try {
      const data = {
        favorites: this.getFavorites(),
        settings: this.getSettings(),
        lastLocation: this.getLastLocation(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return '';
    }
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.favorites) {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
      }
      
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
      }
      
      if (data.lastLocation) {
        localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(data.lastLocation));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Check storage quota
  getStorageInfo(): { used: number; total: number; available: number } {
    try {
      let used = 0;
      Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          used += item.length;
        }
      });

      // Estimate total available storage (usually around 5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate
      const available = total - used;

      return { used, total, available };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, total: 5 * 1024 * 1024, available: 5 * 1024 * 1024 };
    }
  }

  // PWA installation prompt
  setInstallPromptDismissed(): void {
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } catch (error) {
      console.error('Error setting install prompt dismissed:', error);
    }
  }

  shouldShowInstallPrompt(): boolean {
    try {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) return true;
      
      // Show again after 7 days
      const dismissedTime = parseInt(dismissed);
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - dismissedTime > weekInMs;
    } catch (error) {
      console.error('Error checking install prompt:', error);
      return true;
    }
  }
}

export const storage = new StorageService();
export default storage;