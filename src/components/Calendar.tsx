import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Trash2,
  Calendar as CalendarIcon,
  Plane,
  ListTodo,
  Sparkles,
} from 'lucide-react'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import type { EventType } from '../types/calendar'

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: typeof CalendarIcon }> = {
  event: { label: 'Event', color: '#c084fc', icon: Sparkles },
  trip: { label: 'Trip', color: '#22d3ee', icon: Plane },
  todo: { label: 'Todo', color: '#facc15', icon: ListTodo },
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function Calendar() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newType, setNewType] = useState<EventType>('event')

  const { events, addEvent, removeEvent, toggleComplete } = useCalendarEvents()

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>()
    for (const e of events) {
      const existing = map.get(e.date) ?? []
      existing.push(e)
      map.set(e.date, existing)
    }
    return map
  }, [events])

  const selectedEvents = selectedDate ? (eventsByDate.get(selectedDate) ?? []) : []

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const handleAddEvent = () => {
    if (!newTitle.trim() || !selectedDate) return
    addEvent(newTitle.trim(), selectedDate, newType)
    setNewTitle('')
    setShowAddForm(false)
  }

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="neon-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={12} className="text-[var(--color-neon-purple)]" />
          <span className="text-xs font-bold text-white tracking-wide">CALENDAR</span>
        </div>
        <div className="flex items-center">
          <button onClick={prevMonth} className="p-2 active:bg-white/5 rounded-lg transition-colors">
            <ChevronLeft size={14} className="text-gray-400" />
          </button>
          <span className="text-[11px] font-mono font-medium text-white min-w-[90px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-2 active:bg-white/5 rounded-lg transition-colors">
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[9px] font-mono font-medium text-gray-600 pb-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-2 pb-2 gap-y-0.5">
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />

          const dateKey = formatDateKey(currentYear, currentMonth, day)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === selectedDate
          const dayEvents = eventsByDate.get(dateKey) ?? []
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={dateKey}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
              className={`
                relative flex flex-col items-center justify-center
                h-10 rounded-lg text-xs transition-all active:scale-95
                ${isToday && !isSelected ? 'text-[var(--color-neon-purple)] font-bold' : ''}
                ${isSelected ? 'font-bold' : ''}
                ${!isToday && !isSelected ? 'text-gray-400' : ''}
              `}
              style={
                isSelected
                  ? {
                      background: 'rgba(168, 85, 247, 0.15)',
                      border: '1px solid rgba(168, 85, 247, 0.3)',
                      boxShadow: '0 0 8px rgba(168, 85, 247, 0.15)',
                      color: '#c084fc',
                    }
                  : isToday
                  ? { background: 'rgba(168, 85, 247, 0.08)' }
                  : undefined
              }
            >
              {day}
              {hasEvents && (
                <div className="flex gap-px mt-0.5">
                  {dayEvents.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      className="w-1 h-1 rounded-full"
                      style={{
                        background: eventTypeConfig[e.type].color,
                        boxShadow: `0 0 3px ${eventTypeConfig[e.type].color}`,
                      }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected date detail */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="neon-divider" />
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-medium text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-[10px] font-mono text-[var(--color-neon-purple)] active:text-white transition-colors p-1"
                >
                  <Plus size={12} />
                  ADD
                </button>
              </div>

              {/* Add form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2"
                  >
                    <div className="bg-white/[0.03] rounded-lg p-3 space-y-2 border border-white/[0.05]">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                        placeholder="What's happening?"
                        className="w-full bg-white/[0.04] rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-600 outline-none border border-white/[0.05] focus:border-[var(--color-neon-purple)]/40 transition-colors font-mono"
                        autoFocus
                      />
                      <div className="flex items-center gap-1 flex-wrap">
                        {(Object.keys(eventTypeConfig) as EventType[]).map(type => {
                          const config = eventTypeConfig[type]
                          const Icon = config.icon
                          const isActive = newType === type
                          return (
                            <button
                              key={type}
                              onClick={() => setNewType(type)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-mono transition-all active:scale-95"
                              style={{
                                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                                color: isActive ? config.color : '#6b7280',
                                border: isActive ? `1px solid ${config.color}30` : '1px solid transparent',
                              }}
                            >
                              <Icon size={10} />
                              {config.label}
                            </button>
                          )
                        })}
                        <div className="flex-1" />
                        <button onClick={() => setShowAddForm(false)} className="p-1.5 text-gray-600 active:text-gray-400">
                          <X size={12} />
                        </button>
                        <button
                          onClick={handleAddEvent}
                          className="px-3 py-1.5 rounded-md text-[10px] font-mono font-bold text-white transition-colors active:scale-95"
                          style={{
                            background: 'var(--color-primary-dark)',
                            boxShadow: '0 0 8px rgba(168, 85, 247, 0.2)',
                          }}
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Event list */}
              {selectedEvents.length === 0 && !showAddForm && (
                <p className="text-[10px] text-gray-600 text-center py-3 font-mono">No events</p>
              )}
              <div className="space-y-1">
                {selectedEvents.map(event => {
                  const config = eventTypeConfig[event.type]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs
                        event-${event.type}
                        ${event.completed ? 'opacity-40' : ''}
                      `}
                    >
                      <Icon size={12} style={{ color: config.color }} className="shrink-0" />
                      <span className={`flex-1 min-w-0 truncate font-mono ${event.completed ? 'line-through' : ''} text-gray-300`}>
                        {event.title}
                      </span>
                      {event.type === 'todo' && (
                        <button
                          onClick={() => toggleComplete(event.id)}
                          className="p-1.5 rounded active:bg-white/5 transition-colors shrink-0"
                        >
                          <Check size={12} className={event.completed ? 'text-[var(--color-neon-green)]' : 'text-gray-600'} />
                        </button>
                      )}
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="p-1.5 rounded active:bg-white/5 transition-colors text-gray-600 active:text-[var(--color-accent-rose)] shrink-0"
                      >
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
