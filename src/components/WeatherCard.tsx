import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Droplets, Wind } from 'lucide-react'
import { generateWeatherData } from '../utils/weatherData'

export default function WeatherCard() {
  const weather = useMemo(() => generateWeatherData(), [])
  const today = weather[0]
  const weekForecast = weather.slice(1, 8) // 7 days

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="neon-card rounded-xl overflow-hidden"
    >
      {/* Today */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
          <MapPin size={10} className="text-[var(--color-neon-blue)]" />
          <span className="font-mono uppercase tracking-wider">Myogadani, Bunkyo-ku</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-white leading-none">
              {today.temp}°
            </div>
            <div className="text-[10px] text-gray-500 mt-1 font-mono">
              H:{today.tempMax}° L:{today.tempMin}°
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl">{today.icon}</div>
            <div className="text-[10px] text-gray-400 mt-1">{today.condition}</div>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-[10px] text-gray-500 font-mono">
          <div className="flex items-center gap-1">
            <Droplets size={10} className="text-[var(--color-neon-blue)]" />
            {today.humidity}%
          </div>
          <div className="flex items-center gap-1">
            <Wind size={10} className="text-[var(--color-neon-green)]" />
            {today.windSpeed} km/h
          </div>
          <div className="flex items-center gap-1">
            🌧️ {today.precipitation}%
          </div>
        </div>
      </div>

      {/* Neon divider */}
      <div className="neon-divider" />

      {/* 7-day forecast — vertical column */}
      <div className="p-4 pt-3">
        <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] font-mono mb-2">
          7-Day Forecast
        </p>
        <div className="space-y-1.5">
          {weekForecast.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
              className="flex items-center gap-2 py-1"
            >
              <span className="w-12 text-[11px] text-gray-400 font-medium shrink-0">{day.day}</span>
              <span className="text-base leading-none">{day.icon}</span>
              <span className="text-[10px] text-gray-600 w-7 text-right shrink-0 font-mono">{day.precipitation}%</span>
              <div className="flex-1 flex items-center justify-end gap-1.5">
                <span className="text-[11px] text-white font-bold font-mono w-6 text-right">{day.tempMax}°</span>
                <div className="w-14 h-1 rounded-full bg-white/[0.05] overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(((day.tempMax - day.tempMin) / 12) * 100, 100)}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #a855f7)',
                      boxShadow: '0 0 4px rgba(6, 182, 212, 0.3)',
                    }}
                  />
                </div>
                <span className="text-[11px] text-gray-600 font-mono w-6 text-right">{day.tempMin}°</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
