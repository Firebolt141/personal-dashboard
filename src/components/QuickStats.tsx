import { motion } from 'framer-motion'
import { Clock, Flame, Target } from 'lucide-react'

export default function QuickStats() {
  const now = new Date()
  const hours = now.getHours()
  const greeting = hours < 12 ? 'Good Morning' : hours < 17 ? 'Good Afternoon' : 'Good Evening'

  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const totalDays = (now.getFullYear() % 4 === 0) ? 366 : 365
  const yearProgress = Math.round((dayOfYear / totalDays) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-2xl p-5 glass-hover"
    >
      <h2 className="text-lg font-semibold text-white mb-1">{greeting}</h2>
      <p className="text-sm text-gray-400 mb-4">
        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Clock size={16} className="mx-auto mb-1 text-[var(--color-primary-light)]" />
          <div className="text-lg font-bold text-white font-mono">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Local Time</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Flame size={16} className="mx-auto mb-1 text-[var(--color-accent-amber)]" />
          <div className="text-lg font-bold text-white font-mono">
            Day {dayOfYear}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">of {totalDays}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <Target size={16} className="mx-auto mb-1 text-[var(--color-accent-emerald)]" />
          <div className="text-lg font-bold text-white font-mono">
            {yearProgress}%
          </div>
          <div className="text-xs text-gray-500 mt-0.5">Year Done</div>
        </div>
      </div>

      {/* Year progress bar */}
      <div className="mt-3">
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yearProgress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-cyan)] to-[var(--color-accent-emerald)]"
          />
        </div>
      </div>
    </motion.div>
  )
}
