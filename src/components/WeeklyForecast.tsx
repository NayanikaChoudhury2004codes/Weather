import React from 'react';
import { format, fromUnixTime, addDays, startOfDay } from 'date-fns';
import { ForecastData } from '../types/weather';
import { getDailyForecast, getWeatherEmoji } from '../utils/weatherUtils';
import weatherApi from '../services/weatherApi';

interface WeeklyForecastProps {
  forecast: ForecastData;
  className?: string;
}

const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecast, className = '' }) => {
  const dailyData = getDailyForecast(forecast.list);

  const getDayName = (dateString: string, index: number): string => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return format(new Date(dateString), 'EEEE');
  };

  const getDateString = (dateString: string): string => {
    return format(new Date(dateString), 'MMM dd');
  };

  const getRainProbability = (date: string): number => {
    const dayItems = forecast.list.filter(item => 
      format(fromUnixTime(item.dt), 'yyyy-MM-dd') === date
    );
    const maxPop = Math.max(...dayItems.map(item => item.pop));
    return Math.round(maxPop * 100);
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp >= 30) return 'text-red-500';
    if (temp >= 20) return 'text-orange-500';
    if (temp >= 10) return 'text-yellow-500';
    if (temp >= 0) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          7-Day Forecast
        </h2>

        <div className="space-y-3">
          {dailyData.map((day, index) => {
            const rainChance = getRainProbability(day.date);
            const emoji = getWeatherEmoji(day.weather.main);
            
            return (
              <div 
                key={day.date}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 
                         rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 
                         transition-all duration-200 hover:shadow-md group"
              >
                {/* Day and Date */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getDayName(day.date, index)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getDateString(day.date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Icon and Description */}
                <div className="flex items-center space-x-3 flex-1 justify-center">
                  <div className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {emoji}
                  </div>
                  <img
                    src={weatherApi.getWeatherIconUrl(day.weather.icon)}
                    alt={day.weather.description}
                    className="w-12 h-12 group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {day.weather.description}
                    </div>
                    {rainChance > 0 && (
                      <div className="text-xs text-blue-500 dark:text-blue-400">
                        💧 {rainChance}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Temperature Range */}
                <div className="flex items-center space-x-6 flex-1 justify-end">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getTemperatureColor(day.temp_max)}`}>
                        {Math.round(day.temp_max)}°
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        High
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-medium text-gray-600 dark:text-gray-400">
                        {Math.round(day.temp_min)}°
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Low
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <div className="font-medium">
                        {day.humidity}%
                      </div>
                      <div className="text-xs">
                        Humidity
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-medium">
                        {day.wind_speed} m/s
                      </div>
                      <div className="text-xs">
                        Wind
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Weekly Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-blue-800 dark:text-blue-200">
              <span className="font-medium">Average High:</span>{' '}
              {Math.round(
                dailyData.reduce((sum, day) => sum + day.temp_max, 0) / dailyData.length
              )}°C
            </div>
            <div className="text-blue-800 dark:text-blue-200">
              <span className="font-medium">Average Low:</span>{' '}
              {Math.round(
                dailyData.reduce((sum, day) => sum + day.temp_min, 0) / dailyData.length
              )}°C
            </div>
            <div className="text-blue-800 dark:text-blue-200">
              <span className="font-medium">Rain Days:</span>{' '}
              {dailyData.filter(day => 
                day.weather.main.toLowerCase().includes('rain') || 
                getRainProbability(day.date) > 50
              ).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyForecast;