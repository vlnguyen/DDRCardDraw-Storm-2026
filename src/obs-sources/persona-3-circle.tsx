const W = 3840;
const H = 2160;
const BASE_COLOR = "#00a2fe";
const ACCENT_COLOR = "white";

interface Props {
  cx?: number;
  cy?: number;
  radius?: number;
  outerText?: string;
  fontSize?: number;
}

export function Persona3Circle({
  cx = 0.305,
  cy = 0.505,
  radius = 0.1723,
  outerText = "Project Storm",
  fontSize = 80,
}: Props) {
  const baseCircleCx = W * cx;
  const baseCircleCy = H * cy;
  const innerCircleR = W * radius;
  const baseCircleR = innerCircleR * 1.1236;
  const accentCircleR = innerCircleR * 1.0371;
  const dottedCircleR = innerCircleR * 1.1845;
  const textCircleR = dottedCircleR + 40;
  const topArc = `M ${baseCircleCx - textCircleR},${baseCircleCy} A ${textCircleR},${textCircleR},0,0,1,${baseCircleCx + textCircleR},${baseCircleCy}`;
  const rotateCSS = `
    @keyframes persona3Rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .persona3-rotating {
      transform-origin: ${baseCircleCx}px ${baseCircleCy}px;
      animation: persona3Rotate 20s linear infinite;
    }
  `;

  return (
    <div style={{ width: W, height: H, overflow: "hidden" }}>
      <svg width={W} height={H}>
        <defs>
          <style>{rotateCSS}</style>
          <path id="text-arc" d={topArc} />
        </defs>
        <circle cx={baseCircleCx} cy={baseCircleCy} r={baseCircleR} fill={BASE_COLOR} />
        <circle cx={baseCircleCx} cy={baseCircleCy} r={accentCircleR} fill={ACCENT_COLOR} />
        <circle cx={baseCircleCx} cy={baseCircleCy} r={innerCircleR} fill={BASE_COLOR} />
        <circle className="persona3-rotating" cx={baseCircleCx} cy={baseCircleCy} r={dottedCircleR} fill="none" stroke={ACCENT_COLOR} strokeWidth={8} strokeDasharray="16 48" strokeLinecap="round" />
        <g className="persona3-rotating">
          <text textAnchor="middle" fill={ACCENT_COLOR} fontSize={fontSize} fontWeight="bold">
            <textPath href="#text-arc" startOffset="50%">
              {outerText}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
