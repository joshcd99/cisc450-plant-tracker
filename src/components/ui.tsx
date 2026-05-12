// Presentational helpers shared across pages. Server-component safe.

export function Card({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
}) {
  return (
    <div className={`win95 ${className}`}>
      <div className="win95-titlebar">
        <span>📁 {title ?? "Plant Care Tracker"}</span>
        <span className="controls">
          <span className="win95-titlebutton">_</span>
          <span className="win95-titlebutton">▢</span>
          <span className="win95-titlebutton">×</span>
        </span>
      </div>
      <div className="win95-body">{children}</div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 12,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <div>
        <h2 className="panel-title" style={{ margin: 0 }}>
          <span className="wiggle" style={{ display: "inline-block" }}>✿</span> {title}{" "}
          <span className="wiggle" style={{ display: "inline-block" }}>✿</span>
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
      {action}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "2px dashed var(--leaf-dark)",
        background: "#fff7c2",
        padding: "18px",
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

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <span
        style={{
          display: "block",
          fontFamily: "Comic Sans MS, cursive",
          fontWeight: 700,
          color: "var(--leaf-dark)",
          marginBottom: 4,
          fontSize: 14,
        }}
      >
        ★ {label}
      </span>
      {children}
      {hint && (
        <span
          style={{
            display: "block",
            marginTop: 2,
            fontStyle: "italic",
            color: "#5b9b3d",
            fontSize: 12,
          }}
        >
          {hint}
        </span>
      )}
    </label>
  );
}

// File-input variant. Uses a div + htmlFor so blank label space doesn't open
// the OS file picker (which a wrapping <label> would cause).
export function FileField({
  id,
  label,
  children,
  hint,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ display: "block", marginBottom: 8 }}>
      <label
        htmlFor={id}
        style={{
          display: "inline-block",
          fontFamily: "Comic Sans MS, cursive",
          fontWeight: 700,
          color: "var(--leaf-dark)",
          marginBottom: 4,
          fontSize: 14,
        }}
      >
        ★ {label}
      </label>
      {children}
      {hint && (
        <span
          style={{
            display: "block",
            marginTop: 2,
            fontStyle: "italic",
            color: "#5b9b3d",
            fontSize: 12,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// Win95 radio-style segment toggle: active option looks pressed in.
export function SegmentToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--bevel-face)",
        padding: 2,
        border: "1px inset var(--bevel-dark)",
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: "3px 10px",
              fontFamily: "Tahoma, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              background: active ? "#fffce8" : "var(--bevel-face)",
              color: "#000",
              borderTop: active
                ? "2px solid var(--bevel-darker)"
                : "2px solid var(--bevel-light)",
              borderLeft: active
                ? "2px solid var(--bevel-darker)"
                : "2px solid var(--bevel-light)",
              borderRight: active
                ? "2px solid var(--bevel-light)"
                : "2px solid var(--bevel-darker)",
              borderBottom: active
                ? "2px solid var(--bevel-light)"
                : "2px solid var(--bevel-darker)",
              cursor: "url(/cursors/vine-precision.cur), pointer",
              boxShadow: active ? "inset 1px 1px 0 rgba(0,0,0,0.25)" : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Hook class names; actual styling lives in globals.css.
export const inputClass = "retro-input";
export const selectClass = "retro-input";
export const buttonClass = "retro-btn btn-bevel";
export const linkButtonClass = "retro-btn btn-bevel";
