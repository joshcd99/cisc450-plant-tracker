"use client";

import { useMemo, useState } from "react";
import { PlantCard } from "./PlantCard";
import { inputClass } from "./ui";

type Plant = Parameters<typeof PlantCard>[0];

// Client-side text filter over a pre-fetched plant list.
export function SearchablePlants({ plants }: { plants: Plant[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return plants;
    return plants.filter((p) => {
      const haystack = `${p.plantName} ${p.speciesName} ${p.roomName} ${p.locationName}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [q, plants]);

  return (
    <div className="space-y-4">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔎 Search by name, species, room, or location…"
          className={inputClass}
          aria-label="Search plants"
          style={{ flex: 1, minWidth: 320 }}
        />
        <span
          style={{
            fontFamily: "Courier New, monospace",
            fontSize: 12,
            color: "#2c5e1a",
            fontWeight: 700,
            background: "#fffce8",
            border: "2px inset #808080",
            padding: "3px 8px",
          }}
        >
          {filtered.length} of {plants.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            border: "2px dashed var(--leaf-dark)",
            background: "#fff7c2",
            padding: 18,
            textAlign: "center",
            fontFamily: "Comic Sans MS, cursive",
            color: "#2c5e1a",
          }}
        >
          <span className="bob" style={{ display: "inline-block", marginRight: 6 }}>🌱</span>
          No plants match &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PlantCard key={p.plantId} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
