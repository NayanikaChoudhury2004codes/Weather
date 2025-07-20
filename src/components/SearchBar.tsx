import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { GeocodingData } from '../types/weather';
import weatherApi from '../services/weatherApi';

interface SearchBarProps {
  onCitySelect: (city: string, lat?: number, lon?: number) => void;
  onLocationRequest: () => void;
  className?: string;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onCitySelect,
  onLocationRequest,
  className = '',
  placeholder = 'Search for a city...',
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCities = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await weatherApi.searchCities(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchCities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleCitySelect = (city: GeocodingData) => {
    const cityName = city.state 
      ? `${city.name}, ${city.state}, ${city.country}`
      : `${city.name}, ${city.country}`;
    
    setQuery(cityName);
    setIsOpen(false);
    setSelectedIndex(-1);
    onCitySelect(cityName, city.lat, city.lon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleCitySelect(suggestions[selectedIndex]);
      } else {
        setIsOpen(false);
        onCitySelect(query.trim());
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleCitySelect(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg 
                     bg-white/90 backdrop-blur-sm shadow-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 text-gray-900
                     dark:bg-gray-800/90 dark:border-gray-600 dark:text-white
                     dark:placeholder-gray-400 dark:focus:ring-blue-400
                     transition-all duration-200"
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
                         transition-colors duration-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            
            <button
              type="button"
              onClick={onLocationRequest}
              className="p-1 text-blue-500 hover:text-blue-600 dark:text-blue-400
                       dark:hover:text-blue-300 transition-colors duration-200"
              title="Use current location"
            >
              <MapPinIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      {/* Search suggestions dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 
                      border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl
                      max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((city, index) => (
              <button
                key={`${city.lat}-${city.lon}`}
                onClick={() => handleCitySelect(city)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                          transition-colors duration-200 flex items-center justify-between
                          ${index === selectedIndex 
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-900 dark:text-white'
                          }`}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    {city.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {city.state ? `${city.state}, ${city.country}` : city.country}
                  </div>
                </div>
                <MapPinIcon className="h-4 w-4 text-gray-400" />
              </button>
            ))
          ) : query.length >= 2 && (
            <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
              No cities found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;