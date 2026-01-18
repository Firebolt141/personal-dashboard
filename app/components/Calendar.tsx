"use client";

import { useEffect, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function dotColor(type: EventType) {
  switch (type) {
    case "event":
      return "#3b82f6";
    case "trip":
      return "#a855f7";
    case "todo":
      return "#22c55e";
  }
}

export default function Calendar() {
  const [todayDate, setTodayDate] = useState(new Date().getDate());
  const [selectedDate, setSelectedDate] = useState<number | null>(todayDate);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("event");
  const [tripEnd, setTripEnd] = useState<number>(todayDate);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleString("en-US", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) dates.push(i);

  /* ---------- AUTO-FOCUS TODAY ---------- */
  useEffect(() => {
    setSelectedDate(todayDate);

    const interval = setInterval(() => {
      const now = new Date();
      const newDate = now.getDate();
      if (newDate !== todayDate) {
        setTodayDate(newDate);
        setSelectedDate(newDate);
      }
    }, 60_000); // check every minute

    return () => clearInterval(interval);
  }, [todayDate]);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEvents(JSON.parse(stored));
  }, []);

  /* ---------- SAVE ---------- */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  function eventsForDate(date: number) {
    return events.filter((e) => {
      if (e.type === "trip" && e.start && e.end) {
        return date >= e.start && date <= e.end;
      }
      return e.date === date;
    });
  }

  function addEvent() {
    if (!selectedDate || !title.trim()) return;

    if (type === "trip") {
      setEvents((prev) => [
        ...prev,
        { type, title, start: selectedDate, end: tripEnd },
      ]);
    } else {
      setEvents((prev) => [
        ...prev,
        {
          type,
          title,
          date: selectedDate,
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

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];

  return (
    <div className="card">
      <div className="section-title">
        {monthLabel} {year}
      </div>

      {/* DAYS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {DAYS.map((day) => (
          <div key={day} className="muted" style={{ fontSize: 12, textAlign: "center" }}>
            {day}
          </div>
        ))}
      </div>

      {/* DATES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
          marginTop: 8,
        }}
      >
        {dates.map((date, index) => {
          if (!date) return <div key={index} />;

          const dayEvents = eventsForDate(date);
          const isToday = date === todayDate;

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(date)}
              style={{
                height: 46,
                borderRadius: 14,
                background:
                  date === selectedDate
                    ? "#2a2a2a"
                    : isToday
                    ? "#1e1e1e"
                    : "transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: isToday ? "bold" : "normal" }}>
                {date}
              </div>

              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                {dayEvents.map((e, i) => (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: dotColor(e.type),
                      opacity: e.type === "todo" && e.completed ? 0.3 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILS */}
      {selectedDate && (
        <div style={{ marginTop: 16 }}>
          <div className="section-title">Details</div>

          {selectedEvents.length === 0 && (
            <p className="muted">No items for this day.</p>
          )}

          {selectedEvents.map((e, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
                opacity: e.completed ? 0.5 : 1,
              }}
            >
              {e.type === "todo" && (
                <input
                  type="checkbox"
                  checked={!!e.completed}
                  onChange={() => toggleTodo(events.indexOf(e))}
                />
              )}

              <span
                style={{
                  textDecoration: e.completed ? "line-through" : "none",
                }}
              >
                <span style={{ color: dotColor(e.type), marginRight: 6 }}>●</span>
                {e.title}
                {e.type === "trip" && e.start && e.end && (
                  <span className="muted"> ({e.start}–{e.end})</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
