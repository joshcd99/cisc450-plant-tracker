// Primary status for a calendar day. Priority: missed > watered > scheduled.

import type { CalendarDay } from "@/db/queries";

export type DayStatus = "missed" | "watered" | "scheduled" | "none";

export function dayStatus(info: CalendarDay | undefined): DayStatus {
  if (!info) return "none";
  if (info.missed > 0) return "missed";
  if (info.watered > 0) return "watered";
  if (info.scheduled > 0) return "scheduled";
  return "none";
}
