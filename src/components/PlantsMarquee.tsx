// Bottom-of-page ticker scrolling the user's plant names.

import Link from "next/link";
import { unstable_cache } from "next/cache";
import { listPlants } from "@/db/queries";

const LEAVES = ["🌿", "🌱", "🍀", "🌸", "🌻", "🌼", "✿", "🍃", "🌷", "🌵"];

// Cached for 5 min; the "plants" tag is revalidated by mutating server actions
// so changes show up immediately rather than waiting for the TTL.
const getMarqueePlants = unstable_cache(
  async () => {
    const rows = await listPlants();
    return rows.map((p) => ({ plantId: p.plantId, plantName: p.plantName }));
  },
  ["plants-marquee"],
  { revalidate: 300, tags: ["plants"] },
);

export async function PlantsMarquee() {
  let plants: { plantId: number; plantName: string }[] = [];
  try {
    plants = await getMarqueePlants();
  } catch {
    return null;
  }
  if (plants.length === 0) return null;

  // Duplicate the list so a small collection still feels like a continuous ticker.
  const cycles = Math.max(2, Math.ceil(40 / plants.length));

  return (
    <div className="retro-marquee retro-marquee-leafy retro-marquee-reverse retro-marquee-slow">
      <div className="retro-marquee-inner">
        ~*~ now growing in my collection ~*~ &nbsp;
        {Array.from({ length: cycles }).flatMap((_, ci) =>
          plants.map((p, pi) => {
            const emoji = LEAVES[(ci * plants.length + pi) % LEAVES.length];
            return (
              <span key={`${ci}-${p.plantId}`}>
                {emoji}{" "}
                <Link
                  href={`/plants/${p.plantId}`}
                  style={{
                    color: "#fff7c2",
                    textDecoration: "underline",
                    textUnderlineOffset: 2,
                  }}
                >
                  {p.plantName}
                </Link>{" "}
                &nbsp; ✦ &nbsp;
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}
