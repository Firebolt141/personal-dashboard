import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Wind, Eye, ChevronDown } from 'lucide-react'
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
      {/* Today — rich card */}
      <button
        className="w-full text-left"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="p-4 pb-3">
          {/* Location + chevron */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-[var(--color-text-muted)]">Myogadani, Tokyo</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="text-[var(--color-text-faint)]" />
            </motion.div>
          </div>

          {/* Main row: temp + icon */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl font-light text-[var(--color-text)] leading-none tracking-tight">
                {today.temp}°
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{today.condition}</div>
              <div className="text-[10px] text-[var(--color-text-faint)] mt-0.5">
                H:{today.tempMax}°  L:{today.tempMin}°
              </div>
            </div>
            <div className="text-5xl leading-none -mt-1">{today.icon}</div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <Droplets size={11} className="text-[var(--color-cyan)]" />
              <span>{today.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <Wind size={11} className="text-[var(--color-accent)]" />
              <span>{today.windSpeed} km/h</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
              <Eye size={11} className="text-[var(--color-violet)]" />
              <span>{today.precipitation}% rain</span>
            </div>
          </div>
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
            <div className="border-t border-[var(--color-border)]" />
            <div className="p-3 grid grid-cols-7 gap-0.5">
              {week.map((day, i) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-lg"
                >
                  <span className="text-[10px] text-[var(--color-text-muted)] font-medium">{day.day.slice(0, 3)}</span>
                  <span className="text-base leading-none my-0.5">{day.icon}</span>
                  <span className="text-[11px] font-medium text-[var(--color-text)]">{day.tempMax}°</span>
                  <span className="text-[10px] text-[var(--color-text-faint)]">{day.tempMin}°</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
