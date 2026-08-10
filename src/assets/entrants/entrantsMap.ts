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
  | "rip13"
  | "rip135"
  | "rip14"
  | "rip15"
  | "shine2024"
  | "shine2025"
  | "wg2024";

export type ItlRankingPointsKey = `itl${string}rp`;

export const eventsMap: Record<
  EventKey,
  {
    name: string;
    url: string;
    date: string;
    totalEntrants: number;
  }
> = {
  rip13: {
    name: "Rumble in the Prairie 13",
    url: "https://www.start.gg/tournament/rumble-in-the-prairie-13/event/itg-tech-singles/standings",
    date: "2023-03-10",
    totalEntrants: 84,
  },
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
};

/** Registered for the current event but didn't end up with a seed.
 * Distinguished from `null`, which means
 * the player isn't in this event's entrants list at all. */
export const SEED_UNSEEDED = -1;

export const entrantsMap: Record<
  number,
  | {
      id: number;
      discriminator: string;
      // Not every entrant has a known GrooveStats member id (e.g. players
      // added only via the current event's start.gg roster, with no prior
      // ITL history to source it from).
      membersId?: number;
      entrantPlacements: Partial<Record<EventKey, number>> &
        Partial<Record<ItlRankingPointsKey, number>>;
      /** Current event seed. `SEED_UNSEEDED` if registered but unseeded,
       * `null` if not registered for the current event. Never undefined —
       * every entry must explicitly say which of these applies. */
      seed: number | null;
    }
  | undefined
> = {
  // Agent A
  [2626971]: {
    id: 2626971,
    discriminator: "e4e1304b",
    membersId: 176321,
    entrantPlacements: {
      itl2023: 928,
      itl2023rp: 20878,
      itl2024: 292,
      itl2024rp: 329698,
      itl2025: 217,
      itl2025rp: 390126,
      itl2026: 302,
      itl2026rp: 379560,
    },
    seed: 43,
  },
  // Alex
  [3396838]: {
    id: 3396838,
    discriminator: "",
    entrantPlacements: {},
    seed: 65,
  },
  // Andeh [LONESTAR]
  [1955111]: {
    id: 1955111,
    discriminator: "e9b9f217",
    membersId: 173716,
    entrantPlacements: {
      itl2023: 183,
      itl2023rp: 350033,
      itl2024: 214,
      itl2024rp: 376275,
      itl2025: 110,
      itl2025rp: 470400,
      itl2026: 80,
      itl2026rp: 515297,
      panini2025: 13,
      rip15: 17,
    },
    seed: 18,
  },
  // ANDROO [RNG]
  [1787090]: {
    id: 1787090,
    discriminator: "c7bd7fec",
    entrantPlacements: {},
    seed: 34,
  },
  // Angel_Who [BITE]
  [631250]: {
    id: 631250,
    discriminator: "eb8dc0e6",
    entrantPlacements: {},
    seed: SEED_UNSEEDED,
  },
  // BadAntelope
  [3439497]: {
    id: 3439497,
    discriminator: "7df3718e",
    entrantPlacements: {},
    seed: 66,
  },
  // baraka
  [473954]: {
    id: 473954,
    discriminator: "9d0dfc93",
    membersId: 8181,
    entrantPlacements: {
      ceo2023: 5,
      ceo2025: 9,
      itl2023: 11,
      itl2023rp: 543779,
      itl2024: 22,
      itl2024rp: 546679,
      itl2025: 31,
      itl2025rp: 554393,
      itl2026: 50,
      itl2026rp: 540558,
    },
    seed: 12,
  },
  // BarinRojo
  [3441371]: {
    id: 3441371,
    discriminator: "8df3e68c",
    entrantPlacements: {},
    seed: 69,
  },
  // BigYama
  [1956381]: {
    id: 1956381,
    discriminator: "f9901178",
    membersId: 3983,
    entrantPlacements: {
      itl2023: 200,
      itl2023rp: 337566,
      itl2024: 192,
      itl2024rp: 388040,
      itl2025: 202,
      itl2025rp: 400176,
      itl2026: 260,
      itl2026rp: 400469,
    },
    seed: 39,
  },
  // Blizzrdball
  [1970499]: {
    id: 1970499,
    discriminator: "bdbeaaf0",
    membersId: 61697,
    entrantPlacements: {
      itl2023: 143,
      itl2023rp: 376838,
      itl2024: 157,
      itl2024rp: 417162,
      itl2025: 184,
      itl2025rp: 406994,
      itl2026: 191,
      itl2026rp: 442396,
      panini2024: 13,
      rip13: 25,
      rip135: 29,
    },
    seed: 32,
  },
  // BMG!!
  [3286044]: {
    id: 3286044,
    discriminator: "edccd012",
    entrantPlacements: {},
    seed: 60,
  },
  // Bostic300
  [2628662]: {
    id: 2628662,
    discriminator: "d4495286",
    membersId: 175571,
    entrantPlacements: {
      itl2023: 492,
      itl2023rp: 180756,
      itl2025: 113,
      itl2025rp: 469524,
      itl2026: 37,
      itl2026rp: 563798,
    },
    seed: 15,
  },
  // Captain Carbon [TBD]
  [486724]: {
    id: 486724,
    discriminator: "92e538cc",
    membersId: 44806,
    entrantPlacements: {
      itl2023: 56,
      itl2023rp: 455070,
      itl2024: 40,
      itl2024rp: 525908,
      itl2025: 589,
      itl2025rp: 231834,
      itl2026: 100,
      itl2026rp: 503370,
    },
    seed: SEED_UNSEEDED,
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
      itl2023rp: 371658,
      itl2024: 398,
      itl2024rp: 280265,
      itl2025: 1558,
      itl2025rp: 9723,
      itl2026: 788,
      itl2026rp: 173345,
      rip13: 33,
      rip135: 21,
      rip14: 17,
      rip15: 37,
    },
    seed: 35,
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
      itl2023rp: 573964,
      itl2024: 2,
      itl2024rp: 611121,
      itl2025: 1,
      itl2025rp: 650994,
      itl2026: 2,
      itl2026rp: 651542,
      panini2023: 3,
      panini2024: 1,
      panini2025: 1,
      rip13: 7,
      rip135: 3,
      rip14: 5,
      rip15: 1,
      shine2024: 2,
      shine2025: 3,
      wg2024: 5,
    },
    seed: 1,
  },
  // cheesecake [HFIL]
  [14485]: {
    id: 14485,
    discriminator: "b1875b2d",
    membersId: 2174,
    entrantPlacements: {},
    seed: 59,
  },
  // chezmix [RNG]
  [1451396]: {
    id: 1451396,
    discriminator: "9ab67a73",
    membersId: 1,
    entrantPlacements: {
      itl2023: 614,
      itl2023rp: 115172,
      itl2024: 186,
      itl2024rp: 392430,
      itl2025: 510,
      itl2025rp: 259576,
      itl2026: 645,
      itl2026rp: 229486,
    },
    seed: 24,
  },
  // Chief Skittles [STORM]
  [2099374]: {
    id: 2099374,
    discriminator: "04153250",
    membersId: 66673,
    entrantPlacements: {
      itl2023: 66,
      itl2023rp: 444613,
      itl2024: 75,
      itl2024rp: 488748,
      itl2025: 83,
      itl2025rp: 500035,
      itl2026: 109,
      itl2026rp: 498706,
      rip13: 21,
      rip14: 13,
      rip15: 25,
    },
    seed: 21,
  },
  // cousinoer5
  [2158665]: {
    id: 2158665,
    discriminator: "63385614",
    membersId: 170786,
    entrantPlacements: {
      itl2024: 441,
      itl2024rp: 258973,
      itl2025: 454,
      itl2025rp: 280102,
      itl2026: 454,
      itl2026rp: 305284,
    },
    seed: 51,
  },
  // Crash Cringle
  [3439532]: {
    id: 3439532,
    discriminator: "73b1897a",
    membersId: 74441,
    entrantPlacements: {
      itl2023: 554,
      itl2023rp: 142940,
      itl2024: 283,
      itl2024rp: 336670,
      itl2025: 290,
      itl2025rp: 348942,
      itl2026: 382,
      itl2026rp: 338334,
    },
    seed: 47,
  },
  // Darkstar
  [2652265]: {
    id: 2652265,
    discriminator: "b6af19a7",
    membersId: 4730,
    entrantPlacements: {
      itl2023: 50,
      itl2023rp: 467221,
      itl2024: 64,
      itl2024rp: 496787,
      itl2025: 29,
      itl2025rp: 555573,
      itl2026: 28,
      itl2026rp: 579718,
      dd2025: 9,
    },
    seed: 14,
  },
  // dashark
  [2119088]: {
    id: 2119088,
    discriminator: "2f8f7845",
    membersId: 124751,
    entrantPlacements: {},
    seed: 25,
  },
  // datcoreedoe
  [2230581]: {
    id: 2230581,
    discriminator: "e549c65b",
    entrantPlacements: {},
    seed: 50,
  },
  // DIGI [MAH MI]
  [487027]: {
    id: 487027,
    discriminator: "dbd9b614",
    entrantPlacements: {},
    seed: SEED_UNSEEDED,
  },
  // DomDeeKong
  [488761]: {
    id: 488761,
    discriminator: "20fcba89",
    membersId: 66487,
    entrantPlacements: {
      itl2023: 377,
      itl2023rp: 243606,
      itl2024: 261,
      itl2024rp: 350817,
      itl2025: 165,
      itl2025rp: 418878,
      itl2026: 170,
      itl2026rp: 452549,
    },
    seed: 31,
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
      itl2023rp: 376686,
      itl2024: 187,
      itl2024rp: 391702,
      itl2025: 144,
      itl2025rp: 436328,
      itl2026: 172,
      itl2026rp: 451961,
      rip15: 45,
    },
    seed: 26,
  },
  // EMCAT [RNG]
  [739936]: {
    id: 739936,
    discriminator: "ff8ebf72",
    entrantPlacements: {},
    seed: SEED_UNSEEDED,
  },
  // Emmp
  [3265571]: {
    id: 3265571,
    discriminator: "",
    entrantPlacements: {},
    seed: 61,
  },
  // EvanS [ASU]
  [2512771]: {
    id: 2512771,
    discriminator: "b8aaf24f",
    entrantPlacements: {},
    seed: 62,
  },
  // EvilDave219 [TBD]
  [436678]: {
    id: 436678,
    discriminator: "96661b6c",
    membersId: 661,
    entrantPlacements: {},
    seed: 33,
  },
  // FabSab440 [IIDX]
  [630151]: {
    id: 630151,
    discriminator: "76ce2ba6",
    membersId: 66610,
    entrantPlacements: {
      itl2023: 536,
      itl2023rp: 151821,
      itl2024: 338,
      itl2024rp: 310243,
      itl2025: 667,
      itl2025rp: 209209,
    },
    seed: 41,
  },
  // fastboy [pals]
  [4634]: {
    id: 4634,
    discriminator: "473f3ee1",
    membersId: 118539,
    entrantPlacements: {
      itl2023: 299,
      itl2023rp: 282303,
      itl2024: 263,
      itl2024rp: 350411,
      itl2025: 356,
      itl2025rp: 313022,
      itl2026: 1520,
      itl2026rp: 17501,
    },
    seed: null,
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
      itl2023rp: 515029,
      itl2024: 19,
      itl2024rp: 557293,
      itl2025: 24,
      itl2025rp: 578283,
      itl2026: 40,
      itl2026rp: 556912,
      panini2025: 7,
      wg2024: 2,
    },
    seed: 4,
  },
  // Flip
  [2090414]: {
    id: 2090414,
    discriminator: "8a84a321",
    membersId: 5571,
    entrantPlacements: {
      itl2025: 640,
      itl2025rp: 219042,
      itl2026: 186,
      itl2026rp: 448866,
    },
    seed: 13,
  },
  // GalaxyStar
  [638828]: {
    id: 638828,
    discriminator: "b79537a2",
    membersId: 187831,
    entrantPlacements: {
      itl2025: 850,
      itl2025rp: 148197,
      itl2026: 1354,
      itl2026rp: 38000,
    },
    seed: null,
  },
  // GlitchedGoddess [Twitch]
  [3065163]: {
    id: 3065163,
    discriminator: "a4c7a09f",
    entrantPlacements: {},
    seed: 64,
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
      itl2024rp: 450267,
      itl2025: 39,
      itl2025rp: 543139,
      itl2026: 16,
      itl2026rp: 600256,
      rip135: 45,
      rip14: 21,
      rip15: 17,
    },
    seed: 10,
  },
  // HeavyMode
  [3171983]: {
    id: 3171983,
    discriminator: "3d399b44",
    membersId: 175406,
    entrantPlacements: {
      dd2025: 17,
      itl2023: 411,
      itl2023rp: 226150,
      itl2024: 194,
      itl2024rp: 385816,
      itl2025: 143,
      itl2025rp: 437548,
      itl2026: 134,
      itl2026rp: 480389,
      rip15: 29,
    },
    seed: 28,
  },
  // Higgy
  [2121528]: {
    id: 2121528,
    discriminator: "8f9d2f17",
    membersId: 171721,
    entrantPlacements: {
      itl2023: 53,
      itl2023rp: 459189,
      itl2024: 78,
      itl2024rp: 482456,
      itl2025: 61,
      itl2025rp: 517529,
      itl2026: 72,
      itl2026rp: 526160,
      rip13: 17,
      rip135: 13,
    },
    seed: 19,
  },
  // idontevenknowyou
  [3008718]: {
    id: 3008718,
    discriminator: "0669859a",
    membersId: 175363,
    entrantPlacements: {
      itl2023: 170,
      itl2023rp: 357069,
      itl2024: 70,
      itl2024rp: 492165,
      itl2025: 58,
      itl2025rp: 520165,
      itl2026: 60,
      itl2026rp: 531297,
    },
    seed: 17,
  },
  // itgalex
  [2027270]: {
    id: 2027270,
    discriminator: "97813247",
    membersId: 46152,
    entrantPlacements: {
      itl2023: 713,
      itl2023rp: 72784,
      itl2024: 813,
      itl2024rp: 103108,
      itl2025: 687,
      itl2025rp: 201953,
      itl2026: 12,
      itl2026rp: 603358,
    },
    seed: 6,
  },
  // Itss2Eazyy
  [3442890]: {
    id: 3442890,
    discriminator: "49ee8d5d",
    entrantPlacements: {},
    seed: 74,
  },
  // JeauxColorado
  [3441225]: {
    id: 3441225,
    discriminator: "2b2eb2e3",
    entrantPlacements: {},
    seed: 72,
  },
  // Jhennyinthecup
  [781642]: {
    id: 781642,
    discriminator: "05b58e89",
    membersId: 128840,
    entrantPlacements: {
      itl2023: 74,
      itl2023rp: 368594,
      itl2024: 92,
      itl2024rp: 417810,
      itl2025: 1505,
      itl2025rp: 13478,
    },
    seed: 48,
  },
  // JONBUDDY [OCG]
  [746713]: {
    id: 746713,
    discriminator: "40382427",
    membersId: 127823,
    entrantPlacements: {
      itl2023: 605,
      itl2023rp: 117649,
      itl2024: 555,
      itl2024rp: 216526,
      itl2025: 752,
      itl2025rp: 176793,
      itl2026: 664,
      itl2026rp: 221094,
    },
    seed: 55,
  },
  // KEAK
  [2048909]: {
    id: 2048909,
    discriminator: "391ac297",
    membersId: 194288,
    entrantPlacements: {
      itl2026: 368,
      itl2026rp: 344770,
    },
    seed: 42,
  },
  // kickinnc2
  [3442088]: {
    id: 3442088,
    discriminator: "",
    entrantPlacements: {},
    seed: 70,
  },
  // Koffee
  [2409673]: {
    id: 2409673,
    discriminator: "d1207fcb",
    membersId: 177112,
    entrantPlacements: {
      itl2024: 395,
      itl2024rp: 282563,
      itl2025: 274,
      itl2025rp: 356930,
      itl2026: 256,
      itl2026rp: 401328,
      rip15: 57,
    },
    seed: 38,
  },
  // Lazor
  [2267114]: {
    id: 2267114,
    discriminator: "0d539df8",
    membersId: 174948,
    entrantPlacements: {
      itl2024: 429,
      itl2024rp: 262845,
      itl2025: 149,
      itl2025rp: 432722,
      itl2026: 96,
      itl2026rp: 504475,
    },
    seed: 27,
  },
  // leontwix
  [498791]: {
    id: 498791,
    discriminator: "9e90235e",
    membersId: 6284,
    entrantPlacements: {
      ceo2023: 2,
      itl2023: 7,
      itl2023rp: 561793,
      itl2024: 18,
      itl2024rp: 558919,
      itl2025: 1368,
      itl2025rp: 27066,
    },
    seed: null,
  },
  // LIGHTW8
  [2151595]: {
    id: 2151595,
    discriminator: "2121c3fa",
    membersId: 175904,
    entrantPlacements: {
      itl2023: 430,
      itl2023rp: 217050,
      itl2025: 282,
      itl2025rp: 351611,
      itl2026: 117,
      itl2026rp: 493045,
    },
    seed: 23,
  },
  // Limen
  [155600]: {
    id: 155600,
    discriminator: "e3964cf2",
    membersId: 183712,
    entrantPlacements: {
      itl2026: 1294,
      itl2026rp: 47816,
    },
    seed: 58,
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
      itl2023rp: 522109,
      itl2024: 14,
      itl2024rp: 567433,
      itl2025: 28,
      itl2025rp: 567633,
      itl2026: 10,
      itl2026rp: 606542,
      panini2025: 5,
      rip13: 9,
      rip14: 5,
      rip15: 13,
    },
    seed: 5,
  },
  // Malia
  [627949]: {
    id: 627949,
    discriminator: "114a6fea",
    membersId: 136487,
    entrantPlacements: {
      bhop4: 37,
      dd2025: 29,
      itl2023: 542,
      itl2023rp: 150116,
      itl2024: 385,
      itl2024rp: 291184,
      itl2025: 483,
      itl2025rp: 267829,
      itl2026: 471,
      itl2026rp: 300936,
    },
    seed: 45,
  },
  // Matty Ice
  [231774]: {
    id: 231774,
    discriminator: "1336c4bf",
    membersId: 6911,
    entrantPlacements: {
      rip13: 13,
      rip135: 13,
      rip14: 21,
      rip15: 25,
    },
    seed: SEED_UNSEEDED,
  },
  // mdx
  [605243]: {
    id: 605243,
    discriminator: "76f9d3bd",
    membersId: 174515,
    entrantPlacements: {
      itl2024: 65,
      itl2024rp: 496521,
      itl2025: 241,
      itl2025rp: 376448,
      itl2026: 43,
      itl2026rp: 551737,
      panini2025: 9,
      rip15: 17,
    },
    seed: 9,
  },
  // meowbois
  [473823]: {
    id: 473823,
    discriminator: "6b96f2ab",
    membersId: 182892,
    entrantPlacements: {
      itl2025: 637,
      itl2025rp: 219851,
      itl2026: 445,
      itl2026rp: 311990,
    },
    seed: 52,
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
      itl2023rp: 399313,
      itl2024: 72,
      itl2024rp: 490713,
      itl2025: 27,
      itl2025rp: 571452,
      itl2026: 17,
      itl2026rp: 596937,
      rip135: 17,
      rip14: 17,
      rip15: 5,
      shine2025: 7,
    },
    seed: 7,
  },
  // Miligram
  [727583]: {
    id: 727583,
    discriminator: "db6de701",
    membersId: 98817,
    entrantPlacements: {
      itl2023: 329,
      itl2023rp: 266884,
      itl2024: 167,
      itl2024rp: 407190,
      itl2025: 231,
      itl2025rp: 381120,
      itl2026: 156,
      itl2026rp: 462263,
    },
    seed: 29,
  },
  // PenguinMessiah
  [3291058]: {
    id: 3291058,
    discriminator: "d3ca308a",
    membersId: 188718,
    entrantPlacements: {
      itl2025: 443,
      itl2025rp: 284817,
      itl2026: 1123,
      itl2026rp: 83882,
    },
    seed: 57,
  },
  // PolloxX
  [806211]: {
    id: 806211,
    discriminator: "613d4730",
    membersId: 6678,
    entrantPlacements: {
      itl2023: 187,
      itl2023rp: 346848,
      itl2024: 243,
      itl2024rp: 360035,
      itl2025: 218,
      itl2025rp: 390032,
      itl2026: 1579,
      itl2026rp: 12630,
    },
    seed: 30,
  },
  // ReformedSho#TWT
  [3156620]: {
    id: 3156620,
    discriminator: "ca5e2ab0",
    entrantPlacements: {},
    seed: 68,
  },
  // RisaOzu
  [2152274]: {
    id: 2152274,
    discriminator: "16497141",
    membersId: 175886,
    entrantPlacements: {
      itl2023: 673,
      itl2023rp: 86739,
      itl2024: 468,
      itl2024rp: 250591,
      itl2025: 433,
      itl2025rp: 289597,
      itl2026: 457,
      itl2026rp: 304463,
    },
    seed: null,
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
      itl2023rp: 563795,
      itl2024: 6,
      itl2024rp: 601086,
      itl2025: 5,
      itl2025rp: 625488,
      itl2026: 5,
      itl2026rp: 625353,
      panini2025: 2,
      rip13: 1,
      rip135: 1,
      rip14: 1,
      rip15: 2,
      shine2024: 6,
      shine2025: 1,
    },
    seed: 2,
  },
  // Ryuguu
  [3266358]: {
    id: 3266358,
    discriminator: "f04c1451",
    membersId: 194624,
    entrantPlacements: {
      itl2026: 285,
      itl2026rp: 388639,
    },
    seed: 44,
  },
  // SailorMoonElite
  [2206880]: {
    id: 2206880,
    discriminator: "1ec6593b",
    membersId: 173554,
    entrantPlacements: {
      itl2023: 308,
      itl2023rp: 279300,
      itl2024: 477,
      itl2024rp: 245558,
      itl2025: 656,
      itl2025rp: 214516,
      itl2026: 780,
      itl2026rp: 176011,
      rip135: 33,
    },
    seed: 53,
  },
  // Shinobee
  [916638]: {
    id: 916638,
    discriminator: "b6b3f83f",
    entrantPlacements: {},
    seed: SEED_UNSEEDED,
  },
  // simplySOUF [STUUF]
  [2298424]: {
    id: 2298424,
    discriminator: "857ad296",
    membersId: 8535,
    entrantPlacements: {},
    seed: 63,
  },
  // SirDelins
  [2275154]: {
    id: 2275154,
    discriminator: "97d82fb9",
    membersId: 127205,
    entrantPlacements: {
      itl2025: 1359,
      itl2025rp: 28513,
      itl2026: 1084,
      itl2026rp: 93959,
    },
    seed: 56,
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
      itl2024rp: 25556,
      itl2025: 550,
      itl2025rp: 247188,
      itl2026: 463,
      itl2026rp: 302585,
      rip135: 61,
      rip14: 73,
      rip15: 61,
    },
    seed: 49,
  },
  // SpeakEZ
  [94078]: {
    id: 94078,
    discriminator: "03229ef1",
    membersId: 188881,
    entrantPlacements: {
      itl2025: 1041,
      itl2025rp: 83478,
      itl2026: 745,
      itl2026rp: 191115,
      rip13: 53,
      rip15: 69,
    },
    seed: 54,
  },
  // SpOwOky_Angu
  [1655336]: {
    id: 1655336,
    discriminator: "ef27084b",
    entrantPlacements: {},
    seed: 71,
  },
  // STILL Gigas
  [1630991]: {
    id: 1630991,
    discriminator: "b3184096",
    entrantPlacements: {},
    seed: 73,
  },
  // Sudzi
  [231667]: {
    id: 231667,
    discriminator: "a24fd984",
    membersId: 36049,
    entrantPlacements: {
      itl2023: 44,
      itl2023rp: 474398,
      itl2024: 44,
      itl2024rp: 525108,
      itl2025: 32,
      itl2025rp: 554212,
      itl2026: 20,
      itl2026rp: 591907,
      panini2025: 9,
      rip13: 7,
      rip135: 5,
      rip14: 7,
      rip15: 9,
      shine2025: 4,
    },
    seed: null,
  },
  // T. Swag
  [497819]: {
    id: 497819,
    discriminator: "2ddd55d0",
    membersId: 8349,
    entrantPlacements: {
      itl2023: 61,
      itl2023rp: 450223,
      itl2024: 1398,
      itl2024rp: 0,
      itl2025: 85,
      itl2025rp: 499124,
      itl2026: 1689,
      itl2026rp: 4641,
      rip14: 13,
      rip15: 37,
    },
    seed: 22,
  },
  // Taraun Anderson
  [3374222]: {
    id: 3374222,
    discriminator: "5d3ec0fc",
    entrantPlacements: {},
    seed: 67,
  },
  // teejusb
  [90040]: {
    id: 90040,
    discriminator: "ea646ec3",
    membersId: 50287,
    entrantPlacements: {
      itl2023: 120,
      itl2023rp: 396231,
      itl2024: 139,
      itl2024rp: 431263,
      itl2025: 236,
      itl2025rp: 377973,
      itl2026: 277,
      itl2026rp: 392360,
      rip135: 25,
      rip15: 45,
    },
    seed: 36,
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
      itl2023rp: 443717,
      itl2024: 87,
      itl2024rp: 469219,
      itl2025: 76,
      itl2025rp: 504727,
      itl2026: 92,
      itl2026rp: 505704,
      rip13: 9,
      rip135: 9,
      rip15: 21,
    },
    seed: null,
  },
  // Ty
  [792951]: {
    id: 792951,
    discriminator: "d0e4d8b9",
    membersId: 33185,
    entrantPlacements: {
      ceo2023: 9,
      itl2023: 424,
      itl2023rp: 220408,
      itl2024: 267,
      itl2024rp: 349541,
      itl2025: 48,
      itl2025rp: 530169,
      itl2026: 18,
      itl2026rp: 596508,
    },
    seed: 8,
  },
  // undrscore
  [2296976]: {
    id: 2296976,
    discriminator: "741bcead",
    membersId: 174873,
    entrantPlacements: {
      itl2023: 844,
      itl2023rp: 36292,
      itl2024: 148,
      itl2024rp: 422989,
      itl2025: 104,
      itl2025rp: 477585,
      itl2026: 31,
      itl2026rp: 572209,
    },
    seed: 16,
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
      itl2023rp: 500312,
      itl2024: 17,
      itl2024rp: 562326,
      itl2025: 30,
      itl2025rp: 555521,
      itl2026: 68,
      itl2026rp: 528288,
      rip13: 21,
      rip135: 9,
      rip14: 9,
      rip15: 21,
    },
    seed: 11,
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
      itl2023rp: 545394,
      itl2024: 10,
      itl2024rp: 587137,
      itl2025: 12,
      itl2025rp: 605694,
      itl2026: 7,
      itl2026rp: 615386,
      panini2023: 1,
      panini2025: 4,
      rip13: 4,
      rip14: 2,
      rip15: 9,
      shine2024: 3,
      wg2024: 4,
    },
    seed: 3,
  },
  // WDRM
  [1838861]: {
    id: 1838861,
    discriminator: "1f8376b0",
    membersId: 180548,
    entrantPlacements: {
      bhop3: 13,
      itl2024: 487,
      itl2024rp: 240612,
    },
    seed: 40,
  },
  // X!!
  [2214618]: {
    id: 2214618,
    discriminator: "3cc8c8ed",
    membersId: 175512,
    entrantPlacements: {
      itl2023: 445,
      itl2023rp: 209760,
      itl2024: 277,
      itl2024rp: 341715,
      itl2025: 156,
      itl2025rp: 425398,
      itl2026: 139,
      itl2026rp: 476563,
    },
    seed: 37,
  },
  // XEPHER
  [1821389]: {
    id: 1821389,
    discriminator: "cdecc7e5",
    entrantPlacements: {},
    seed: 46,
  },
  // XjojoX
  [1785438]: {
    id: 1785438,
    discriminator: "d3882fa8",
    membersId: 173043,
    entrantPlacements: {
      ceo2025: 9,
      itl2023: 77,
      itl2023rp: 433016,
      itl2024: 42,
      itl2024rp: 525456,
      itl2025: 62,
      itl2025rp: 514475,
      itl2026: 51,
      itl2026rp: 539486,
      panini2024: 5,
      panini2025: 9,
      rip14: 9,
      rip15: 21,
    },
    seed: null,
  },
  // Yokamaa [MOISTBOIS]
  [1786551]: {
    id: 1786551,
    discriminator: "1ee0ca7e",
    membersId: 170806,
    entrantPlacements: {
      itl2023: 237,
      itl2023rp: 314893,
      itl2024: 83,
      itl2024rp: 471590,
      itl2025: 137,
      itl2025rp: 450324,
      itl2026: 107,
      itl2026rp: 500067,
      panini2024: 7,
      panini2025: 13,
    },
    seed: 20,
  },

};

/** GrooveStats member id -> start.gg entrant id, for entrants with both known. */
export const startggIdByMemberId = new Map<number, number>();
for (const [startggIdStr, entrant] of Object.entries(entrantsMap)) {
  if (entrant?.membersId != null) {
    startggIdByMemberId.set(entrant.membersId, Number(startggIdStr));
  }
}
