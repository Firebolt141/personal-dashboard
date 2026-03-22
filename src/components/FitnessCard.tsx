import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Footprints, Flame, Timer, Heart } from 'lucide-react'
import { generateFitnessData } from '../utils/fitnessData'

function RingProgress({ value, max, size, strokeWidth, color, children }: {
  value: number
  max: number
  size: number
  strokeWidth: number
  color: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}

export default function FitnessCard() {
  const data = useMemo(() => generateFitnessData(), [])
  const maxWeeklySteps = Math.max(...data.weeklySteps.map(d => d.steps), 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="neon-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-green)]" style={{ boxShadow: '0 0 6px #39ff14' }} />
          <span className="text-xs font-bold text-white tracking-wide">FITNESS</span>
        </div>
        <span className="text-[9px] font-mono text-gray-500 uppercase">Google Fit</span>
      </div>

      <div className="p-4">
        {/* Main ring + stats */}
        <div className="flex items-center gap-4">
          {/* Steps ring */}
          <RingProgress
            value={data.steps}
            max={data.stepGoal}
            size={88}
            strokeWidth={6}
            color="#39ff14"
          >
            <div className="text-center">
              <Footprints size={14} className="mx-auto mb-0.5 text-[var(--color-neon-green)]" />
              <div className="text-sm font-bold text-white font-mono leading-none">
                {data.steps.toLocaleString()}
              </div>
              <div className="text-[8px] text-gray-500 mt-0.5">
                / {(data.stepGoal / 1000).toFixed(0)}k
              </div>
            </div>
          </RingProgress>

          {/* Right side stats */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
              <div className="flex items-center gap-1 mb-1">
                <Flame size={10} className="text-[var(--color-accent-rose)]" />
                <span className="text-[9px] text-gray-500 uppercase">Cal</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{data.calories}</div>
              <div className="w-full h-0.5 rounded-full bg-white/[0.05] mt-1">
                <motion.div
                  className="h-full rounded-full bg-[var(--color-accent-rose)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.calories / data.calorieGoal) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ boxShadow: '0 0 4px rgba(251, 113, 133, 0.5)' }}
                />
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
              <div className="flex items-center gap-1 mb-1">
                <Timer size={10} className="text-[var(--color-neon-blue)]" />
                <span className="text-[9px] text-gray-500 uppercase">Active</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{data.activeMinutes}m</div>
              <div className="w-full h-0.5 rounded-full bg-white/[0.05] mt-1">
                <motion.div
                  className="h-full rounded-full bg-[var(--color-neon-blue)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((data.activeMinutes / data.activeMinuteGoal) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{ boxShadow: '0 0 4px rgba(0, 212, 255, 0.5)' }}
                />
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
              <div className="flex items-center gap-1 mb-1">
                <Footprints size={10} className="text-[var(--color-neon-green)]" />
                <span className="text-[9px] text-gray-500 uppercase">Dist</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{data.distance} km</div>
            </div>

            <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04]">
              <div className="flex items-center gap-1 mb-1">
                <Heart size={10} className="text-[var(--color-neon-pink)]" />
                <span className="text-[9px] text-gray-500 uppercase">BPM</span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{data.heartRate}</div>
            </div>
          </div>
        </div>

        {/* Weekly steps bar chart */}
        <div className="mt-4">
          <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">This Week</div>
          <div className="flex items-end gap-1.5 h-12">
            {data.weeklySteps.map((d, i) => {
              const height = d.steps > 0 ? Math.max((d.steps / maxWeeklySteps) * 100, 8) : 4
              const isToday = i === (new Date().getDay() + 6) % 7
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                    className="w-full rounded-sm"
                    style={{
                      background: isToday
                        ? 'linear-gradient(to top, #39ff14, #22d3ee)'
                        : d.steps > 0
                        ? 'rgba(57, 255, 20, 0.25)'
                        : 'rgba(255,255,255,0.03)',
                      boxShadow: isToday ? '0 0 6px rgba(57, 255, 20, 0.3)' : undefined,
                    }}
                  />
                  <span className={`text-[8px] font-mono ${isToday ? 'text-[var(--color-neon-green)]' : 'text-gray-600'}`}>
                    {d.day[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
