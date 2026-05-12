import Link from "next/link";
import { getCalendarMonth } from "@/db/queries";
import { Card, SectionHeader } from "@/components/ui";
import { DayHoverPopover } from "@/components/DayHoverPopover";
import { dayStatus, type DayStatus } from "@/lib/dayStatus";

export const dynamic = "force-dynamic";

// Full-month watering grid (matches the dashboard mini calendar).

const RETRO_LIME    = "#9bff4c";
const RETRO_RED     = "#ff5252";
const RETRO_CYAN    = "#62d4ff";
const RETRO_GOLD    = "#ffd400";
const RETRO_BG      = "#fffce8";
const RETRO_DKGREEN = "#1a3d10";

function todayLocal(): { year: number; month: number; day: number; iso: string } {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, iso };
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const today = todayLocal();
  const year = params.year ? Number(params.year) : today.year;
  const month = params.month ? Number(params.month) : today.month;

  const days = await getCalendarMonth(year, month);
  const byDay = new Map(days.map((d) => [d.day, d]));

  const firstOfMonth = new Date(year, month - 1, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  // Cap forward nav at 1 year out (matches the auto-schedule horizon).
  const maxForward = shiftMonth(today.year, today.month, 12);
  const nextAllowed =
    next.year < maxForward.year ||
    (next.year === maxForward.year && next.month <= maxForward.month);

  const totals = days.reduce(
    (acc, d) => ({
      watered: acc.watered + d.watered,
      scheduled: acc.scheduled + d.scheduled,
      missed: acc.missed + d.missed,
    }),
    { watered: 0, scheduled: 0, missed: 0 },
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Calendar"
        subtitle="Past waterings, missed waterings, and upcoming scheduled events"
      />

      <Card title="month-control.dll" className="!p-0">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href={`/calendar?year=${prev.year}&month=${prev.month}`}
              className="retro-btn btn-bevel"
              aria-label="Previous month"
            >
              ◄◄
            </Link>
            <h2
              style={{
                margin: 0,
                fontFamily: "Comic Sans MS, cursive",
                fontWeight: 900,
                fontSize: 22,
                color: RETRO_DKGREEN,
                textShadow: `2px 2px 0 #fff, 3px 3px 0 ${RETRO_GOLD}`,
                minWidth: 200,
                textAlign: "center",
              }}
            >
              <span className="bob" style={{ display: "inline-block" }}>📅</span>{" "}
              {monthLabel(year, month)}
            </h2>
            {nextAllowed ? (
              <Link
                href={`/calendar?year=${next.year}&month=${next.month}`}
                className="retro-btn btn-bevel"
                aria-label="Next month"
              >
                ►►
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="retro-btn btn-bevel"
                aria-label="Next month (limit reached)"
                title="Calendar only shows 1 year ahead"
                style={{ opacity: 0.5 } as React.CSSProperties}
              >
                ►►
              </button>
            )}
            <Link
              href={`/calendar?year=${today.year}&month=${today.month}`}
              className="retro-btn btn-bevel"
              style={{ marginLeft: 4 }}
            >
              [Today]
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
              fontFamily: "Tahoma, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              color: RETRO_DKGREEN,
            }}
          >
            <LegendSwatch color={RETRO_LIME} label={`${totals.watered} done`} />
            <LegendSwatch color={RETRO_RED}  label={`${totals.missed} missed`} />
            <LegendSwatch color={RETRO_CYAN} label={`${totals.scheduled} scheduled`} />
            <LegendSwatch color={RETRO_GOLD} label="today" />
          </div>
        </div>
      </Card>

      <div
        style={{
          background: "#000",
          padding: 6,
          border: `3px ridge ${RETRO_GOLD}`,
        }}
      >
        <div
          className="grid grid-cols-7"
          style={{
            background: RETRO_DKGREEN,
            border: `2px ridge ${RETRO_GOLD}`,
            fontFamily: "Tahoma, sans-serif",
            fontWeight: 700,
            fontSize: 11,
            color: RETRO_GOLD,
            textShadow: "1px 1px 0 #000",
            letterSpacing: 1.5,
            marginBottom: 4,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ padding: "5px 0", textAlign: "center" }}>
              {d.toUpperCase()}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7" style={{ gap: 4 }}>
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div
              key={`blank-${i}`}
              style={{
                minHeight: 110,
                background: "#222",
                border: "2px inset #1a1a1a",
              }}
            />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const iso = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const info = byDay.get(iso);
            const isToday = iso === today.iso;
            const status = dayStatus(info);
            return (
              <Link
                key={iso}
                href={`/schedule?date=${iso}`}
                className="group relative hover:z-50 hover:brightness-95"
                style={{
                  minHeight: 110,
                  padding: 6,
                  background: cellBg(status, isToday),
                  borderTop: isToday
                    ? `4px solid ${RETRO_GOLD}`
                    : "2px solid rgba(255,255,255,0.7)",
                  borderLeft: isToday
                    ? `4px solid ${RETRO_GOLD}`
                    : "2px solid rgba(255,255,255,0.7)",
                  borderRight: isToday
                    ? `4px solid ${RETRO_GOLD}`
                    : "2px solid rgba(0,0,0,0.45)",
                  borderBottom: isToday
                    ? `4px solid ${RETRO_GOLD}`
                    : "2px solid rgba(0,0,0,0.45)",
                  color: cellText(status, isToday),
                  fontFamily: "Comic Sans MS, cursive",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    height: 24,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Comic Sans MS, cursive",
                      fontSize: 14,
                      fontWeight: 900,
                      textShadow: "1px 1px 0 #fff",
                    }}
                  >
                    {dayNum}
                  </span>
                </div>
                {info && (info.watered > 0 || info.missed > 0 || info.scheduled > 0) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {info.watered > 0 && (
                      <StatPill kind="watered" count={info.watered} />
                    )}
                    {info.missed > 0 && (
                      <StatPill kind="missed" count={info.missed} />
                    )}
                    {info.scheduled > 0 && (
                      <StatPill kind="scheduled" count={info.scheduled} />
                    )}
                  </div>
                )}
                {info && <DayHoverPopover day={iso} items={info.items} />}
              </Link>
            );
          })}
        </div>
      </div>

      <p
        style={{
          fontFamily: "Comic Sans MS, cursive",
          fontSize: 13,
          color: RETRO_DKGREEN,
          textAlign: "center",
          margin: 0,
        }}
      >
        ✦ <span className="blink">Click</span> any day to see plants scheduled for that date! ✦
      </p>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          display: "inline-block",
          width: 14,
          height: 14,
          background: color,
          borderTop: "2px solid rgba(255,255,255,0.8)",
          borderLeft: "2px solid rgba(255,255,255,0.8)",
          borderRight: "2px solid rgba(0,0,0,0.45)",
          borderBottom: "2px solid rgba(0,0,0,0.45)",
        }}
      />
      {label}
    </span>
  );
}

function StatPill({
  kind,
  count,
}: {
  kind: "watered" | "missed" | "scheduled";
  count: number;
}) {
  const labels = { watered: "done", missed: "missed", scheduled: "scheduled" };
  const colorMap = {
    watered:   { bg: "#0a4a00", fg: RETRO_LIME, border: RETRO_LIME },
    missed:    { bg: "#5b0000", fg: "#ffcccc",  border: RETRO_RED  },
    scheduled: { bg: "#003a5b", fg: RETRO_CYAN, border: RETRO_CYAN },
  } as const;
  const c = colorMap[kind];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1px 4px",
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.border}`,
        fontFamily: "Tahoma, sans-serif",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        textShadow: "1px 1px 0 #000",
      }}
    >
      <span>{labels[kind]}</span>
      <span style={{ fontFamily: "Courier New, monospace", fontWeight: 900 }}>
        {count}
      </span>
    </div>
  );
}

function cellBg(status: DayStatus, isToday: boolean): string {
  if (status === "missed")    return RETRO_RED;
  if (status === "watered")   return RETRO_LIME;
  if (status === "scheduled") return RETRO_CYAN;
  return isToday ? RETRO_GOLD : RETRO_BG;
}

function cellText(status: DayStatus, isToday: boolean): string {
  if (isToday) return "#5a2a00";
  if (status === "missed")    return "#5b0000";
  if (status === "watered")   return "#0a3a00";
  if (status === "scheduled") return "#003a5b";
  return "#444";
}
