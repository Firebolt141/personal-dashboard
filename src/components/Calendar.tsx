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
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: typeof CalendarIcon }> = {
  event: { label: 'Event', color: 'var(--color-primary)', icon: Sparkles },
  trip: { label: 'Trip', color: 'var(--color-accent-cyan)', icon: Plane },
  todo: { label: 'Todo', color: 'var(--color-accent-amber)', icon: ListTodo },
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
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
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
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass rounded-xl overflow-hidden glass-hover"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarIcon size={14} className="text-[var(--color-primary-light)]" />
          <span className="text-xs font-semibold text-white">Calendar</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg active:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-400" />
          </button>
          <span className="text-xs font-medium text-white min-w-[110px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg active:bg-white/10 transition-colors"
          >
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day headers - single letter for mobile */}
      <div className="grid grid-cols-7 px-3 pt-2">
        {DAYS.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[10px] font-medium text-gray-500 pb-1.5">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid — larger touch targets */}
      <div className="grid grid-cols-7 px-2 pb-2">
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
                h-10 rounded-lg text-sm transition-all active:scale-95
                ${isToday ? 'text-[var(--color-primary-light)] font-bold' : 'text-gray-300'}
                ${isSelected ? 'bg-[var(--color-primary)]/20 ring-1 ring-[var(--color-primary)]/40' : 'active:bg-white/5'}
              `}
            >
              {day}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      className="w-1 h-1 rounded-full"
                      style={{ background: eventTypeConfig[e.type].color }}
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
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 text-xs text-[var(--color-primary-light)] active:text-white transition-colors p-1"
                >
                  <Plus size={14} />
                  Add
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
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                        placeholder="What's happening?"
                        className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
                        autoFocus
                      />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(Object.keys(eventTypeConfig) as EventType[]).map(type => {
                          const config = eventTypeConfig[type]
                          const Icon = config.icon
                          return (
                            <button
                              key={type}
                              onClick={() => setNewType(type)}
                              className={`
                                flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all
                                ${newType === type ? 'bg-white/10 text-white' : 'text-gray-400 active:text-gray-300'}
                              `}
                              style={newType === type ? { borderLeft: `2px solid ${config.color}` } : undefined}
                            >
                              <Icon size={12} />
                              {config.label}
                            </button>
                          )
                        })}
                        <div className="flex-1" />
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="p-1.5 text-gray-500 active:text-gray-300"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={handleAddEvent}
                          className="px-4 py-1.5 bg-[var(--color-primary)] rounded-lg text-xs text-white active:bg-[var(--color-primary-dark)] transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Event list */}
              {selectedEvents.length === 0 && !showAddForm && (
                <p className="text-xs text-gray-500 text-center py-2">No events</p>
              )}
              <div className="space-y-1.5">
                {selectedEvents.map(event => {
                  const config = eventTypeConfig[event.type]
                  const Icon = config.icon
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className={`
                        flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm
                        event-${event.type}
                        ${event.completed ? 'opacity-50' : ''}
                      `}
                    >
                      <Icon size={14} style={{ color: config.color }} className="shrink-0" />
                      <span className={`flex-1 min-w-0 truncate ${event.completed ? 'line-through' : ''} text-gray-200`}>
                        {event.title}
                      </span>
                      {event.type === 'todo' && (
                        <button
                          onClick={() => toggleComplete(event.id)}
                          className="p-1.5 rounded active:bg-white/10 transition-colors shrink-0"
                        >
                          <Check size={14} className={event.completed ? 'text-[var(--color-accent-emerald)]' : 'text-gray-500'} />
                        </button>
                      )}
                      <button
                        onClick={() => removeEvent(event.id)}
                        className="p-1.5 rounded active:bg-white/10 transition-colors text-gray-500 active:text-[var(--color-accent-rose)] shrink-0"
                      >
                        <Trash2 size={14} />
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
