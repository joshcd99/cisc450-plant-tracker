// Display age for a plant. Prefers birthday (derived from CURRENT_DATE so it
// stays accurate); falls back to approxAge. Returns null if neither is set.
export function plantAge({
  approxAge,
  birthday,
}: {
  approxAge: string | null;
  birthday: string | null;
}): number | null {
  if (birthday) {
    const bd = new Date(birthday + "T00:00");
    const now = new Date();
    const days = (now.getTime() - bd.getTime()) / (1000 * 60 * 60 * 24);
    const years = days / 365.25;
    return Math.max(0, Math.round(years * 10) / 10);
  }
  if (approxAge !== null) {
    const n = parseFloat(approxAge);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function formatAge(age: number | null): string | null {
  if (age === null) return null;
  return `${age}y`;
}
