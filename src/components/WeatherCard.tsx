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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-xl overflow-hidden glass-hover active:scale-[0.99] transition-transform"
      onClick={() => setExpanded(prev => !prev)}
    >
      {/* Today's weather */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={12} className="text-[var(--color-primary-light)]" />
            <span>Myogadani Station, Bunkyo-ku</span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown size={16} className="text-gray-400" />
          </motion.div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold text-white">
              {today.temp}°
              <span className="text-sm font-normal text-gray-400 ml-0.5">C</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              H:{today.tempMax}° L:{today.tempMin}°
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl">{today.icon}</div>
            <div className="text-xs text-gray-300 mt-0.5">{today.condition}</div>
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Droplets size={12} className="text-[var(--color-accent-cyan)]" />
            {today.humidity}%
          </div>
          <div className="flex items-center gap-1">
            <Wind size={12} className="text-[var(--color-accent-emerald)]" />
            {today.windSpeed} km/h
          </div>
          <div className="flex items-center gap-1">
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
            <div className="border-t border-white/5 px-4 py-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
                15-Day Forecast
              </p>
              <div className="space-y-1">
                {weather.slice(1).map((day, i) => (
                  <motion.div
                    key={day.date}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.025, duration: 0.25 }}
                    className="flex items-center gap-2 py-1 text-xs"
                  >
                    <span className="w-10 text-gray-400 font-medium shrink-0">{day.day}</span>
                    <span className="text-base leading-none">{day.icon}</span>
                    <span className="text-gray-500 w-7 shrink-0 text-right">{day.precipitation}%</span>
                    <div className="flex-1 flex items-center gap-1.5 justify-end">
                      <span className="text-white font-medium w-6 text-right">{day.tempMax}°</span>
                      <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent-cyan)] to-[var(--color-accent-amber)]"
                          style={{ width: `${Math.min(((day.tempMax - day.tempMin) / 12) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-gray-500 w-6 text-right">{day.tempMin}°</span>
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
