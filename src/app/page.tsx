import Link from "next/link";
import { db } from "@/db";
import { plants, species } from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  getCalendarMonth,
  getOverduePlants,
  getPlantsScheduledOn,
  getTopWateredPlants,
  getWateringsLastNDays,
  getWateringStats,
  listPlants,
} from "@/db/queries";
import { ActivityCard } from "@/components/ActivityCard";
import { MiniCalendar } from "@/components/MiniCalendar";
import { PlantCard } from "@/components/PlantCard";
import { Win95Window } from "@/components/Retro";

export const dynamic = "force-dynamic";

// Local YYYY-MM-DD (avoid UTC drift in the evening US time).
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const today = todayIso();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const [
    overdue,
    todaysSchedule,
    plantCount,
    speciesCount,
    allPlants,
    sparklineData,
    calendarDays,
    stats,
    topPlants,
  ] = await Promise.all([
    getOverduePlants(),
    getPlantsScheduledOn(today),
    db.select({ c: sql<number>`count(*)::int` }).from(plants),
    db.select({ c: sql<number>`count(*)::int` }).from(species),
    listPlants(),
    getWateringsLastNDays(30),
    getCalendarMonth(year, month),
    getWateringStats(),
    getTopWateredPlants(30, 3),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="panel-title" style={{ margin: 0, fontSize: 28 }}>
            <span className="wiggle" style={{ display: "inline-block" }}>🌿</span>{" "}
            <span className="rainbow">DASHBOARD</span>{" "}
            <span className="wiggle" style={{ display: "inline-block" }}>🌿</span>
          </h1>
          <p
            style={{
              marginTop: 6,
              fontFamily: "Comic Sans MS, cursive",
              color: "#2c5e1a",
              fontSize: 14,
            }}
          >
            ★ today is{" "}
            <span style={{ fontWeight: 700, textDecoration: "underline" }}>
              {new Date(today + "T00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>{" "}
            ★ <span className="blink">don&apos;t forget to water!!</span>
          </p>
        </div>
        <Link href="/plants/new" className="retro-btn btn-bevel">
          ➕ Add plant
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Plants" value={plantCount[0]?.c ?? 0} />
        <StatCard label="Species" value={speciesCount[0]?.c ?? 0} />
        <StatCard
          label="Overdue"
          value={overdue.length}
          tone={overdue.length > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Watering today"
          value={todaysSchedule.length}
          tone={todaysSchedule.length > 0 ? "info" : "neutral"}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Win95Window title="my_watering_activity.exe">
          <ActivityCard
            sparklineData={sparklineData}
            stats={stats}
            topPlants={topPlants}
          />
        </Win95Window>
        <Win95Window title="calendar.bmp">
          <MiniCalendar year={year} month={month} days={calendarDays} todayIso={today} />
        </Win95Window>
      </section>

      <hr className="rainbow-hr" />
      <section>
        <SectionHeader
          title="Needs water"
          subtitle="Plants overdue based on their species' recommended interval"
        />
        {overdue.length === 0 ? (
          <EmptyState>All caught up! Nothing is overdue. 🌱</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-stone-200 text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-2">Plant</th>
                  <th className="px-4 py-2">Species</th>
                  <th className="hidden px-4 py-2 sm:table-cell">Location</th>
                  <th className="hidden px-4 py-2 sm:table-cell">Room</th>
                  <th className="hidden px-4 py-2 md:table-cell">Last watered</th>
                  <th className="px-4 py-2">Overdue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {overdue.map((p) => (
                  <tr key={p.plantId} className="hover:bg-stone-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/plants/${p.plantId}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {p.plantName}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-stone-700">{p.speciesName}</td>
                    <td className="hidden px-4 py-2 text-stone-700 sm:table-cell">
                      {p.locationName}
                    </td>
                    <td className="hidden px-4 py-2 text-stone-700 sm:table-cell">
                      {p.roomName}
                    </td>
                    <td className="hidden px-4 py-2 text-stone-700 md:table-cell">
                      {p.lastWateredOn ? (
                        <>
                          {p.lastWateredOn}{" "}
                          <span className="text-xs text-stone-500">
                            ({p.daysSinceWatered}d ago)
                          </span>
                        </>
                      ) : (
                        <span className="text-stone-400">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className="blink"
                        style={{
                          display: "inline-block",
                          background: "red",
                          color: "yellow",
                          fontFamily: "Impact, sans-serif",
                          padding: "2px 8px",
                          border: "2px outset #ff5555",
                          textShadow: "1px 1px 0 #000",
                        }}
                      >
                        {p.daysOverdue >= 0 ? `+${p.daysOverdue}` : p.daysOverdue}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <hr className="rainbow-hr" />
      <section>
        <SectionHeader
          title="Scheduled for today"
          subtitle={`Plants on the watering schedule for ${today}`}
        />
        {todaysSchedule.length === 0 ? (
          <EmptyState>
            Nothing scheduled today.{" "}
            <Link href="/schedule" className="text-emerald-700 hover:underline">
              View full schedule →
            </Link>
          </EmptyState>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              background: "#fff",
              borderTop: "2px solid rgba(0,0,0,0.45)",
              borderLeft: "2px solid rgba(0,0,0,0.45)",
              borderRight: "2px solid rgba(255,255,255,0.85)",
              borderBottom: "2px solid rgba(255,255,255,0.85)",
            }}
          >
            {todaysSchedule.map((s, i) => (
              <li
                key={s.scheduleId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "8px 10px",
                  background: i % 2 === 0 ? "#fffce8" : "#f3fbe9",
                  borderBottom:
                    i < todaysSchedule.length - 1
                      ? "1px dashed #b8d3a6"
                      : "none",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Link
                    href={`/plants/${s.plantId}`}
                    style={{
                      fontFamily: "Comic Sans MS, cursive",
                      fontWeight: 900,
                      fontSize: 14,
                      color: "#1a0dab",
                      textDecoration: "underline",
                    }}
                  >
                    🌿 {s.plantName}
                  </Link>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontFamily: "Tahoma, sans-serif",
                      fontSize: 11,
                      color: "#2c5e1a",
                    }}
                  >
                    ✿ {s.speciesName} · 🏡 {s.locationName} · 📍 {s.roomName}
                  </p>
                </div>
                <Link
                  href={`/plants/${s.plantId}`}
                  className="retro-btn btn-bevel"
                  style={{ flexShrink: 0 }}
                >
                  💧 Log watering →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr className="rainbow-hr" />
      <section>
        <SectionHeader title="All plants" subtitle="Your collection at a glance" />
        {allPlants.length === 0 ? (
          <EmptyState>
            You haven&apos;t added any plants yet.{" "}
            <Link href="/plants/new" className="text-emerald-700 hover:underline">
              Add your first plant →
            </Link>
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allPlants.map((p) => (
              <PlantCard
                key={p.plantId}
                plantId={p.plantId}
                plantName={p.plantName}
                speciesName={p.speciesName}
                roomName={p.roomName}
                locationName={p.locationName}
                approxAge={p.approxAge}
                birthday={p.birthday}
                potSize={p.potSize}
                imageUrl={p.imageUrl}
                recommWaterInterval={p.recommWaterInterval}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warn" | "info";
}) {
  const color =
    tone === "warn" ? "#cc4400" : tone === "info" ? "#1a3d10" : "#000080";
  const accent = tone === "warn" ? "🔥" : tone === "info" ? "💧" : "🌿";
  return (
    <div className="win95" style={{ padding: 0 }}>
      <div className="win95-titlebar">
        <span>
          {accent} {label}
        </span>
        <span className="controls">
          <span className="win95-titlebutton">×</span>
        </span>
      </div>
      <div
        className="win95-body"
        style={{
          textAlign: "center",
          padding: "10px 12px",
          fontFamily: "Courier New, monospace",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 900,
            color,
            textShadow: "2px 2px 0 #fff, 3px 3px 0 #000",
            fontFamily: "Impact, Arial Black, sans-serif",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <h2 className="panel-title" style={{ margin: 0 }}>
        <span className="bob" style={{ display: "inline-block" }}>✿</span> {title}{" "}
        <span className="bob" style={{ display: "inline-block" }}>✿</span>
      </h2>
      {subtitle && (
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: "Times New Roman, serif",
            fontStyle: "italic",
            color: "#2c5e1a",
            fontSize: 14,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </div>
  );
}
