"use client";

import { useEffect, useMemo, useState } from "react";

type EventType = "event" | "trip" | "todo";

type CalendarEvent = {
  type: EventType;
  title: string;
  date?: string;
  start?: string;
  end?: string;
  completed?: boolean;
};

const STORAGE_KEY = "personal-dashboard-events";

function formatDateKey(date: Date) {
  const paddedMonth = String(date.getMonth() + 1).padStart(2, "0");
  const paddedDay = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${paddedMonth}-${paddedDay}`;
}

function normalizeEvents(items: CalendarEvent[], fallbackDate: Date) {
  return items.map((event) => {
    if (typeof event.date === "number") {
      return {
        ...event,
        date: formatDateKey(
          new Date(
            fallbackDate.getFullYear(),
            fallbackDate.getMonth(),
            event.date
          )
        ),
      };
    }
    if (typeof event.start === "number" && typeof event.end === "number") {
      return {
        ...event,
        start: formatDateKey(
          new Date(
            fallbackDate.getFullYear(),
            fallbackDate.getMonth(),
            event.start
          )
        ),
        end: formatDateKey(
          new Date(
            fallbackDate.getFullYear(),
            fallbackDate.getMonth(),
            event.end
          )
        ),
      };
    }
    return event;
  });
}

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
  const today = new Date();
  const todayKey = formatDateKey(today);

  useEffect(() => {
    const loadEvents = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CalendarEvent[];
        setEvents(normalizeEvents(parsed, today));
      }
    };

    loadEvents();

    const handleUpdate = () => loadEvents();
    window.addEventListener("events-updated", handleUpdate);

    return () => {
      window.removeEventListener("events-updated", handleUpdate);
    };
  }, []);

  const todaysEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.type === "trip" && event.start && event.end) {
        return todayKey >= event.start && todayKey <= event.end;
      }
      return event.date === todayKey;
    });
  }, [events, todayKey]);

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
