import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import {
  FakeMidiPlayer,
  FloatingDecor,
  RetroMarquee,
  SparkleCursorToggleable,
  TrailToggle,
} from "@/components/Retro";
import { HitCounterServer } from "@/components/HitCounterServer";
import { PlantsMarquee } from "@/components/PlantsMarquee";

export const metadata: Metadata = {
  metadataBase: new URL("https://plants.auriga.fyi"),
  title: "★彡 Plant Care Tracker 彡★ ~ My Greenhouse on the Web!!",
  description:
    "Welcome 2 my plant homepage!!! Track ur ferns ferns ferns. Best viewed in Internet Explorer 6 at 1024×768.",
  openGraph: {
    title: "Plant Care Tracker ★ CISC 450 Final Project",
    description: "~*~ welcome 2 my greenhouse on the web!! ~*~",
    type: "website",
    url: "/",
    siteName: "Plant Care Tracker",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Plant Care Tracker" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plant Care Tracker ★ CISC 450 Final Project",
    description: "~*~ welcome 2 my greenhouse on the web!! ~*~",
    images: ["/og.png"],
  },
};

// Force-dynamic because the visitor counter UPDATE on every render can't be
// cached. The hit counter and plants marquee are both wrapped in Suspense so
// their DB work doesn't block the rest of the page.
export const dynamic = "force-dynamic";

const navLinks: { href: string; label: string; emoji: string }[] = [
  { href: "/",          label: "Home",      emoji: "🏠" },
  { href: "/plants",    label: "Plants",    emoji: "🌿" },
  { href: "/calendar",  label: "Calendar",  emoji: "📅" },
  { href: "/schedule",  label: "Schedule",  emoji: "💧" },
  { href: "/guestbook", label: "Guestbook", emoji: "✉" },
  { href: "/settings",  label: "Settings",  emoji: "⚙️" },
];

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <FloatingDecor />
        <SparkleCursorToggleable />

        <div className="outer-frame">
          <div className="inner-frame" style={{ textAlign: "center" }}>
            <h1 className="wordart" style={{ fontSize: "clamp(40px, 6vw, 78px)", margin: 0 }}>
              <span className="wiggle" style={{ display: "inline-block" }}>★</span>{" "}
              PLANT CARE TRACKER{" "}
              <span className="wiggle" style={{ display: "inline-block" }}>★</span>
            </h1>
            <p
              className="font-comic"
              style={{
                marginTop: 8,
                fontSize: 18,
                color: "#1a3d10",
                textShadow: "2px 2px 0 #fff",
              }}
            >
              ~*~ welcome 2 my greenhouse on the web!! ~*~
            </p>
            <p style={{ marginTop: 4, fontSize: 14 }}>
              <span className="blink" style={{ color: "red", fontWeight: 900 }}>
                ★ NEW! ★
              </span>{" "}
              <span className="rainbow">CISC 450 FINAL PROJECT</span>{" "}
              <span className="badge-new">HOT!</span>
            </p>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <span className="bob" style={{ fontSize: 30 }}>🌱</span>
              <span className="spin-slow" style={{ fontSize: 30 }}>🌻</span>
              <span className="bob" style={{ fontSize: 30, animationDelay: "0.4s" }}>🌿</span>
            </div>
          </div>
        </div>

        <RetroMarquee>
          ✨ ✨ ✨ &nbsp; WELCOME TO PLANT CARE TRACKER!! &nbsp; *~*~* &nbsp;
          please sign my guestbook &nbsp; ❀ &nbsp; water ur plants on time!!
          &nbsp; ★ &nbsp; this site is best viewed in Internet Explorer 6 at
          1024×768 &nbsp; ❀ &nbsp; coded with ♥ by Josh, Aaron &amp; Nathan
          &nbsp; ★ &nbsp; press F11 4 da full experience &nbsp; ✨ ✨ ✨
        </RetroMarquee>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr",
            gap: 0,
            minHeight: "60vh",
            position: "relative",
            zIndex: 1,
          }}
        >
          <nav className="retro-sidebar">
            <p
              className="font-comic"
              style={{
                color: "#fff7c2",
                margin: "0 0 8px",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 900,
                textShadow: "1px 1px 0 #000",
              }}
            >
              ~ Navigation ~
            </p>
            <hr className="rainbow-hr" />
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                <span className="arrow">»</span> {l.emoji} {l.label}
              </Link>
            ))}
            <hr className="rainbow-hr" style={{ marginTop: 12 }} />
            <p
              style={{
                color: "#fff7c2",
                fontFamily: "Comic Sans MS, cursive",
                textAlign: "center",
                fontSize: 12,
                marginTop: 10,
                lineHeight: 1.5,
              }}
            >
              ✿{" "}
              <Link
                href="/guestbook"
                style={{
                  textDecoration: "underline",
                  fontWeight: 700,
                }}
                className="pulse"
              >
                Sign my guestbook!!
              </Link>{" "}
              ✿
              <br />
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=josh.dunlap%40stthomas.edu%2Cfuen8236%40stthomas.edu%2Creev2103%40stthomas.edu&su=%F0%9F%8C%BF%20Hello%20from%20a%20fellow%20plant%20lover%21%20%E2%9C%BF"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#fff7c2",
                  textDecoration: "underline",
                  fontWeight: 700,
                }}
                className="pulse"
              >
                ✉ E-mail us ✉
              </a>
            </p>
            <div style={{ textAlign: "center", marginTop: 14, fontSize: 28 }}>
              <span className="spin-slow" style={{ display: "inline-block" }}>🌻</span>
            </div>
          </nav>

          <main style={{ padding: 16, position: "relative" }}>
            <div
              style={{
                background: "rgba(255, 252, 232, 0.92)",
                border: "3px ridge var(--leaf-dark)",
                padding: "20px 22px",
                minHeight: "55vh",
              }}
            >
              {children}
            </div>
          </main>
        </div>

        {/* Second marquee with every plant. Suspended so its DB fetch
            doesn't block the rest of the page. */}
        <Suspense fallback={<MarqueeFallback />}>
          <PlantsMarquee />
        </Suspense>

        <footer
          style={{
            background: "#003300",
            color: "#fff7c2",
            padding: "20px 16px",
            textAlign: "center",
            borderTop: "4px ridge var(--gold)",
            fontFamily: "Times New Roman, serif",
            position: "relative",
            zIndex: 1,
          }}
        >
          <p
            className="font-comic"
            style={{ margin: "0 0 8px", fontSize: 16 }}
          >
            ✿ You are visitor # ✿
          </p>
          {/* Suspense isolates the counter's row-lock UPDATE from the rest of the page. */}
          <Suspense fallback={<span className="hit-counter" aria-hidden>{"0000000".split("").map((d, i) => (<span key={i}>{d}</span>))}</span>}>
            <HitCounterServer />
          </Suspense>
          <p style={{ marginTop: 14, fontSize: 14 }}>
            ✦ Last updated: <strong className="rainbow">05/11/2026</strong> ✦
          </p>
          <p style={{ marginTop: 6, fontSize: 13 }}>
            🌐 Best viewed in <em>Netscape Navigator 4</em> or{" "}
            <em>Internet Explorer 6</em> at 1024×768 ·{" "}
            <span className="blink" style={{ color: "#ffd400" }}>NEW!</span>{" "}
            now with 16-bit color!
          </p>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <FakeMidiPlayer />
            <TrailToggle />
          </div>
          <p
            style={{
              marginTop: 16,
              fontSize: 12,
              fontFamily: "Times New Roman, serif",
              color: "#dff3d5",
            }}
          >
            CISC 450 Final Project · Josh Dunlap · Aaron Fuentes · Nathan Reeves
            <br />
            &copy; 2026 · A.D. · Hosted with <span style={{ color: "#ff52b1" }}>♥</span> on
            the World Wide Web
          </p>
          <p style={{ marginTop: 10 }}>
            <a
              href="https://github.com/joshcd99/cisc450-plant-tracker"
              target="_blank"
              rel="noreferrer"
            >
              🌟 Source code on GitHub 🌟
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}

// Same dimensions as the real marquee so the footer doesn't jump on swap-in.
function MarqueeFallback() {
  return (
    <div className="retro-marquee retro-marquee-leafy" aria-hidden style={{ opacity: 0.5 }}>
      <div className="retro-marquee-inner">~*~ loading plants ~*~</div>
    </div>
  );
}
