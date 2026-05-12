import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
      }}
    >
      {/* Win95 "Error" dialog */}
      <div
        style={{
          display: "inline-block",
          minWidth: 360,
          maxWidth: 520,
          textAlign: "left",
          background: "#c0c0c0",
          borderTop: "2px solid #ffffff",
          borderLeft: "2px solid #ffffff",
          borderRight: "2px solid #000000",
          borderBottom: "2px solid #000000",
          padding: 2,
          boxShadow: "4px 4px 0 rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(90deg, #aa0000 0%, #ff3333 100%)",
            color: "#fff",
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
          <span>⚠ error.exe :: 404</span>
          <span style={{ display: "flex", gap: 2 }}>
            <span
              style={{
                width: 16, height: 14, background: "#c0c0c0", color: "#000",
                border: "1px solid #000", display: "inline-flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 10, textShadow: "none",
              }}
            >×</span>
          </span>
        </div>

        <div
          style={{
            background: "#fffce8",
            borderTop: "1px solid #808080",
            borderLeft: "1px solid #808080",
            borderRight: "1px solid #ffffff",
            borderBottom: "1px solid #ffffff",
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              className="wiggle"
              style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}
            >
              🪴
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "Comic Sans MS, cursive",
                  fontWeight: 900,
                  fontSize: 22,
                  color: "#aa0000",
                  textShadow: "2px 2px 0 #fff",
                }}
              >
                404: Page not found!
              </h1>
              <p
                style={{
                  margin: "10px 0 0",
                  fontFamily: "Times New Roman, serif",
                  fontSize: 14,
                  color: "#1a3d10",
                  lineHeight: 1.5,
                }}
              >
                The page you&apos;re looking for has been{" "}
                <em>repotted somewhere else</em>, or maybe it never existed at
                all. 🤷‍♀️
              </p>
              <p
                style={{
                  margin: "10px 0 0",
                  fontFamily: "Courier New, monospace",
                  fontSize: 11,
                  color: "#5b9b3d",
                }}
              >
                ERROR_PLANT_NOT_FOUND · please try one of the options below ↓
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="retro-btn btn-bevel">
              🏠 Back to dashboard
            </Link>
            <Link href="/plants" className="retro-btn btn-bevel">
              🌿 View plants
            </Link>
          </div>
        </div>
      </div>

      <p
        style={{
          marginTop: 18,
          fontFamily: "Comic Sans MS, cursive",
          fontSize: 13,
          color: "#1a3d10",
        }}
      >
        ✦ <span className="blink">sorry 4 the inconvenience!!</span> ✦
      </p>
    </div>
  );
}
