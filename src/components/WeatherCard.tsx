import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Droplets, Wind, ChevronDown } from 'lucide-react'
import { generateWeatherData } from '../utils/weatherData'

export default function WeatherCard() {
  const [expanded, setExpanded] = useState(false)
  const weather = useMemo(() => generateWeatherData(), [])
  const today = weather[0]
  const week = weather.slice(1, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Today — single compact row */}
      <button
        className="w-full p-4 flex items-center gap-3 text-left"
        onClick={() => setExpanded(p => !p)}
      >
        {/* Icon */}
        <div className="text-2xl leading-none shrink-0">{today.icon}</div>

        {/* Temp + condition */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-semibold text-[var(--color-text)]">{today.temp}°</span>
            <span className="text-xs text-[var(--color-text-muted)]">{today.condition}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[var(--color-text-faint)]">
            <span className="flex items-center gap-1">
              <MapPin size={9} />
              Myogadani
            </span>
            <span>H:{today.tempMax}° L:{today.tempMin}°</span>
          </div>
        </div>

        {/* Quick stats + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2.5 text-[10px] text-[var(--color-text-faint)]">
            <span className="flex items-center gap-1"><Droplets size={10} />{today.humidity}%</span>
            <span className="flex items-center gap-1"><Wind size={10} />{today.windSpeed}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} className="text-[var(--color-text-faint)]" />
          </motion.div>
        </div>
      </button>

      {/* Expanded — 7 day forecast */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Today's detail row */}
            <div className="px-4 pb-3 flex items-center gap-3 text-[10px] text-[var(--color-text-muted)] sm:hidden">
              <span className="flex items-center gap-1"><Droplets size={10} className="text-[var(--color-cyan)]" />{today.humidity}%</span>
              <span className="flex items-center gap-1"><Wind size={10} className="text-[var(--color-accent)]" />{today.windSpeed} km/h</span>
              <span>🌧️ {today.precipitation}%</span>
            </div>

            <div className="border-t border-[var(--color-border)]" />

            {/* 7-day grid */}
            <div className="p-3 grid grid-cols-7 gap-1">
              {week.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="flex flex-col items-center gap-1 py-2 rounded-lg"
                >
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">
                    {day.day.slice(0, 3)}
                  </span>
                  <span className="text-lg leading-none">{day.icon}</span>
                  <div className="flex flex-col items-center gap-0.5 mt-0.5">
                    <span className="text-[11px] font-semibold text-[var(--color-text)]">{day.tempMax}°</span>
                    <span className="text-[10px] text-[var(--color-text-faint)]">{day.tempMin}°</span>
                  </div>
                  <span className="text-[8px] text-[var(--color-text-faint)]">{day.precipitation}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
