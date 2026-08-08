/** All 28 "Stage N - Pool" match name combinations for the event's pool play. */
const stagePoolOptions: string[] = [
  "Stage 1 - Pool A1",
  "Stage 1 - Pool A2",
  "Stage 1 - Pool B1",
  "Stage 1 - Pool B2",
  "Stage 2 - Pool C1",
  "Stage 2 - Pool C2",
  "Stage 2 - Pool D1",
  "Stage 2 - Pool D2",
  "Stage 3 - Pool E1",
  "Stage 3 - Pool E2",
  "Stage 3 - Pool F1",
  "Stage 3 - Pool F2",
  "Stage 4 - Pool G1",
  "Stage 4 - Pool G2",
  "Stage 4 - Pool H1",
  "Stage 4 - Pool H2",
  "Stage 5 - Pool I1",
  "Stage 5 - Pool I2",
  "Stage 5 - Pool J1",
  "Stage 5 - Pool J2",
  "Stage 6 - Pool K1",
  "Stage 6 - Pool K2",
  "Stage 6 - Pool L1",
  "Stage 6 - Pool L2",
  "Stage 7 - Pool M1",
  "Stage 7 - Pool N1",
  "Stage 7 - Pool O1",
  "Stage 7 - Pool P1",
];

/** Top 8 double-elim bracket round names, in start.gg's terminology. */
const bracketRoundOptions: string[] = [
  "Winners Semi-Final",
  "Losers Round 1",
  "Winners Final",
  "Losers Quarter-Final",
  "Losers Semi-Final",
  "Losers Final",
  "Grand Final",
  "Grand Final Reset",
];

export const poolMatchOptions: string[] = [
  ...stagePoolOptions,
  ...bracketRoundOptions,
];
