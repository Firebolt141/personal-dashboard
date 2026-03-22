import { useState, useMemo, useRef, useCallback } from 'react'
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

const typeConfig: Record<EventType, { label: string; color: string; bg: string; icon: typeof CalIcon; emoji: string }> = {
  event: { label: 'Event', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Sparkles, emoji: '✨' },
  trip: { label: 'Trip', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: Plane, emoji: '✈️' },
  todo: { label: 'Todo', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: ListTodo, emoji: '✅' },
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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<'category' | 'form'>('category')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('event')
  const [slideDir, setSlideDir] = useState(0)

  const { events, addEvent, removeEvent, toggleComplete } = useCalendarEvents()

  // Swipe handling
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return
    if (dx < 0) goNext()
    else goPrev()
  }, [])

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

  function goPrev() {
    setSlideDir(-1)
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function goNext() {
    setSlideDir(1)
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const openModal = () => {
    if (!selected) {
      setSelected(todayKey)
    }
    setTitle('')
    setType('event')
    setModalStep('category')
    setModalOpen(true)
  }

  const submit = () => {
    const targetDate = selected || todayKey
    if (!title.trim()) return
    addEvent(title.trim(), targetDate, type)
    setTitle('')
    setModalOpen(false)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < first; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(d)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center">
            <button onClick={goPrev} className="p-1.5 rounded-md active:bg-[var(--color-surface-2)]">
              <ChevronLeft size={14} className="text-[var(--color-text-muted)]" />
            </button>
            <span className="text-xs font-medium text-[var(--color-text)] min-w-[100px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={goNext} className="p-1.5 rounded-md active:bg-[var(--color-surface-2)]">
              <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
            </button>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-accent)] active:text-[var(--color-accent-light)] px-2 py-1 rounded-md active:bg-[var(--color-surface-2)]"
          >
            <Plus size={12} />
            Add
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 px-2 pt-2">
          {DAYS.map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-[9px] font-medium text-[var(--color-text-faint)] pb-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid with swipe */}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${year}-${month}`}
            ref={gridRef}
            initial={{ x: slideDir * 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: slideDir * -60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 px-1.5 pb-1.5"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
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
                    flex flex-col items-center justify-center h-9 rounded-md text-[11px] transition-all active:scale-95
                    ${isSel ? 'font-semibold' : ''}
                    ${isToday && !isSel ? 'font-semibold' : ''}
                    ${!isToday && !isSel ? 'text-[var(--color-text-secondary)] active:bg-[var(--color-surface-2)]' : ''}
                  `}
                  style={
                    isSel
                      ? { background: 'var(--color-accent)', color: 'white' }
                      : isToday
                      ? { color: 'var(--color-accent)' }
                      : undefined
                  }
                >
                  {day}
                  {de.length > 0 && (
                    <div className="flex gap-px mt-px">
                      {de.slice(0, 3).map(e => (
                        <div
                          key={e.id}
                          className="w-1 h-1 rounded-full"
                          style={{ background: isSel ? 'white' : typeConfig[e.type].color }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Selected date events */}
        <AnimatePresence>
          {selected && selEvents.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[var(--color-border)] px-3 py-2 space-y-1">
                {selEvents.map(ev => {
                  const c = typeConfig[ev.type]
                  const Icon = c.icon
                  return (
                    <div
                      key={ev.id}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs ${ev.completed ? 'opacity-40' : ''}`}
                      style={{ background: c.bg }}
                    >
                      <Icon size={12} style={{ color: c.color }} className="shrink-0" />
                      <span className={`flex-1 min-w-0 truncate ${ev.completed ? 'line-through' : ''} text-[var(--color-text-secondary)]`}>
                        {ev.title}
                      </span>
                      {ev.type === 'todo' && (
                        <button onClick={() => toggleComplete(ev.id)} className="p-1 rounded active:bg-white/10 shrink-0">
                          <Check size={12} style={{ color: ev.completed ? 'var(--color-green)' : 'var(--color-text-faint)' }} />
                        </button>
                      )}
                      <button onClick={() => removeEvent(ev.id)} className="p-1 rounded active:bg-white/10 text-[var(--color-text-faint)] shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen modal overlay */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            onClick={() => setModalOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Modal card */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-md mx-3 mb-0 sm:mb-0 rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{ background: 'var(--color-surface)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Drag handle for mobile */}
              <div className="flex justify-center pt-2 pb-1 sm:hidden">
                <div className="w-8 h-1 rounded-full bg-[var(--color-surface-3)]" />
              </div>

              {/* Modal header */}
              <div className="px-5 py-3 flex items-center justify-between border-b border-[var(--color-border)]">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {modalStep === 'category' ? 'New Event' : `New ${typeConfig[type].label}`}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-md active:bg-[var(--color-surface-2)]">
                  <X size={16} className="text-[var(--color-text-muted)]" />
                </button>
              </div>

              {/* Category chooser */}
              {modalStep === 'category' ? (
                <div className="p-5 grid grid-cols-3 gap-2">
                  {(Object.keys(typeConfig) as EventType[]).map(t => {
                    const c = typeConfig[t]
                    return (
                      <button
                        key={t}
                        onClick={() => { setType(t); setModalStep('form') }}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border)] active:scale-95 transition-all active:border-[var(--color-border-light)]"
                        style={{ background: c.bg }}
                      >
                        <span className="text-2xl">{c.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: c.color }}>{c.label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                /* Form */
                <div className="p-5 space-y-3">
                  {/* Date display */}
                  <div className="text-[11px] text-[var(--color-text-muted)]">
                    {new Date((selected || todayKey) + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && submit()}
                    placeholder={type === 'trip' ? 'Where are you going?' : type === 'todo' ? 'What needs to be done?' : 'What\'s the event?'}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-text-faint)] outline-none border border-[var(--color-border)] focus:border-[var(--color-accent)] transition-colors"
                    style={{ background: 'var(--color-surface-2)' }}
                    autoFocus
                  />

                  {/* Type selector (can change) */}
                  <div className="flex gap-1.5">
                    {(Object.keys(typeConfig) as EventType[]).map(t => {
                      const c = typeConfig[t]
                      const active = type === t
                      return (
                        <button
                          key={t}
                          onClick={() => setType(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95"
                          style={{
                            background: active ? c.bg : 'transparent',
                            color: active ? c.color : 'var(--color-text-faint)',
                            border: `1px solid ${active ? c.color + '30' : 'transparent'}`,
                          }}
                        >
                          <span className="text-xs">{c.emoji}</span>
                          {c.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setModalOpen(false)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)] border border-[var(--color-border)] active:bg-[var(--color-surface-2)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      className="flex-1 py-2.5 rounded-lg text-xs font-medium text-white transition-colors active:opacity-80"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      Add {typeConfig[type].label}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
