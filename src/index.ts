import { AppServer, AppSession } from '@mentraos/sdk';
import { WeatherService, WeatherData, ForecastData } from './weather-service';
import { formatCurrentWeather, formatForecast, parseLocationFromText } from './utils';
import dotenv from 'dotenv';

dotenv.config();

interface SessionState {
  lastLocation?: string;
  showingForecast: boolean;
  currentWeather?: WeatherData;
  forecast?: ForecastData[];
}

class WeatherGlassesApp extends AppServer {
  private weatherService: WeatherService;
  private sessionStates = new Map<string, SessionState>();

  constructor() {
    super({
      packageName: process.env.PACKAGE_NAME || 'com.example.weatherglasses',
      apiKey: process.env.MENTRAOS_API_KEY!,
      port: 3000
    });
    
    this.weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY!);
  }

  protected async onSession(session: AppSession, sessionId: string, userId: string) {
    const state: SessionState = { showingForecast: false };
    this.sessionStates.set(sessionId, state);

    session.logger.info('Weather app session started', { userId });
    
    // Welcome message
    session.layouts.showTextWall(
      '🌤️ Weather Assistant\n\nAsk about weather in any city!\n\nExamples:\n• "Weather in New York"\n• "Weather in London"\n• "Show forecast"\n• "Help"'
    );

    // Set up voice command handling
    session.events.onTranscription(async (data) => {
      if (!data.isFinal) return;
      
      const text = data.text.toLowerCase().trim();
      session.logger.info('Voice command received', { text });
      
      try {
        await this.handleVoiceCommand(session, state, text);
      } catch (error) {
        session.logger.error('Error handling voice command', { text, error });
        session.layouts.showTextWall('❌ Sorry, I couldn\'t get the weather data. Please try again.');
      }
    });

    // Button navigation
    session.events.onButtonPress((data) => {
      if (data.action === 'press') {
        this.handleButtonPress(session, state, data.button);
      }
    });
  }

  private async handleVoiceCommand(session: AppSession, state: SessionState, text: string) {
    // Parse different weather request patterns
    if (text.includes('weather')) {
      const location = parseLocationFromText(text);
      
      if (location) {
        state.lastLocation = location;
        await this.showCurrentWeather(session, state);
      } else {
        session.layouts.showTextWall('📍 Please specify a location, like "weather in London".');
      }
    } else if (text.includes('forecast')) {
      if (state.lastLocation) {
        await this.showForecast(session, state);
      } else {
        session.layouts.showTextWall('📍 Please ask for weather in a specific city first.');
      }
    } else if (text.includes('current') || text.includes('now')) {
      if (state.lastLocation) {
        await this.showCurrentWeather(session, state);
      } else {
        session.layouts.showTextWall('📍 Please specify a location first.');
      }
    } else if (text.includes('help')) {
      session.layouts.showTextWall(
        '🌤️ Weather Commands:\n\n• "Weather in [city]"\n• "Show forecast"\n• "Current weather"\n• "Help"'
      );
    }
  }

  private handleButtonPress(session: AppSession, state: SessionState, button: string) {
    switch (button) {
      case 'forward':
      case 'select':
        if (state.showingForecast) {
          this.showCurrentWeather(session, state);
        } else if (state.currentWeather) {
          this.showForecast(session, state);
        }
        break;
      case 'back':
        session.layouts.showTextWall(
          '🌤️ Weather Assistant\n\nAsk about weather in any city!'
        );
        state.showingForecast = false;
        break;
    }
  }

  private async showCurrentWeather(session: AppSession, state: SessionState) {
    if (!state.lastLocation) return;
    
    session.layouts.showTextWall('🔄 Getting weather data...');
    
    try {
      const weatherData = await this.weatherService.getCurrentWeather(state.lastLocation);
      
      state.currentWeather = weatherData;
      state.showingForecast = false;
      
      const formatted = formatCurrentWeather(weatherData);
      session.layouts.showTextWall(formatted);
      
      session.logger.info('Weather data displayed', { 
        location: state.lastLocation,
        temperature: weatherData.temperature
      });
    } catch (error) {
      session.logger.error('Failed to get weather data', { error, location: state.lastLocation });
      session.layouts.showTextWall('❌ Unable to get weather for this location. Please try a different city.');
    }
  }

  private async showForecast(session: AppSession, state: SessionState) {
    if (!state.lastLocation) return;
    
    session.layouts.showTextWall('🔄 Getting forecast...');
    
    try {
      const forecastData = await this.weatherService.getForecast(state.lastLocation);
      
      state.forecast = forecastData;
      state.showingForecast = true;
      
      const formatted = formatForecast(forecastData, state.lastLocation);
      session.layouts.showTextWall(formatted);
      
      session.logger.info('Forecast displayed', { 
        location: state.lastLocation,
        days: forecastData.length
      });
    } catch (error) {
      session.logger.error('Failed to get forecast', { error, location: state.lastLocation });
      session.layouts.showTextWall('❌ Unable to get forecast for this location.');
    }
  }

  protected async onStop(sessionId: string, userId: string, reason: string) {
    this.sessionStates.delete(sessionId);
    console.log(`Weather session ${sessionId} ended: ${reason}`);
  }
}

const app = new WeatherGlassesApp();
app.start();

console.log('🌤️ Weather Glasses App running on port 3000');
console.log('Expose with: ngrok http --url=<YOUR_NGROK_URL> 3000');