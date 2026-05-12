import {
  pgTable,
  integer,
  varchar,
  text,
  date,
  numeric,
  timestamp,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Drizzle schema. supabase/schema.sql is the source of truth; this file
// just describes the same shape to Drizzle's typed query builder.

export const species = pgTable(
  "species",
  {
    speciesId: integer("species_id").primaryKey().generatedAlwaysAsIdentity(),
    speciesName: varchar("species_name", { length: 100 }).notNull().unique(),
    recommWaterInterval: integer("recomm_water_interval").notNull(),
  },
  (t) => [check("recomm_water_interval_positive", sql`${t.recommWaterInterval} > 0`)],
);

export const location = pgTable("location", {
  locationId: integer("location_id").primaryKey().generatedAlwaysAsIdentity(),
  locationName: varchar("location_name", { length: 100 }).notNull().unique(),
});

export const room = pgTable(
  "room",
  {
    roomId: integer("room_id").primaryKey().generatedAlwaysAsIdentity(),
    locationId: integer("location_id")
      .notNull()
      .references(() => location.locationId, { onDelete: "restrict" }),
    roomName: varchar("room_name", { length: 100 }).notNull(),
  },
  (t) => [
    index("idx_room_location_id").on(t.locationId),
    unique("room_location_name_unique").on(t.locationId, t.roomName),
  ],
);

export const plants = pgTable(
  "plants",
  {
    plantId: integer("plant_id").primaryKey().generatedAlwaysAsIdentity(),
    roomId: integer("room_id")
      .notNull()
      .references(() => room.roomId, { onDelete: "restrict" }),
    speciesId: integer("species_id")
      .notNull()
      .references(() => species.speciesId, { onDelete: "restrict" }),
    plantName: varchar("plant_name", { length: 100 }).notNull(),
    approxAge: numeric("approx_age", { precision: 4, scale: 1 }),
    birthday: date("birthday"),
    potSize: varchar("pot_size", { length: 50 }),
    imageUrl: text("image_url"),
  },
  (t) => [
    index("idx_plants_room_id").on(t.roomId),
    index("idx_plants_species_id").on(t.speciesId),
  ],
);

export const wateringEvent = pgTable(
  "watering_event",
  {
    waterEventId: integer("water_event_id").primaryKey().generatedAlwaysAsIdentity(),
    plantId: integer("plant_id")
      .notNull()
      .references(() => plants.plantId, { onDelete: "cascade" }),
    wateredOn: date("watered_on").notNull(),
    notes: text("notes"),
  },
  (t) => [
    index("idx_watering_event_plant_id").on(t.plantId),
    index("idx_watering_event_watered_on").on(t.wateredOn),
  ],
);

export const wateringSchedule = pgTable(
  "watering_schedule",
  {
    scheduleId: integer("schedule_id").primaryKey().generatedAlwaysAsIdentity(),
    plantId: integer("plant_id")
      .notNull()
      .references(() => plants.plantId, { onDelete: "cascade" }),
    scheduledDate: date("scheduled_date").notNull(),
  },
  (t) => [
    index("idx_watering_schedule_plant_id").on(t.plantId),
    index("idx_watering_schedule_date").on(t.scheduledDate),
    unique("watering_schedule_plant_date_unique").on(t.plantId, t.scheduledDate),
  ],
);

export const fertilizationEvent = pgTable(
  "fertilization_event",
  {
    fertId: integer("fert_id").primaryKey().generatedAlwaysAsIdentity(),
    plantId: integer("plant_id")
      .notNull()
      .references(() => plants.plantId, { onDelete: "cascade" }),
    fertType: varchar("fert_type", { length: 100 }).notNull(),
    dateApplied: date("date_applied").notNull(),
  },
  (t) => [index("idx_fertilization_event_plant_id").on(t.plantId)],
);

export const repottingEvent = pgTable(
  "repotting_event",
  {
    repottingId: integer("repotting_id").primaryKey().generatedAlwaysAsIdentity(),
    plantId: integer("plant_id")
      .notNull()
      .references(() => plants.plantId, { onDelete: "cascade" }),
    previousPotSize: varchar("previous_pot_size", { length: 50 }),
    newPotSize: varchar("new_pot_size", { length: 50 }).notNull(),
    repottedOn: date("repotted_on").notNull(),
  },
  (t) => [index("idx_repotting_event_plant_id").on(t.plantId)],
);

export const healthObservation = pgTable(
  "health_observation",
  {
    healthId: integer("health_id").primaryKey().generatedAlwaysAsIdentity(),
    plantId: integer("plant_id")
      .notNull()
      .references(() => plants.plantId, { onDelete: "cascade" }),
    observationDate: date("observation_date").notNull(),
    notes: text("notes").notNull(),
  },
  (t) => [index("idx_health_observation_plant_id").on(t.plantId)],
);

// Guestbook signatures. Retro-edition only.
export const guestbookEntry = pgTable(
  "guestbook_entry",
  {
    guestbookId: integer("guestbook_id").primaryKey().generatedAlwaysAsIdentity(),
    visitorName: varchar("visitor_name", { length: 60 }).notNull(),
    location: varchar("location", { length: 80 }),
    mood: varchar("mood", { length: 8 }),
    message: varchar("message", { length: 500 }).notNull(),
    signedAt: timestamp("signed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_guestbook_entry_signed_at").on(t.signedAt)],
);

export type Species = typeof species.$inferSelect;
export type Location = typeof location.$inferSelect;
export type Room = typeof room.$inferSelect;
export type Plant = typeof plants.$inferSelect;
export type WateringEvent = typeof wateringEvent.$inferSelect;
export type WateringSchedule = typeof wateringSchedule.$inferSelect;
export type FertilizationEvent = typeof fertilizationEvent.$inferSelect;
export type RepottingEvent = typeof repottingEvent.$inferSelect;
export type HealthObservation = typeof healthObservation.$inferSelect;
export type GuestbookEntry = typeof guestbookEntry.$inferSelect;
