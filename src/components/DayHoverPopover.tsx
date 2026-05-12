// CSS-only hover popover for a calendar day. Parent must be `group relative`.

import type { CalendarItem } from "@/db/queries";

const COLORS = {
  watered:   { swatch: "#9bff4c", label: "✓ done"      },
  missed:    { swatch: "#ff5252", label: "✗ missed"    },
  scheduled: { swatch: "#62d4ff", label: "» scheduled" },
} as const;

export function DayHoverPopover({ day, items }: { day: string; items: CalendarItem[] }) {
  if (items.length === 0) return null;

  const formatted = new Date(day + "T00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      role="tooltip"
      className="pointer-events-none invisible absolute left-1/2 top-full -translate-x-1/2 opacity-0 transition group-hover:visible group-hover:opacity-100"
      style={{
        marginTop: 6,
        width: 240,
        zIndex: 9999,
        background: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        borderLeft: "2px solid #ffffff",
        borderRight: "2px solid #000000",
        borderBottom: "2px solid #000000",
        padding: 2,
        boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
          color: "#fff",
          fontFamily: "Tahoma, Geneva, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          padding: "2px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textShadow: "1px 1px 0 #000",
          letterSpacing: 0.5,
        }}
      >
        <span>📅 {formatted}</span>
        <span
          style={{
            width: 14,
            height: 12,
            background: "#c0c0c0",
            border: "1px solid #000",
            color: "#000",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            lineHeight: 1,
            textShadow: "none",
          }}
        >
          ×
        </span>
      </div>

      <div
        style={{
          background: "#fffce8",
          borderTop: "1px solid #808080",
          borderLeft: "1px solid #808080",
          borderRight: "1px solid #ffffff",
          borderBottom: "1px solid #ffffff",
          padding: "6px 8px",
          fontFamily: "Tahoma, Geneva, sans-serif",
          fontSize: 11,
          color: "#1a3d10",
        }}
      >
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {items.map((item, i) => {
            const c = COLORS[item.status];
            return (
              <li
                key={`${item.plantId}-${item.status}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                  padding: "3px 0",
                  borderBottom: i < items.length - 1 ? "1px dashed #b8d3a6" : "none",
                }}
              >
                <span
                  style={{
                    marginTop: 2,
                    width: 10,
                    height: 10,
                    flexShrink: 0,
                    background: c.swatch,
                    borderTop: "1px solid rgba(255,255,255,0.8)",
                    borderLeft: "1px solid rgba(255,255,255,0.8)",
                    borderRight: "1px solid rgba(0,0,0,0.5)",
                    borderBottom: "1px solid rgba(0,0,0,0.5)",
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.plantName}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "Times New Roman, serif",
                      fontStyle: "italic",
                      fontSize: 10,
                      color: "#5b9b3d",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.speciesName}
                    {item.notes ? ` · ${item.notes}` : ""}
                  </p>
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: "Courier New, monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  {c.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
