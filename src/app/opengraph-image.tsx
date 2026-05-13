import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Mirrors the site's top header (outer diagonal-stripe frame, beige inner
// panel, rainbow WordArt title). Satori supports background-clip: text via
// the camelCased property, so the rainbow gradient renders inside the letters
// just like on the site.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 20,
          backgroundColor: "#000",
          backgroundImage:
            "repeating-linear-gradient(45deg, #1a3d10 0 12px, #2c5e1a 12px 24px)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            border: "6px solid #ffd400",
            padding: 10,
            backgroundImage:
              "repeating-linear-gradient(45deg, #1a3d10 0 12px, #2c5e1a 12px 24px)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fffce8",
              border: "6px solid #1a3d10",
              padding: "32px 50px",
            }}
          >
            {/* Rainbow WordArt title with chunky drop shadow (mirrors .wordart) */}
            <div
              style={{
                display: "flex",
                fontSize: 78,
                fontWeight: 900,
                letterSpacing: 1,
                lineHeight: 1.05,
                color: "transparent",
                backgroundImage:
                  "linear-gradient(90deg, #ff0000, #ff9900, #ffee00, #00cc44, #0099ff, #aa00ff, #ff0099)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                textShadow:
                  "2px 2px 0 #fff, 3px 3px 0 #000, 5px 5px 0 rgba(0,0,0,0.25)",
              }}
            >
              PLANT CARE TRACKER
            </div>

            {/* Subtitle */}
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 28,
                color: "#1a3d10",
                fontWeight: 700,
                textShadow: "2px 2px 0 #fff",
              }}
            >
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </div>

            {/* Badge row: red NEW! / gold CISC 450 / green HOT! */}
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <span
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#fff",
                  backgroundColor: "#aa0000",
                  padding: "6px 14px",
                  border: "3px solid #5a0000",
                  letterSpacing: 1,
                }}
              >
                NEW!
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#000",
                  backgroundColor: "#ffd400",
                  padding: "6px 14px",
                  border: "3px solid #5a2a00",
                  letterSpacing: 1,
                }}
              >
                CISC 450 FINAL PROJECT
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 900,
                  color: "#fff",
                  backgroundColor: "#5b9b3d",
                  padding: "6px 14px",
                  border: "3px solid #1a3d10",
                  letterSpacing: 1,
                }}
              >
                HOT!
              </span>
            </div>

            {/* Bobbing emoji row */}
            <div style={{ display: "flex", gap: 24, marginTop: 24, fontSize: 56 }}>
              <span>🌱</span>
              <span>🌻</span>
              <span>🌿</span>
            </div>

            {/* URL footer */}
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 18,
                fontFamily: "monospace",
                color: "#5b9b3d",
                fontWeight: 700,
              }}
            >
              plants.auriga.fyi
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
