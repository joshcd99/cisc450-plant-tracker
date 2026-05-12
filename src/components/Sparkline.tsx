// Retro SVG area chart for watering activity.

type Point = { day: string; n: number };

export function Sparkline({
  data,
  height = 80,
  label,
}: {
  data: Point[];
  height?: number;
  width?: number;
  label?: string;
}) {
  if (data.length === 0) return null;

  const width = 600; // viewBox; SVG scales to container
  // Extra top padding for the "★N" peak label.
  const pad = { top: 26, right: 8, bottom: 22, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const max = Math.max(2, ...data.map((d) => d.n));
  const stepX = innerW / Math.max(1, data.length - 1);

  const pts = data.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + innerH - (d.n / max) * innerH,
    n: d.n,
    day: d.day,
  }));

  // Catmull-Rom-to-Bezier smoothing. Y is clamped so the spline can't dip
  // below the baseline between a zero day and a non-zero neighbor.
  const baselineY = pad.top + innerH;
  const clampY = (v: number) => Math.min(baselineY, Math.max(pad.top, v));
  const linePath = (() => {
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = clampY(p1.y + (p2.y - p0.y) / 6);
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = clampY(p2.y - (p3.y - p1.y) / 6);
      d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  })();

  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x},${pad.top + innerH}` +
    ` L ${pts[0].x},${pad.top + innerH} Z`;

  const peakIndex = pts.reduce(
    (best, p, i) => (p.n > pts[best].n ? i : best),
    0,
  );

  const total = data.reduce((sum, d) => sum + d.n, 0);
  const avg = total / data.length;

  return (
    <div>
      {label && (
        <p
          style={{
            margin: "0 0 2px",
            fontFamily: "Tahoma, sans-serif",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "#9bff4c",
          }}
        >
          {label}
        </p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        role="img"
        aria-label={label ?? "Watering activity"}
        style={{ height, display: "block" }}
      >
        <defs>
          <linearGradient id="retro-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ff52b1" stopOpacity="0.85" />
            <stop offset="55%"  stopColor="#9b5dff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#62d4ff" stopOpacity="0.10" />
          </linearGradient>
          <pattern id="retro-grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#155013" strokeWidth="1" />
          </pattern>
        </defs>

        <rect
          x={pad.left}
          y={pad.top}
          width={innerW}
          height={innerH}
          fill="url(#retro-grid)"
        />

        {avg > 0 && (
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH - (avg / max) * innerH}
            y2={pad.top + innerH - (avg / max) * innerH}
            stroke="#ffd400"
            strokeDasharray="4 3"
            strokeWidth={1}
            opacity="0.8"
          />
        )}

        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={baselineY}
          y2={baselineY}
          stroke="#9bff4c"
          strokeWidth={1.5}
        />

        <path d={areaPath} fill="url(#retro-fill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#9bff4c"
          strokeWidth={2.4}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(155,255,76,0.6))" }}
        />

        {/* Invisible per-point hover targets carrying <title> tooltips. */}
        {pts.map((p) => (
          <circle key={p.day} cx={p.x} cy={p.y} r={8} fill="transparent">
            <title>
              {p.day}: {p.n} watering{p.n === 1 ? "" : "s"}
            </title>
          </circle>
        ))}

        {pts[peakIndex].n > 0 && (
          <>
            <circle
              cx={pts[peakIndex].x}
              cy={pts[peakIndex].y}
              r={5}
              fill="#ffd400"
              stroke="#ff0033"
              strokeWidth={1.5}
            />
            <text
              x={pts[peakIndex].x}
              y={pts[peakIndex].y - 8}
              textAnchor="middle"
              fontSize={11}
              fontWeight={900}
              fill="#ffd400"
              style={{
                fontFamily: "Impact, sans-serif",
                paintOrder: "stroke",
                stroke: "#000",
                strokeWidth: 3,
              }}
            >
              ★{pts[peakIndex].n}
            </text>
          </>
        )}

        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r={3.5}
          fill="#ff52b1"
          stroke="#fff"
          strokeWidth={1}
        />
      </svg>

      <div
        style={{
          marginTop: 4,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Courier New, monospace",
          fontSize: 10,
          color: "#9bff4c",
          padding: "0 4px",
        }}
      >
        <span>{data[0].day}</span>
        <span style={{ color: "#ffd400" }}>avg {avg.toFixed(1)}/day</span>
        <span>{data[data.length - 1].day}</span>
      </div>
    </div>
  );
}
