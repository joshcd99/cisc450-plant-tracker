// Dashboard watering-activity card: sparkline + stat tiles + leaderboard.

import Link from "next/link";
import type {
  DailyCount,
  TopWateredPlant,
  WateringStats,
} from "@/db/queries";
import { Sparkline } from "./Sparkline";

const GOLD = "#ffd400";
const DKGREEN = "#1a3d10";

export function ActivityCard({
  sparklineData,
  stats,
  topPlants,
}: {
  sparklineData: DailyCount[];
  stats: WateringStats;
  topPlants: TopWateredPlant[];
}) {
  const maxCount = Math.max(1, ...topPlants.map((p) => p.count));
  const totalRecent = sparklineData.reduce((sum, d) => sum + d.n, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          marginBottom: 8,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: "Comic Sans MS, cursive",
              fontWeight: 900,
              fontSize: 18,
              color: DKGREEN,
              textShadow: `2px 2px 0 #fff, 3px 3px 0 ${GOLD}`,
            }}
          >
            <span className="wiggle" style={{ display: "inline-block" }}>💦</span>{" "}
            Watering Activity
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "Times New Roman, serif",
              fontStyle: "italic",
              color: "#2c5e1a",
              fontSize: 12,
            }}
          >
            ★ {totalRecent} watering{totalRecent === 1 ? "" : "s"} in the last 30 days ★
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#000",
          borderTop: "2px solid #444",
          borderLeft: "2px solid #444",
          borderRight: "2px solid #fff",
          borderBottom: "2px solid #fff",
          padding: 6,
        }}
      >
        <Sparkline data={sparklineData} height={130} />
      </div>

      <div className="grid grid-cols-4" style={{ marginTop: 12, gap: 6 }}>
        <StatTile label="Last 7 days"    value={stats.last7}              accent="#ff52b1" />
        <StatTile label="Last 30 days"   value={stats.last30}             accent="#22aa22" />
        <StatTile label="Longest streak" value={`${stats.longestStreak}d`} accent="#0088dd" />
        <StatTile label="Busiest day"    value={stats.peakDayCount}       accent="#cc7700" />
      </div>

      <div style={{ marginTop: 14, flex: 1 }}>
        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 900,
            fontSize: 14,
            color: DKGREEN,
            textShadow: "1px 1px 0 #fff",
          }}
        >
          <span className="bob" style={{ display: "inline-block" }}>🏆</span>{" "}
          ✦ Top Waterings (30d) ✦
        </h3>
        {topPlants.every((p) => p.count === 0) ? (
          <p
            style={{
              fontFamily: "Comic Sans MS, cursive",
              color: "#2c5e1a",
              fontSize: 13,
            }}
          >
            <span className="blink">No watering activity yet!!</span>
          </p>
        ) : (
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {topPlants.map((p, idx) => (
              <li key={p.plantId} style={{ marginBottom: 6 }}>
                <Link
                  href={`/plants/${p.plantId}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 4,
                    background: "#fffce8",
                    border: "2px ridge " + DKGREEN,
                    textDecoration: "none",
                    color: DKGREEN,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: GOLD,
                      color: "#000",
                      fontFamily: "Impact, sans-serif",
                      fontSize: 14,
                      fontWeight: 900,
                      border: "1px solid #000",
                      textShadow: "1px 1px 0 rgba(255,255,255,0.5)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      overflow: "hidden",
                      borderTop: "2px solid rgba(0,0,0,0.45)",
                      borderLeft: "2px solid rgba(0,0,0,0.45)",
                      borderRight: "2px solid rgba(255,255,255,0.85)",
                      borderBottom: "2px solid rgba(255,255,255,0.85)",
                      background: "#dff3d5",
                    }}
                  >
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.plantName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                        }}
                      >
                        🌿
                      </div>
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Tahoma, sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textDecoration: "underline",
                        }}
                      >
                        {p.plantName}
                      </span>
                      <span
                        style={{
                          fontFamily: "Courier New, monospace",
                          fontWeight: 900,
                          fontSize: 13,
                          color: "#a00",
                          flexShrink: 0,
                        }}
                      >
                        {p.count}×
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        height: 8,
                        background: "#000",
                        border: "1px inset #444",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(p.count / maxCount) * 100}%`,
                          background:
                            "linear-gradient(90deg, #ff0066, #ff9900, #ffee00, #00cc44, #00ccff, #aa00ff)",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontFamily: "Times New Roman, serif",
                        fontStyle: "italic",
                        fontSize: 11,
                        color: "#2c5e1a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.speciesName}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "#fffce8",
        borderTop: "2px solid rgba(0,0,0,0.45)",
        borderLeft: "2px solid rgba(0,0,0,0.45)",
        borderRight: "2px solid rgba(255,255,255,0.85)",
        borderBottom: "2px solid rgba(255,255,255,0.85)",
        padding: "6px 4px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Impact, Arial Black, sans-serif",
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1,
          color: accent,
          textShadow: "1px 1px 0 #fff, 2px 2px 0 rgba(0,0,0,0.25)",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "Tahoma, sans-serif",
          fontSize: 9,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          color: "#2c5e1a",
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
}
