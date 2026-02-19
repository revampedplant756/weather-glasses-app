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
 * Format current weather data for display on glasses
 */
export function formatCurrentWeather(weather: WeatherData): string {
  const emoji = getWeatherEmoji(weather.icon);
  const location = weather.country ? `${weather.location}, ${weather.country}` : weather.location;
  
  return [
    `${emoji} ${location}`,
    '',
    `${weather.temperature}°C`,
    `Feels like ${weather.feelsLike}°C`,
    '',
    `${capitalizeFirst(weather.description)}`,
    `Humidity: ${weather.humidity}%`,
    `Wind: ${weather.windSpeed} km/h`,
    '',
    '🔄 Say "forecast" for 5-day'
  ].join('\n');
}

/**
 * Format forecast data for display on glasses
 */
export function formatForecast(forecast: ForecastData[], location: string): string {
  const header = `📅 5-Day Forecast\n${location}\n`;
  
  const forecastLines = forecast.map(day => {
    const emoji = getWeatherEmoji(day.icon);
    return `${emoji} ${day.dayName}: ${day.high}°/${day.low}°`;
  });
  
  return [
    header,
    ...forecastLines,
    '',
    '🔄 Say "current" to go back'
  ].join('\n');
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