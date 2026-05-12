"use client";

// Early-2000s GeoCities-style decorations.

import { useEffect, useRef, useState } from "react";

// SparkleCursor: drops a fading sparkle at the cursor on move, capped to MAX_NODES.

const SPARKLE_CHARS = ["✨", "★", "✿", "❀", "🌿", "✦"];
const SPARKLE_COLORS = ["#ff52b1", "#f7c948", "#5b9b3d", "#7ec8ff", "#9b5dff"];

export function SparkleCursor() {
  useEffect(() => {
    let lastTime = 0;
    let nodeCount = 0;
    const MAX_NODES = 60;

    function spawn(x: number, y: number) {
      if (nodeCount > MAX_NODES) return;
      // Keep sparkles inside the viewport so they don't trigger a horizontal scrollbar.
      const margin = 12;
      const cx = Math.min(window.innerWidth - margin, Math.max(margin, x + (Math.random() * 12 - 6)));
      const cy = Math.min(window.innerHeight - margin, Math.max(margin, y + (Math.random() * 12 - 6)));
      const el = document.createElement("span");
      el.className = "sparkle-dot";
      el.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.style.color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      el.style.fontSize = `${10 + Math.random() * 10}px`;
      document.body.appendChild(el);
      nodeCount++;
      setTimeout(() => {
        el.remove();
        nodeCount--;
      }, 700);
    }

    function onMove(e: MouseEvent) {
      // Throttle to ~30/s
      const now = performance.now();
      if (now - lastTime < 33) return;
      lastTime = now;
      spawn(e.clientX, e.clientY);
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}

// FloatingDecor: emoji that drift upward; pointer-events disabled.

export function FloatingDecor() {
  const items = [
    { emoji: "🌿", left: "5%",  delay: "0s",   duration: "18s" },
    { emoji: "🍃", left: "15%", delay: "4s",   duration: "22s" },
    { emoji: "✨", left: "28%", delay: "9s",   duration: "16s" },
    { emoji: "🌱", left: "44%", delay: "2s",   duration: "20s" },
    { emoji: "🌸", left: "58%", delay: "11s",  duration: "24s" },
    { emoji: "🍀", left: "72%", delay: "6s",   duration: "19s" },
    { emoji: "✨", left: "85%", delay: "13s",  duration: "17s" },
    { emoji: "🌼", left: "93%", delay: "1s",   duration: "21s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className="float-bg"
          style={{
            left: it.left,
            bottom: "-40px",
            animationDelay: it.delay,
            animationDuration: it.duration,
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  );
}

// Win95Window: title bar + min/max/close buttons wrapping body content.

export function Win95Window({
  title,
  children,
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`win95 ${className}`}>
      <div className="win95-titlebar">
        <span>📁 {title}</span>
        <span className="controls">
          <span className="win95-titlebutton">_</span>
          <span className="win95-titlebutton">▢</span>
          <span className="win95-titlebutton">×</span>
        </span>
      </div>
      <div className="win95-body">{children}</div>
    </div>
  );
}

// FakeMidiPlayer: chiptune Greensleeves rendered via Web Audio.
// Melody is [note, 16th-note count] pairs played on a triangle oscillator.

const NOTE_FREQ: Record<string, number> = {
  E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3,
  A4: 440.0,  "A#4": 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, "D#5": 622.25, E5: 659.25,
  F5: 698.46, "F#5": 739.99, G5: 783.99,
};

// Greensleeves verse: two phrases (A + B), looped.
const MELODY: [string, number][] = [
  // Phrase A
  ["A4", 2],
  ["C5", 4], ["D5", 2], ["E5", 5], ["F5", 1],
  ["E5", 4], ["D5", 2], ["B4", 5], ["G4", 1],
  ["A4", 4], ["B4", 2], ["C5", 5], ["C#5", 1],
  ["B4", 4], ["A4", 2], ["A4", 6],

  // Phrase B
  ["A4", 2],
  ["C5", 4], ["D5", 2], ["E5", 5], ["F5", 1],
  ["E5", 4], ["D5", 2], ["B4", 5], ["G4", 1],
  ["A4", 4], ["B4", 2], ["C5", 4], ["B4", 2], ["A4", 2],
  ["G#4", 6], ["E4", 2], ["A4", 8],
];

export function FakeMidiPlayer() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const stoppedRef = useRef(true);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    };
  }, []);

  async function start() {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctx = W.AudioContext || W.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    stoppedRef.current = false;
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch { /* ignore */ }
    }

    const BPM = 92;
    const SIXTEENTH = 60 / BPM / 4;
    const GAIN = 0.08;

    const amp = ctx.createGain();
    amp.gain.value = 1;
    amp.connect(ctx.destination);

    function playNote(freq: number, when: number, dur: number) {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = ctx.createGain();
      // Short attack/release to avoid clicks at note boundaries.
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(GAIN, when + 0.012);
      g.gain.setValueAtTime(GAIN * 0.75, Math.max(when + 0.012, when + dur - 0.05));
      g.gain.linearRampToValueAtTime(0, when + dur);
      osc.connect(g);
      g.connect(amp);
      osc.start(when);
      osc.stop(when + dur + 0.05);
    }

    const total = MELODY.reduce((s, [, u]) => s + u * SIXTEENTH, 0);

    function scheduleLoop(startAt: number) {
      if (stoppedRef.current || ctxRef.current !== ctx) return;
      let t = startAt;
      for (const [note, units] of MELODY) {
        const dur = units * SIXTEENTH;
        const f = NOTE_FREQ[note];
        if (f) playNote(f, t, dur);
        t += dur;
      }
      // Re-arm the next loop just before this one ends for gapless playback.
      const ms = Math.max(50, (total - 0.1) * 1000);
      setTimeout(() => scheduleLoop(startAt + total), ms);
    }

    scheduleLoop(ctx.currentTime + 0.1);
  }

  function stop() {
    stoppedRef.current = true;
    const ctx = ctxRef.current;
    if (ctx) {
      // Closing the context cancels every scheduled oscillator.
      ctx.close().catch(() => {});
      ctxRef.current = null;
    }
  }

  function toggle() {
    if (playing) {
      stop();
      setPlaying(false);
    } else {
      setPlaying(true);
      start().catch(() => setPlaying(false));
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="retro-btn btn-bevel"
      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      aria-pressed={playing}
    >
      <span className={playing ? "spin-slow" : ""}>💿</span>
      {playing ? "♪ Now Playing: greensleeves.mid" : "▶ Play music"}
    </button>
  );
}

// Sparkle-trail on/off toggle, persisted in localStorage.

const TRAIL_KEY = "retro:trail";

export function SparkleCursorToggleable() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    setEnabled(localStorage.getItem(TRAIL_KEY) !== "off");
  }, []);
  if (!enabled) return null;
  return <SparkleCursor />;
}

export function TrailToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  useEffect(() => {
    setEnabled(localStorage.getItem(TRAIL_KEY) !== "off");
  }, []);
  if (enabled === null) return null;
  return (
    <button
      type="button"
      className="retro-btn btn-bevel"
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        localStorage.setItem(TRAIL_KEY, next ? "on" : "off");
        window.location.reload();
      }}
    >
      {enabled ? "✨ Sparkles: ON" : "✨ Sparkles: OFF"}
    </button>
  );
}

// CSS-animated marquee banner. Animation lives in globals.css.

export function RetroMarquee({ children }: { children: React.ReactNode }) {
  return (
    <div className="retro-marquee">
      <div className="retro-marquee-inner">{children}</div>
    </div>
  );
}
