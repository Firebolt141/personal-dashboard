"use client";

import { useEffect, useMemo, useState } from "react";

type WeatherResponse = {
  current?: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
  hourly?: {
    temperature_2m: number[];
    time: string[];
  };
};

const DEFAULT_COORDS = { lat: 35.7322, lon: 139.7286 };

const CODE_LABELS: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Snow",
  80: "Showers",
};

const CODE_ICONS: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌧️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  80: "🌦️",
};

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    async function loadWeather() {
      try {
        const params = new URLSearchParams({
          latitude: String(DEFAULT_COORDS.lat),
          longitude: String(DEFAULT_COORDS.lon),
          current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
          daily: "temperature_2m_max,temperature_2m_min",
          hourly: "temperature_2m",
          timezone: "auto",
        });
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Weather request failed.");
        }
        const data = (await response.json()) as WeatherResponse;
        setWeather(data);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadWeather();
  }, []);

  const hourlyTemps = useMemo(() => {
    if (!weather?.hourly?.temperature_2m) return [];
    return weather.hourly.temperature_2m.slice(0, 4);
  }, [weather]);

  const hourlyLabels = ["Now", "+2h", "+4h"];
  const icon = weather?.current
    ? CODE_ICONS[weather.current.weather_code] ?? "⛅"
    : "⛅";

  return (
    <div className="card">
      <div className="section-title">Weather</div>
      {status === "loading" && <p className="muted">Loading forecast…</p>}
      {status === "error" && (
        <p className="muted">
          Unable to load weather right now. Check your network or API key.
        </p>
      )}
      {status === "ready" && weather?.current && (
        <>
          <div className="weather-main compact">
            <div className="weather-hero">
              <span className="weather-icon" aria-hidden>
                {icon}
              </span>
              <div>
                <p className="weather-temp">
                  {Math.round(weather.current.temperature_2m)}°C
                </p>
                <p className="muted weather-summary">
                  {CODE_LABELS[weather.current.weather_code] ?? "Mixed"} · Feels
                  like {Math.round(weather.current.apparent_temperature)}°C
                </p>
              </div>
            </div>
            <div className="weather-meta compact">
              <span className="weather-pill">↑ {Math.round(weather.daily?.temperature_2m_max?.[0] ?? 0)}°</span>
              <span className="weather-pill">↓ {Math.round(weather.daily?.temperature_2m_min?.[0] ?? 0)}°</span>
              <span className="weather-pill">💨 {Math.round(weather.current.wind_speed_10m)} km/h</span>
            </div>
          </div>
          <div className="hourly-row compact">
            {hourlyTemps.slice(0, 3).map((temp, index) => (
              <div key={`${temp}-${index}`}>
                <p>{hourlyLabels[index]}</p>
                <strong>{Math.round(temp)}°</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
