const W = 3840;
const H = 2160;
const BASE_CIRCLE_CX = W * 0.305;
const BASE_CIRCLE_CY = H * 0.505;
const BASE_CIRCLE_R = W * 0.1936;
const BASE_COLOR = "#00a2fe";
const ACCENT_COLOR = "white";
const ACCENT_CIRCLE_R = BASE_CIRCLE_R * 0.923;
const INNER_CIRCLE_R = BASE_CIRCLE_R * 0.89;

export function Persona3Circle() {
  return (
    <div style={{ width: W, height: H, overflow: "hidden" }}>
      <svg width={W} height={H}>
        <circle cx={BASE_CIRCLE_CX} cy={BASE_CIRCLE_CY} r={BASE_CIRCLE_R} fill={BASE_COLOR} />
        <circle cx={BASE_CIRCLE_CX} cy={BASE_CIRCLE_CY} r={ACCENT_CIRCLE_R} fill={ACCENT_COLOR} />
        <circle cx={BASE_CIRCLE_CX} cy={BASE_CIRCLE_CY} r={INNER_CIRCLE_R} fill={BASE_COLOR} />
      </svg>
    </div>
  );
}
