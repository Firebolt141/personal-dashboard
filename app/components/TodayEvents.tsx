"use client";

import { useEffect, useMemo, useState } from "react";

type EventType = "event" | "trip" | "todo";

type CalendarEvent = {
  type: EventType;
  title: string;
  date?: number;
  start?: number;
  end?: number;
  completed?: boolean;
};

const STORAGE_KEY = "personal-dashboard-events";

function badgeColor(type: EventType) {
  switch (type) {
    case "event":
      return "badge badge-event";
    case "trip":
      return "badge badge-trip";
    case "todo":
      return "badge badge-todo";
  }
}

export default function TodayEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const todayDate = new Date().getDate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEvents(JSON.parse(stored));
  }, []);

  const todaysEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.type === "trip" && event.start && event.end) {
        return todayDate >= event.start && todayDate <= event.end;
      }
      return event.date === todayDate;
    });
  }, [events, todayDate]);

  if (todaysEvents.length === 0) {
    return <p className="muted">No events scheduled. Add one in the calendar.</p>;
  }

  return (
    <ul className="today-list">
      {todaysEvents.map((event, index) => (
        <li key={`${event.title}-${index}`} className="today-item">
          <span className={badgeColor(event.type)}>{event.type}</span>
          <span className={event.completed ? "is-complete" : undefined}>
            {event.title}
          </span>
        </li>
      ))}
    </ul>
  );
}
