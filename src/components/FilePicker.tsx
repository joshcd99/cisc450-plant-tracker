"use client";

// Retro file picker. The native input is visually hidden (sr-only style) so
// the click target is just the styled <label> button, not the whole row.

import { useState } from "react";

export function FilePicker({
  id,
  name,
  accept,
  required,
  buttonLabel = "Choose photo",
}: {
  id: string;
  name: string;
  accept?: string;
  required?: boolean;
  buttonLabel?: string;
}) {
  const [filename, setFilename] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
      }}
    >
      {/* Visually-hidden but focusable file input. */}
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => setFilename(e.target.files?.[0]?.name ?? null)}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
      <label htmlFor={id} className="retro-btn btn-bevel">
        📁 {buttonLabel}
      </label>
      <span
        style={{
          fontFamily: "Tahoma, sans-serif",
          fontSize: 12,
          color: filename ? "#1a3d10" : "#7a7a7a",
          fontStyle: filename ? "normal" : "italic",
          background: "#fff",
          borderTop: "2px solid var(--bevel-dark)",
          borderLeft: "2px solid var(--bevel-dark)",
          borderRight: "2px solid var(--bevel-light)",
          borderBottom: "2px solid var(--bevel-light)",
          padding: "3px 8px",
          flex: 1,
          minWidth: 140,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {filename ?? "No file chosen"}
      </span>
    </div>
  );
}
