export type { CardSectionProps, CardContentsProps } from "./base";
export { baseChartValues } from "./base";

import {
  BaseCardCenter,
  BaseCardFooter,
  type CardContentsProps,
  MaxScoreCardCenter,
} from "./base";
import { DdrCardFooter } from "./ddr";
import { ItgCardFooter, PersonaItgCardFooter } from "./itg";
import { MaimaiCardFooter } from "./maimai";
import { DonkeyKongaCardCenter } from "./donkeykonga";
import { PersonaBaseCardCenter } from "./persona-base";

export function getContentVariants(
  cardType: string | undefined,
): CardContentsProps {
  switch (cardType) {
    case "ddr":
      return {
        CenterContent: MaxScoreCardCenter,
        FooterContent: DdrCardFooter,
      };
    case "itg":
      return {
        CenterContent: BaseCardCenter,
        FooterContent: ItgCardFooter,
      };
    case "maimai":
      return {
        CenterContent: BaseCardCenter,
        FooterContent: MaimaiCardFooter,
      };
    case "donkeykonga":
      return {
        CenterContent: DonkeyKongaCardCenter,
        FooterContent: BaseCardFooter,
      };
    default:
      return {
        CenterContent: BaseCardCenter,
        FooterContent: BaseCardFooter,
      };
  }
}

export function getPersonaContentVariants(): CardContentsProps {
  return {
    CenterContent: PersonaBaseCardCenter,
    FooterContent: PersonaItgCardFooter,
  };
}
