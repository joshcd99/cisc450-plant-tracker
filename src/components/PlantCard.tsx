// Plant card used on the dashboard and plants list.

import Link from "next/link";
import { formatAge, plantAge } from "@/lib/plantAge";

type PlantCardProps = {
  plantId: number;
  plantName: string;
  speciesName: string;
  roomName: string;
  locationName: string;
  approxAge: string | null;
  birthday: string | null;
  potSize: string | null;
  imageUrl: string | null;
  recommWaterInterval?: number;
};

export function PlantCard(p: PlantCardProps) {
  const ageLabel = formatAge(plantAge({ approxAge: p.approxAge, birthday: p.birthday }));
  return (
    <Link
      href={`/plants/${p.plantId}`}
      className="group"
      style={{
        display: "block",
        textDecoration: "none",
        background: "#c0c0c0",
        borderTop: "2px solid #ffffff",
        borderLeft: "2px solid #ffffff",
        borderRight: "2px solid #000000",
        borderBottom: "2px solid #000000",
        padding: 2,
        boxShadow: "2px 2px 0 rgba(0,0,0,0.35)",
        color: "#1a3d10",
      }}
    >
      <div
        style={{
          background: "linear-gradient(90deg, #1a3d10 0%, #5b9b3d 100%)",
          color: "#fff7c2",
          fontFamily: "Tahoma, Geneva, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          padding: "3px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textShadow: "1px 1px 0 #000",
          letterSpacing: 0.5,
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "block",
            paddingRight: 8,
          }}
        >
          🪴 {p.plantName}.bmp
        </span>
        <span style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          <span
            style={{
              width: 14,
              height: 12,
              background: "#c0c0c0",
              border: "1px solid #000",
              color: "#000",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              textShadow: "none",
            }}
          >
            _
          </span>
          <span
            style={{
              width: 14,
              height: 12,
              background: "#c0c0c0",
              border: "1px solid #000",
              color: "#000",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              textShadow: "none",
            }}
          >
            ×
          </span>
        </span>
      </div>
      <div
        style={{
          background: "#fffce8",
          borderTop: "1px solid #808080",
          borderLeft: "1px solid #808080",
          borderRight: "1px solid #ffffff",
          borderBottom: "1px solid #ffffff",
          padding: 8,
        }}
      >
        <div
          style={{
            aspectRatio: "4 / 3",
            width: "100%",
            background: "#dff3d5",
            overflow: "hidden",
            borderTop: "2px solid rgba(0,0,0,0.45)",
            borderLeft: "2px solid rgba(0,0,0,0.45)",
            borderRight: "2px solid rgba(255,255,255,0.85)",
            borderBottom: "2px solid rgba(255,255,255,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.imageUrl}
              alt={p.plantName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 200ms",
              }}
              className="group-hover:scale-105"
            />
          ) : (
            <span style={{ fontSize: 48, color: "#5b9b3d" }}>🌿</span>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: "Comic Sans MS, cursive",
                fontWeight: 900,
                fontSize: 16,
                color: "#1a3d10",
                textShadow: "1px 1px 0 #fff",
                textDecoration: "underline",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {p.plantName}
            </h3>
            {ageLabel && (
              <span
                style={{
                  flexShrink: 0,
                  fontFamily: "Courier New, monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#5a2a00",
                  background: "#ffd400",
                  border: "1px solid #5a2a00",
                  padding: "1px 5px",
                }}
              >
                {ageLabel} old
              </span>
            )}
          </div>

          <p
            style={{
              margin: "4px 0 0",
              fontFamily: "Times New Roman, serif",
              fontStyle: "italic",
              fontSize: 13,
              color: "#2c5e1a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            ✿ {p.speciesName}
          </p>

          {/* Location and Room are independent, so each gets its own line. */}
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "Tahoma, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "#1a3d10",
            }}
          >
            🏡 {p.locationName}
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontFamily: "Tahoma, sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: "#1a3d10",
            }}
          >
            📍 {p.roomName}
          </p>

          {(p.recommWaterInterval !== undefined || p.potSize) && (
            <p
              style={{
                margin: "3px 0 0",
                fontFamily: "Tahoma, sans-serif",
                fontSize: 11,
                color: "#5b9b3d",
              }}
            >
              {p.recommWaterInterval !== undefined && (
                <>💧 every {p.recommWaterInterval}d</>
              )}
              {p.potSize && (
                <>
                  {p.recommWaterInterval !== undefined ? " · " : ""}
                  🪴 {p.potSize}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
