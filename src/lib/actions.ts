"use server";

import { and, eq, gte, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { db } from "@/db";
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
} from "@/db/schema";
import { PLANT_PHOTOS_BUCKET, supabaseAdmin } from "./supabase";

// Wipe the future watering_schedule for one plant and project a year of new
// dates forward from `baseDate` at the species' recommended interval. Called
// from addPlant (baseDate = today) and logWatering (baseDate = watered_on).

const SCHEDULE_HORIZON_DAYS = 365;

async function regeneratePlantSchedule(
  plantId: number,
  baseDate: string,
): Promise<void> {
  const rows = await db
    .select({ interval: species.recommWaterInterval })
    .from(plants)
    .innerJoin(species, eq(species.speciesId, plants.speciesId))
    .where(eq(plants.plantId, plantId))
    .limit(1);
  const interval = rows[0]?.interval;
  if (!interval || interval <= 0) return;

  // Includes today: a watering logged today supersedes today's scheduled row.
  await db
    .delete(wateringSchedule)
    .where(
      and(
        eq(wateringSchedule.plantId, plantId),
        gte(wateringSchedule.scheduledDate, sql`CURRENT_DATE`),
      ),
    );

  await db.execute(sql`
    INSERT INTO watering_schedule (plant_id, scheduled_date)
    SELECT ${plantId},
           (${baseDate}::date + (n * ${interval}::int))::date AS scheduled_date
      FROM generate_series(1, ${Math.ceil(SCHEDULE_HORIZON_DAYS / interval) + 1}) AS n
     WHERE (${baseDate}::date + (n * ${interval}::int))::date >  CURRENT_DATE
       AND (${baseDate}::date + (n * ${interval}::int))::date <= CURRENT_DATE + ${SCHEDULE_HORIZON_DAYS}
    ON CONFLICT (plant_id, scheduled_date) DO NOTHING
  `);
}

function todayIsoLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type FormState = { ok: boolean; error?: string; id?: number };

function required(value: FormDataEntryValue | null, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} is required`);
  }
  return value.trim();
}

function optional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

// Local-date YYYY-MM-DD (avoid UTC drift in the evening US time).
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// Per-plant prefix + timestamp filename so we can clean up by prefix later
// and avoid collisions on re-photo.
async function uploadPlantPhoto(file: File, plantId: number): Promise<string> {
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("Photo is larger than 5 MB. Please choose a smaller file.");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const path = `plant-${plantId}/${Date.now()}.${safeExt}`;

  const { error } = await supabaseAdmin.storage
    .from(PLANT_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type || `image/${safeExt}`,
      upsert: false,
    });
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage
    .from(PLANT_PHOTOS_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

// Map Postgres error codes to user-facing messages.
function friendlyError(err: unknown): string {
  const e = err as { code?: string; message?: string };
  switch (e.code) {
    case "23505":
      return "Already exists. Duplicate entry not allowed.";
    case "23503":
      return "Can't complete: referenced record is missing.";
    case "23514":
      return "Value is out of the allowed range.";
    case "22P02":
      return "Invalid value format.";
    default:
      return e.message ?? "Something went wrong.";
  }
}

// Req 1: add a new plant. Species, room, and location can each be
// existing-by-id or "new" with the inline-create fields alongside.
export async function addPlant(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantName = required(formData.get("plantName"), "Plant name");
    const potSize = optional(formData.get("potSize"));

    // Resolve species (existing or inline-create).
    const speciesIdRaw = required(formData.get("speciesId"), "Species");
    let speciesId: number;
    if (speciesIdRaw === "new") {
      const newSpeciesName = required(formData.get("newSpeciesName"), "Species name");
      const newSpeciesInterval = Number(
        required(formData.get("newSpeciesInterval"), "Watering interval"),
      );
      const [createdSpecies] = await db
        .insert(species)
        .values({ speciesName: newSpeciesName, recommWaterInterval: newSpeciesInterval })
        .returning({ id: species.speciesId });
      speciesId = createdSpecies.id;
    } else {
      speciesId = Number(speciesIdRaw);
    }

    // Resolve room (and optionally its location).
    const roomIdRaw = required(formData.get("roomId"), "Room");
    let roomId: number;
    if (roomIdRaw === "new") {
      const locationIdRaw = required(formData.get("locationId"), "Location");
      let locationId: number;
      if (locationIdRaw === "new") {
        const newLocationName = required(
          formData.get("newLocationName"),
          "Location name",
        );
        const [createdLocation] = await db
          .insert(location)
          .values({ locationName: newLocationName })
          .returning({ id: location.locationId });
        locationId = createdLocation.id;
      } else {
        locationId = Number(locationIdRaw);
      }
      const newRoomName = required(formData.get("newRoomName"), "Room name");
      const [createdRoom] = await db
        .insert(room)
        .values({ locationId, roomName: newRoomName })
        .returning({ id: room.roomId });
      roomId = createdRoom.id;
    } else {
      roomId = Number(roomIdRaw);
    }

    // Birthday wins over approxAge if both are present; only one is kept.
    const birthday = optional(formData.get("birthday"));
    const approxAgeRaw = birthday ? null : optional(formData.get("approxAge"));

    // Insert first to get the plant_id, then upload any photo under it.
    const [inserted] = await db
      .insert(plants)
      .values({
        plantName,
        speciesId,
        roomId,
        approxAge: approxAgeRaw,
        birthday,
        potSize,
      })
      .returning({ plantId: plants.plantId });

    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const imageUrl = await uploadPlantPhoto(photo, inserted.plantId);
      await db
        .update(plants)
        .set({ imageUrl })
        .where(eq(plants.plantId, inserted.plantId));
    }

    await regeneratePlantSchedule(inserted.plantId, todayIsoLocal());

    revalidatePath("/");
    revalidatePath("/plants");
    revalidatePath("/settings");
    updateTag("plants"); // bust the PlantsMarquee cache

    return { ok: true, id: inserted.plantId };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Replace a plant's image_url. The old Storage object is left in place to
// avoid races if its URL is still being rendered somewhere.
export async function updatePlantImage(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      return { ok: false, error: "Please choose a photo to upload." };
    }

    const imageUrl = await uploadPlantPhoto(photo, plantId);
    await db.update(plants).set({ imageUrl }).where(eq(plants.plantId, plantId));

    revalidatePath(`/plants/${plantId}`);
    revalidatePath("/");
    revalidatePath("/plants");
    updateTag("plants");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Care-event tables cascade on plant delete, so this one statement cleans
// up the entire history.
export async function deletePlant(plantId: number): Promise<void> {
  await db.delete(plants).where(eq(plants.plantId, plantId));
  revalidatePath("/");
  revalidatePath("/plants");
  updateTag("plants");
}

// Req 3: log a watering event

export async function logWatering(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const wateredOn = required(formData.get("wateredOn"), "Date");
    const notes = optional(formData.get("notes"));

    const [inserted] = await db
      .insert(wateringEvent)
      .values({ plantId, wateredOn, notes })
      .returning({ id: wateringEvent.waterEventId });

    // Realign the future schedule with the new "last watered" date. If the
    // user is logging an out-of-cadence watering (e.g. 3 days early), every
    // upcoming scheduled date shifts to match.
    await regeneratePlantSchedule(plantId, wateredOn);

    revalidatePath("/");
    revalidatePath(`/plants/${plantId}`);
    revalidatePath("/calendar");
    revalidatePath("/schedule");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Req 6 (write side): schedule a future watering.

export async function scheduleWatering(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const scheduledDate = required(formData.get("scheduledDate"), "Date");

    const [inserted] = await db
      .insert(wateringSchedule)
      .values({ plantId, scheduledDate })
      .returning({ id: wateringSchedule.scheduleId });

    revalidatePath("/");
    revalidatePath(`/plants/${plantId}`);
    revalidatePath("/schedule");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Req 8: log a fertilization event

export async function logFertilization(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const fertType = required(formData.get("fertType"), "Fertilizer type");
    const dateApplied = required(formData.get("dateApplied"), "Date");

    const [inserted] = await db
      .insert(fertilizationEvent)
      .values({ plantId, fertType, dateApplied })
      .returning({ id: fertilizationEvent.fertId });

    revalidatePath(`/plants/${plantId}`);
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Req 9: log a repotting event (also updates current pot size)

export async function logRepotting(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const previousPotSize = optional(formData.get("previousPotSize"));
    const newPotSize = required(formData.get("newPotSize"), "New pot size");
    const repottedOn = required(formData.get("repottedOn"), "Date");

    const insertedId = await db.transaction(async (tx) => {
      const [event] = await tx
        .insert(repottingEvent)
        .values({ plantId, previousPotSize, newPotSize, repottedOn })
        .returning({ id: repottingEvent.repottingId });
      // Keep the plant's "current" pot size in sync with the latest repot.
      await tx.update(plants).set({ potSize: newPotSize }).where(eq(plants.plantId, plantId));
      return event.id;
    });

    revalidatePath(`/plants/${plantId}`);
    return { ok: true, id: insertedId };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// Req 10: log a freeform health observation

export async function logHealthObservation(
  _: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const plantId = Number(required(formData.get("plantId"), "Plant"));
    const observationDate =
      optional(formData.get("observationDate")) ?? todayIso();
    const notes = required(formData.get("notes"), "Observation");

    const [inserted] = await db
      .insert(healthObservation)
      .values({ plantId, observationDate, notes })
      .returning({ id: healthObservation.healthId });

    revalidatePath(`/plants/${plantId}`);
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// ----- Lookup management (Settings page) -----

export async function addSpecies(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const speciesName = required(formData.get("speciesName"), "Species name");
    const recommWaterInterval = Number(
      required(formData.get("recommWaterInterval"), "Watering interval"),
    );
    const [inserted] = await db
      .insert(species)
      .values({ speciesName, recommWaterInterval })
      .returning({ id: species.speciesId });
    revalidatePath("/settings");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

export async function addLocation(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const locationName = required(formData.get("locationName"), "Location name");
    const [inserted] = await db
      .insert(location)
      .values({ locationName })
      .returning({ id: location.locationId });
    revalidatePath("/settings");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

export async function addRoom(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const locationId = Number(required(formData.get("locationId"), "Location"));
    const roomName = required(formData.get("roomName"), "Room name");
    const [inserted] = await db
      .insert(room)
      .values({ locationId, roomName })
      .returning({ id: room.roomId });
    revalidatePath("/settings");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}

// ----- Guestbook -----

export async function signGuestbook(_: FormState, formData: FormData): Promise<FormState> {
  try {
    const visitorName = required(formData.get("visitorName"), "Your name");
    const message = required(formData.get("message"), "Message");
    const location = optional(formData.get("location"));
    const moodRaw = optional(formData.get("mood"));
    // Cap to a couple of graphemes so we don't store an Iliad in the mood column.
    const mood = moodRaw ? [...moodRaw].slice(0, 2).join("") : null;

    if (visitorName.length > 60) {
      return { ok: false, error: "Name too long (max 60 chars)." };
    }
    if (message.length > 500) {
      return { ok: false, error: "Message too long (max 500 chars)." };
    }

    const [inserted] = await db
      .insert(guestbookEntry)
      .values({ visitorName, location, mood, message })
      .returning({ id: guestbookEntry.guestbookId });

    revalidatePath("/guestbook");
    return { ok: true, id: inserted.id };
  } catch (err) {
    return { ok: false, error: friendlyError(err) };
  }
}
