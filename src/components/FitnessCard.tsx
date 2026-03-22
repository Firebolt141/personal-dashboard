import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Footprints, Flame, Timer, Heart, TrendingUp } from 'lucide-react'
import { generateFitnessData } from '../utils/fitnessData'

function Ring({ value, max, size, stroke, color }: {
  value: number; max: number; size: number; stroke: number; color: string
}) {
  const r = (size - stroke) / 2
  const circ = r * 2 * Math.PI
  const progress = Math.min(value / max, 1)
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - progress * circ }}
        transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

function Stat({ icon: Icon, label, value, unit, color }: {
  icon: typeof Flame; label: string; value: string; unit?: string; color: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div>
        <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-[var(--color-text)]">
          {value}{unit && <span className="text-[var(--color-text-muted)] text-xs font-normal ml-0.5">{unit}</span>}
        </div>
      </div>
    </div>
  )
}

export default function FitnessCard() {
  const data = useMemo(() => generateFitnessData(), [])
  const maxSteps = Math.max(...data.weeklySteps.map(d => d.steps), 1)
  const stepsPercent = Math.round((data.steps / data.stepGoal) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="card rounded-xl overflow-hidden"
    >
      <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <TrendingUp size={13} className="text-[var(--color-green)]" />
          <span className="text-xs font-medium text-[var(--color-text)]">Activity</span>
        </div>
        <span className="text-[10px] text-[var(--color-text-faint)]">Today</span>
      </div>

      <div className="p-4">
        {/* Steps ring + number */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <Ring value={data.steps} max={data.stepGoal} size={72} stroke={5} color="var(--color-green)" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-[var(--color-text)] font-mono leading-none">
                {(data.steps / 1000).toFixed(1)}k
              </span>
              <span className="text-[8px] text-[var(--color-text-muted)] mt-0.5">steps</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <Stat icon={Flame} label="Calories" value={String(data.calories)} unit="kcal" color="var(--color-rose)" />
            <Stat icon={Timer} label="Active" value={String(data.activeMinutes)} unit="min" color="var(--color-accent)" />
          </div>
        </div>

        {/* Secondary stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 card-inner rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Footprints size={11} className="text-[var(--color-green)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">Distance</span>
            </div>
            <div className="text-sm font-semibold mt-0.5 font-mono">{data.distance} km</div>
          </div>
          <div className="flex-1 card-inner rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Heart size={11} className="text-[var(--color-rose)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">Heart Rate</span>
            </div>
            <div className="text-sm font-semibold mt-0.5 font-mono">{data.heartRate} bpm</div>
          </div>
          <div className="flex-1 card-inner rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Target size={11} className="text-[var(--color-amber)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">Goal</span>
            </div>
            <div className="text-sm font-semibold mt-0.5 font-mono">{stepsPercent}%</div>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div>
          <div className="text-[10px] text-[var(--color-text-muted)] mb-2">This week</div>
          <div className="flex items-end gap-1 h-10">
            {data.weeklySteps.map((d, i) => {
              const h = d.steps > 0 ? Math.max((d.steps / maxSteps) * 100, 6) : 3
              const isToday = i === (new Date().getDay() + 6) % 7
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + i * 0.06 }}
                    className="w-full rounded-sm"
                    style={{
                      background: isToday ? 'var(--color-green)' : d.steps > 0 ? 'var(--color-surface-3)' : 'var(--color-surface-2)',
                    }}
                  />
                  <span className={`text-[8px] ${isToday ? 'text-[var(--color-green)] font-medium' : 'text-[var(--color-text-faint)]'}`}>
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

function Target({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  )
}
