"use client";

import { useEffect, useMemo, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_RANGE = 12;

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

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString("en-US", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) dates.push(i);

  /* ---------- AUTO-FOCUS TODAY ---------- */
  useEffect(() => {
    if (today.getMonth() === month && today.getFullYear() === year) {
      setSelectedDate(todayDate);
    }

    const interval = setInterval(() => {
      const now = new Date();
      const newDate = now.getDate();
      if (newDate !== todayDate) {
        setTodayDate(newDate);
        if (now.getMonth() === month && now.getFullYear() === year) {
          setSelectedDate(newDate);
        }
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [month, year, today, todayDate]);

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
  }, [events]);

  function eventsForDate(date: number) {
    const dateKey = formatDateKey(year, month, date);
    return events.filter((e) => {
      if (e.type === "trip" && e.start && e.end) {
        return dateKey >= e.start && dateKey <= e.end;
      }
      return e.date === dateKey;
    });
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

  const selectedEvents = selectedDate ? eventsForDate(selectedDate) : [];
  const monthOptions = useMemo(() => {
    const options: Date[] = [];
    const base = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let offset = -MONTH_RANGE; offset <= MONTH_RANGE; offset += 1) {
      options.push(new Date(base.getFullYear(), base.getMonth() + offset, 1));
    }
    return options;
  }, [today]);

  return (
    <div className="card">
      <div className="section-title">Calendar</div>
      <div className="month-strip">
        {monthOptions.map((option) => {
          const isActive =
            option.getFullYear() === year && option.getMonth() === month;
          return (
            <button
              key={option.toISOString()}
              type="button"
              onClick={() => setViewDate(option)}
              className={`month-chip${isActive ? " active" : ""}`}
            >
              {option.toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </button>
          );
        })}
      </div>

      <div className="month-label">
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
          const isToday =
            date === todayDate &&
            month === today.getMonth() &&
            year === today.getFullYear();

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
                  className="todo-checkbox"
                  type="checkbox"
                  checked={!!e.completed}
                  onChange={() => toggleTodo(events.indexOf(e))}
                />
              )}

              <span style={{ textDecoration: e.completed ? "line-through" : "none" }}>
                <span style={{ color: dotColor(e.type), marginRight: 6 }}>●</span>
                {e.title}
              </span>
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
