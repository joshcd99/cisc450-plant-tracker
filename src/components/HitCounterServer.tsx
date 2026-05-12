// Server-rendered visitor counter. Increments site_counter on every render.

import { recordHitAndGetCount } from "@/db/queries";

export async function HitCounterServer() {
  let display = "0000000";
  try {
    const hits = await recordHitAndGetCount();
    display = String(hits).padStart(7, "0");
  } catch {
    // DB hiccup → keep the placeholder zeros so the footer still renders.
  }
  return (
    <span className="hit-counter" aria-label={`Visitor count: ${display}`}>
      {display.split("").map((d, i) => (
        <span key={i}>{d}</span>
      ))}
    </span>
  );
}
