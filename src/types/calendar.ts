export type EventType = 'event' | 'trip' | 'todo'

export interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  type: EventType
  completed?: boolean
}
