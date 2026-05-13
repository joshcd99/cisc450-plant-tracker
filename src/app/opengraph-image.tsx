import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Generated at build/request time by Satori. Only flexbox is supported (no
// grid) and only a handful of CSS properties; the retro look is faked with
// chunky text-shadows, ridge borders, and emoji.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a3d10 0%, #5b9b3d 60%, #2c5e1a 100%)",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            background: "rgba(255, 252, 232, 0.06)",
            border: "8px solid #ffd400",
            boxShadow:
              "inset 0 0 0 4px #5a2a00, inset 0 0 0 12px #ffd400, 0 0 0 4px #aa0000",
            padding: "40px 60px",
          }}
        >
          <div style={{ display: "flex", gap: 32, fontSize: 96 }}>
            <span>🌿</span>
            <span>🪴</span>
            <span>🌻</span>
            <span>✿</span>
            <span>🍃</span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              color: "#ffd400",
              textShadow:
                "4px 4px 0 #aa0000, 8px 8px 0 #5a2a00, 12px 12px 0 rgba(0,0,0,0.4)",
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            ★ PLANT CARE TRACKER ★
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 42,
              color: "#fff7c2",
              fontStyle: "italic",
              textAlign: "center",
              textShadow: "3px 3px 0 rgba(0,0,0,0.6)",
            }}
          >
            ~*~ welcome 2 my greenhouse on the web!! ~*~
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <span
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 900,
                color: "#000",
                background: "#ffd400",
                padding: "10px 22px",
                border: "4px solid #5a2a00",
                letterSpacing: 1,
              }}
            >
              CISC 450 FINAL PROJECT
            </span>
            <span
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                background: "#aa0000",
                padding: "10px 22px",
                border: "4px solid #5a0000",
                letterSpacing: 1,
              }}
            >
              ★ NEW! ★
            </span>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#dff3d5",
              fontFamily: "monospace",
              marginTop: 14,
            }}
          >
            plants.auriga.fyi
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
