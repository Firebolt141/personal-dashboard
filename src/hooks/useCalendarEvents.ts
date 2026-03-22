import { useState, useCallback, useSyncExternalStore } from 'react'
import type { CalendarEvent, EventType } from '../types/calendar'
import { loadEvents, saveEvents } from '../utils/calendarStorage'

export function useCalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadEvents())

  // Force re-read on storage changes from other tabs
  useSyncExternalStore(
    (cb) => {
      window.addEventListener('storage', cb)
      return () => window.removeEventListener('storage', cb)
    },
    () => localStorage.getItem('dashboard_calendar_events') ?? '[]',
  )

  const addEvent = useCallback((title: string, date: string, type: EventType) => {
    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title,
      date,
      type,
      completed: false,
    }
    setEvents(prev => {
      const updated = [...prev, newEvent]
      saveEvents(updated)
      return updated
    })
  }, [])

  const removeEvent = useCallback((id: string) => {
    setEvents(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveEvents(updated)
      return updated
    })
  }, [])

  const toggleComplete = useCallback((id: string) => {
    setEvents(prev => {
      const updated = prev.map(e =>
        e.id === id ? { ...e, completed: !e.completed } : e
      )
      saveEvents(updated)
      return updated
    })
  }, [])

  return { events, addEvent, removeEvent, toggleComplete }
}
