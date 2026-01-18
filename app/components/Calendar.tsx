"use client";

import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type EventType = "event" | "trip" | "todo";

type CalendarEvent = {
  type: EventType;
  title: string;
  date?: number;      // for event & todo
  start?: number;     // for trip
  end?: number;       // for trip
};

function dotColor(type: EventType) {
  switch (type) {
    case "event":
      return "#3b82f6"; // blue
    case "trip":
      return "#a855f7"; // purple
    case "todo":
      return "#22c55e"; // green
  }
}

export default function Calendar() {
  const today = new Date();
  const todayDate = today.getDate();

  const [selectedDate, setSelectedDate] = useState<number | null>(todayDate);

  const [events, setEvents] = useState<CalendarEvent[]>([
    { type: "event", title: "Team meeting", date: 12 },
    { type: "trip", title: "Kyoto Trip", start: 18, end: 21 },
    { type: "todo", title: "Buy groceries", date: 22 },
  ]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("event");
  const [tripEnd, setTripEnd] = useState<number>(todayDate);

  const year = today.getFullYear();
  const month = today.getMonth();
  const monthLabel = today.toLocaleString("en-US", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dates: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= daysInMonth; i++) dates.push(i);

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
        { type, title, date: selectedDate },
      ]);
    }

    setTitle("");
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
            <p key={i}>
              <span style={{ color: dotColor(e.type), marginRight: 6 }}>●</span>
              {e.title}
              {e.type === "trip" && e.start && e.end && (
                <span className="muted"> ({e.start}–{e.end})</span>
              )}
            </p>
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
