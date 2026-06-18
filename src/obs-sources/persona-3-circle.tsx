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

  return (
    <div style={{ width: W, height: H, overflow: "hidden" }}>
      <svg width={W} height={H}>
        <defs>
          <path id="text-arc" d={topArc} />
        </defs>
        <circle cx={baseCircleCx} cy={baseCircleCy} r={baseCircleR} fill={BASE_COLOR} />
        <circle cx={baseCircleCx} cy={baseCircleCy} r={accentCircleR} fill={ACCENT_COLOR} />
        <circle cx={baseCircleCx} cy={baseCircleCy} r={innerCircleR} fill={BASE_COLOR} />
        <circle cx={baseCircleCx} cy={baseCircleCy} r={dottedCircleR} fill="none" stroke={ACCENT_COLOR} strokeWidth={8} strokeDasharray="16 48" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${baseCircleCx} ${baseCircleCy}`} to={`360 ${baseCircleCx} ${baseCircleCy}`} dur="20s" repeatCount="indefinite" />
        </circle>
        <g>
          <animateTransform attributeName="transform" type="rotate" from={`0 ${baseCircleCx} ${baseCircleCy}`} to={`360 ${baseCircleCx} ${baseCircleCy}`} dur="20s" repeatCount="indefinite" />
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
