# Weather Glasses App

A hands-free weather app for Even Realities smart glasses that provides current conditions and forecasts through voice commands.

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- MentraOS API key from [console.mentraglass.com](https://console.mentraglass.com)
- OpenWeatherMap API key from [openweathermap.org](https://openweathermap.org/api)
- ngrok account and static URL

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd weather-glasses-app

# Install dependencies
bun install
# or: npm install

# Copy environment file
cp .env.example .env
```

### 3. Configuration

Edit `.env` file with your API keys:
```env
MENTRAOS_API_KEY=your_mentraos_api_key_here
PACKAGE_NAME=com.yourname.weatherglasses
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### 4. Developer Console Setup

1. Go to [console.mentraglass.com](https://console.mentraglass.com)
2. Register your app with:
   - **Package Name**: `com.yourname.weatherglasses` (match your .env)
   - **Webhook URL**: `https://your-ngrok-url.ngrok.app/webhook`
   - **API Key**: Your MentraOS API key
   - **Permissions**: `MICROPHONE`, `LOCATION`

### 5. Get OpenWeatherMap API Key

1. Create account at [openweathermap.org](https://openweathermap.org/api)
2. Subscribe to "Current Weather Data" (free tier available)
3. Copy your API key to `.env`

## Running the App

### Development Mode
```bash
# Start the development server
bun run dev
# or: npm run dev

# In another terminal, expose with ngrok
ngrok http --url=<YOUR_NGROK_URL> 3000
```

### Production Mode
```bash
# Build the app
bun run build
# or: npm run build

# Start production server
bun run start
# or: npm start
```

## Usage

### Voice Commands
- **"Weather in [city]"** - Get current weather for any city
- **"What's the weather like?"** - Get weather for your current location
- **"Show forecast"** - View 5-day forecast
- **"Current weather"** - Return to current conditions
- **"Help"** - Show available commands

### Button Navigation
- **Forward/Select** - Toggle between current weather and forecast
- **Back** - Return to main menu

### Features
- 🌤️ Current weather conditions with temperature, humidity, wind
- 📅 5-day weather forecast
- 📍 Location-based weather (automatic or voice-specified)
- 🎙️ Natural voice command parsing
- 🔄 Easy switching between current and forecast views

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `MENTRAOS_API_KEY` | Your MentraOS API key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |
| `PACKAGE_NAME` | App package identifier | Yes |
| `PORT` | Server port (default: 3000) | No |

## Required Permissions

- **MICROPHONE** - For voice commands and speech recognition
- **LOCATION** - For automatic location-based weather

## Deployment

For production deployment:

1. Set up a server (VPS, cloud instance, etc.)
2. Install Node.js and dependencies
3. Set environment variables
4. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name weather-app
   ```
5. Set up a reverse proxy (nginx) if needed
6. Update webhook URL in Developer Console

## Troubleshooting

### App Not Responding to Voice
- Verify `MICROPHONE` permission is enabled in Developer Console
- Check that ngrok URL is accessible
- Ensure webhook URL ends with `/webhook`

### Weather Data Not Loading
- Verify OpenWeatherMap API key is valid
- Check API quota limits
- Ensure city names are spelled correctly

### Location Not Working
- Verify `LOCATION` permission is enabled
- Check if location services are enabled on glasses
- Try specifying cities by voice as fallback

## API Usage

This app uses:
- **OpenWeatherMap API** - Current weather and forecast data
- **MentraOS SDK** - Smart glasses integration and voice processing

## License

MIT License - see LICENSE file for details