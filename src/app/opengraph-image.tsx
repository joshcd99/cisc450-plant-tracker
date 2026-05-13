import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Comic Sans MS is proprietary; Comic Neue is the free clone designed to
// replace it. Fetched from Google Fonts at build time so the WordArt actually
// has the goofy rounded letterforms instead of Satori's default Noto Sans.
async function loadComicFont(): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const css = await cssRes.text();
  // Google Fonts CSS returns .woff2, .ttf, or .otf depending on UA — Satori
  // can read any of them.
  const match = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf|otf))\)/);
  if (!match) throw new Error("Could not locate Comic Neue font URL in CSS response");
  return (await fetch(match[1])).arrayBuffer();
}

// Mirrors the site's top header. Satori does NOT support: SVG <text> nodes,
// background-clip:text gradient fills, -webkit-text-stroke, or fallback-font
// lookup for missing glyphs like ★. So we stick to solid colors and emojis
// known to render via the embedded Twemoji set.
export default async function OpengraphImage() {
  const comic = await loadComicFont();

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
          fontFamily: "Comic Neue",
        }}
      >
        {/* Outer .outer-frame */}
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
          {/* Inner .inner-frame */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fffce8",
              border: "6px solid #1a3d10",
              padding: "30px 50px",
            }}
          >
            {/* WordArt title — chunky solid gold with stacked shadow to mimic .wordart */}
            <div
              style={{
                display: "flex",
                fontSize: 102,
                fontWeight: 700,
                letterSpacing: 1,
                lineHeight: 1,
                color: "#ffd400",
                textShadow:
                  "3px 3px 0 #fff, 5px 5px 0 #000, 8px 8px 0 #aa0000, 11px 11px 0 rgba(0,0,0,0.35)",
              }}
            >
              PLANT CARE TRACKER
            </div>

            {/* .font-comic subtitle in dark green */}
            <div
              style={{
                display: "flex",
                marginTop: 30,
                fontSize: 36,
                color: "#1a3d10",
                fontWeight: 700,
                textShadow: "2px 2px 0 #fff",
              }}
            >
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </div>

            {/* Status row matching the header: NEW! / CISC 450 / HOT! */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 26,
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#ff0000",
                  textShadow: "1px 1px 0 #fff",
                }}
              >
                NEW!
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#000",
                  backgroundColor: "#ffd400",
                  padding: "6px 18px",
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
                  fontFamily: "Impact, sans-serif",
                  color: "#ffff00",
                  backgroundColor: "#ff0000",
                  padding: "4px 14px",
                  border: "2px solid #ffff00",
                  textShadow: "1px 1px 0 #000",
                  letterSpacing: 1,
                }}
              >
                HOT!
              </span>
            </div>

            {/* Bobbing emoji row */}
            <div style={{ display: "flex", gap: 28, marginTop: 30, fontSize: 64 }}>
              <span>🌱</span>
              <span>🌻</span>
              <span>🌿</span>
            </div>

            {/* URL footer */}
            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontSize: 20,
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
    {
      ...size,
      fonts: [
        { name: "Comic Neue", data: comic, style: "normal", weight: 700 },
      ],
    },
  );
}
