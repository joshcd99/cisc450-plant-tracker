"use client";

// Win95-styled date picker. Native <input type="date"> can't be themed, so the
// popover is rendered manually and the value flows back via a hidden input.

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  required?: boolean;
  placeholder?: string;
  /** Min CSS width of the trigger button. Defaults to 220px. */
  minWidth?: number;
};

const WEEKDAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"] as const;
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftMonth(year: number, month: number, delta: number) {
  // month is 1-indexed; normalize via a 0-indexed total.
  const total = year * 12 + (month - 1) + delta;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function isoToDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

// Accept mm/dd/yyyy or yyyy-mm-dd. Returns null for invalid/impossible dates.
function parseDisplayToIso(s: string): string | null {
  const t = s.trim();
  if (!t) return null;

  const us = t.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

  let y: string, m: string, d: string;
  if (us) {
    [, m, d, y] = us;
  } else if (iso) {
    [, y, m, d] = iso;
  } else {
    return null;
  }

  const yy = Number(y);
  const mm = Number(m);
  const dd = Number(d);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

  // Round-trip through Date to reject impossible days (e.g. Feb 30).
  const dt = new Date(yy, mm - 1, dd);
  if (
    dt.getFullYear() !== yy ||
    dt.getMonth() !== mm - 1 ||
    dt.getDate() !== dd
  ) {
    return null;
  }
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function RetroDatePicker({
  name,
  defaultValue = "",
  min,
  max,
  required,
  placeholder = "mm/dd/yyyy",
  minWidth = 220,
}: Props) {
  // `value` is the committed ISO date; `textValue` is the raw text being typed.
  const [value, setValue] = useState<string>(defaultValue);
  const [textValue, setTextValue] = useState<string>(isoToDisplay(defaultValue));
  const [open, setOpen] = useState(false);

  const initialView = useMemo(() => {
    const seed = value ? new Date(value + "T00:00") : new Date();
    return { year: seed.getFullYear(), month: seed.getMonth() + 1 };
  }, [value]);
  const [view, setView] = useState(initialView);

  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = todayIso();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();

  const isOutOfRange = (iso: string) => {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const commit = (iso: string) => {
    setValue(iso);
    setTextValue(isoToDisplay(iso));
    const td = iso ? new Date(iso + "T00:00") : new Date();
    setView({ year: td.getFullYear(), month: td.getMonth() + 1 });
  };

  const pick = (iso: string) => {
    commit(iso);
    setOpen(false);
  };

  const goToday = () => {
    pick(todayIso());
  };

  const onTextBlur = () => {
    if (textValue.trim() === "") {
      setValue("");
      return;
    }
    const parsed = parseDisplayToIso(textValue);
    if (!parsed || isOutOfRange(parsed)) {
      // Revert to the last committed value on invalid/out-of-range input.
      setTextValue(isoToDisplay(value));
      return;
    }
    commit(parsed);
  };

  const prev = () => setView((v) => shiftMonth(v.year, v.month, -1));
  const next = () => setView((v) => shiftMonth(v.year, v.month, 1));

  return (
    <div ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <input type="hidden" name={name} value={value} required={required} />

      {/* Beveled trigger: typeable text input + gold calendar button. */}
      <div
        className="retro-date-trigger"
        style={{
          minWidth,
          display: "inline-flex",
          alignItems: "stretch",
          background: "#fff",
          borderTop: "2px solid var(--bevel-dark)",
          borderLeft: "2px solid var(--bevel-dark)",
          borderRight: "2px solid var(--bevel-light)",
          borderBottom: "2px solid var(--bevel-light)",
          boxShadow: "inset 1px 1px 0 var(--bevel-darker)",
        }}
      >
        <input
          type="text"
          className="retro-date-text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onBlur={onTextBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onTextBlur();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
          aria-label={placeholder}
          style={{ flex: 1, minWidth: 0 }}
        />
        <button
          type="button"
          aria-label="Open calendar"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{
            background: "var(--gold)",
            borderTop: "2px solid var(--bevel-light)",
            borderLeft: "2px solid var(--bevel-light)",
            borderRight: 0,
            borderBottom: 0,
            margin: "1px 1px 1px 0",
            padding: "0 6px",
            fontSize: 13,
            lineHeight: 1,
            cursor: 'url("/cursors/vine-precision.cur"), pointer',
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "1px 1px 0 var(--bevel-dark)",
          }}
        >
          📅
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 60,
            background: "#c0c0c0",
            borderTop: "2px solid #ffffff",
            borderLeft: "2px solid #ffffff",
            borderRight: "2px solid #000000",
            borderBottom: "2px solid #000000",
            padding: 2,
            boxShadow: "3px 3px 0 rgba(0,0,0,0.45)",
            width: 252,
            fontFamily: "Tahoma, Geneva, sans-serif",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #1a3d10 0%, #5b9b3d 100%)",
              color: "#fff7c2",
              fontWeight: 700,
              fontSize: 11,
              padding: "3px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textShadow: "1px 1px 0 #000",
              letterSpacing: 0.4,
            }}
          >
            <span>📅 calendar.exe</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                width: 16,
                height: 13,
                background: "#c0c0c0",
                color: "#000",
                border: "1px solid #000",
                borderTop: "1px solid #fff",
                borderLeft: "1px solid #fff",
                fontSize: 10,
                lineHeight: 1,
                padding: 0,
                cursor: 'url("/cursors/vine-precision.cur"), pointer',
                textShadow: "none",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              background: "#fffce8",
              borderTop: "1px solid #808080",
              borderLeft: "1px solid #808080",
              borderRight: "1px solid #ffffff",
              borderBottom: "1px solid #ffffff",
              padding: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={prev}
                className="retro-btn btn-bevel"
                style={{ padding: "1px 8px", fontSize: 12 }}
                aria-label="Previous month"
              >
                ◄
              </button>
              <span
                style={{
                  fontFamily: "Comic Sans MS, cursive",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#1a3d10",
                }}
              >
                {MONTHS[view.month - 1]} {view.year}
              </span>
              <button
                type="button"
                onClick={next}
                className="retro-btn btn-bevel"
                style={{ padding: "1px 8px", fontSize: 12 }}
                aria-label="Next month"
              >
                ►
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                marginBottom: 2,
              }}
            >
              {WEEKDAYS_SHORT.map((d, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#5b9b3d",
                    padding: "2px 0",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 2,
              }}
            >
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const d = i + 1;
                const iso = `${view.year}-${String(view.month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const isToday = iso === today;
                const isSelected = iso === value;
                const disabled = isOutOfRange(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(iso)}
                    style={{
                      // Selected = inset dark-green; today = gold; default = beveled.
                      background: isSelected
                        ? "#1a3d10"
                        : isToday
                          ? "var(--gold)"
                          : "#ffffff",
                      color: isSelected
                        ? "#fff7c2"
                        : disabled
                          ? "#bbb"
                          : "#1a3d10",
                      borderTop: isSelected
                        ? "1px solid #000"
                        : "1px solid #ffffff",
                      borderLeft: isSelected
                        ? "1px solid #000"
                        : "1px solid #ffffff",
                      borderRight: isSelected
                        ? "1px solid #fff"
                        : "1px solid #808080",
                      borderBottom: isSelected
                        ? "1px solid #fff"
                        : "1px solid #808080",
                      padding: "3px 0",
                      fontSize: 11,
                      fontWeight: isToday || isSelected ? 700 : 400,
                      fontFamily: "Tahoma, sans-serif",
                      cursor: disabled
                        ? "not-allowed"
                        : 'url("/cursors/vine-precision.cur"), pointer',
                      opacity: disabled ? 0.4 : 1,
                      lineHeight: 1.1,
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                fontFamily: "Times New Roman, serif",
              }}
            >
              <button
                type="button"
                onClick={goToday}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  color: "#1a3d10",
                  textDecoration: "underline",
                  cursor: 'url("/cursors/vine-precision.cur"), pointer',
                  fontStyle: "italic",
                }}
              >
                ★ Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue("");
                  setTextValue("");
                }}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  color: "#aa0000",
                  textDecoration: "underline",
                  cursor: 'url("/cursors/vine-precision.cur"), pointer',
                  fontStyle: "italic",
                }}
              >
                ✕ Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
