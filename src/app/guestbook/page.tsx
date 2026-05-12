import { countGuestbookEntries, listGuestbookEntries } from "@/db/queries";
import { SignGuestbookForm } from "@/components/forms";
import { Card, EmptyState, SectionHeader } from "@/components/ui";
import { Win95Window } from "@/components/Retro";

export const dynamic = "force-dynamic";

const TIME_FMT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

export default async function GuestbookPage() {
  const [entries, total] = await Promise.all([
    listGuestbookEntries(),
    countGuestbookEntries(),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Guestbook"
        subtitle="Leave a sign of life so I know u were here!! ✿"
      />

      <p
        style={{
          margin: 0,
          fontFamily: "Comic Sans MS, cursive",
          fontSize: 14,
          color: "#1a3d10",
          textAlign: "center",
        }}
      >
        ★{" "}
        <span style={{ background: "#fff7c2", padding: "2px 8px", border: "1px dashed #1a3d10" }}>
          {total} {total === 1 ? "person has" : "people have"} signed!
        </span>{" "}
        ★
      </p>

      <Card title="sign_guestbook.exe" className="!p-0">
        <SignGuestbookForm />
      </Card>

      <hr className="rainbow-hr" />

      {entries.length === 0 ? (
        <EmptyState>
          No signatures yet. <span className="blink">Be the first!!</span>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {entries.map((e, i) => {
            // Cycle through a small rotation so consecutive entries don't
            // line up dead-straight, like notecards thumbtacked to a board.
            const tilt = (i % 5) - 2; // -2 to +2 degrees
            return (
              <div
                key={e.guestbookId}
                style={{ transform: `rotate(${tilt * 0.4}deg)` }}
              >
                <Win95Window
                  title={`${e.mood ?? "✉"} ${e.visitorName}.txt`}
                >
                  <p
                    style={{
                      margin: "0 0 8px",
                      fontFamily: "Times New Roman, serif",
                      fontSize: 14,
                      color: "#1a3d10",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {e.message}
                  </p>
                  <hr
                    style={{
                      border: 0,
                      borderTop: "1px dashed #5b9b3d",
                      margin: "8px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      fontFamily: "Tahoma, sans-serif",
                      fontSize: 11,
                      color: "#2c5e1a",
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>
                      ~ <strong>{e.visitorName}</strong>
                      {e.location && (
                        <>
                          , <span style={{ color: "#5b9b3d" }}>{e.location}</span>
                        </>
                      )}{" "}
                      {e.mood && <span style={{ fontSize: 14 }}>{e.mood}</span>}
                    </span>
                    <span
                      style={{
                        fontFamily: "Courier New, monospace",
                        fontSize: 10,
                        color: "#5b9b3d",
                      }}
                    >
                      {new Date(e.signedAt).toLocaleString(undefined, TIME_FMT)}
                    </span>
                  </div>
                </Win95Window>
              </div>
            );
          })}
        </div>
      )}

      <p
        style={{
          textAlign: "center",
          fontFamily: "Comic Sans MS, cursive",
          color: "#1a3d10",
          fontSize: 13,
          margin: 0,
        }}
      >
        ✦ Thanks 4 stopping by!! Come back soon!!! ✦
      </p>
    </div>
  );
}
