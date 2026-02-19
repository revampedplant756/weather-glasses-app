import { WeatherData, ForecastData } from './weather-service';

/**
 * Get weather emoji based on OpenWeatherMap icon code
 */
export function getWeatherEmoji(icon: string): string {
  const emojiMap: Record<string, string> = {
    '01d': '☀️', '01n': '🌙', // clear sky
    '02d': '⛅', '02n': '☁️', // few clouds
    '03d': '☁️', '03n': '☁️', // scattered clouds
    '04d': '☁️', '04n': '☁️', // broken clouds
    '09d': '🌧️', '09n': '🌧️', // shower rain
    '10d': '🌦️', '10n': '🌧️', // rain
    '11d': '⛈️', '11n': '⛈️', // thunderstorm
    '13d': '❄️', '13n': '❄️', // snow
    '50d': '🌫️', '50n': '🌫️'  // mist
  };
  
  return emojiMap[icon] || '🌤️';
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
}

/**
 * Format current weather data for display on glasses with enhanced location info
 */
export function formatCurrentWeather(
  weather: WeatherData, 
  coordinates?: { lat: number; lng: number }
): string {
  const emoji = getWeatherEmoji(weather.icon);
  const location = weather.country ? `${weather.location}, ${weather.country}` : weather.location;
  
  const lines = [
    `${emoji} ${location}`,
    ''
  ];

  // Add coordinates if available
  if (coordinates) {
    lines.push(`📍 ${formatCoordinates(coordinates.lat, coordinates.lng)}`);
    lines.push('');
  }

  lines.push(
    `${weather.temperature}°C`,
    `Feels like ${weather.feelsLike}°C`,
    '',
    `${capitalizeFirst(weather.description)}`,
    `Humidity: ${weather.humidity}%`,
    `Wind: ${weather.windSpeed} km/h`,
    '',
    '🔄 Say "forecast" for 5-day'
  );
  
  return lines.join('\n');
}

/**
 * Format forecast data for display on glasses with enhanced location info
 */
export function formatForecast(
  forecast: ForecastData[], 
  location: string,
  coordinates?: { lat: number; lng: number }
): string {
  const lines = [`📅 5-Day Forecast`, location];
  
  // Add coordinates if available
  if (coordinates) {
    lines.push(`📍 ${formatCoordinates(coordinates.lat, coordinates.lng)}`);
  }
  
  lines.push(''); // Empty line before forecast
  
  const forecastLines = forecast.map(day => {
    const emoji = getWeatherEmoji(day.icon);
    return `${emoji} ${day.dayName}: ${day.high}°/${day.low}°`;
  });
  
  lines.push(...forecastLines);
  lines.push('');
  lines.push('🔄 Say "current" to go back');
  
  return lines.join('\n');
}

/**
 * Parse location from voice command text
 */
export function parseLocationFromText(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  // Common patterns for location in speech
  const patterns = [
    /weather in ([a-zA-Z\s]+?)(?:\s|$)/, // "weather in London"
    /weather for ([a-zA-Z\s]+?)(?:\s|$)/, // "weather for New York"
    /([a-zA-Z\s]+?)\s+weather/, // "London weather"
    /what.*weather.*in ([a-zA-Z\s]+?)(?:\s|$)/, // "what's the weather in Paris"
    /how.*weather.*in ([a-zA-Z\s]+?)(?:\s|$)/ // "how's the weather in Tokyo"
  ];
  
  for (const pattern of patterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      const location = match[1].trim();
      // Filter out common words that aren't locations
      const stopWords = ['the', 'today', 'now', 'like', 'there', 'here'];
      if (!stopWords.includes(location)) {
        return capitalizeFirst(location);
      }
    }
  }
  
  return null;
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeFirst(str: string): string {
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Convert temperature between units if needed
 */
export function convertTemperature(temp: number, fromUnit: 'C' | 'F', toUnit: 'C' | 'F'): number {
  if (fromUnit === toUnit) return temp;
  
  if (fromUnit === 'C' && toUnit === 'F') {
    return Math.round((temp * 9/5) + 32);
  } else if (fromUnit === 'F' && toUnit === 'C') {
    return Math.round((temp - 32) * 5/9);
  }
  
  return temp;
}

/**
 * Get location type indicator
 */
export function getLocationTypeIndicator(hasCoordinates: boolean): string {
  return hasCoordinates ? '🎯' : '🏙️';
}