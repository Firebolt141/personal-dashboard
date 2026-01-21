import Calendar from "./components/Calendar";
import TodayEvents from "./components/TodayEvents";
import WeatherCard from "./components/WeatherCard";

const today = new Date();
const dateLabel = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function Home() {
  return (
    <div className="app-container">
      <section className="card hero">
        <div className="hero-header">
          <div>
            <p className="muted">{dateLabel}</p>
            <h1>Good afternoon, Traveler</h1>
            <p className="muted">
              Rest here, soldier. Take in the warmth before the next fight.
            </p>
          </div>
        </div>

        <div className="image-wrapper">
          <img src="/gifs/bonfire.gif" alt="Bonfire" />
        </div>
      </section>

      <section className="card">
        <div className="section-title">Today</div>
        <TodayEvents />
      </section>

      <WeatherCard />

      <Calendar />
    </div>
  );
}
