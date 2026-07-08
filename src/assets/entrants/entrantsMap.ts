export type EventKey =
  | "bhop1"
  | "bhop2"
  | "bhop3"
  | "bhop4"
  | "bite6"
  | "bite7"
  | "bite8"
  | "ceo2023"
  | "ceo2024"
  | "ceo2025"
  | "dd2025"
  | "itl2023"
  | "itl2024"
  | "itl2025"
  | "itl2026"
  | "panini2023"
  | "panini2024"
  | "panini2025"
  | "rip135"
  | "rip14"
  | "rip15"
  | "shine2024"
  | "shine2025"
  | "wg2024";

export const eventsMap: Record<EventKey, {
  name: string;
  url: string;
  date: string;
  totalEntrants: number;
}> = {
  itl2023: {
    name: "ITL Online 2023",
    url: "https://itl2023.groovestats.com/finalRankings",
    date: "2023-06-19",
    totalEntrants: 1096,
  },
  ceo2023: {
    name: "CEO 2023",
    url: "https://www.start.gg/tournament/ceo-2023-3/event/in-the-groove-2-sm5/brackets/1399203/2122916",
    date: "2023-06-23",
    totalEntrants: 54,
  },
  bite6: {
    name: "Beast in the East 6",
    url: "https://www.start.gg/tournament/the-beast-in-the-east-6/event/itg-customs/brackets/1448507/2194521",
    date: "2023-08-25",
    totalEntrants: 36,
  },
  panini2023: {
    name: "Panini Fest 2023",
    url: "https://ddrcommunity.com/panini-fest-2023-tournament-results/",
    date: "2023-09-02",
    totalEntrants: 35,
  },
  rip135: {
    name: "Rumble in the Prairie 13.5",
    url: "https://www.start.gg/tournament/rumble-in-the-prairie-13-5/event/itg-tech-singles/standings",
    date: "2023-11-17",
    totalEntrants: 75,
  },
  bhop1: {
    name: "BHOP Ball",
    url: "https://www.start.gg/tournament/bhop-ball/event/itg-tech-bracket/standings",
    date: "2023-12-15",
    totalEntrants: 18,
  },
  wg2024: {
    name: "Winter Groove 2024",
    url: "https://www.start.gg/tournament/winter-groove-2024-itg-tournament/event/itg-tech-singles/brackets/1553467/2332620",
    date: "2024-01-12",
    totalEntrants: 46,
  },
  rip14: {
    name: "Rumble in the Prairie 14",
    url: "https://www.start.gg/tournament/rumble-in-the-prairie-14/event/itg-tech-singles/standings",
    date: "2024-03-15",
    totalEntrants: 84,
  },
  itl2024: {
    name: "ITL Online 2024",
    url: "https://itl2024.groovestats.com/finalRankings",
    date: "2024-06-13",
    totalEntrants: 1394,
  },
  ceo2024: {
    name: "CEO 2024",
    url: "https://www.start.gg/tournament/ceo-2024-6/events/in-the-groove-2-sm5-1/brackets/1583769/2372293/standings",
    date: "2024-06-28",
    totalEntrants: 51,
  },
  bhop2: {
    name: "BHOP Ball 2",
    url: "https://www.start.gg/tournament/bhop-ball-2/event/itg-tech-bracket/standings",
    date: "2024-07-12",
    totalEntrants: 32,
  },
  bite7: {
    name: "Beast in the East 7",
    url: "https://www.start.gg/tournament/beast-in-the-east-7/event/in-the-groove-stepmania/brackets/1729799/2569227",
    date: "2024-08-09",
    totalEntrants: 60,
  },
  shine2024: {
    name: "SHINE",
    url: "https://ddrcommunity.com/shine-tournament-results/",
    date: "2024-08-24",
    totalEntrants: 16,
  },
  panini2024: {
    name: "Panini Fest 2024",
    url: "https://challonge.com/paninifest2024_itgtop16/standings",
    date: "2024-09-01",
    totalEntrants: 32,
  },
  bhop3: {
    name: "BHOP Ball 3",
    url: "https://www.start.gg/tournament/bhop-ball-3/event/itg-tech-singles/standings",
    date: "2024-12-06",
    totalEntrants: 44,
  },
  bhop4: {
    name: "BHOP Ball 4",
    url: "https://www.start.gg/tournament/bhop-ball-4/event/itg-tech-singles/standings",
    date: "2025-04-11",
    totalEntrants: 50,
  },
  ceo2025: {
    name: "CEO 2025",
    url: "https://www.start.gg/tournament/ceo-2025-6/event/itgmania/brackets/1999140/2930433",
    date: "2025-06-13",
    totalEntrants: 71,
  },
  itl2025: {
    name: "ITL Online 2025",
    url: "https://itl2025.groovestats.com/finalRankings",
    date: "2025-06-21",
    totalEntrants: 1703,
  },
  bite8: {
    name: "Beast in the East 8",
    url: "https://www.start.gg/tournament/beast-in-the-east-8/event/itgmania-main-event/brackets/2054340/3006840",
    date: "2025-08-22",
    totalEntrants: 44,
  },
  panini2025: {
    name: "Panini Fest 2025",
    url: "https://challonge.com/paninifest2025_itg_top16",
    date: "2025-09-01",
    totalEntrants: 40,
  },
  shine2025: {
    name: "SHINE Invitational 2025",
    url: "https://ddrcommunity.com/shine-invitational-2025-tournament-results/",
    date: "2025-10-11",
    totalEntrants: 16,
  },
  dd2025: {
    name: "Dash Dance",
    url: "https://www.start.gg/tournament/dash-dance/event/itg-tech-singles/",
    date: "2025-11-07",
    totalEntrants: 46,
  },
  rip15: {
    name: "Rumble in the Prairie 15",
    url: "https://www.start.gg/tournament/rumble-in-the-prairie-15/event/itg-tech-singles/standings",
    date: "2026-03-13",
    totalEntrants: 96,
  },
  itl2026: {
    name: "ITL Online 2026",
    url: "https://itl2026.groovestats.com/finalRankings",
    date: "2026-06-25",
    totalEntrants: 1769,
  },
}

export const entrantsMap: Record<number, {
  id: number;
  discriminator: string;
  membersId: number;
  entrantPlacements: Partial<Record<EventKey, number>>,
} | undefined> = {
  // Agent A
  [2626971]: {
    id: 2626971,
    discriminator: "e4e1304b",
    membersId: 176321,
    entrantPlacements: {
      itl2023: 928,
      itl2024: 292,
      itl2025: 217,
      itl2026: 302,
    },
  },
  // Andeh [LONESTAR]
  [1955111]: {
    id: 1955111,
    discriminator: "e9b9f217",
    membersId: 173716,
    entrantPlacements: {
      itl2023: 183,
      itl2024: 214,
      itl2025: 110,
      itl2026: 80,
      panini2025: 13,
      rip15: 17,
    },
  },
  // BigYama
  [1956381]: {
    id: 1956381,
    discriminator: "f9901178",
    membersId: 3983,
    entrantPlacements: {
      itl2023: 200,
      itl2024: 192,
      itl2025: 202,
      itl2026: 260,
    },
  },
  // Blizzrdball
  [1970499]: {
    id: 1970499,
    discriminator: "bdbeaaf0",
    membersId: 61697,
    entrantPlacements: {
      itl2023: 143,
      itl2024: 157,
      itl2025: 184,
      itl2026: 191,
      panini2024: 13,
      rip135: 29,
    },
  },
  // Bostic300
  [2628662]: {
    id: 2628662,
    discriminator: "d4495286",
    membersId: 175571,
    entrantPlacements: {
      itl2023: 492,
      itl2025: 113,
      itl2026: 37,
    },
  },
  // Captain Carbon [TBD]
  [486724]: {
    id: 486724,
    discriminator: "92e538cc",
    membersId: 44806,
    entrantPlacements: {
      itl2023: 56,
      itl2024: 40,
      itl2025: 589,
      itl2026: 100,
    },
  },
  // CarterTheQ [DDRIllini]
  [12877]: {
    id: 12877,
    discriminator: "db47f574",
    membersId: 128275,
    entrantPlacements: {
      bhop2: 7,
      bhop3: 13,
      bhop4: 13,
      dd2025: 13,
      itl2023: 153,
      itl2024: 398,
      itl2025: 1558,
      itl2026: 788,
      rip135: 21,
      rip14: 17,
      rip15: 37,
    },
  },
  // Chance R.
  [2008712]: {
    id: 2008712,
    discriminator: "3a372353",
    membersId: 133006,
    entrantPlacements: {
      bhop4: 1,
      ceo2024: 5,
      ceo2025: 1,
      itl2023: 5,
      itl2024: 2,
      itl2025: 1,
      itl2026: 2,
      panini2023: 3,
      panini2024: 1,
      panini2025: 1,
      rip135: 3,
      rip14: 5,
      rip15: 1,
      shine2024: 2,
      shine2025: 3,
      wg2024: 5,
    },
  },
  // cheesecake [HFIL]
  [14485]: {
    id: 14485,
    discriminator: "b1875b2d",
    membersId: 2174,
    entrantPlacements: {},
  },
  // chezmix [RNG]
  [1451396]: {
    id: 1451396,
    discriminator: "9ab67a73",
    membersId: 1,
    entrantPlacements: {
      itl2023: 614,
      itl2024: 186,
      itl2025: 510,
      itl2026: 645,
    },
  },
  // Chief Skittles [STORM]
  [2099374]: {
    id: 2099374,
    discriminator: "04153250",
    membersId: 66673,
    entrantPlacements: {
      itl2023: 66,
      itl2024: 75,
      itl2025: 83,
      itl2026: 109,
      rip14: 13,
      rip15: 25,
    },
  },
  // cousinoer5
  [2158665]: {
    id: 2158665,
    discriminator: "63385614",
    membersId: 170786,
    entrantPlacements: {
      itl2024: 441,
      itl2025: 454,
      itl2026: 454,
    },
  },
  // DomDeeKong
  [488761]: {
    id: 488761,
    discriminator: "20fcba89",
    membersId: 66487,
    entrantPlacements: {
      itl2023: 377,
      itl2024: 261,
      itl2025: 165,
      itl2026: 170,
    },
  },
  // Eesa
  [1814321]: {
    id: 1814321,
    discriminator: "d9a6772f",
    membersId: 147676,
    entrantPlacements: {
      bhop3: 17,
      bhop4: 13,
      dd2025: 13,
      itl2023: 144,
      itl2024: 187,
      itl2025: 144,
      itl2026: 172,
      rip15: 45,
    },
  },
  // EvilDave219 [TBD]
  [436678]: {
    id: 436678,
    discriminator: "96661b6c",
    membersId: 661,
    entrantPlacements: {},
  },
  // FabSab440 [IIDX]
  [630151]: {
    id: 630151,
    discriminator: "76ce2ba6",
    membersId: 66610,
    entrantPlacements: {
      itl2023: 536,
      itl2024: 338,
      itl2025: 667,
    },
  },
  // fastboy [pals]
  [4634]: {
    id: 4634,
    discriminator: "473f3ee1",
    membersId: 118539,
    entrantPlacements: {
      itl2023: 299,
      itl2024: 263,
      itl2025: 356,
      itl2026: 1520,
    },
  },
  // Flash
  [2072594]: {
    id: 2072594,
    discriminator: "baf87bf4",
    membersId: 4306,
    entrantPlacements: {
      bite8: 4,
      ceo2023: 5,
      ceo2024: 5,
      ceo2025: 7,
      itl2023: 18,
      itl2024: 19,
      itl2025: 24,
      itl2026: 40,
      panini2025: 7,
      wg2024: 2,
    },
  },
  // Flip
  [2090414]: {
    id: 2090414,
    discriminator: "8a84a321",
    membersId: 5571,
    entrantPlacements: {
      itl2025: 640,
      itl2026: 186,
    },
  },
  // GalaxyStar
  [638828]: {
    id: 638828,
    discriminator: "b79537a2",
    membersId: 187831,
    entrantPlacements: {
      itl2025: 850,
      itl2026: 1354,
    },
  },
  // Goomba Roomba [Bhop]
  [2403703]: {
    id: 2403703,
    discriminator: "5392e440",
    membersId: 178749,
    entrantPlacements: {
      bhop1: 5,
      bhop2: 5,
      bhop3: 9,
      bhop4: 5,
      dd2025: 7,
      itl2024: 122,
      itl2025: 39,
      itl2026: 16,
      rip135: 45,
      rip14: 21,
      rip15: 17,
    },
  },
  // HeavyMode
  [3171983]: {
    id: 3171983,
    discriminator: "3d399b44",
    membersId: 175406,
    entrantPlacements: {
      dd2025: 17,
      itl2023: 411,
      itl2024: 194,
      itl2025: 143,
      itl2026: 134,
      rip15: 29,
    },
  },
  // Higgy
  [2121528]: {
    id: 2121528,
    discriminator: "8f9d2f17",
    membersId: 171721,
    entrantPlacements: {
      itl2023: 53,
      itl2024: 78,
      itl2025: 61,
      itl2026: 72,
      rip135: 13,
    },
  },
  // idontevenknowyou
  [3008718]: {
    id: 3008718,
    discriminator: "0669859a",
    membersId: 175363,
    entrantPlacements: {
      itl2023: 170,
      itl2024: 70,
      itl2025: 58,
      itl2026: 60,
    },
  },
  // itgalex
  [2027270]: {
    id: 2027270,
    discriminator: "97813247",
    membersId: 46152,
    entrantPlacements: {
      itl2023: 713,
      itl2024: 813,
      itl2025: 687,
      itl2026: 12,
    },
  },
  // JONBUDDY [OCG]
  [746713]: {
    id: 746713,
    discriminator: "40382427",
    membersId: 127823,
    entrantPlacements: {
      itl2023: 605,
      itl2024: 555,
      itl2025: 752,
      itl2026: 664,
    },
  },
  // KEAK
  [2048909]: {
    id: 2048909,
    discriminator: "391ac297",
    membersId: 194288,
    entrantPlacements: {
      itl2026: 368,
    },
  },
  // Koffee
  [2409673]: {
    id: 2409673,
    discriminator: "d1207fcb",
    membersId: 177112,
    entrantPlacements: {
      itl2024: 395,
      itl2025: 274,
      itl2026: 256,
      rip15: 57,
    },
  },
  // Lazor
  [2267114]: {
    id: 2267114,
    discriminator: "0d539df8",
    membersId: 174948,
    entrantPlacements: {
      itl2024: 429,
      itl2025: 149,
      itl2026: 96,
    },
  },
  // leontwix
  [498791]: {
    id: 498791,
    discriminator: "9e90235e",
    membersId: 6284,
    entrantPlacements: {
      ceo2023: 2,
      itl2023: 7,
      itl2024: 18,
      itl2025: 1368,
    },
  },
  // LIGHTW8
  [2151595]: {
    id: 2151595,
    discriminator: "2121c3fa",
    membersId: 175904,
    entrantPlacements: {
      itl2023: 430,
      itl2025: 282,
      itl2026: 117,
    },
  },
  // Limen
  [155600]: {
    id: 155600,
    discriminator: "e3964cf2",
    membersId: 183712,
    entrantPlacements: {
      itl2026: 1294,
    },
  },
  // lolipo
  [436726]: {
    id: 436726,
    discriminator: "1d674757",
    membersId: 35701,
    entrantPlacements: {
      bhop2: 3,
      bhop3: 3,
      bhop4: 4,
      bite8: 5,
      ceo2023: 9,
      ceo2024: 7,
      ceo2025: 9,
      dd2025: 5,
      itl2023: 15,
      itl2024: 14,
      itl2025: 28,
      itl2026: 10,
      panini2025: 5,
      rip14: 5,
      rip15: 13,
    },
  },
  // mdx
  [605243]: {
    id: 605243,
    discriminator: "76f9d3bd",
    membersId: 174515,
    entrantPlacements: {
      itl2024: 65,
      itl2025: 241,
      itl2026: 43,
      panini2025: 9,
      rip15: 17,
    },
  },
  // meowbois
  [473823]: {
    id: 473823,
    discriminator: "6b96f2ab",
    membersId: 182892,
    entrantPlacements: {
      itl2025: 637,
      itl2026: 445,
    },
  },
  // midtown
  [2354355]: {
    id: 2354355,
    discriminator: "649127bf",
    membersId: 175365,
    entrantPlacements: {
      bhop2: 4,
      bhop3: 7,
      dd2025: 5,
      itl2023: 117,
      itl2024: 72,
      itl2025: 27,
      itl2026: 17,
      rip135: 17,
      rip14: 17,
      rip15: 5,
      shine2025: 7,
    },
  },
  // Miligram
  [727583]: {
    id: 727583,
    discriminator: "db6de701",
    membersId: 98817,
    entrantPlacements: {
      itl2023: 329,
      itl2024: 167,
      itl2025: 231,
      itl2026: 156,
    },
  },
  // PenguinMessiah
  [3291058]: {
    id: 3291058,
    discriminator: "d3ca308a",
    membersId: 188718,
    entrantPlacements: {
      itl2025: 443,
      itl2026: 1123,
    },
  },
  // PolloxX
  [806211]: {
    id: 806211,
    discriminator: "613d4730",
    membersId: 6678,
    entrantPlacements: {
      itl2023: 187,
      itl2024: 243,
      itl2025: 218,
      itl2026: 1579,
    },
  },
  // RisaOzu
  [2152274]: {
    id: 2152274,
    discriminator: "16497141",
    membersId: 175886,
    entrantPlacements: {
      itl2023: 673,
      itl2024: 468,
      itl2025: 433,
      itl2026: 457,
    },
  },
  // Rynker
  [437458]: {
    id: 437458,
    discriminator: "f63b99dd",
    membersId: 4062,
    entrantPlacements: {
      bhop1: 1,
      bhop2: 2,
      bhop3: 2,
      bhop4: 2,
      bite8: 1,
      ceo2023: 1,
      ceo2024: 2,
      ceo2025: 4,
      dd2025: 1,
      itl2023: 6,
      itl2024: 6,
      itl2025: 5,
      itl2026: 5,
      panini2025: 2,
      rip135: 1,
      rip14: 1,
      rip15: 2,
      shine2024: 6,
      shine2025: 1,
    },
  },
  // Ryuguu
  [3266358]: {
    id: 3266358,
    discriminator: "f04c1451",
    membersId: 194624,
    entrantPlacements: {
      itl2026: 285,
    },
  },
  // SailorMoonElite
  [2206880]: {
    id: 2206880,
    discriminator: "1ec6593b",
    membersId: 173554,
    entrantPlacements: {
      itl2023: 308,
      itl2024: 477,
      itl2025: 656,
      itl2026: 780,
      rip135: 33,
    },
  },
  // simplySOUF [STUUF]
  [2298424]: {
    id: 2298424,
    discriminator: "857ad296",
    membersId: 8535,
    entrantPlacements: {},
  },
  // SirDelins
  [2275154]: {
    id: 2275154,
    discriminator: "97d82fb9",
    membersId: 127205,
    entrantPlacements: {
      itl2025: 1359,
      itl2026: 1084,
    },
  },
  // Skate
  [2400497]: {
    id: 2400497,
    discriminator: "3c532367",
    membersId: 178992,
    entrantPlacements: {
      bhop1: 13,
      bhop2: 27,
      bhop3: 33,
      bhop4: 29,
      dd2025: 33,
      itl2024: 1149,
      itl2025: 550,
      itl2026: 463,
      rip135: 61,
      rip14: 73,
      rip15: 61,
    },
  },
  // SpeakEZ
  [94078]: {
    id: 94078,
    discriminator: "03229ef1",
    membersId: 188881,
    entrantPlacements: {
      itl2025: 1041,
      itl2026: 745,
      rip15: 69,
    },
  },
  // Sudzi
  [231667]: {
    id: 231667,
    discriminator: "a24fd984",
    membersId: 36049,
    entrantPlacements: {
      itl2023: 44,
      itl2024: 44,
      itl2025: 32,
      itl2026: 20,
      panini2025: 9,
      rip135: 5,
      rip14: 7,
      rip15: 9,
      shine2025: 4,
    },
  },
  // T. Swag
  [497819]: {
    id: 497819,
    discriminator: "2ddd55d0",
    membersId: 8349,
    entrantPlacements: {
      itl2023: 61,
      itl2024: 1398,
      itl2025: 85,
      itl2026: 1689,
      rip14: 13,
      rip15: 37,
    },
  },
  // teejusb
  [90040]: {
    id: 90040,
    discriminator: "ea646ec3",
    membersId: 50287,
    entrantPlacements: {
      itl2023: 120,
      itl2024: 139,
      itl2025: 236,
      itl2026: 277,
      rip135: 25,
      rip15: 45,
    },
  },
  // TommyDoesntMiss
  [486388]: {
    id: 486388,
    discriminator: "75cf6b41",
    membersId: 66784,
    entrantPlacements: {
      bhop3: 13,
      dd2025: 9,
      itl2023: 67,
      itl2024: 87,
      itl2025: 76,
      itl2026: 92,
      rip135: 9,
      rip15: 21,
    },
  },
  // Ty
  [792951]: {
    id: 792951,
    discriminator: "d0e4d8b9",
    membersId: 33185,
    entrantPlacements: {
      ceo2023: 9,
      itl2023: 424,
      itl2024: 267,
      itl2025: 48,
      itl2026: 18,
    },
  },
  // undrscore
  [2296976]: {
    id: 2296976,
    discriminator: "741bcead",
    membersId: 174873,
    entrantPlacements: {
      itl2023: 844,
      itl2024: 148,
      itl2025: 104,
      itl2026: 31,
    },
  },
  // VincentITG [ROBERTO]
  [656475]: {
    id: 656475,
    discriminator: "226cd505",
    membersId: 65671,
    entrantPlacements: {
      bhop3: 5,
      ceo2025: 9,
      dd2025: 7,
      itl2023: 29,
      itl2024: 17,
      itl2025: 30,
      itl2026: 68,
      rip135: 9,
      rip14: 9,
      rip15: 21,
    },
  },
  // VivaLaMoo [STORM]
  [143547]: {
    id: 143547,
    discriminator: "3aadda80",
    membersId: 4362,
    entrantPlacements: {
      bhop3: 1,
      bhop4: 5,
      bite7: 3,
      bite8: 2,
      ceo2023: 3,
      ceo2025: 5,
      dd2025: 2,
      itl2023: 8,
      itl2024: 10,
      itl2025: 12,
      itl2026: 7,
      panini2023: 1,
      panini2025: 4,
      rip14: 2,
      rip15: 9,
      shine2024: 3,
      wg2024: 4,
    },
  },
  // WDRM
  [1838861]: {
    id: 1838861,
    discriminator: "1f8376b0",
    membersId: 180548,
    entrantPlacements: {
      bhop3: 13,
      itl2024: 487,
    },
  },
  // X!!
  [2214618]: {
    id: 2214618,
    discriminator: "3cc8c8ed",
    membersId: 175512,
    entrantPlacements: {
      itl2023: 445,
      itl2024: 277,
      itl2025: 156,
      itl2026: 139,
    },
  },
  // XjojoX
  [1785438]: {
    id: 1785438,
    discriminator: "d3882fa8",
    membersId: 173043,
    entrantPlacements: {
      ceo2025: 9,
      itl2023: 77,
      itl2024: 42,
      itl2025: 62,
      itl2026: 51,
      panini2024: 5,
      panini2025: 9,
      rip14: 9,
      rip15: 21,
    },
  },
  // Yokamaa [MOISTBOIS]
  [1786551]: {
    id: 1786551,
    discriminator: "1ee0ca7e",
    membersId: 170806,
    entrantPlacements: {
      itl2023: 237,
      itl2024: 83,
      itl2025: 137,
      itl2026: 107,
      panini2024: 7,
      panini2025: 13,
    },
  },
  // Yung Buttcoin
  [231774]: {
    id: 231774,
    discriminator: "1336c4bf",
    membersId: 6911,
    entrantPlacements: {
      rip135: 13,
      rip14: 21,
      rip15: 25,
    },
  }
}
