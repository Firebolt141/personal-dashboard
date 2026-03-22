import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Droplets, Wind, ChevronDown } from 'lucide-react'
import { generateWeatherData } from '../utils/weatherData'

export default function WeatherCard() {
  const [expanded, setExpanded] = useState(false)
  const weather = useMemo(() => generateWeatherData(), [])
  const today = weather[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl overflow-hidden glass-hover cursor-pointer"
      onClick={() => setExpanded(prev => !prev)}
    >
      {/* Today's weather */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin size={14} className="text-[var(--color-primary-light)]" />
            <span>Myogadani Station, Bunkyo-ku</span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={18} className="text-gray-400" />
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl font-bold text-white">
              {today.temp}°
              <span className="text-lg font-normal text-gray-400 ml-1">C</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              H:{today.tempMax}° L:{today.tempMin}°
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl">{today.icon}</div>
            <div className="text-sm text-gray-300 mt-1">{today.condition}</div>
          </div>
        </div>

        <div className="flex gap-6 mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-[var(--color-accent-cyan)]" />
            {today.humidity}%
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={14} className="text-[var(--color-accent-emerald)]" />
            {today.windSpeed} km/h
          </div>
          <div className="flex items-center gap-1.5">
            🌧️ {today.precipitation}%
          </div>
        </div>
      </div>

      {/* 15-day forecast */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-5 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                15-Day Forecast
              </p>
              <div className="space-y-2">
                {weather.slice(1).map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <div className="w-16 text-gray-400 font-medium">{day.day}</div>
                    <div className="w-12 text-gray-500 text-xs">{day.date}</div>
                    <div className="text-lg">{day.icon}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Droplets size={10} />
                      {day.precipitation}%
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-white font-medium">{day.tempMax}°</span>
                      <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-amber)]"
                          style={{ width: `${((day.tempMax - day.tempMin) / 15) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-500">{day.tempMin}°</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
