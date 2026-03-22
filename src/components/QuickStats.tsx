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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass rounded-xl p-4 glass-hover"
    >
      <h2 className="text-base font-semibold text-white">{greeting}</h2>
      <p className="text-xs text-gray-400 mb-3">
        {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <Clock size={14} className="mx-auto mb-0.5 text-[var(--color-primary-light)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-[10px] text-gray-500">Local</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <Flame size={14} className="mx-auto mb-0.5 text-[var(--color-accent-amber)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {dayOfYear}
          </div>
          <div className="text-[10px] text-gray-500">Day of Year</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 text-center">
          <Target size={14} className="mx-auto mb-0.5 text-[var(--color-accent-emerald)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {yearProgress}%
          </div>
          <div className="text-[10px] text-gray-500">Year Done</div>
        </div>
      </div>

      <div className="mt-2.5">
        <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
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
