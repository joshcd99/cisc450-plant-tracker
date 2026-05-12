// Compact dashboard calendar. Cells are tinted by primary status (missed/
// watered/scheduled); today gets a gold border; days with >1 event show a badge.

import Link from "next/link";
import type { CalendarDay } from "@/db/queries";
import { dayStatus, type DayStatus } from "@/lib/dayStatus";
import { DayHoverPopover } from "./DayHoverPopover";

const RETRO_LIME    = "#9bff4c";
const RETRO_RED     = "#ff5252";
const RETRO_CYAN    = "#62d4ff";
const RETRO_GOLD    = "#ffd400";
const RETRO_BG      = "#fffce8";
const RETRO_DKGREEN = "#1a3d10";

export function MiniCalendar({
  year,
  month,
  days,
  todayIso,
}: {
  year: number;
  month: number;
  days: CalendarDay[];
  todayIso: string;
}) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const firstOfMonth = new Date(year, month - 1, 1);
  const leadingBlanks = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthLabel = firstOfMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div
        style={{
          marginBottom: 6,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 900,
            fontSize: 18,
            color: RETRO_DKGREEN,
            textShadow: "2px 2px 0 #fff, 3px 3px 0 " + RETRO_GOLD,
          }}
        >
          <span className="bob" style={{ display: "inline-block" }}>📅</span>{" "}
          {monthLabel}
        </h3>
        <Link
          href="/calendar"
          style={{
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 700,
            color: "#1a0dab",
            textDecoration: "underline",
            fontSize: 13,
          }}
        >
          [Full calendar »]
        </Link>
      </div>

      <div
        className="grid grid-cols-7"
        style={{
          background: RETRO_DKGREEN,
          border: "2px ridge " + RETRO_GOLD,
          fontFamily: "Tahoma, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: RETRO_GOLD,
          textShadow: "1px 1px 0 #000",
          letterSpacing: 1,
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} style={{ padding: "4px 0", textAlign: "center" }}>
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-7"
        style={{ gap: 2, padding: 2, background: "#000" }}
      >
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div
            key={`blank-${i}`}
            style={{
              aspectRatio: "1",
              background: "#222",
            }}
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const info = byDay.get(iso);
          const isToday = iso === todayIso;
          const status = dayStatus(info);
          const bg = cellBg(status, isToday);
          return (
            <Link
              key={iso}
              href={`/schedule?date=${iso}`}
              // hover:z-50 lifts the cell + its popover above later rows.
              className="group relative hover:z-50 hover:brightness-95"
              title={tooltipText(iso, info)}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: bg,
                borderTop: isToday
                  ? `3px solid ${RETRO_GOLD}`
                  : "2px solid rgba(255,255,255,0.7)",
                borderLeft: isToday
                  ? `3px solid ${RETRO_GOLD}`
                  : "2px solid rgba(255,255,255,0.7)",
                borderRight: isToday
                  ? `3px solid ${RETRO_GOLD}`
                  : "2px solid rgba(0,0,0,0.45)",
                borderBottom: isToday
                  ? `3px solid ${RETRO_GOLD}`
                  : "2px solid rgba(0,0,0,0.45)",
                color: cellText(status, isToday),
                fontFamily: "Comic Sans MS, cursive",
                position: "relative",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  lineHeight: 1,
                  textShadow: isToday ? "1px 1px 0 #fff" : "none",
                }}
              >
                {dayNum}
              </span>
              {info && totalEvents(info) > 1 && (
                <span
                  style={{
                    marginTop: 2,
                    background: RETRO_GOLD,
                    color: "#000",
                    fontFamily: "Tahoma, sans-serif",
                    fontSize: 9,
                    fontWeight: 900,
                    padding: "0 3px",
                    border: "1px solid #000",
                    lineHeight: 1.2,
                  }}
                >
                  {totalEvents(info)}
                </span>
              )}
              {info && <DayHoverPopover day={iso} items={info.items} />}
            </Link>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: 10,
          fontFamily: "Tahoma, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: RETRO_DKGREEN,
        }}
      >
        <Legend swatch={RETRO_LIME} label="done" />
        <Legend swatch={RETRO_RED}  label="missed" />
        <Legend swatch={RETRO_CYAN} label="scheduled" />
        <Legend swatch={RETRO_GOLD} label="today" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          display: "inline-block",
          width: 12,
          height: 12,
          background: swatch,
          borderTop: "2px solid rgba(255,255,255,0.7)",
          borderLeft: "2px solid rgba(255,255,255,0.7)",
          borderRight: "2px solid rgba(0,0,0,0.45)",
          borderBottom: "2px solid rgba(0,0,0,0.45)",
        }}
      />
      {label}
    </span>
  );
}

function totalEvents(info: CalendarDay): number {
  return info.watered + info.missed + info.scheduled;
}

function tooltipText(iso: string, info: CalendarDay | undefined): string {
  if (!info) return iso;
  const parts: string[] = [];
  if (info.watered) parts.push(`${info.watered} done`);
  if (info.missed) parts.push(`${info.missed} missed`);
  if (info.scheduled) parts.push(`${info.scheduled} scheduled`);
  return parts.length ? `${iso}: ${parts.join(", ")}` : iso;
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
