const W = 3840;
const H = 2160;
const BASE_CIRCLE_CX = W * 0.305;
const BASE_CIRCLE_CY = H * 0.505;
const BASE_CIRCLE_R = W * 0.1936;
const BASE_COLOR = "#00a2fe";
const ACCENT_COLOR = "white";
const ACCENT_CIRCLE_R = BASE_CIRCLE_R * 0.923;
const INNER_CIRCLE_R = BASE_CIRCLE_R * 0.89;
const DOTTED_CIRCLE_R = BASE_CIRCLE_R * 1.054;
const TEXT_CIRCLE_R = DOTTED_CIRCLE_R + 40;

const CX = BASE_CIRCLE_CX;
const CY = BASE_CIRCLE_CY;

interface Props {
  outerText?: string;
}

export function Persona3Circle({ outerText = "Project Storm" }: Props) {
  const topArc = `M ${CX - TEXT_CIRCLE_R},${CY} A ${TEXT_CIRCLE_R},${TEXT_CIRCLE_R},0,0,1,${CX + TEXT_CIRCLE_R},${CY}`;

  return (
    <div style={{ width: W, height: H, overflow: "hidden" }}>
      <svg width={W} height={H}>
        <defs>
          <path id="text-arc" d={topArc} />
        </defs>
        <circle cx={CX} cy={CY} r={BASE_CIRCLE_R} fill={BASE_COLOR} />
        <circle cx={CX} cy={CY} r={ACCENT_CIRCLE_R} fill={ACCENT_COLOR} />
        <circle cx={CX} cy={CY} r={INNER_CIRCLE_R} fill={BASE_COLOR} />
        <circle cx={CX} cy={CY} r={DOTTED_CIRCLE_R} fill="none" stroke={ACCENT_COLOR} strokeWidth={8} strokeDasharray="16 48" strokeLinecap="round">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="20s" repeatCount="indefinite" />
        </circle>
        <g>
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="20s" repeatCount="indefinite" />
          <text textAnchor="middle" fill={ACCENT_COLOR} fontSize={80} fontWeight="bold">
            <textPath href="#text-arc" startOffset="50%">
              {outerText}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  );
}
