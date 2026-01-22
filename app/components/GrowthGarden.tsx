"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = {
  key: string;
  label: string;
  min: number;
  max: number;
  accent: string;
  aria: string;
  icon: string;
};

const STORAGE_KEY = "personal-dashboard-garden";
const MAX_WATER = 100;

const STAGES: Stage[] = [
  {
    key: "seedling",
    label: "Seedling",
    min: 0,
    max: 12,
    accent: "#7dd3fc",
    aria: "A tiny seedling sprouting from the soil.",
    icon: "🌱",
  },
  {
    key: "sprout",
    label: "Sprout",
    min: 13,
    max: 26,
    accent: "#5eead4",
    aria: "A fresh sprout with bright leaves.",
    icon: "🌿",
  },
  {
    key: "plant",
    label: "Plant",
    min: 27,
    max: 40,
    accent: "#a7f3d0",
    aria: "A healthy plant reaching upward.",
    icon: "🪴",
  },
  {
    key: "flowering",
    label: "Flowering",
    min: 41,
    max: 55,
    accent: "#f9a8d4",
    aria: "A flowering plant in bloom.",
    icon: "🌸",
  },
  {
    key: "young-tree",
    label: "Young Tree",
    min: 56,
    max: 70,
    accent: "#86efac",
    aria: "A young tree with a strong trunk.",
    icon: "🌳",
  },
  {
    key: "tree",
    label: "Tree",
    min: 71,
    max: 84,
    accent: "#4ade80",
    aria: "A tall tree with a full canopy.",
    icon: "🌲",
  },
  {
    key: "fruiting",
    label: "Fruiting",
    min: 85,
    max: 100,
    accent: "#fde047",
    aria: "A tree heavy with fruit.",
    icon: "🍎",
  },
];

const WATER_AMOUNTS = [4, 8, 12];

export default function GrowthGarden() {
  const [water, setWater] = useState(18);
  const [lastWatered, setLastWatered] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { water: number; lastWatered?: string };
      setWater(parsed.water ?? 18);
      setLastWatered(parsed.lastWatered ? new Date(parsed.lastWatered) : null);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ water, lastWatered: lastWatered?.toISOString() })
    );
  }, [water, lastWatered]);

  const stage = useMemo(() => {
    return (
      STAGES.find((item) => water >= item.min && water <= item.max) ?? STAGES[0]
    );
  }, [water]);

  const nextStage = useMemo(() => {
    const currentIndex = STAGES.findIndex((item) => item.key === stage.key);
    return STAGES[Math.min(currentIndex + 1, STAGES.length - 1)];
  }, [stage]);

  function waterPlant(amount: number) {
    setWater((prev) => Math.min(prev + amount, MAX_WATER));
    setLastWatered(new Date());
  }

  function resetGarden() {
    setWater(6);
    setLastWatered(new Date());
  }

  const progress = Math.round((water / MAX_WATER) * 100);

  return (
    <section className="card garden-card">
      <div className="garden-header">
        <div>
          <div className="section-title">Growth Garden</div>
          <p className="muted garden-subtitle">
            Water your plant to advance through every growth stage.
          </p>
        </div>
        <button className="garden-reset" type="button" onClick={resetGarden}>
          Reset
        </button>
      </div>

      <div className="garden-body">
        <div className="garden-visual" aria-label={stage.aria}>
          <span className="garden-icon" aria-hidden>
            {stage.icon}
          </span>
          <div className="garden-stage">
            <p className="garden-label">{stage.label}</p>
            <p className="garden-progress-text">{progress}% hydrated</p>
          </div>
        </div>

        <div className="garden-meter">
          <div className="garden-meter-track">
            <div
              className="garden-meter-fill"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${stage.accent}, ${nextStage.accent})`,
              }}
            />
          </div>
          <div className="garden-meter-meta">
            <span>Next: {nextStage.label}</span>
            <span>{water}/{MAX_WATER} water</span>
          </div>
        </div>

        <div className="garden-actions">
          {WATER_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              className="garden-water"
              onClick={() => waterPlant(amount)}
            >
              +{amount} 💧
            </button>
          ))}
          <button
            type="button"
            className="garden-water primary"
            onClick={() => waterPlant(16)}
          >
            Deep water 💦
          </button>
        </div>

        <div className="garden-footer">
          <span className="garden-tip">Tip: smaller waterings give smoother growth.</span>
          <span className="garden-time">
            {lastWatered
              ? `Last watered ${lastWatered.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Not watered yet"}
          </span>
        </div>
      </div>
    </section>
  );
}
