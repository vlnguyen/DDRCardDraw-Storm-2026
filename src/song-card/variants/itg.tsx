import { BaseCardFooter, CardSectionProps, baseChartValues } from "./base";
import { PersonaBaseCardFooter } from "./persona-base";

export function ItgCardFooter(props: CardSectionProps) {
  const { flags } = baseChartValues(props.chart);
  return (
    <BaseCardFooter
      chart={props.chart}
      centerElement={flags?.includes("noCmod") && "🚫"}
    />
  );
}

export function PersonaItgCardFooter(props: CardSectionProps) {
  const { flags } = baseChartValues(props.chart);
  return (
    <PersonaBaseCardFooter
      chart={props.chart}
      winner={props.winner}
      centerElement={flags?.includes("noCmod") && "🚫"}
    />
  );
}
