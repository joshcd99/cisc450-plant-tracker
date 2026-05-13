import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Comic Sans MS is proprietary, so we fetch Comic Neue (its free clone) from
// Google Fonts and feed the woff2 into Satori. Without a comic-style font
// loaded, the WordArt title falls back to Noto Sans and loses all personality.
async function loadComicFont(): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap",
    {
      // Mozilla UA forces Google Fonts to return woff2 URLs (the format Satori reads).
      headers: { "User-Agent": "Mozilla/5.0" },
    },
  );
  const css = await cssRes.text();
  const match = css.match(/url\((https:\/\/[^)]+\.woff2)\)/);
  if (!match) throw new Error("Could not locate Comic Neue woff2 URL");
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

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
        }}
      >
        {/* Outer .outer-frame: gold border + dark green diagonal stripes */}
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
          {/* Inner .inner-frame: cream panel + dark green border */}
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
              fontFamily: "Comic Neue",
            }}
          >
            {/* .wordart title with rainbow gradient + chunky drop shadow */}
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 700,
                letterSpacing: 1,
                lineHeight: 1.05,
                color: "transparent",
                backgroundImage:
                  "linear-gradient(90deg, #ff0000, #ff9900, #ffee00, #00cc44, #0099ff, #aa00ff, #ff0099)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                textShadow:
                  "3px 3px 0 #fff, 4px 4px 0 #000, 6px 6px 0 rgba(0,0,0,0.25)",
              }}
            >
              PLANT CARE TRACKER
            </div>

            {/* .font-comic subtitle */}
            <div
              style={{
                display: "flex",
                marginTop: 18,
                fontSize: 32,
                color: "#1a3d10",
                fontWeight: 700,
                textShadow: "2px 2px 0 #fff",
              }}
            >
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </div>

            {/* Status row matching the actual header: red NEW! / rainbow CISC 450 / red HOT! badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 22,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              <span style={{ display: "flex", color: "#ff0000" }}>
                ★ NEW! ★
              </span>
              <span
                style={{
                  display: "flex",
                  color: "transparent",
                  backgroundImage:
                    "linear-gradient(90deg, #ff0000, #ff9900, #ffee00, #00cc44, #0099ff, #aa00ff, #ff0099)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  fontWeight: 700,
                }}
              >
                CISC 450 FINAL PROJECT
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontFamily: "Impact",
                  color: "#ffff00",
                  backgroundColor: "#ff0000",
                  padding: "2px 10px",
                  border: "2px solid #ffff00",
                  textShadow: "1px 1px 0 #000",
                }}
              >
                HOT!
              </span>
            </div>

            {/* Emoji row */}
            <div style={{ display: "flex", gap: 24, marginTop: 26, fontSize: 54 }}>
              <span>🌱</span>
              <span>🌻</span>
              <span>🌿</span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
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
    {
      ...size,
      fonts: [
        {
          name: "Comic Neue",
          data: comic,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
