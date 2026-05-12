import Link from "next/link";
import { listLocations, listPlants, listRooms } from "@/db/queries";
import { Card, SectionHeader } from "@/components/ui";
import { SearchablePlants } from "@/components/SearchablePlants";
import { RetroSelect } from "@/components/RetroSelect";

export const dynamic = "force-dynamic";

export default async function PlantsPage({
  searchParams,
}: {
  searchParams: Promise<{ roomId?: string; locationId?: string }>;
}) {
  const params = await searchParams;
  const roomId = params.roomId ? Number(params.roomId) : undefined;
  const locationId = params.locationId ? Number(params.locationId) : undefined;

  const [allPlants, rooms, locations] = await Promise.all([
    listPlants({ roomId, locationId }),
    listRooms(),
    listLocations(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="All plants"
        subtitle={`${allPlants.length} plant${allPlants.length === 1 ? "" : "s"} ${
          roomId || locationId ? "matching filters" : "in your collection"
        }`}
        action={
          <Link href="/plants/new" className="retro-btn btn-bevel">
            ➕ Add plant
          </Link>
        }
      />

      <Card className="!p-4">
        <form className="flex flex-wrap items-end gap-3 text-sm">
          <label style={{ display: "block", minWidth: 180 }}>
            <span
              style={{
                display: "block",
                marginBottom: 4,
                fontFamily: "Comic Sans MS, cursive",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--leaf-dark)",
              }}
            >
              ★ Location
            </span>
            <RetroSelect
              name="locationId"
              defaultValue={locationId !== undefined ? String(locationId) : ""}
              placeholder="All locations"
              options={[
                { value: "", label: "All locations" },
                ...locations.map((l) => ({
                  value: String(l.locationId),
                  label: l.locationName,
                })),
              ]}
            />
          </label>
          <label style={{ display: "block", minWidth: 220 }}>
            <span
              style={{
                display: "block",
                marginBottom: 4,
                fontFamily: "Comic Sans MS, cursive",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--leaf-dark)",
              }}
            >
              ★ Room
            </span>
            <RetroSelect
              name="roomId"
              defaultValue={roomId !== undefined ? String(roomId) : ""}
              placeholder="All rooms"
              options={[
                { value: "", label: "All rooms" },
                ...rooms.map((r) => ({
                  value: String(r.roomId),
                  // Location is parenthetical so duplicate room names disambiguate.
                  label: `${r.roomName} (${r.locationName})`,
                })),
              ]}
            />
          </label>
          <button type="submit" className="retro-btn btn-bevel">
            Apply
          </button>
          {(roomId || locationId) && (
            <Link href="/plants" className="retro-btn btn-bevel">
              Reset
            </Link>
          )}
        </form>
      </Card>

      <SearchablePlants
        plants={allPlants.map((p) => ({
          plantId: p.plantId,
          plantName: p.plantName,
          speciesName: p.speciesName,
          roomName: p.roomName,
          locationName: p.locationName,
          approxAge: p.approxAge,
          birthday: p.birthday,
          potSize: p.potSize,
          imageUrl: p.imageUrl,
          recommWaterInterval: p.recommWaterInterval,
        }))}
      />
    </div>
  );
}
