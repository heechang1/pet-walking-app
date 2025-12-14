import { useState, useEffect } from "react";

export interface WeatherData {
  temperature: number; // °C
  windSpeed: number; // km/h (converted from m/s in API)
  weatherCode: number;
  weatherText: string;
  icon: string;
  riskAlert?: {
    message: string;
    color: string;
  };
}

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
}

// Calculate risk alert based on weather conditions
function calculateRiskAlert(
  temperature: number,
  windSpeed: number, // m/s
  weatherCode: number
): { message: string; color: string } | undefined {
  // Temperature risk
  if (temperature > 30) {
    return {
      message: "더워요! 산책을 짧게 하세요.",
      color: "#F8D7DA",
    };
  }
  if (temperature < 0) {
    return {
      message: "추워요! 외투가 필요해요.",
      color: "#D1ECF1",
    };
  }

  // Wind risk (convert m/s to km/h for check: 10 m/s = 36 km/h)
  if (windSpeed > 10) {
    return {
      message: "바람이 강해요! 주의하세요.",
      color: "#FFF3CD",
    };
  }

  // Rain/Snow risk
  const rainCodes = [51, 52, 53, 54, 55, 56, 57, 61, 62, 63, 64, 65, 66, 67, 80, 81, 82];
  const snowCodes = [71, 72, 73, 74, 75, 76, 77, 85, 86];
  if (rainCodes.includes(weatherCode) || snowCodes.includes(weatherCode)) {
    return {
      message: "비/눈이 와요. 조심하세요.",
      color: "#FFF3CD",
    };
  }

  return undefined;
}

// Weather code to text and icon mapping (WMO Weather interpretation codes)
function getWeatherInfo(code: number): { text: string; icon: string } {
  // Clear sky
  if (code === 0) return { text: "맑음", icon: "☀️" };
  // Mainly clear
  if (code === 1) return { text: "대체로 맑음", icon: "🌤️" };
  // Partly cloudy
  if (code === 2) return { text: "약간 흐림", icon: "⛅" };
  // Overcast
  if (code === 3) return { text: "흐림", icon: "☁️" };
  // Fog
  if (code >= 45 && code <= 48) return { text: "안개", icon: "🌫️" };
  // Drizzle
  if (code >= 51 && code <= 57) return { text: "이슬비", icon: "🌦️" };
  // Rain
  if (code >= 61 && code <= 67) return { text: "비", icon: "🌧️" };
  // Freezing rain
  if (code >= 71 && code <= 77) return { text: "눈", icon: "❄️" };
  // Rain showers
  if (code >= 80 && code <= 82) return { text: "소나기", icon: "🌦️" };
  // Snow showers
  if (code >= 85 && code <= 86) return { text: "눈 소나기", icon: "🌨️" };
  // Thunderstorm
  if (code >= 95 && code <= 99) return { text: "천둥번개", icon: "⛈️" };
  // Default
  return { text: "알 수 없음", icon: "🌡️" };
}

const WEATHER_CACHE_KEY = "weatherCache";
const WEATHER_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedWeather {
  data: WeatherData;
  timestamp: number;
  lat: number;
  lon: number;
}

export function useWeather(latitude: number | null, longitude: number | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!latitude || !longitude) {
      setWeather(null);
      setError(null);
      return;
    }

    // Check cache first
    try {
      const cachedStr = localStorage.getItem(WEATHER_CACHE_KEY);
      if (cachedStr) {
        const cached: CachedWeather = JSON.parse(cachedStr);
        const isSameLocation = 
          Math.abs(cached.lat - latitude) < 0.01 && 
          Math.abs(cached.lon - longitude) < 0.01;
        const isRecent = Date.now() - cached.timestamp < WEATHER_CACHE_DURATION;
        
        if (isSameLocation && isRecent) {
          setWeather(cached.data);
          setLoading(false);
          return; // Use cached data
        }
      }
    } catch (e) {
      console.warn("Failed to read weather cache:", e);
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), 1000); // 1 second timeout
      });

      try {
        // Race between fetch and timeout
        const response = await Promise.race([
          fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`),
          timeoutPromise,
        ]);

        if (!response.ok) {
          throw new Error("날씨 정보를 가져올 수 없습니다");
        }

        const data: OpenMeteoResponse = await response.json();
        const weatherInfo = getWeatherInfo(data.current_weather.weathercode);
        const temp = Math.round(data.current_weather.temperature);
        const windSpeedMs = data.current_weather.windspeed;
        const windSpeedKmh = Math.round(windSpeedMs * 3.6); // Convert m/s to km/h
        const riskAlert = calculateRiskAlert(
          temp,
          windSpeedMs,
          data.current_weather.weathercode
        );

        const weatherData: WeatherData = {
          temperature: temp,
          windSpeed: windSpeedKmh,
          weatherCode: data.current_weather.weathercode,
          weatherText: weatherInfo.text,
          icon: weatherInfo.icon,
          riskAlert,
        };

        setWeather(weatherData);

        // Save to cache
        try {
          const cache: CachedWeather = {
            data: weatherData,
            timestamp: Date.now(),
            lat: latitude,
            lon: longitude,
          };
          localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
        } catch (e) {
          console.warn("Failed to save weather cache:", e);
        }
      } catch (err) {
        // On timeout or error, try to use cached data
        try {
          const cachedStr = localStorage.getItem(WEATHER_CACHE_KEY);
          if (cachedStr) {
            const cached: CachedWeather = JSON.parse(cachedStr);
            setWeather(cached.data);
            setError(null);
          } else {
            setError("날씨 정보를 불러올 수 없습니다");
            setWeather(null);
          }
        } catch (e) {
          setError("날씨 정보를 불러올 수 없습니다");
          setWeather(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weather, loading, error };
}

