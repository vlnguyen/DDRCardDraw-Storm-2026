const entrantsMap: Record<number, {
  id: number;
  discriminator: string;
  membersId: number;
} | undefined> = {
  // Agent A
  [2626971]: {
    id: 2626971,
    discriminator: "e4e1304b",
    membersId: 176321
  },
  // Andeh [LONESTAR]
  [1955111]: {
    id: 1955111,
    discriminator: "e9b9f217",
    membersId: 173716
  },
  // BigYama
  [1956381]: {
    id: 1956381,
    discriminator: "f9901178",
    membersId: 3983
  },
  // Blizzrdball
  [1970499]: {
    id: 1970499,
    discriminator: "bdbeaaf0",
    membersId: 61697
  },
  // Bostic300
  [2628662]: {
    id: 2628662,
    discriminator: "d4495286",
    membersId: 175571
  },
  // Captain Carbon [TBD]
  [486724]: {
    id: 486724,
    discriminator: "92e538cc",
    membersId: 44806
  },
  // CarterTheQ [DDRIllini]
  [12877]: {
    id: 12877,
    discriminator: "db47f574",
    membersId: 128275
  },
  // Chance R.
  [2008712]: {
    id: 2008712,
    discriminator: "3a372353",
    membersId: 133006
  },
  // cheesecake [HFIL]
  [14485]: {
    id: 14485,
    discriminator: "b1875b2d",
    membersId: 2174
  },
  // chezmix [RNG]
  [1451396]: {
    id: 1451396,
    discriminator: "9ab67a73",
    membersId: 1
  },
  // Chief Skittles [STORM]
  [2099374]: {
    id: 2099374,
    discriminator: "04153250",
    membersId: 66673
  },
  // cousinoer5
  [2158665]: {
    id: 2158665,
    discriminator: "63385614",
    membersId: 170786
  },
  // DomDeeKong
  [488761]: {
    id: 488761,
    discriminator: "20fcba89",
    membersId: 66487
  },
  // Eesa
  [1814321]: {
    id: 1814321,
    discriminator: "d9a6772f",
    membersId: 147676
  },
  // EvilDave219 [TBD]
  [436678]: {
    id: 436678,
    discriminator: "96661b6c",
    membersId: 661
  },
  // FabSab440 [IIDX]
  [630151]: {
    id: 630151,
    discriminator: "76ce2ba6",
    membersId: 66610
  },
  // fastboy [pals]
  [4634]: {
    id: 4634,
    discriminator: "473f3ee1",
    membersId: 118539
  },
  // Flash
  [2072594]: {
    id: 2072594,
    discriminator: "baf87bf4",
    membersId: 4306
  },
  // Flip
  [2090414]: {
    id: 2090414,
    discriminator: "8a84a321",
    membersId: 5571
  },
  // GalaxyStar
  [638828]: {
    id: 638828,
    discriminator: "b79537a2",
    membersId: 187831
  },
  // Goomba Roomba [Bhop]
  [2403703]: {
    id: 2403703,
    discriminator: "5392e440",
    membersId: 178749
  },
  // HeavyMode
  [3171983]: {
    id: 3171983,
    discriminator: "3d399b44",
    membersId: 175406
  },
  // Higgy
  [2121528]: {
    id: 2121528,
    discriminator: "8f9d2f17",
    membersId: 171721
  },
  // idontevenknowyou
  [3008718]: {
    id: 3008718,
    discriminator: "0669859a",
    membersId: 175363
  },
  // itgalex
  [2027270]: {
    id: 2027270,
    discriminator: "97813247",
    membersId: 46152
  },
  // JONBUDDY [OCG]
  [746713]: {
    id: 746713,
    discriminator: "40382427",
    membersId: 127823
  },
  // KEAK
  [2048909]: {
    id: 2048909,
    discriminator: "391ac297",
    membersId: 194288
  },
  // Koffee
  [2409673]: {
    id: 2409673,
    discriminator: "d1207fcb",
    membersId: 177112
  },
  // Lazor
  [2267114]: {
    id: 2267114,
    discriminator: "0d539df8",
    membersId: 174948
  },
  // leontwix
  [498791]: {
    id: 498791,
    discriminator: "9e90235e",
    membersId: 6284
  },
  // LIGHTW8
  [2151595]: {
    id: 2151595,
    discriminator: "2121c3fa",
    membersId: 175904
  },
  // Limen
  [155600]: {
    id: 155600,
    discriminator: "e3964cf2",
    membersId: 183712
  },
  // lolipo
  [436726]: {
    id: 436726,
    discriminator: "1d674757",
    membersId: 35701
  },
  // mdx
  [605243]: {
    id: 605243,
    discriminator: "76f9d3bd",
    membersId: 174515
  },
  // meowbois
  [473823]: {
    id: 473823,
    discriminator: "6b96f2ab",
    membersId: 182892
  },
  // midtown
  [2354355]: {
    id: 2354355,
    discriminator: "649127bf",
    membersId: 175365
  },
  // Miligram
  [727583]: {
    id: 727583,
    discriminator: "db6de701",
    membersId: 98817
  },
  // PenguinMessiah
  [3291058]: {
    id: 3291058,
    discriminator: "d3ca308a",
    membersId: 188718
  },
  // PolloxX
  [806211]: {
    id: 806211,
    discriminator: "613d4730",
    membersId: 6678
  },
  // RisaOzu
  [2152274]: {
    id: 2152274,
    discriminator: "16497141",
    membersId: 175886
  },
  // Rynker
  [437458]: {
    id: 437458,
    discriminator: "f63b99dd",
    membersId: 4062
  },
  // Ryuguu
  [3266358]: {
    id: 3266358,
    discriminator: "f04c1451",
    membersId: 194624
  },
  // SailorMoonElite
  [2206880]: {
    id: 2206880,
    discriminator: "1ec6593b",
    membersId: 173554
  },
  // simplySOUF [STUUF]
  [2298424]: {
    id: 2298424,
    discriminator: "857ad296",
    membersId: 8535
  },
  // SirDelins
  [2275154]: {
    id: 2275154,
    discriminator: "97d82fb9",
    membersId: 127205
  },
  // Skate
  [2400497]: {
    id: 2400497,
    discriminator: "3c532367",
    membersId: 178992
  },
  // SpeakEZ
  [94078]: {
    id: 94078,
    discriminator: "03229ef1",
    membersId: 188881
  },
  // Sudzi
  [231667]: {
    id: 231667,
    discriminator: "a24fd984",
    membersId: 36049
  },
  // T. Swag
  [497819]: {
    id: 497819,
    discriminator: "2ddd55d0",
    membersId: 8349
  },
  // teejusb
  [90040]: {
    id: 90040,
    discriminator: "ea646ec3",
    membersId: 50287
  },
  // TommyDoesntMiss
  [486388]: {
    id: 486388,
    discriminator: "75cf6b41",
    membersId: 66784
  },
  // Ty
  [792951]: {
    id: 792951,
    discriminator: "d0e4d8b9",
    membersId: 33185
  },
  // undrscore
  [2296976]: {
    id: 2296976,
    discriminator: "741bcead",
    membersId: 174873
  },
  // VincentITG [ROBERTO]
  [656475]: {
    id: 656475,
    discriminator: "226cd505",
    membersId: 65671
  },
  // VivaLaMoo [STORM]
  [143547]: {
    id: 143547,
    discriminator: "3aadda80",
    membersId: 4362
  },
  // WDRM
  [1838861]: {
    id: 1838861,
    discriminator: "1f8376b0",
    membersId: 180548
  },
  // X!!
  [2214618]: {
    id: 2214618,
    discriminator: "3cc8c8ed",
    membersId: 175512
  },
  // XjojoX
  [1785438]: {
    id: 1785438,
    discriminator: "d3882fa8",
    membersId: 173043
  },
  // Yokamaa [MOISTBOIS]
  [1786551]: {
    id: 1786551,
    discriminator: "1ee0ca7e",
    membersId: 170806
  },
  // Yung Buttcoin
  [231774]: {
    id: 231774,
    discriminator: "1336c4bf",
    membersId: 6911
  }
}
