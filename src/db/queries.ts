import "server-only";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  fertilizationEvent,
  guestbookEntry,
  healthObservation,
  location,
  plants,
  repottingEvent,
  room,
  species,
  wateringEvent,
  wateringSchedule,
} from "./schema";

// ----- Lookups -----

export async function listSpecies() {
  return db.select().from(species).orderBy(asc(species.speciesName));
}

export async function listLocations() {
  return db.select().from(location).orderBy(asc(location.locationName));
}

export async function listRooms() {
  return db
    .select({
      roomId: room.roomId,
      roomName: room.roomName,
      locationId: room.locationId,
      locationName: location.locationName,
    })
    .from(room)
    .innerJoin(location, eq(room.locationId, location.locationId))
    .orderBy(asc(location.locationName), asc(room.roomName));
}

// Req 2: list plants, optionally filtered by room or location.
export async function listPlants(filters?: { roomId?: number; locationId?: number }) {
  const conditions = [];
  if (filters?.roomId !== undefined) {
    conditions.push(eq(plants.roomId, filters.roomId));
  }
  if (filters?.locationId !== undefined) {
    conditions.push(eq(room.locationId, filters.locationId));
  }

  return db
    .select({
      plantId: plants.plantId,
      plantName: plants.plantName,
      approxAge: plants.approxAge,
      birthday: plants.birthday,
      potSize: plants.potSize,
      imageUrl: plants.imageUrl,
      speciesId: species.speciesId,
      speciesName: species.speciesName,
      recommWaterInterval: species.recommWaterInterval,
      roomId: room.roomId,
      roomName: room.roomName,
      locationId: location.locationId,
      locationName: location.locationName,
    })
    .from(plants)
    .innerJoin(species, eq(plants.speciesId, species.speciesId))
    .innerJoin(room, eq(plants.roomId, room.roomId))
    .innerJoin(location, eq(room.locationId, location.locationId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(plants.plantName));
}

export async function getPlantById(plantId: number) {
  const rows = await db
    .select({
      plantId: plants.plantId,
      plantName: plants.plantName,
      approxAge: plants.approxAge,
      birthday: plants.birthday,
      potSize: plants.potSize,
      imageUrl: plants.imageUrl,
      speciesId: species.speciesId,
      speciesName: species.speciesName,
      recommWaterInterval: species.recommWaterInterval,
      roomId: room.roomId,
      roomName: room.roomName,
      locationId: location.locationId,
      locationName: location.locationName,
    })
    .from(plants)
    .innerJoin(species, eq(plants.speciesId, species.speciesId))
    .innerJoin(room, eq(plants.roomId, room.roomId))
    .innerJoin(location, eq(room.locationId, location.locationId))
    .where(eq(plants.plantId, plantId))
    .limit(1);
  return rows[0] ?? null;
}

// Req 4: full watering history for a plant.
export async function getWateringHistory(plantId: number) {
  return db
    .select()
    .from(wateringEvent)
    .where(eq(wateringEvent.plantId, plantId))
    .orderBy(desc(wateringEvent.wateredOn));
}

// Req 5: last watering for a plant + days ago.
export async function getLastWatered(plantId: number) {
  const rows = await db.execute(sql`
    SELECT
      MAX(watered_on) AS last_watered_on,
      CURRENT_DATE - MAX(watered_on) AS days_ago
    FROM watering_event
    WHERE plant_id = ${plantId}
  `);
  const row = rows[0] as { last_watered_on: string | null; days_ago: number | null } | undefined;
  if (!row || row.last_watered_on === null) return null;
  return {
    lastWateredOn: row.last_watered_on,
    daysAgo: Number(row.days_ago),
  };
}

// Req 6: plants scheduled to be watered on a specific date

export async function getPlantsScheduledOn(scheduledDate: string) {
  return db
    .select({
      scheduleId: wateringSchedule.scheduleId,
      scheduledDate: wateringSchedule.scheduledDate,
      plantId: plants.plantId,
      plantName: plants.plantName,
      speciesName: species.speciesName,
      roomName: room.roomName,
      locationName: location.locationName,
    })
    .from(wateringSchedule)
    .innerJoin(plants, eq(wateringSchedule.plantId, plants.plantId))
    .innerJoin(species, eq(plants.speciesId, species.speciesId))
    .innerJoin(room, eq(plants.roomId, room.roomId))
    .innerJoin(location, eq(room.locationId, location.locationId))
    .where(eq(wateringSchedule.scheduledDate, scheduledDate))
    .orderBy(asc(plants.plantName));
}

// Req 7: plants overdue for watering (per species interval)

export type OverduePlant = {
  plantId: number;
  plantName: string;
  speciesName: string;
  roomName: string;
  locationName: string;
  recommWaterInterval: number;
  lastWateredOn: string | null;
  daysSinceWatered: number | null;
  daysOverdue: number;
};

export async function getOverduePlants(): Promise<OverduePlant[]> {
  const rows = await db.execute(sql`
    WITH last_water AS (
      SELECT plant_id, MAX(watered_on) AS last_watered_on
        FROM watering_event
       GROUP BY plant_id
    )
    SELECT
      p.plant_id                                         AS "plantId",
      p.plant_name                                       AS "plantName",
      sp.species_name                                    AS "speciesName",
      r.room_name                                        AS "roomName",
      l.location_name                                    AS "locationName",
      sp.recomm_water_interval                           AS "recommWaterInterval",
      lw.last_watered_on                                 AS "lastWateredOn",
      CASE WHEN lw.last_watered_on IS NULL THEN NULL
           ELSE (CURRENT_DATE - lw.last_watered_on)::int
      END                                                AS "daysSinceWatered",
      CASE WHEN lw.last_watered_on IS NULL THEN sp.recomm_water_interval
           ELSE ((CURRENT_DATE - lw.last_watered_on) - sp.recomm_water_interval)::int
      END                                                AS "daysOverdue"
    FROM plants p
    INNER JOIN species sp  ON sp.species_id = p.species_id
    INNER JOIN room r      ON r.room_id     = p.room_id
    INNER JOIN location l  ON l.location_id = r.location_id
    LEFT JOIN  last_water lw ON lw.plant_id = p.plant_id
    WHERE lw.last_watered_on IS NULL
       OR (CURRENT_DATE - lw.last_watered_on) >= sp.recomm_water_interval
    ORDER BY "daysOverdue" DESC, p.plant_name ASC;
  `);
  return rows as unknown as OverduePlant[];
}

// Req 11: care summary for one plant (last of each event type)

export type CareSummary = {
  plantId: number;
  plantName: string;
  speciesName: string;
  recommWaterInterval: number;
  roomName: string;
  locationName: string;
  imageUrl: string | null;
  approxAge: string | null;
  birthday: string | null;
  potSize: string | null;
  lastWatering: { date: string; notes: string | null } | null;
  lastFertilization: { date: string; fertType: string } | null;
  lastRepotting: { date: string; previousPotSize: string | null; newPotSize: string } | null;
  lastHealthObservation: { date: string; notes: string } | null;
};

export async function getCareSummary(plantId: number): Promise<CareSummary | null> {
  const plant = await getPlantById(plantId);
  if (!plant) return null;

  const [latestWatering, latestFert, latestRepot, latestHealth] = await Promise.all([
    db
      .select()
      .from(wateringEvent)
      .where(eq(wateringEvent.plantId, plantId))
      .orderBy(desc(wateringEvent.wateredOn))
      .limit(1),
    db
      .select()
      .from(fertilizationEvent)
      .where(eq(fertilizationEvent.plantId, plantId))
      .orderBy(desc(fertilizationEvent.dateApplied))
      .limit(1),
    db
      .select()
      .from(repottingEvent)
      .where(eq(repottingEvent.plantId, plantId))
      .orderBy(desc(repottingEvent.repottedOn))
      .limit(1),
    db
      .select()
      .from(healthObservation)
      .where(eq(healthObservation.plantId, plantId))
      .orderBy(desc(healthObservation.observationDate))
      .limit(1),
  ]);

  return {
    plantId: plant.plantId,
    plantName: plant.plantName,
    speciesName: plant.speciesName,
    recommWaterInterval: plant.recommWaterInterval,
    roomName: plant.roomName,
    locationName: plant.locationName,
    imageUrl: plant.imageUrl,
    approxAge: plant.approxAge,
    birthday: plant.birthday,
    potSize: plant.potSize,
    lastWatering: latestWatering[0]
      ? { date: latestWatering[0].wateredOn, notes: latestWatering[0].notes }
      : null,
    lastFertilization: latestFert[0]
      ? { date: latestFert[0].dateApplied, fertType: latestFert[0].fertType }
      : null,
    lastRepotting: latestRepot[0]
      ? {
          date: latestRepot[0].repottedOn,
          previousPotSize: latestRepot[0].previousPotSize,
          newPotSize: latestRepot[0].newPotSize,
        }
      : null,
    lastHealthObservation: latestHealth[0]
      ? { date: latestHealth[0].observationDate, notes: latestHealth[0].notes }
      : null,
  };
}

// Event histories for the plant detail page.
export async function getFertilizationHistory(plantId: number) {
  return db
    .select()
    .from(fertilizationEvent)
    .where(eq(fertilizationEvent.plantId, plantId))
    .orderBy(desc(fertilizationEvent.dateApplied));
}

export async function getRepottingHistory(plantId: number) {
  return db
    .select()
    .from(repottingEvent)
    .where(eq(repottingEvent.plantId, plantId))
    .orderBy(desc(repottingEvent.repottedOn));
}

export async function getHealthObservations(plantId: number) {
  return db
    .select()
    .from(healthObservation)
    .where(eq(healthObservation.plantId, plantId))
    .orderBy(desc(healthObservation.observationDate));
}

export async function getUpcomingSchedules(plantId: number) {
  return db
    .select()
    .from(wateringSchedule)
    .where(eq(wateringSchedule.plantId, plantId))
    .orderBy(asc(wateringSchedule.scheduledDate));
}

// Calendar view: per-day aggregate of waterings done, missed, and scheduled.
// "missed" requires the date to be STRICTLY in the past (today's scheduled
// rows stay sky until the day rolls over).

export type CalendarItem = {
  plantId: number;
  plantName: string;
  speciesName: string;
  status: "watered" | "missed" | "scheduled";
  notes: string | null;
};

export type CalendarDay = {
  day: string; // YYYY-MM-DD
  watered: number;
  scheduled: number;
  missed: number;
  items: CalendarItem[];
};

export async function getCalendarMonth(year: number, month: number): Promise<CalendarDay[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const rows = await db.execute(sql`
    SELECT
      to_char(day, 'YYYY-MM-DD')  AS "day",
      "plantId", "plantName", "speciesName", "status", "notes"
    FROM (
      SELECT
        we.watered_on               AS day,
        p.plant_id                  AS "plantId",
        p.plant_name                AS "plantName",
        sp.species_name             AS "speciesName",
        'watered'::text             AS "status",
        we.notes                    AS "notes"
      FROM watering_event we
      INNER JOIN plants p   ON p.plant_id   = we.plant_id
      INNER JOIN species sp ON sp.species_id = p.species_id
      WHERE we.watered_on >= ${startDate}::date
        AND we.watered_on <  (${startDate}::date + INTERVAL '1 month')

      UNION ALL

      SELECT
        s.scheduled_date            AS day,
        p.plant_id                  AS "plantId",
        p.plant_name                AS "plantName",
        sp.species_name             AS "speciesName",
        'missed'::text              AS "status",
        NULL                        AS "notes"
      FROM watering_schedule s
      INNER JOIN plants p   ON p.plant_id   = s.plant_id
      INNER JOIN species sp ON sp.species_id = p.species_id
      WHERE s.scheduled_date >= ${startDate}::date
        AND s.scheduled_date <  (${startDate}::date + INTERVAL '1 month')
        AND s.scheduled_date <  CURRENT_DATE
        AND NOT EXISTS (
              SELECT 1 FROM watering_event w
               WHERE w.plant_id   = s.plant_id
                 AND w.watered_on = s.scheduled_date
            )

      UNION ALL

      SELECT
        s.scheduled_date            AS day,
        p.plant_id                  AS "plantId",
        p.plant_name                AS "plantName",
        sp.species_name             AS "speciesName",
        'scheduled'::text           AS "status",
        NULL                        AS "notes"
      FROM watering_schedule s
      INNER JOIN plants p   ON p.plant_id   = s.plant_id
      INNER JOIN species sp ON sp.species_id = p.species_id
      WHERE s.scheduled_date >= ${startDate}::date
        AND s.scheduled_date <  (${startDate}::date + INTERVAL '1 month')
        AND s.scheduled_date >= CURRENT_DATE
    ) t
    ORDER BY day,
      CASE "status" WHEN 'missed' THEN 1 WHEN 'watered' THEN 2 ELSE 3 END,
      "plantName";
  `);

  // Build a record for every day in the month (even empty ones) so the grid
  // can render uniformly.
  const start = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const byDay = new Map<string, CalendarDay>();
  for (let i = 0; i < daysInMonth; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), i + 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    byDay.set(iso, { day: iso, watered: 0, missed: 0, scheduled: 0, items: [] });
  }

  for (const r of rows as unknown as (CalendarItem & { day: string })[]) {
    const detail = byDay.get(r.day);
    if (!detail) continue;
    detail.items.push({
      plantId: r.plantId,
      plantName: r.plantName,
      speciesName: r.speciesName,
      status: r.status,
      notes: r.notes,
    });
    if (r.status === "watered") detail.watered++;
    else if (r.status === "missed") detail.missed++;
    else detail.scheduled++;
  }

  return Array.from(byDay.values());
}

// ----- Dashboard activity card -----

export type DailyCount = { day: string; n: number };

export type TopWateredPlant = {
  plantId: number;
  plantName: string;
  speciesName: string;
  imageUrl: string | null;
  count: number;
};

export async function getTopWateredPlants(
  days: number,
  limit: number,
): Promise<TopWateredPlant[]> {
  const rows = await db.execute(sql`
    SELECT
      p.plant_id        AS "plantId",
      p.plant_name      AS "plantName",
      sp.species_name   AS "speciesName",
      p.image_url       AS "imageUrl",
      COUNT(we.water_event_id)::int AS "count"
    FROM plants p
    INNER JOIN species sp ON sp.species_id = p.species_id
    LEFT JOIN  watering_event we
      ON we.plant_id = p.plant_id
     AND we.watered_on > CURRENT_DATE - (${days})::int
    GROUP BY p.plant_id, p.plant_name, sp.species_name, p.image_url
    ORDER BY "count" DESC, p.plant_name ASC
    LIMIT ${limit};
  `);
  return rows as unknown as TopWateredPlant[];
}

// longestStreak: greatest run of consecutive days in the 30-day window with
// at least one watering recorded across any plant.
export type WateringStats = {
  last7: number;
  last30: number;
  longestStreak: number;
  peakDayCount: number;
};

export async function getWateringStats(): Promise<WateringStats> {
  const rows = await db.execute(sql`
    WITH last30 AS (
      SELECT watered_on, COUNT(*)::int AS n
        FROM watering_event
       WHERE watered_on > CURRENT_DATE - 30
       GROUP BY watered_on
    ),
    -- Island-and-gap: consecutive days collapse into runs by (date - row#).
    grouped AS (
      SELECT
        watered_on,
        watered_on - (ROW_NUMBER() OVER (ORDER BY watered_on))::int AS island
      FROM last30
    ),
    streaks AS (
      SELECT COUNT(*)::int AS run FROM grouped GROUP BY island
    )
    SELECT
      (SELECT COALESCE(SUM(n), 0)::int FROM last30 WHERE watered_on > CURRENT_DATE - 7) AS "last7",
      (SELECT COALESCE(SUM(n), 0)::int FROM last30)                                       AS "last30",
      (SELECT COALESCE(MAX(run), 0)::int FROM streaks)                                    AS "longestStreak",
      (SELECT COALESCE(MAX(n), 0)::int FROM last30)                                       AS "peakDayCount";
  `);
  return rows[0] as unknown as WateringStats;
}

export async function getWateringsLastNDays(n: number): Promise<DailyCount[]> {
  const rows = await db.execute(sql`
    WITH days AS (
      SELECT generate_series(
        (CURRENT_DATE - (${n - 1})::int)::date,
        CURRENT_DATE,
        '1 day'::interval
      )::date AS day
    ),
    waterings AS (
      SELECT watered_on AS day, COUNT(*)::int AS n
        FROM watering_event
       WHERE watered_on > CURRENT_DATE - (${n})::int
       GROUP BY watered_on
    )
    SELECT to_char(d.day, 'YYYY-MM-DD') AS "day", COALESCE(w.n, 0) AS "n"
      FROM days d
      LEFT JOIN waterings w ON w.day = d.day
      ORDER BY d.day;
  `);
  return rows as unknown as DailyCount[];
}

// ----- Guestbook (Retro Edition) -----

export async function listGuestbookEntries() {
  return db
    .select()
    .from(guestbookEntry)
    .orderBy(desc(guestbookEntry.signedAt));
}

export async function countGuestbookEntries(): Promise<number> {
  const rows = await db.execute(sql`SELECT COUNT(*)::int AS c FROM guestbook_entry`);
  const row = rows[0] as { c: number } | undefined;
  return row?.c ?? 0;
}

// Atomic UPDATE … RETURNING: concurrent requests serialize on the row lock
// so the counter can't double-count or return a torn read.
export async function recordHitAndGetCount(): Promise<number> {
  const rows = await db.execute(sql`
    UPDATE site_counter
       SET hits = hits + 1
     WHERE id = 1
     RETURNING hits
  `);
  const row = rows[0] as { hits: number | string } | undefined;
  if (!row) return 0;
  // pg returns BIGINT as string; coerce to number.
  return Number(row.hits);
}
