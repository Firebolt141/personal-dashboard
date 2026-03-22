import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Trash2,
  Calendar as CalIcon,
  Plane,
  ListTodo,
  Sparkles,
} from 'lucide-react'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import type { EventType } from '../types/calendar'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const typeConfig: Record<EventType, { label: string; color: string; icon: typeof CalIcon }> = {
  event: { label: 'Event', color: 'var(--color-violet)', icon: Sparkles },
  trip: { label: 'Trip', color: 'var(--color-cyan)', icon: Plane },
  todo: { label: 'Todo', color: 'var(--color-amber)', icon: ListTodo },
}

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate() }
function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay() }
function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function Calendar() {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selected, setSelected] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('event')

  const { events, addEvent, removeEvent, toggleComplete } = useCalendarEvents()

  const days = daysInMonth(year, month)
  const first = firstDay(year, month)
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const byDate = useMemo(() => {
    const m = new Map<string, typeof events>()
    for (const e of events) {
      const arr = m.get(e.date) ?? []
      arr.push(e)
      m.set(e.date, arr)
    }
    return m
  }, [events])

  const selEvents = selected ? (byDate.get(selected) ?? []) : []

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const submit = () => {
    if (!title.trim() || !selected) return
    addEvent(title.trim(), selected, type)
    setTitle('')
    setAdding(false)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalIcon size={13} className="text-[var(--color-violet)]" />
          <span className="text-xs font-medium text-[var(--color-text)]">Calendar</span>
        </div>
        <div className="flex items-center">
          <button onClick={prev} className="p-1.5 rounded-md active:bg-[var(--color-surface-2)]">
            <ChevronLeft size={14} className="text-[var(--color-text-muted)]" />
          </button>
          <span className="text-xs font-medium text-[var(--color-text)] min-w-[100px] text-center">
            {MONTHS[month]} {year}
          </span>
          <button onClick={next} className="p-1.5 rounded-md active:bg-[var(--color-surface-2)]">
            <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[9px] font-medium text-[var(--color-text-faint)] pb-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 px-2 pb-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const dk = dateKey(year, month, day)
          const isToday = dk === todayKey
          const isSel = dk === selected
          const de = byDate.get(dk) ?? []
          return (
            <button
              key={dk}
              onClick={() => setSelected(isSel ? null : dk)}
              className={`
                flex flex-col items-center justify-center h-10 rounded-lg text-xs transition-all active:scale-95
                ${isToday && !isSel ? 'text-[var(--color-accent)] font-semibold' : ''}
                ${isSel ? 'bg-[var(--color-accent)] text-white font-semibold' : ''}
                ${!isToday && !isSel ? 'text-[var(--color-text-secondary)] active:bg-[var(--color-surface-2)]' : ''}
              `}
            >
              {day}
              {de.length > 0 && (
                <div className="flex gap-px mt-0.5">
                  {de.slice(0, 3).map(e => (
                    <div key={e.id} className="w-1 h-1 rounded-full" style={{ background: isSel ? 'white' : typeConfig[e.type].color }} />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-[var(--color-border)]" />
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                  {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1 text-[10px] text-[var(--color-accent)] active:text-[var(--color-accent-light)] p-1"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {adding && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2"
                  >
                    <div className="card-inner rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submit()}
                        placeholder="Event name..."
                        className="w-full bg-transparent rounded-md px-3 py-2 text-xs text-[var(--color-text)] placeholder-[var(--color-text-faint)] outline-none border border-[var(--color-border)] focus:border-[var(--color-accent)] transition-colors"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {(Object.keys(typeConfig) as EventType[]).map(t => {
                          const c = typeConfig[t]
                          const Icon = c.icon
                          const active = type === t
                          return (
                            <button
                              key={t}
                              onClick={() => setType(t)}
                              className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] transition-all active:scale-95 border ${
                                active ? 'border-[var(--color-border-light)] bg-[var(--color-surface-3)] text-[var(--color-text)]'
                                       : 'border-transparent text-[var(--color-text-faint)]'
                              }`}
                            >
                              <Icon size={10} />
                              {c.label}
                            </button>
                          )
                        })}
                        <div className="flex-1" />
                        <button onClick={() => setAdding(false)} className="p-1 text-[var(--color-text-faint)]">
                          <X size={12} />
                        </button>
                        <button
                          onClick={submit}
                          className="px-3 py-1.5 rounded-md text-[10px] font-medium text-white bg-[var(--color-accent)] active:opacity-80 transition-opacity"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Events */}
              {selEvents.length === 0 && !adding && (
                <p className="text-[10px] text-[var(--color-text-faint)] text-center py-3">No events</p>
              )}
              <div className="space-y-1">
                {selEvents.map(ev => {
                  const c = typeConfig[ev.type]
                  const Icon = c.icon
                  return (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs event-${ev.type} ${ev.completed ? 'opacity-40' : ''}`}
                    >
                      <Icon size={12} style={{ color: c.color }} className="shrink-0" />
                      <span className={`flex-1 min-w-0 truncate ${ev.completed ? 'line-through' : ''} text-[var(--color-text-secondary)]`}>
                        {ev.title}
                      </span>
                      {ev.type === 'todo' && (
                        <button onClick={() => toggleComplete(ev.id)} className="p-1 rounded active:bg-[var(--color-surface-3)] shrink-0">
                          <Check size={12} className={ev.completed ? 'text-[var(--color-green)]' : 'text-[var(--color-text-faint)]'} />
                        </button>
                      )}
                      <button onClick={() => removeEvent(ev.id)} className="p-1 rounded active:bg-[var(--color-surface-3)] text-[var(--color-text-faint)] shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
