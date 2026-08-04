import styles from "./stars.css";

// Sparkle shape traced from the reference star.svg (viewBox 0 0 197 200).
const STAR_PATH =
  "M98.500,0.177 C98.500,55.111 142.275,99.644 196.274,99.644 L196.274,99.644 L196.274,99.644 C142.275,99.644 98.500,144.177 98.500,199.110 L98.500,199.110 L98.500,199.110 C98.500,144.177 54.726,99.644 0.727,99.644 L0.727,99.644 L0.727,99.644 C54.726,99.644 98.500,55.111 98.500,0.177 L98.500,0.177 L98.500,0.177 Z";

// Position/size/color of each sparkle, traced from the reference stars.png.
const STARS: { x: number; y: number; size: number; color: string }[] = [
  { x: 3367, y: 1437, size: 250, color: "#00aeef" },
  { x: 158, y: 1548, size: 250, color: "#00aeef" },
  { x: 364, y: 881, size: 242, color: "#ffea00" },
  { x: 3774, y: 731, size: 242, color: "#ffb24f" },
  { x: 463, y: 2114, size: 250, color: "#ffb24f" },
  { x: 3170, y: 171, size: 188, color: "#ec008c" },
  { x: 462, y: 1052, size: 189, color: "#00aeef" },
  { x: 2979, y: 1917, size: 176, color: "#ec008c" },
  { x: 288, y: 299, size: 176, color: "#00aeef" },
  { x: 1055, y: 507, size: 142, color: "#ffb24f" },
  { x: 2783, y: 70, size: 120, color: "#ffea00" },
  { x: 196, y: 667, size: 120, color: "#ffea00" },
  { x: 2595, y: 794, size: 120, color: "#ffb24f" },
  { x: 489, y: 1680, size: 120, color: "#00aeef" },
  { x: 1128, y: 2005, size: 120, color: "#ec008c" },
  { x: 2352, y: 2010, size: 120, color: "#ffea00" },
  { x: 3625, y: 450, size: 120, color: "#9cff00" },
  { x: 1920, y: 1416, size: 120, color: "#ec008c" },
  { x: 3682, y: 2068, size: 110, color: "#ec008c" },
  { x: 307, y: 58, size: 110, color: "#9cff00" },
  { x: 626, y: 637, size: 104, color: "#9cff00" },
  { x: 1360, y: 795, size: 57, color: "#9cff00" },
  { x: 3071, y: 977, size: 57, color: "#00aeef" },
  { x: 812, y: 1916, size: 57, color: "#ec008c" },
  { x: 3828, y: 1008, size: 57, color: "#9cff00" },
  { x: 3111, y: 2150, size: 30, color: "#00aeef" },
];

const MIN_DURATION_MS = 700;
const MAX_DURATION_MS = 5000;

export function Stars() {
  return (
    <div className={styles.canvas}>
      {STARS.map((star, i) => {
        const duration =
          MIN_DURATION_MS + Math.random() * (MAX_DURATION_MS - MIN_DURATION_MS);
        const delay = -Math.random() * duration;
        return (
          <svg
            key={i}
            className={styles.star}
            viewBox="0 0 197 200"
            width={star.size}
            height={star.size}
            style={{
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              animationDuration: `${duration}ms`,
              animationDelay: `${delay}ms`,
            }}
          >
            <path d={STAR_PATH} fill={star.color} />
          </svg>
        );
      })}
    </div>
  );
}
