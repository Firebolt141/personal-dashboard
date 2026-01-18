export default function Home() {
  return (
    <div className="app-container">

      {/* HERO / BONFIRE */}
      <div className="card hero">
        <div className="image-wrapper">
          <img src="/gifs/bonfire.gif" alt="Bonfire" />
        </div>

        <p className="muted">SUN JAN 18 2026</p>
        <h2>Good afternoon, Traveler</h2>

        <p className="italic muted" style={{ marginTop: 8 }}>
          “Prepare yourself, but first, rest.”
        </p>
      </div>

      {/* WEATHER */}
      <div className="card">
        <div className="section-title">Weather</div>
        <p>18°C · Partly Cloudy</p>
      </div>

      {/* ACTIVITY */}
      <div className="card">
        <div className="section-title">Activity</div>
        <p>8,432 / 10,000 steps</p>
      </div>

      {/* FOCUS */}
      <div className="card">
        <div className="section-title">Focus</div>
        <p className="muted">Rest • Reflect • Prepare</p>
      </div>

    </div>
  );
}
