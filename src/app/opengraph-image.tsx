import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Mirrors the site's top header: diagonal-stripe outer frame with a gold
// border, beige inner panel with a green border, chunky drop-shadowed
// WordArt-style title. Stars/dingbats are avoided because Satori's default
// font doesn't carry those glyphs; we use the emoji that did render
// (plant + flower) and lean on color/shadow for the retro feel.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 24,
          backgroundColor: "#1a3d10",
          backgroundImage:
            "repeating-linear-gradient(45deg, #1a3d10 0 14px, #2c5e1a 14px 28px)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            border: "6px solid #ffd400",
            padding: 14,
            backgroundColor: "#1a3d10",
            backgroundImage:
              "repeating-linear-gradient(45deg, #1a3d10 0 14px, #2c5e1a 14px 28px)",
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
              padding: "40px 60px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 104,
                fontWeight: 900,
                color: "#ffd400",
                textShadow:
                  "4px 4px 0 #aa0000, 8px 8px 0 #000, 12px 12px 0 rgba(0,0,0,0.25)",
                letterSpacing: 2,
              }}
            >
              PLANT CARE TRACKER
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 24,
                fontSize: 38,
                color: "#1a3d10",
                fontStyle: "italic",
                textShadow: "2px 2px 0 #fff",
              }}
            >
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
              <span
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#fff",
                  backgroundColor: "#aa0000",
                  padding: "8px 18px",
                  border: "3px solid #5a0000",
                  letterSpacing: 1,
                }}
              >
                NEW!
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#000",
                  backgroundColor: "#ffd400",
                  padding: "8px 18px",
                  border: "3px solid #5a2a00",
                  letterSpacing: 1,
                }}
              >
                CISC 450 FINAL PROJECT
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 26,
                  fontWeight: 900,
                  color: "#fff",
                  backgroundColor: "#5b9b3d",
                  padding: "8px 18px",
                  border: "3px solid #1a3d10",
                  letterSpacing: 1,
                }}
              >
                HOT!
              </span>
            </div>

            <div
              style={{ display: "flex", gap: 22, marginTop: 26, fontSize: 60 }}
            >
              <span>🌱</span>
              <span>🌻</span>
              <span>🌿</span>
              <span>🪴</span>
              <span>🍃</span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 22,
                fontFamily: "monospace",
                color: "#5b9b3d",
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
