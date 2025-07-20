import axios from 'axios';
import { WeatherData, ForecastData, GeocodingData, AirQualityData } from '../types/weather';

const API_KEY = '8916440394bbd52438dce9e4f823b6f1'; // Using the existing API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

class WeatherApiService {
  private api = axios.create({
    timeout: 10000,
  });

  // Get current weather by city name
  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await this.api.get<WeatherData>(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch weather for ${city}`);
    }
  }

  // Get current weather by coordinates
  async getCurrentWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await this.api.get<WeatherData>(
        `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch weather by coordinates');
    }
  }

  // Get 5-day forecast
  async getForecast(city: string): Promise<ForecastData> {
    try {
      const response = await this.api.get<ForecastData>(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch forecast for ${city}`);
    }
  }

  // Get 5-day forecast by coordinates
  async getForecastByCoords(lat: number, lon: number): Promise<ForecastData> {
    try {
      const response = await this.api.get<ForecastData>(
        `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch forecast by coordinates');
    }
  }

  // Search cities for autocomplete
  async searchCities(query: string): Promise<GeocodingData[]> {
    try {
      const response = await this.api.get<GeocodingData[]>(
        `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to search cities');
    }
  }

  // Get air quality data
  async getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
    try {
      const response = await this.api.get<AirQualityData>(
        `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch air quality data');
    }
  }

  // Get user's current location using geolocation API
  getCurrentLocation(): Promise<{ lat: number; lon: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Failed to get user location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Get weather icon URL
  getWeatherIconUrl(iconCode: string, size: '2x' | '4x' = '2x'): string {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  }
}

export const weatherApi = new WeatherApiService();
export default weatherApi;