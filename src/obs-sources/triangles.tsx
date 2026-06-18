import styles from "./triangles.css";

const COLORS = ["#f1d312", "#bbf915", "#0afee5", "#ff03dc"];

const TRI_W = 180;
const TRI_H = TRI_W * (Math.sqrt(3) / 2);
const GAP_X = 30;
const GAP_Y = 20;
const COLS = Math.ceil(3840 / (TRI_W / 2)) + 2;
const ROWS = Math.ceil(2160 / TRI_H) + 1;

const MIN_DURATION_SECS = 5;
const MAX_DURATION_SECS = 10;

const CX = 1920;
const CY = 1080;
const ELLIPSE_RX = 1200;
const ELLIPSE_RY = 600;

function pickColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function distSqToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
}

function touchesEllipse(verts: [number, number][]): boolean {
  const norm = ([x, y]: [number, number]): [number, number] => [
    (x - CX) / ELLIPSE_RX,
    (y - CY) / ELLIPSE_RY,
  ];
  for (const v of verts) {
    const [nx, ny] = norm(v);
    if (nx * nx + ny * ny < 1) return true;
  }
  for (let i = 0; i < verts.length; i++) {
    const [nax, nay] = norm(verts[i]);
    const [nbx, nby] = norm(verts[(i + 1) % verts.length]);
    if (distSqToSegment(0, 0, nax, nay, nbx, nby) < 1) return true;
  }
  return false;
}

const triangles = Array.from({ length: ROWS }, (_, row) =>
  Array.from({ length: COLS }, (_, col) => {
    const isUp = (row + col) % 2 === 0;
    const x = col * (TRI_W / 2) - TRI_W;
    const y = row * TRI_H;
    const gx = GAP_X / 2;
    const gy = GAP_Y / 2;

    const verts: [number, number][] = isUp
      ? [[x + gx, y + TRI_H - gy], [x + TRI_W - gx, y + TRI_H - gy], [x + TRI_W / 2, y + gy]]
      : [[x + gx, y + gy], [x + TRI_W - gx, y + gy], [x + TRI_W / 2, y + TRI_H - gy]];

    if (touchesEllipse(verts)) return null;
    if (Math.random() < 0.5) return null;

    const points = verts.map(([vx, vy]) => `${vx},${vy}`).join(" ");

    const duration = MIN_DURATION_SECS + Math.random() * (MAX_DURATION_SECS - MIN_DURATION_SECS);
    const delay = -Math.random() * duration;

    return (
      <polygon
        key={`${row}-${col}`}
        points={points}
        fill={pickColor()}
        style={{
          animation: `opacityPulse ${duration}s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        }}  
      />
    );
  }),
).flat();

export function Triangles() {
  return (
    <div className={styles.background}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox={`0 0 3840 2160`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <style>{`
            @keyframes opacityPulse {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
          `}</style>
        </defs>
        {triangles}
      </svg>
    </div>
  );
}
