import Link from "next/link";
import { getPlantsScheduledOn } from "@/db/queries";
import { Card, EmptyState, inputClass, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const DKGREEN = "#1a3d10";
const GOLD = "#ffd400";

// Local YYYY-MM-DD (avoid UTC drift in the evening US time).
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : todayIso();
  const scheduled = await getPlantsScheduledOn(date);

  const prettyDate = new Date(date + "T00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Watering schedule"
        subtitle="See which plants are scheduled to be watered on a given date."
      />

      <Card title="pick_date.exe">
        <form
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <label style={{ display: "block", minWidth: 200 }}>
            <span
              style={{
                display: "block",
                marginBottom: 4,
                fontFamily: "Comic Sans MS, cursive",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--leaf-dark)",
              }}
            >
              ★ Date
            </span>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className={inputClass}
              required
            />
          </label>
          <button type="submit" className="retro-btn btn-bevel">
            🔎 View
          </button>
          <Link
            href={`/schedule?date=${todayIso()}`}
            className="retro-btn btn-bevel"
          >
            [Today]
          </Link>
        </form>
      </Card>

      <Card title={`schedule.txt :: ${date}`}>
        <h2
          style={{
            margin: "0 0 10px",
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 900,
            fontSize: 16,
            color: DKGREEN,
            textShadow: `1px 1px 0 #fff, 2px 2px 0 ${GOLD}`,
          }}
        >
          <span className="bob" style={{ display: "inline-block", marginRight: 4 }}>
            💧
          </span>
          ✦ Plants scheduled for{" "}
          <span
            style={{
              fontFamily: "Courier New, monospace",
              fontSize: 14,
              fontWeight: 900,
              background: GOLD,
              color: "#000",
              padding: "1px 6px",
              border: "1px solid #5a2a00",
              textShadow: "none",
            }}
          >
            {prettyDate}
          </span>{" "}
          ✦
        </h2>

        {scheduled.length === 0 ? (
          <EmptyState>
            Nothing scheduled for this date.{" "}
            <span className="blink" style={{ marginLeft: 4 }}>
              ✨ enjoy ur day off ✨
            </span>
          </EmptyState>
        ) : (
          <>
            <p
              style={{
                margin: "0 0 8px",
                fontFamily: "Tahoma, sans-serif",
                fontSize: 11,
                color: "#5b9b3d",
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              ▾ {scheduled.length} {scheduled.length === 1 ? "plant" : "plants"} on
              the list
            </p>
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
              {scheduled.map((s, i) => (
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
                      i < scheduled.length - 1 ? "1px dashed #b8d3a6" : "none",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Link
                      href={`/plants/${s.plantId}`}
                      style={{
                        fontFamily: "Comic Sans MS, cursive",
                        fontWeight: 900,
                        fontSize: 15,
                        color: "#1a0dab",
                        textDecoration: "underline",
                      }}
                    >
                      🌿 {s.plantName}
                    </Link>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontFamily: "Times New Roman, serif",
                        fontStyle: "italic",
                        fontSize: 12,
                        color: "#2c5e1a",
                      }}
                    >
                      ✿ {s.speciesName}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontFamily: "Tahoma, sans-serif",
                        fontSize: 11,
                        color: "#5b9b3d",
                      }}
                    >
                      🏡 {s.locationName} · 📍 {s.roomName}
                    </p>
                  </div>
                  <Link
                    href={`/plants/${s.plantId}`}
                    className="retro-btn btn-bevel"
                    style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    Open »
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
