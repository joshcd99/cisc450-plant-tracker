"use client";

import { useActionState } from "react";
import {
  addLocation,
  addPlant,
  addRoom,
  addSpecies,
  deletePlant,
  logFertilization,
  logHealthObservation,
  logRepotting,
  logWatering,
  scheduleWatering,
  signGuestbook,
  updatePlantImage,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { buttonClass, Field, FileField, inputClass, SegmentToggle } from "./ui";
import { RetroSelect } from "./RetroSelect";
import { FilePicker } from "./FilePicker";
import { RetroDatePicker } from "./RetroDatePicker";

type Species = { speciesId: number; speciesName: string };
type Room = { roomId: number; roomName: string; locationId: number; locationName: string };
type Location = { locationId: number; locationName: string };

type SpeciesMode = "existing" | "new";
type RoomMode = "existing" | "new";
type LocationMode = "existing" | "new";
type AgeMode = "years" | "birthday";

const initialState = { ok: false } as const;

// Local YYYY-MM-DD (avoid UTC drift in the evening US time).
function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function FormStatus({
  state,
  successText,
}: {
  state: { ok: boolean; error?: string };
  successText: string;
}) {
  if (state.error) {
    return <p className="mt-2 text-sm text-red-600">{state.error}</p>;
  }
  if (state.ok) {
    return <p className="mt-2 text-sm text-emerald-700">{successText}</p>;
  }
  return null;
}

// Labeled subsection with optional mode toggle (existing vs. + add new).
function RetroSubsection({
  label,
  toggle,
  children,
}: {
  label: string;
  toggle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--leaf-dark)",
          }}
        >
          ★ {label}
        </span>
        {toggle}
      </div>
      {children}
    </div>
  );
}

// Beveled inset frame for inline-create blocks nested under a parent subsection.
function RetroInlineGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff7c2",
        padding: 10,
        borderTop: "2px solid rgba(0,0,0,0.45)",
        borderLeft: "2px solid rgba(0,0,0,0.45)",
        borderRight: "2px solid rgba(255,255,255,0.85)",
        borderBottom: "2px solid rgba(255,255,255,0.85)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

// Add plant

export function AddPlantForm({
  speciesList,
  roomList,
  locationList,
}: {
  speciesList: Species[];
  roomList: Room[];
  locationList: Location[];
}) {
  const [state, action, pending] = useActionState(addPlant, initialState);
  const router = useRouter();

  // On successful submit, jump to the new plant's detail page so the user can
  // see their plant, the auto-generated schedule, and start logging events.
  useEffect(() => {
    if (state.ok && state.id) {
      router.push(`/plants/${state.id}`);
    }
  }, [state.ok, state.id, router]);

  // Default to "existing" when records exist; fall back to inline-create otherwise.
  const [speciesMode, setSpeciesMode] = useState<SpeciesMode>(
    speciesList.length > 0 ? "existing" : "new",
  );
  const [locationMode, setLocationMode] = useState<LocationMode>(
    locationList.length > 0 ? "existing" : "new",
  );

  // Selected location filters the room dropdown.
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locationList.length > 0 ? String(locationList[0].locationId) : "",
  );

  const availableRooms = useMemo(() => {
    if (locationMode === "new" || !selectedLocationId) return [];
    const lid = Number(selectedLocationId);
    return roomList.filter((r) => r.locationId === lid);
  }, [locationMode, selectedLocationId, roomList]);

  const [roomMode, setRoomMode] = useState<RoomMode>(
    roomList.length > 0 ? "existing" : "new",
  );

  // No rooms in the chosen location → force inline-create.
  useEffect(() => {
    if (availableRooms.length === 0 && roomMode === "existing") {
      setRoomMode("new");
    }
  }, [availableRooms.length, roomMode]);

  const [ageMode, setAgeMode] = useState<AgeMode>("birthday");

  return (
    <form action={action} className="space-y-5">
      <Field label="Plant name">
        <input name="plantName" required maxLength={100} className={inputClass} />
      </Field>

      {/* Species --------------------------------------------------------- */}
      <RetroSubsection
        label="Species"
        toggle={
          speciesList.length > 0 ? (
            <SegmentToggle
              options={[
                { value: "existing", label: "Pick existing" },
                { value: "new", label: "+ Add new" },
              ]}
              value={speciesMode}
              onChange={setSpeciesMode}
            />
          ) : null
        }
      >
        {speciesMode === "existing" && speciesList.length > 0 ? (
          <RetroSelect
            name="speciesId"
            required
            placeholder="Select species…"
            options={speciesList.map((s) => ({
              value: String(s.speciesId),
              label: s.speciesName,
            }))}
          />
        ) : (
          <RetroInlineGroup>
            <input type="hidden" name="speciesId" value="new" />
            <Field label="Species name">
              <input
                name="newSpeciesName"
                required={speciesMode === "new"}
                maxLength={100}
                placeholder="e.g. Spider Plant"
                className={inputClass}
              />
            </Field>
            <Field
              label="Recommended watering interval (days)"
              hint="How often this species typically needs watering"
            >
              <input
                name="newSpeciesInterval"
                type="number"
                min="1"
                max="365"
                required={speciesMode === "new"}
                className={inputClass}
              />
            </Field>
          </RetroInlineGroup>
        )}
      </RetroSubsection>

      {/* Location: picking one filters the room dropdown below. */}
      <RetroSubsection
        label="Location"
        toggle={
          locationList.length > 0 ? (
            <SegmentToggle
              options={[
                { value: "existing", label: "Pick existing" },
                { value: "new", label: "+ Add new" },
              ]}
              value={locationMode}
              onChange={setLocationMode}
            />
          ) : null
        }
      >
        {locationMode === "existing" && locationList.length > 0 ? (
          <RetroSelect
            name="locationId"
            required
            defaultValue={selectedLocationId}
            onChange={setSelectedLocationId}
            placeholder="Select location…"
            options={locationList.map((l) => ({
              value: String(l.locationId),
              label: l.locationName,
            }))}
          />
        ) : (
          <RetroInlineGroup>
            <input type="hidden" name="locationId" value="new" />
            <Field label="Location name">
              <input
                name="newLocationName"
                required={locationMode === "new"}
                maxLength={100}
                placeholder="e.g. Home, Office"
                className={inputClass}
              />
            </Field>
          </RetroInlineGroup>
        )}
      </RetroSubsection>

      {/* Room: existing picker is scoped to the chosen location. */}
      <RetroSubsection
        label="Room"
        toggle={
          availableRooms.length > 0 ? (
            <SegmentToggle
              options={[
                { value: "existing", label: "Pick existing" },
                { value: "new", label: "+ Add new" },
              ]}
              value={roomMode}
              onChange={setRoomMode}
            />
          ) : null
        }
      >
        {roomMode === "existing" && availableRooms.length > 0 ? (
          // `key` resets the select when the location (and its room list) changes.
          <RetroSelect
            key={`room-${selectedLocationId}`}
            name="roomId"
            required
            placeholder="Select room…"
            options={availableRooms.map((r) => ({
              value: String(r.roomId),
              label: r.roomName,
            }))}
          />
        ) : (
          <RetroInlineGroup>
            <input type="hidden" name="roomId" value="new" />
            <Field label="Room name">
              <input
                name="newRoomName"
                required={roomMode === "new"}
                maxLength={100}
                placeholder="e.g. Living Room"
                className={inputClass}
              />
            </Field>
          </RetroInlineGroup>
        )}
      </RetroSubsection>

      {/* Age ------------------------------------------------------------- */}
      <RetroSubsection
        label="Age"
        toggle={
          <SegmentToggle
            options={[
              { value: "years", label: "Approx. years" },
              { value: "birthday", label: "Birthday" },
            ]}
            value={ageMode}
            onChange={setAgeMode}
          />
        }
      >
        {ageMode === "years" ? (
          <input
            name="approxAge"
            type="number"
            step="0.1"
            min="0"
            max="999"
            placeholder="e.g. 2.5"
            className={inputClass}
            style={{ minWidth: 220 }}
          />
        ) : (
          <RetroDatePicker name="birthday" max={todayIso()} placeholder="Pick a birthday…" />
        )}
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: "Times New Roman, serif",
            fontStyle: "italic",
            fontSize: 11,
            color: "#5b9b3d",
          }}
        >
          Optional. Birthday is preferred, since the displayed age stays accurate over time.
        </p>
      </RetroSubsection>

      <Field label="Pot size" hint="Optional, e.g. '6 inch'">
        <input name="potSize" maxLength={50} className={inputClass} />
      </Field>

      <FileField id="addplant-photo" label="Photo" hint="Optional. JPEG/PNG/WebP, max 5 MB">
        <FilePicker
          id="addplant-photo"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          buttonLabel="Choose photo"
        />
      </FileField>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Adding…" : "Add plant"}
      </button>
      <FormStatus state={state} successText="Plant added." />
    </form>
  );
}

// Edit plant image (inline form on detail page)

export function EditPlantImageForm({
  plantId,
  currentUrl,
}: {
  plantId: number;
  currentUrl: string | null;
}) {
  const [state, action, pending] = useActionState(updatePlantImage, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <div className="flex flex-wrap items-end gap-3">
        <FileField
          id={`plant-photo-${plantId}`}
          label={currentUrl ? "Replace photo" : "Upload photo"}
          hint="JPEG, PNG, or WebP. Max 5 MB"
        >
          <FilePicker
            id={`plant-photo-${plantId}`}
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            required
            buttonLabel={currentUrl ? "Choose replacement" : "Choose photo"}
          />
        </FileField>
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Uploading…" : "Upload"}
        </button>
      </div>
      <FormStatus state={state} successText="Photo updated." />
    </form>
  );
}

// Delete plant (with confirmation)

export function DeletePlantButton({ plantId, plantName }: { plantId: number; plantName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="retro-btn btn-bevel"
        style={{ color: "#aa0000" } as React.CSSProperties}
      >
        🗑 Delete plant
      </button>
    );
  }

  // Win95 "Are you sure?" modal-style confirmation.
  return (
    <div
      style={{
        display: "inline-block",
        background: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        borderLeft: "2px solid #ffffff",
        borderRight: "2px solid #000000",
        borderBottom: "2px solid #000000",
        padding: 2,
        boxShadow: "3px 3px 0 rgba(0,0,0,0.45)",
        maxWidth: 480,
      }}
    >
      {/* Title bar: red gradient for "danger" */}
      <div
        style={{
          background: "linear-gradient(90deg, #800000 0%, #cc3333 100%)",
          color: "#fff",
          fontFamily: "Tahoma, Geneva, sans-serif",
          fontWeight: 700,
          fontSize: 11,
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textShadow: "1px 1px 0 #000",
          letterSpacing: 0.5,
        }}
      >
        <span>⚠ delete_plant.exe :: Are you sure?</span>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          aria-label="Close"
          style={{
            width: 16, height: 14, background: "#c0c0c0", color: "#000",
            border: "1px solid #000",
            borderTop: "1px solid #fff", borderLeft: "1px solid #fff",
            fontSize: 10, lineHeight: 1, padding: 0,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            textShadow: "none",
          }}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          background: "#fffce8",
          borderTop: "1px solid #808080",
          borderLeft: "1px solid #808080",
          borderRight: "1px solid #ffffff",
          borderBottom: "1px solid #ffffff",
          padding: 12,
          fontFamily: "Tahoma, sans-serif",
          fontSize: 12,
          color: "#1a3d10",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span className="wiggle" style={{ fontSize: 28, flexShrink: 0, lineHeight: 1 }}>
            ⚠️
          </span>
          <div>
            <p style={{ margin: 0, fontWeight: 700 }}>
              Delete <span style={{ color: "#aa0000" }}>{plantName}</span> and
              its entire care history??
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "Times New Roman, serif",
                fontStyle: "italic",
                fontSize: 12,
                color: "#5b0000",
              }}
            >
              This cannot be undone!! 😱
            </p>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="retro-btn btn-bevel"
          >
            ← Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await deletePlant(plantId);
                router.push("/plants");
              });
            }}
            className="retro-btn btn-bevel"
            style={{ color: "#aa0000" } as React.CSSProperties}
          >
            {pending ? "🗑 Deleting…" : "🗑 Yes, delete it"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Log watering

export function LogWateringForm({ plantId }: { plantId: number }) {
  const [state, action, pending] = useActionState(logWatering, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <Field label="Date">
        <RetroDatePicker name="wateredOn" defaultValue={todayIso()} required />
      </Field>
      <Field label="Notes" hint="Optional">
        <textarea name="notes" rows={2} className={inputClass} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Log watering"}
      </button>
      <FormStatus state={state} successText="Watering logged." />
    </form>
  );
}

// Schedule a watering

export function ScheduleWateringForm({ plantId }: { plantId: number }) {
  const [state, action, pending] = useActionState(scheduleWatering, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <Field label="Scheduled date">
        <RetroDatePicker name="scheduledDate" required />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Schedule"}
      </button>
      <FormStatus state={state} successText="Scheduled." />
    </form>
  );
}

// Log fertilization

export function LogFertilizationForm({ plantId }: { plantId: number }) {
  const [state, action, pending] = useActionState(logFertilization, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <Field label="Fertilizer type">
        <input
          name="fertType"
          required
          maxLength={100}
          placeholder="e.g. Liquid 10-10-10"
          className={inputClass}
        />
      </Field>
      <Field label="Date applied">
        <RetroDatePicker name="dateApplied" defaultValue={todayIso()} required />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Log fertilization"}
      </button>
      <FormStatus state={state} successText="Fertilization logged." />
    </form>
  );
}

// Log repotting

export function LogRepottingForm({
  plantId,
  currentPotSize,
}: {
  plantId: number;
  currentPotSize: string | null;
}) {
  const [state, action, pending] = useActionState(logRepotting, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <input type="hidden" name="previousPotSize" value={currentPotSize ?? ""} />
      <Field label="New pot size">
        <input
          name="newPotSize"
          required
          maxLength={50}
          placeholder="e.g. 8 inch"
          className={inputClass}
        />
      </Field>
      <Field
        label="Date"
        hint={currentPotSize ? `Previous pot size: ${currentPotSize}` : undefined}
      >
        <RetroDatePicker name="repottedOn" defaultValue={todayIso()} required />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Log repotting"}
      </button>
      <FormStatus state={state} successText="Repotting logged." />
    </form>
  );
}

// Log health observation

export function LogHealthObservationForm({ plantId }: { plantId: number }) {
  const [state, action, pending] = useActionState(logHealthObservation, initialState);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="plantId" value={plantId} />
      <Field label="Date">
        <RetroDatePicker name="observationDate" defaultValue={todayIso()} />
      </Field>
      <Field label="Observation">
        <textarea
          name="notes"
          required
          rows={3}
          maxLength={500}
          placeholder="e.g. New leaf unfurling, yellow leaves appearing, pest spotted…"
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Log observation"}
      </button>
      <FormStatus state={state} successText="Observation logged." />
    </form>
  );
}

// Settings forms: species, location, room

export function AddSpeciesForm() {
  const [state, action, pending] = useActionState(addSpecies, initialState);
  return (
    <form action={action} className="space-y-3">
      <Field label="Species name">
        <input name="speciesName" required maxLength={100} className={inputClass} />
      </Field>
      <Field
        label="Recommended watering interval (days)"
        hint="How often this species typically needs watering"
      >
        <input
          name="recommWaterInterval"
          type="number"
          min="1"
          max="365"
          required
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Add species"}
      </button>
      <FormStatus state={state} successText="Species added." />
    </form>
  );
}

export function AddLocationForm() {
  const [state, action, pending] = useActionState(addLocation, initialState);
  return (
    <form action={action} className="space-y-3">
      <Field label="Location name">
        <input
          name="locationName"
          required
          maxLength={100}
          placeholder="e.g. Home, Office"
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Add location"}
      </button>
      <FormStatus state={state} successText="Location added." />
    </form>
  );
}

export function AddRoomForm({ locations }: { locations: Location[] }) {
  const [state, action, pending] = useActionState(addRoom, initialState);
  return (
    <form action={action} className="space-y-3">
      <Field label="Location">
        <RetroSelect
          name="locationId"
          required
          placeholder="Select location…"
          options={locations.map((l) => ({
            value: String(l.locationId),
            label: l.locationName,
          }))}
        />
      </Field>
      <Field label="Room name">
        <input
          name="roomName"
          required
          maxLength={100}
          placeholder="e.g. Living Room"
          className={inputClass}
        />
      </Field>
      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Saving…" : "Add room"}
      </button>
      <FormStatus state={state} successText="Room added." />
    </form>
  );
}

// Sign the guestbook ★ Retro Edition ★

const MOOD_OPTIONS = ["🌿", "✨", "🌸", "🌻", "🍀", "🌱", "💧", "☀️", "💀", "🤖", "🦄", "🐌"];

export function SignGuestbookForm() {
  const [state, action, pending] = useActionState(signGuestbook, initialState);
  const [mood, setMood] = useState<string>("");

  // Bump the form's key after a successful submit to clear uncontrolled inputs.
  const [submitNonce, setSubmitNonce] = useState(0);
  if (state.ok && submitNonce === 0) {
    queueMicrotask(() => setSubmitNonce(1));
  }

  return (
    <form action={action} key={submitNonce} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Your name">
          <input
            name="visitorName"
            required
            maxLength={60}
            placeholder="e.g. GardenGal98"
            className={inputClass}
          />
        </Field>
        <Field label="Where ya from?" hint="Optional. City, state, country, whatever">
          <input
            name="location"
            maxLength={80}
            placeholder="e.g. Cleveland, OH"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Mood" hint="Optional. Pick an emoji to sign off with">
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            padding: 6,
            background: "#fff",
            border: "2px inset #808080",
          }}
        >
          {MOOD_OPTIONS.map((m) => (
            <button
              type="button"
              key={m}
              onClick={() => setMood(mood === m ? "" : m)}
              aria-pressed={mood === m}
              style={{
                width: 30,
                height: 30,
                fontSize: 18,
                lineHeight: 1,
                background: mood === m ? "#ffd400" : "#c0c0c0",
                borderTop: mood === m ? "2px solid #808080" : "2px solid #fff",
                borderLeft: mood === m ? "2px solid #808080" : "2px solid #fff",
                borderRight: mood === m ? "2px solid #fff" : "2px solid #000",
                borderBottom: mood === m ? "2px solid #fff" : "2px solid #000",
                cursor: "url(/cursors/vine-precision.cur), pointer",
                padding: 0,
              }}
            >
              {m}
            </button>
          ))}
          <input type="hidden" name="mood" value={mood} />
        </div>
      </Field>

      <Field label="Message">
        <textarea
          name="message"
          required
          rows={4}
          maxLength={500}
          placeholder="Drop a sign of life…"
          className={inputClass}
        />
      </Field>

      <button type="submit" disabled={pending} className={buttonClass}>
        {pending ? "Signing…" : "✒ Sign guestbook"}
      </button>
      <FormStatus state={state} successText="✨ Thanks for signing!! ✨" />
    </form>
  );
}
