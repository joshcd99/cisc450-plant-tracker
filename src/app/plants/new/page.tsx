import Link from "next/link";
import { listLocations, listRooms, listSpecies } from "@/db/queries";
import { AddPlantForm } from "@/components/forms";
import { Card, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function NewPlantPage() {
  // Pull all three lookup tables. The form can pick an existing entry from
  // any of them or create a new one inline, so we always need the full list
  // even when there are no rows (the empty list disables the toggle).
  const [speciesList, rooms, locations] = await Promise.all([
    listSpecies(),
    listRooms(),
    listLocations(),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeader
        title="Add a plant"
        subtitle="Catalog a new plant in your collection. Species, rooms, and locations can be picked from existing ones or created inline."
      />

      <Card>
        <AddPlantForm
          speciesList={speciesList}
          roomList={rooms}
          locationList={locations}
        />
      </Card>

      <p className="text-sm text-stone-500">
        <Link href="/plants" className="hover:underline">
          ← Back to plants
        </Link>
      </p>
    </div>
  );
}
