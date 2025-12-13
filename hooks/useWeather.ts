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

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/weather?latitude=${latitude}&longitude=${longitude}`
        );

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

        setWeather({
          temperature: temp,
          windSpeed: windSpeedKmh,
          weatherCode: data.current_weather.weathercode,
          weatherText: weatherInfo.text,
          icon: weatherInfo.icon,
          riskAlert,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "날씨 정보 로드 실패");
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude]);

  return { weather, loading, error };
}

