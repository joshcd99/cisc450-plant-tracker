import { listLocations, listRooms, listSpecies } from "@/db/queries";
import {
  AddLocationForm,
  AddRoomForm,
  AddSpeciesForm,
} from "@/components/forms";
import { Card, EmptyState, SectionHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

const DKGREEN = "#1a3d10";
const GOLD = "#ffd400";

export default async function SettingsPage() {
  const [speciesList, locations, rooms] = await Promise.all([
    listSpecies(),
    listLocations(),
    listRooms(),
  ]);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Settings"
        subtitle="Manage the lookup data used when adding plants and filtering views."
      />

      <hr className="rainbow-hr" />
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="add_species.exe">
          <Heading icon="✿" label="Add species" />
          <AddSpeciesForm />
        </Card>
        <Card title={`species_db.txt :: ${speciesList.length} record${speciesList.length === 1 ? "" : "s"}`}>
          <Heading icon="📋" label={`Existing species (${speciesList.length})`} />
          {speciesList.length === 0 ? (
            <EmptyState>No species yet.</EmptyState>
          ) : (
            <DataList>
              {speciesList.map((s, i) => (
                <DataRow
                  key={s.speciesId}
                  alt={i % 2 === 1}
                  primary={<>✿ {s.speciesName}</>}
                  secondary={
                    <span>
                      💧 every{" "}
                      <span style={{ fontWeight: 900 }}>
                        {s.recommWaterInterval}
                      </span>
                      d
                    </span>
                  }
                />
              ))}
            </DataList>
          )}
        </Card>
      </section>

      <hr className="rainbow-hr" />
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="add_location.exe">
          <Heading icon="🏠" label="Add location" />
          <AddLocationForm />
        </Card>
        <Card title={`location_db.txt :: ${locations.length} record${locations.length === 1 ? "" : "s"}`}>
          <Heading icon="📋" label={`Existing locations (${locations.length})`} />
          {locations.length === 0 ? (
            <EmptyState>No locations yet.</EmptyState>
          ) : (
            <DataList>
              {locations.map((l, i) => (
                <DataRow
                  key={l.locationId}
                  alt={i % 2 === 1}
                  primary={<>🏠 {l.locationName}</>}
                />
              ))}
            </DataList>
          )}
        </Card>
      </section>

      <hr className="rainbow-hr" />
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="add_room.exe">
          <Heading icon="🚪" label="Add room" />
          {locations.length === 0 ? (
            <EmptyState>Add a location first.</EmptyState>
          ) : (
            <AddRoomForm locations={locations} />
          )}
        </Card>
        <Card title={`room_db.txt :: ${rooms.length} record${rooms.length === 1 ? "" : "s"}`}>
          <Heading icon="📋" label={`Existing rooms (${rooms.length})`} />
          {rooms.length === 0 ? (
            <EmptyState>No rooms yet.</EmptyState>
          ) : (
            <DataList>
              {rooms.map((r, i) => (
                <DataRow
                  key={r.roomId}
                  alt={i % 2 === 1}
                  primary={<>🚪 {r.roomName}</>}
                  secondary={<>🏠 {r.locationName}</>}
                />
              ))}
            </DataList>
          )}
        </Card>
      </section>
    </div>
  );
}

function Heading({ icon, label }: { icon: string; label: string }) {
  return (
    <h2
      style={{
        margin: "0 0 10px",
        fontFamily: "Comic Sans MS, cursive",
        fontWeight: 900,
        fontSize: 16,
        color: DKGREEN,
        textShadow: `1px 1px 0 #fff, 2px 2px 0 ${GOLD}`,
      }}
    >
      <span className="wiggle" style={{ display: "inline-block", marginRight: 4 }}>
        {icon}
      </span>
      {label}
    </h2>
  );
}

function DataList({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        background: "#fff",
        borderTop: "2px solid rgba(0,0,0,0.45)",
        borderLeft: "2px solid rgba(0,0,0,0.45)",
        borderRight: "2px solid rgba(255,255,255,0.85)",
        borderBottom: "2px solid rgba(255,255,255,0.85)",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      {children}
    </ul>
  );
}

function DataRow({
  primary,
  secondary,
  alt = false,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "5px 10px",
        background: alt ? "#f3fbe9" : "#fffce8",
        borderBottom: "1px dashed #b8d3a6",
        fontFamily: "Tahoma, sans-serif",
        fontSize: 12,
      }}
    >
      <span
        style={{
          fontFamily: "Comic Sans MS, cursive",
          fontWeight: 700,
          color: DKGREEN,
        }}
      >
        {primary}
      </span>
      {secondary && (
        <span
          style={{
            fontFamily: "Courier New, monospace",
            fontSize: 11,
            color: "#5b9b3d",
            fontWeight: 700,
          }}
        >
          {secondary}
        </span>
      )}
    </li>
  );
}
