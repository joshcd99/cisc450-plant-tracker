import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCareSummary,
  getFertilizationHistory,
  getHealthObservations,
  getLastWatered,
  getRepottingHistory,
  getUpcomingSchedules,
  getWateringHistory,
} from "@/db/queries";
import {
  DeletePlantButton,
  EditPlantImageForm,
  LogFertilizationForm,
  LogHealthObservationForm,
  LogRepottingForm,
  LogWateringForm,
  ScheduleWateringForm,
} from "@/components/forms";
import { Card, SectionHeader } from "@/components/ui";
import { Win95Window } from "@/components/Retro";
import { formatAge, plantAge } from "@/lib/plantAge";

export const dynamic = "force-dynamic";

const GOLD       = "#ffd400";
const DKGREEN    = "#1a3d10";
const CREAM      = "#fffce8";
const LEAF_LIGHT = "#dff3d5";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plantId = Number(id);
  if (!Number.isFinite(plantId)) notFound();

  const [
    summary,
    lastWatered,
    wateringHistory,
    fertHistory,
    repotHistory,
    healthLog,
    upcomingSchedules,
  ] = await Promise.all([
    getCareSummary(plantId),
    getLastWatered(plantId),
    getWateringHistory(plantId),
    getFertilizationHistory(plantId),
    getRepottingHistory(plantId),
    getHealthObservations(plantId),
    getUpcomingSchedules(plantId),
  ]);

  if (!summary) notFound();

  return (
    <div className="space-y-8">
      <Win95Window title={`plant_profile.exe :: ${summary.plantName}`}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              flexShrink: 0,
              background: LEAF_LIGHT,
              overflow: "hidden",
              borderTop: "3px solid rgba(0,0,0,0.55)",
              borderLeft: "3px solid rgba(0,0,0,0.55)",
              borderRight: "3px solid rgba(255,255,255,0.9)",
              borderBottom: "3px solid rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.7)",
            }}
          >
            {summary.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={summary.imageUrl}
                alt={summary.plantName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 64, color: "#5b9b3d" }}>🌿</span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 220 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "Tahoma, sans-serif",
                fontSize: 11,
                letterSpacing: 1,
                textTransform: "uppercase",
                color: "#5b9b3d",
                fontWeight: 700,
              }}
            >
              ✿ Species
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: "Times New Roman, serif",
                fontStyle: "italic",
                fontSize: 18,
                color: DKGREEN,
              }}
            >
              {summary.speciesName}
            </p>

            <h1
              className="wordart"
              style={{
                margin: "10px 0 0",
                fontSize: 38,
                lineHeight: 1.05,
              }}
            >
              {summary.plantName}
            </h1>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                alignItems: "center",
                fontFamily: "Tahoma, sans-serif",
                fontSize: 12,
              }}
            >
              <Pill emoji="🏡" color="#1a3d10" bg={LEAF_LIGHT}>
                {summary.locationName}
              </Pill>
              <Pill emoji="📍" color="#1a3d10" bg={LEAF_LIGHT}>
                {summary.roomName}
              </Pill>
              <Pill emoji="💧" color="#003a5b" bg="#cfeaff">
                Water every {summary.recommWaterInterval} day
                {summary.recommWaterInterval === 1 ? "" : "s"}
              </Pill>
              {(() => {
                const age = formatAge(
                  plantAge({
                    approxAge: summary.approxAge,
                    birthday: summary.birthday,
                  }),
                );
                if (!age) return null;
                return (
                  <Pill emoji="🎂" color="#5a2a00" bg="#ffe69e">
                    {age} old
                    {summary.birthday && (
                      <span
                        style={{
                          marginLeft: 4,
                          fontFamily: "Courier New, monospace",
                          fontSize: 10,
                          color: "#7a5c00",
                          fontWeight: 400,
                        }}
                      >
                        (born {summary.birthday})
                      </span>
                    )}
                  </Pill>
                );
              })()}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Link href="/plants" className="retro-btn btn-bevel">
                ◄ Back to plants
              </Link>
              <DeletePlantButton
                plantId={plantId}
                plantName={summary.plantName}
              />
            </div>
          </div>
        </div>
      </Win95Window>

      <Card title="upload_photo.exe">
        <EditPlantImageForm plantId={plantId} currentUrl={summary.imageUrl} />
      </Card>

      <hr className="rainbow-hr" />
      <section>
        <SectionHeader
          title="Care summary"
          subtitle="The most recent of each event type"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile
            icon="💧"
            label="Last watered"
            accent="#ff52b1"
            value={lastWatered ? lastWatered.lastWateredOn : "Never"}
            subValue={
              lastWatered
                ? `${lastWatered.daysAgo} day${lastWatered.daysAgo === 1 ? "" : "s"} ago`
                : undefined
            }
          />
          <SummaryTile
            icon="🌱"
            label="Last fertilized"
            accent="#22aa22"
            value={summary.lastFertilization?.date ?? "Never"}
            subValue={summary.lastFertilization?.fertType}
          />
          <SummaryTile
            icon="🪴"
            label="Last repotted"
            accent="#cc7700"
            value={summary.lastRepotting?.date ?? "Never"}
            subValue={
              summary.lastRepotting
                ? `${summary.lastRepotting.previousPotSize ?? "?"} → ${summary.lastRepotting.newPotSize}`
                : undefined
            }
          />
          <SummaryTile
            icon="🩺"
            label="Recent observation"
            accent="#0088dd"
            value={summary.lastHealthObservation?.date ?? "None"}
            subValue={summary.lastHealthObservation?.notes ?? undefined}
          />
        </div>
      </section>

      <hr className="rainbow-hr" />
      <section>
        <SectionHeader
          title="Log an event"
          subtitle="Record care activity for this plant"
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="water.exe">
            <FormHeading emoji="💧" label="Water" />
            <LogWateringForm plantId={plantId} />
          </Card>
          <Card title="schedule.exe">
            <FormHeading emoji="📆" label="Schedule next watering" />
            <ScheduleWateringForm plantId={plantId} />
          </Card>
          <Card title="fertilize.exe">
            <FormHeading emoji="🌱" label="Fertilize" />
            <LogFertilizationForm plantId={plantId} />
          </Card>
          <Card title="repot.exe">
            <FormHeading emoji="🪴" label="Repot" />
            <LogRepottingForm
              plantId={plantId}
              currentPotSize={summary.lastRepotting?.newPotSize ?? null}
            />
          </Card>
          <Card title="observe.exe" className="lg:col-span-2">
            <FormHeading emoji="🩺" label="Health observation" />
            <LogHealthObservationForm plantId={plantId} />
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HistoryWindow
          title="watering_log.txt"
          heading="Watering history"
          icon="💧"
          empty="No waterings logged yet."
          items={wateringHistory.map((w) => ({
            id: w.waterEventId,
            date: w.wateredOn,
            note: w.notes,
          }))}
        />
        <HistoryWindow
          title="upcoming.txt"
          heading="Upcoming schedule"
          icon="📆"
          empty="Nothing scheduled."
          items={upcomingSchedules.map((s) => ({
            id: s.scheduleId,
            date: s.scheduledDate,
            note: null,
          }))}
        />
        <HistoryWindow
          title="fertilizer_log.txt"
          heading="Fertilization history"
          icon="🌱"
          empty="No fertilizations logged."
          items={fertHistory.map((f) => ({
            id: f.fertId,
            date: f.dateApplied,
            note: f.fertType,
          }))}
        />
        <HistoryWindow
          title="repot_log.txt"
          heading="Repotting history"
          icon="🪴"
          empty="No repottings logged."
          items={repotHistory.map((r) => ({
            id: r.repottingId,
            date: r.repottedOn,
            note: `${r.previousPotSize ?? "?"} → ${r.newPotSize}`,
          }))}
        />
        <HistoryWindow
          className="lg:col-span-2"
          title="observations.txt"
          heading="Health observations"
          icon="🩺"
          empty="No observations logged."
          items={healthLog.map((h) => ({
            id: h.healthId,
            date: h.observationDate,
            note: h.notes,
          }))}
        />
      </section>
    </div>
  );
}

function Pill({
  emoji,
  bg,
  color,
  children,
}: {
  emoji: string;
  bg: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        background: bg,
        color,
        borderTop: "2px solid rgba(255,255,255,0.8)",
        borderLeft: "2px solid rgba(255,255,255,0.8)",
        borderRight: "2px solid rgba(0,0,0,0.45)",
        borderBottom: "2px solid rgba(0,0,0,0.45)",
        fontWeight: 700,
      }}
    >
      <span>{emoji}</span>
      <span>{children}</span>
    </span>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  accent: string;
}) {
  return (
    <div
      style={{
        background: CREAM,
        borderTop: "2px solid rgba(255,255,255,0.85)",
        borderLeft: "2px solid rgba(255,255,255,0.85)",
        borderRight: "2px solid rgba(0,0,0,0.45)",
        borderBottom: "2px solid rgba(0,0,0,0.45)",
        padding: 10,
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "Tahoma, sans-serif",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#5b9b3d",
          fontWeight: 700,
        }}
      >
        <span style={{ marginRight: 4 }}>{icon}</span>
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontFamily: "Impact, Arial Black, sans-serif",
          fontWeight: 900,
          fontSize: 22,
          lineHeight: 1.1,
          color: accent,
          textShadow: "1px 1px 0 #fff, 2px 2px 0 rgba(0,0,0,0.25)",
        }}
      >
        {value}
      </p>
      {subValue && (
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: "Times New Roman, serif",
            fontStyle: "italic",
            fontSize: 12,
            color: DKGREEN,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {subValue}
        </p>
      )}
    </div>
  );
}

function FormHeading({ emoji, label }: { emoji: string; label: string }) {
  return (
    <h3
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
        {emoji}
      </span>
      {label}
    </h3>
  );
}

function HistoryWindow({
  title,
  heading,
  icon,
  items,
  empty,
  className = "",
}: {
  title: string;
  heading: string;
  icon: string;
  items: { id: number; date: string; note: string | null }[];
  empty: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Card title={title}>
        <h3
          style={{
            margin: "0 0 8px",
            fontFamily: "Comic Sans MS, cursive",
            fontWeight: 900,
            fontSize: 15,
            color: DKGREEN,
            textShadow: "1px 1px 0 #fff",
          }}
        >
          <span className="bob" style={{ display: "inline-block", marginRight: 4 }}>
            {icon}
          </span>
          ✦ {heading} ✦
        </h3>
        {items.length === 0 ? (
          <div
            style={{
              border: "2px dashed var(--leaf-dark)",
              background: "#fff7c2",
              padding: 12,
              textAlign: "center",
              fontFamily: "Comic Sans MS, cursive",
              color: "#2c5e1a",
              fontSize: 13,
            }}
          >
            <span className="bob" style={{ display: "inline-block", marginRight: 4 }}>
              🌱
            </span>
            {empty}
          </div>
        ) : (
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
            }}
          >
            {items.map((item, i) => (
              <li
                key={item.id}
                style={{
                  padding: "5px 10px",
                  background: i % 2 === 0 ? "#fffce8" : "#f3fbe9",
                  borderBottom:
                    i < items.length - 1 ? "1px dashed #b8d3a6" : "none",
                  fontFamily: "Tahoma, sans-serif",
                  fontSize: 12,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "Courier New, monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: DKGREEN,
                  }}
                >
                  ▸ {item.date}
                </p>
                {item.note && (
                  <p
                    style={{
                      margin: "2px 0 0 14px",
                      fontStyle: "italic",
                      color: "#2c5e1a",
                      fontSize: 12,
                    }}
                  >
                    {item.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
