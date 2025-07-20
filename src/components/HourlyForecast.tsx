import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, fromUnixTime } from 'date-fns';
import { ForecastData } from '../types/weather';
import { getHourlyForecast } from '../utils/weatherUtils';
import weatherApi from '../services/weatherApi';

interface HourlyForecastProps {
  forecast: ForecastData;
  className?: string;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ forecast, className = '' }) => {
  const hourlyData = getHourlyForecast(forecast.list, 24);

  const chartData = hourlyData.map(item => ({
    time: format(fromUnixTime(item.dt), 'HH:mm'),
    temp: Math.round(item.main.temp),
    feels_like: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    pop: Math.round(item.pop * 100),
    weather: item.weather[0].main,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
    wind_speed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            Temperature: {data.temp}°C
          </p>
          <p className="text-green-600 dark:text-green-400">
            Feels like: {data.feels_like}°C
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Humidity: {data.humidity}%
          </p>
          <p className="text-purple-600 dark:text-purple-400">
            Rain chance: {data.pop}%
          </p>
          <p className="text-gray-600 dark:text-gray-400 capitalize">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg ${className}`}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          24-Hour Forecast
        </h2>

        {/* Temperature Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Temperature Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="feels_like" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>Temperature</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-0.5 bg-green-500 border-dashed border-t-2 border-green-500"></div>
              <span>Feels like</span>
            </div>
          </div>
        </div>

        {/* Hourly Weather Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Hourly Details
          </h3>
          
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {hourlyData.slice(0, 12).map((item, index) => (
              <div 
                key={item.dt}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 
                         rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white w-16">
                    {format(fromUnixTime(item.dt), 'HH:mm')}
                  </div>
                  
                  <img
                    src={weatherApi.getWeatherIconUrl(item.weather[0].icon)}
                    alt={item.weather[0].description}
                    className="w-10 h-10"
                  />
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {item.weather[0].description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Rain: {Math.round(item.pop * 100)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(item.main.temp)}°
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Temp
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {item.main.humidity}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Humidity
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(item.wind.speed)} m/s
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Wind
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;