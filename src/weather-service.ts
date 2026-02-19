import axios from 'axios';

export interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  country: string;
}

export interface ForecastData {
  date: string;
  dayName: string;
  high: number;
  low: number;
  description: string;
  icon: string;
}

export class WeatherService {
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }
    this.apiKey = apiKey;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.transformWeatherData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      throw new Error('Failed to fetch weather data');
    }
  }

  async getCurrentWeatherByCoords(lat: number, lng: number): Promise<WeatherData> {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.transformWeatherData(response.data);
    } catch (error) {
      throw new Error('Failed to fetch weather data by coordinates');
    }
  }

  async getForecast(city: string): Promise<ForecastData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.transformForecastData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      throw new Error('Failed to fetch forecast data');
    }
  }

  async getForecastByCoords(lat: number, lng: number): Promise<ForecastData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return this.transformForecastData(response.data);
    } catch (error) {
      throw new Error('Failed to fetch forecast data by coordinates');
    }
  }

  private transformWeatherData(data: any): WeatherData {
    return {
      location: data.name,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: data.weather[0].icon,
      country: data.sys.country
    };
  }

  private transformForecastData(data: any): ForecastData[] {
    const dailyForecasts = new Map<string, any>();
    
    // Group by date and find min/max temperatures
    data.list.forEach((item: any) => {
      const date = item.dt_txt.split(' ')[0]; // Get date part (YYYY-MM-DD)
      
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date,
          temps: [],
          descriptions: [],
          icons: []
        });
      }
      
      const dayData = dailyForecasts.get(date);
      dayData.temps.push(item.main.temp);
      dayData.descriptions.push(item.weather[0].description);
      dayData.icons.push(item.weather[0].icon);
    });

    // Transform to final format (take first 5 days)
    return Array.from(dailyForecasts.values())
      .slice(0, 5)
      .map((dayData) => {
        const date = new Date(dayData.date);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        // Get most common description and icon
        const description = this.getMostCommon(dayData.descriptions);
        const icon = this.getMostCommon(dayData.icons);
        
        return {
          date: dayData.date,
          dayName,
          high: Math.round(Math.max(...dayData.temps)),
          low: Math.round(Math.min(...dayData.temps)),
          description,
          icon
        };
      });
  }

  private getMostCommon(arr: string[]): string {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  }
}