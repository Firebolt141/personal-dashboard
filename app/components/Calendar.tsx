"use client";

import { useEffect, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function formatDateKey(year: number, month: number, day: number) {
  const paddedMonth = String(month + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function parseLegacyEvents(items: CalendarEvent[], fallbackDate: Date) {
  return items.map((event) => {
    if (typeof event.date === "number") {
      return {
        ...event,
        date: formatDateKey(
          fallbackDate.getFullYear(),
          fallbackDate.getMonth(),
          event.date
        ),
      };
    }
    if (typeof event.start === "number" && typeof event.end === "number") {
      return {
        ...event,
        start: formatDateKey(
          fallbackDate.getFullYear(),
          fallbackDate.getMonth(),
          event.start
        ),
        end: formatDateKey(
          fallbackDate.getFullYear(),
          fallbackDate.getMonth(),
          event.end
        ),
      };
    }
    return event;
  });
}

function dotColor(type: EventType, completed?: boolean) {
  switch (type) {
    case "event":
      return "#3b82f6";
    case "trip":
      return "#a855f7";
    case "todo":
      return completed ? "#22c55e" : "#f87171";
  }
}

export default function Calendar() {
  const today = new Date();
  const [todayDate, setTodayDate] = useState(today.getDate());
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("event");
  const [tripEnd, setTripEnd] = useState<number>(today.getDate());
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString("en-US", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) dates.push(i);

  /* ---------- AUTO-FOCUS TODAY ---------- */
  useEffect(() => {
    if (selectedDate === null && today.getMonth() === month && today.getFullYear() === year) {
      setSelectedDate(todayDate);
    }

    const interval = setInterval(() => {
      const now = new Date();
      const newDate = now.getDate();
      if (newDate !== todayDate) {
        setTodayDate(newDate);
        if (
          now.getMonth() === month &&
          now.getFullYear() === year &&
          selectedDate === todayDate
        ) {
          setSelectedDate(newDate);
        }
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [month, year, today, todayDate, selectedDate]);

  useEffect(() => {
    setSelectedDate((prev) =>
      prev ? Math.min(prev, daysInMonth) : Math.min(todayDate, daysInMonth)
    );
    setTripEnd((prev) => Math.min(prev, daysInMonth));
  }, [daysInMonth, todayDate]);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CalendarEvent[];
      setEvents(parseLegacyEvents(parsed, today));
    }
  }, []);

  /* ---------- SAVE ---------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    window.dispatchEvent(new Event("events-updated"));
  }, [events]);

  function shiftMonth(offset: number) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  function eventsForDate(date: number) {
    const dateKey = formatDateKey(year, month, date);
    return events.filter((e) => {
      if (e.type === "trip" && e.start && e.end) {
        return dateKey >= e.start && dateKey <= e.end;
      }
      return e.date === dateKey;
    });
  }

  function dotsForDate(date: number) {
    const dateEvents = eventsForDate(date);
    const hasEvent = dateEvents.some((event) => event.type === "event");
    const hasTrip = dateEvents.some((event) => event.type === "trip");
    const todos = dateEvents.filter((event) => event.type === "todo");
    const hasTodo = todos.length > 0;
    const todoCompleted = hasTodo && todos.every((todo) => !!todo.completed);

    return [
      hasEvent && { key: "event", color: dotColor("event") },
      hasTrip && { key: "trip", color: dotColor("trip") },
      hasTodo && { key: "todo", color: dotColor("todo", todoCompleted) },
    ].filter(Boolean) as { key: EventType; color: string }[];
  }

  function addEvent() {
    if (!selectedDate || !title.trim()) return;
    const selectedKey = formatDateKey(year, month, selectedDate);
    const tripEndKey = formatDateKey(year, month, tripEnd);

    if (type === "trip") {
      setEvents((prev) => [
        ...prev,
        { type, title, start: selectedKey, end: tripEndKey },
      ]);
    } else {
      setEvents((prev) => [
        ...prev,
        {
          type,
          title,
          date: selectedKey,
          completed: type === "todo" ? false : undefined,
        },
      ]);
    }

    setTitle("");
  }

  function toggleTodo(index: number) {
    setEvents((prev) =>
      prev.map((e, i) =>
        i === index && e.type === "todo"
          ? { ...e, completed: !e.completed }
          : e
      )
    );
  }

  const selectedEvents = selectedDate
    ? events
        .map((event, index) => ({ event, index }))
        .filter(({ event }) => {
          if (event.type === "trip" && event.start && event.end) {
            const dateKey = formatDateKey(year, month, selectedDate);
            return dateKey >= event.start && dateKey <= event.end;
          }
          return event.date === formatDateKey(year, month, selectedDate);
        })
    : [];

  function deleteEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="card">
      <div className="section-title">Calendar</div>
      <div className="month-header">
        <button
          type="button"
          className="month-nav"
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="month-label">
          {monthLabel} {year}
        </div>
        <button
          type="button"
          className="month-nav"
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* DAYS */}
      <div className="calendar-days">
        {DAYS.map((day) => (
          <div key={day} className="calendar-day muted">
            {day}
          </div>
        ))}
      </div>

      {/* DATES */}
      <div
        className="calendar-grid"
        onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
        onTouchEnd={(event) => {
          if (touchStartX === null) return;
          const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
          const delta = touchStartX - touchEndX;
          if (Math.abs(delta) > 50) {
            shiftMonth(delta > 0 ? 1 : -1);
          }
          setTouchStartX(null);
        }}
      >
        {dates.map((date, index) => {
          if (!date) return <div key={index} />;

          const dayDots = dotsForDate(date);
          const isToday =
            date === todayDate &&
            month === today.getMonth() &&
            year === today.getFullYear();

          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`calendar-cell${date === selectedDate ? " is-selected" : ""}${
                isToday ? " is-today" : ""
              }`}
            >
              <span className="calendar-date" style={{ fontWeight: isToday ? "bold" : "normal" }}>
                {date}
              </span>

              <span className="calendar-dots" aria-hidden>
                {dayDots.map((dot) => (
                  <span
                    key={dot.key}
                    className="calendar-dot"
                    style={{ background: dot.color }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* DETAILS */}
      {selectedDate && (
        <div className="calendar-details">
          <div className="section-title">Details</div>

          {selectedEvents.map(({ event, index }) => (
            <div
              key={`${event.title}-${index}`}
              className={`calendar-detail-row${
                event.type === "todo" ? " todo-row" : ""
              }${event.completed ? " is-complete" : ""}`}
            >
              {event.type === "todo" && (
                <input
                  className="todo-checkbox"
                  type="checkbox"
                  checked={!!event.completed}
                  onChange={() => toggleTodo(index)}
                />
              )}

              <span className="calendar-detail-text">
                {event.title}
              </span>
              <button
                type="button"
                className="detail-delete"
                onClick={() => deleteEvent(index)}
                aria-label={`Delete ${event.title}`}
              >
                ✕
              </button>
            </div>
          ))}

          {/* ADD FORM */}
          <div style={{ marginTop: 12 }}>
            <input
              placeholder="Title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 10,
                background: "#111",
                border: "1px solid #333",
                color: "#fff",
                marginBottom: 8,
              }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 10,
                  background: "#111",
                  border: "1px solid #333",
                  color: "#fff",
                }}
              >
                <option value="event">Event</option>
                <option value="trip">Trip</option>
                <option value="todo">Todo</option>
              </select>

              {type === "trip" && (
                <input
                  type="number"
                  min={selectedDate}
                  max={daysInMonth}
                  value={tripEnd}
                  onChange={(e) => setTripEnd(Number(e.target.value))}
                  style={{
                    width: 70,
                    padding: 8,
                    borderRadius: 10,
                    background: "#111",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
              )}

              <button
                type="button"
                onClick={addEvent}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: "#2a2a2a",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
