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
      className="neon-card rounded-xl p-4"
    >
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-sm font-bold text-white tracking-wide">{greeting}</h2>
        <span className="text-[10px] font-mono text-gray-500">
          {now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="relative bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/[0.04]">
          <Clock size={12} className="mx-auto mb-1 text-[var(--color-neon-blue)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">Time</div>
        </div>
        <div className="relative bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/[0.04]">
          <Flame size={12} className="mx-auto mb-1 text-[var(--color-accent-amber)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {dayOfYear}
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">Day</div>
        </div>
        <div className="relative bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/[0.04]">
          <Target size={12} className="mx-auto mb-1 text-[var(--color-neon-green)]" />
          <div className="text-base font-bold text-white font-mono leading-tight">
            {yearProgress}%
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">Year</div>
        </div>
      </div>

      {/* Year progress bar — neon gradient */}
      <div className="mt-3">
        <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yearProgress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #a855f7, #06b6d4, #39ff14)',
              boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)',
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}
