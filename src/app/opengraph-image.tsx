import { ImageResponse } from "next/og";

// Standard link-preview dimensions used by iMessage, Slack, Twitter, Discord, etc.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Plant Care Tracker — CISC 450 final project";

// Comic Sans MS is proprietary; Comic Neue is the free clone designed to
// replace it. Fetched from Google Fonts so the WordArt actually has the
// goofy rounded letterforms instead of Satori's default Noto Sans.
async function loadComicFont(): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@700&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0" } },
  );
  const css = await cssRes.text();
  // Google Fonts CSS returns either .woff2 or .ttf depending on UA; Satori reads both.
  const match = css.match(/url\((https:\/\/[^)]+\.(?:woff2|ttf|otf))\)/);
  if (!match) throw new Error("Could not locate Comic Neue font URL in CSS response");
  return (await fetch(match[1])).arrayBuffer();
}

// Rainbow colors matching .wordart's CSS gradient (one per letter).
const RAINBOW = [
  "#ff0000", "#ff5500", "#ff9900", "#ffcc00", "#ffee00",
  "#88cc22", "#00cc44", "#00aa88", "#0099ff", "#5566dd",
  "#aa00ff", "#cc0099", "#ff0099",
];

// Build the title as a series of <tspan>s, one per letter, each in its own
// rainbow color. Solid SVG fills — no background-clip:text trickery that
// Satori can't render.
function rainbowTspans(text: string) {
  const letters = [...text];
  let c = 0;
  return letters.map((ch, i) => {
    const color = ch === " " ? "transparent" : RAINBOW[c++ % RAINBOW.length];
    return (
      <tspan key={i} fill={color}>
        {ch}
      </tspan>
    );
  });
}

export default async function OpengraphImage() {
  const comic = await loadComicFont();
  const fontFamily = "Comic Neue";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#000",
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Diagonal-stripe pattern matching .outer-frame */}
            <pattern
              id="stripes"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="10" height="20" fill="#1a3d10" />
              <rect x="10" width="10" height="20" fill="#2c5e1a" />
            </pattern>
          </defs>

          {/* Outer dark-green striped background */}
          <rect width="1200" height="630" fill="url(#stripes)" />

          {/* Gold ridge border (faked with two stacked rects) */}
          <rect
            x="22"
            y="22"
            width="1156"
            height="586"
            fill="none"
            stroke="#ffd400"
            strokeWidth="8"
          />

          {/* Cream inner panel with dark-green border */}
          <rect
            x="60"
            y="60"
            width="1080"
            height="510"
            fill="#fffce8"
            stroke="#1a3d10"
            strokeWidth="6"
          />

          {/* WordArt title — 3-layer drop shadow then per-letter rainbow */}
          <g
            fontFamily={fontFamily}
            fontSize="96"
            fontWeight="700"
            textAnchor="middle"
            style={{ letterSpacing: "2px" }}
          >
            {/* shadow layers, lightest → darkest, then white highlight, then fill */}
            <text x="606" y="226" fill="rgba(0,0,0,0.25)">
              PLANT CARE TRACKER
            </text>
            <text x="604" y="224" fill="#000">
              PLANT CARE TRACKER
            </text>
            <text x="603" y="223" fill="#fff">
              PLANT CARE TRACKER
            </text>
            <text x="600" y="220" stroke="#000" strokeWidth="3">
              {rainbowTspans("PLANT CARE TRACKER")}
            </text>
          </g>

          {/* Subtitle in dark green Comic Neue with white drop-shadow */}
          <g
            fontFamily={fontFamily}
            fontSize="34"
            fontWeight="700"
            textAnchor="middle"
          >
            <text x="602" y="302" fill="#fff">
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </text>
            <text x="600" y="300" fill="#1a3d10">
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </text>
          </g>

          {/* Status row: red NEW! / rainbow CISC 450 / red HOT! badge */}
          <g
            fontFamily={fontFamily}
            fontSize="30"
            fontWeight="700"
            textAnchor="middle"
          >
            <text x="320" y="380" fill="#ff0000">
              ★ NEW! ★
            </text>
            <text x="600" y="380" stroke="#000" strokeWidth="1.5">
              {rainbowTspans("CISC 450 FINAL PROJECT")}
            </text>
          </g>
          {/* HOT! badge (red box + yellow Impact-style text) */}
          <g>
            <rect
              x="820"
              y="356"
              width="92"
              height="36"
              fill="#ff0000"
              stroke="#ffff00"
              strokeWidth="2"
            />
            <text
              x="866"
              y="383"
              fontFamily="Impact, sans-serif"
              fontSize="26"
              fontWeight="700"
              textAnchor="middle"
              fill="#ffff00"
            >
              HOT!
            </text>
          </g>

          {/* Emoji row (Satori renders these via its embedded Twemoji set) */}
          <g
            fontSize="64"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <text x="540" y="470">🌱</text>
            <text x="600" y="470">🌻</text>
            <text x="660" y="470">🌿</text>
          </g>

          {/* URL footer */}
          <text
            x="600"
            y="540"
            fontFamily="monospace"
            fontSize="20"
            fontWeight="700"
            fill="#5b9b3d"
            textAnchor="middle"
          >
            plants.auriga.fyi
          </text>
        </svg>
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
