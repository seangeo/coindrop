/* data.jsx — mock arcade population & state seeds */

const ME = {
  id: "me",
  name: "QUASAR",
  sprite: "ship",
  wins: 24,
  losses: 11,
  you: true,
};

const PLAYERS = [
  { id: "p1",  name: "NEONFOX",  sprite: "invader", status: "lobby", wins: 41, losses: 19 },
  { id: "p2",  name: "GLITCH",   sprite: "squid",   status: "game",  wins: 38, losses: 22, vs: "PIX3L" },
  { id: "p3",  name: "PIX3L",    sprite: "ghost",   status: "game",  wins: 33, losses: 25, vs: "GLITCH" },
  { id: "p4",  name: "SOL_77",   sprite: "ufo",     status: "lobby", wins: 52, losses: 14 },
  { id: "p5",  name: "MAXOUT",   sprite: "robot",   status: "lobby", wins: 29, losses: 30 },
  { id: "p6",  name: "VECTOR",   sprite: "alienb",  status: "lobby", wins: 18, losses: 12 },
  { id: "p7",  name: "TURBO_K",  sprite: "rocket",  status: "game",  wins: 47, losses: 20, vs: "NOVA" },
  { id: "p8",  name: "NOVA",     sprite: "skull",   status: "game",  wins: 44, losses: 21, vs: "TURBO_K" },
  { id: "p9",  name: "ECHO",     sprite: "cat",     status: "lobby", wins: 12, losses: 9  },
  { id: "p10", name: "BYTE_ME",  sprite: "bug",     status: "idle",  wins: 8,  losses: 15 },
  { id: "p11", name: "ZAPDOS",   sprite: "heart",   status: "lobby", wins: 21, losses: 17 },
  { id: "p12", name: "ORBITAL",  sprite: "invader", status: "idle",  wins: 5,  losses: 11 },
];

const SEED_CHAT = [
  { who: "NEONFOX", sprite: "invader", text: "anyone up for a round?", t: "21:58" },
  { who: "SOL_77",  sprite: "ufo",     text: "gg glitch that was brutal", t: "21:59" },
  { who: "GLITCH",  sprite: "squid",   text: "center opening every time, works", t: "22:00" },
  { who: "_system", text: "TURBO_K challenged NOVA", t: "22:00" },
  { who: "ECHO",    sprite: "cat",     text: "who taught the rookie corner traps lol", t: "22:01" },
  { who: "MAXOUT",  sprite: "robot",   text: "rematch me quasar, i want my points back", t: "22:02" },
  { who: "QUASAR",  sprite: "ship",    me: true, text: "any time maxout 😤", t: "22:02" },
  { who: "VECTOR",  sprite: "alienb",  text: "lobby's lively tonight", t: "22:03" },
];

/* lines the simulated room will keep dropping in, to feel alive */
const AMBIENT_CHAT = [
  { who: "SOL_77",  sprite: "ufo",     text: "brb grabbing a refill" },
  { who: "_system", text: "ZAPDOS won vs ECHO" },
  { who: "NEONFOX", sprite: "invader", text: "first move corner is underrated" },
  { who: "PIX3L",   sprite: "ghost",   text: "draw again ugh" },
  { who: "_system", text: "BYTE_ME joined the lobby" },
  { who: "MAXOUT",  sprite: "robot",   text: "ok quasar where you at" },
  { who: "VECTOR",  sprite: "alienb",  text: "this scanline filter is so clean" },
  { who: "_system", text: "GLITCH challenged SOL_77" },
  { who: "ECHO",    sprite: "cat",     text: "running it back" },
  { who: "NOVA",    sprite: "skull",   text: "x always goes center, predictable" },
];

const HISTORY = [
  { opp: "MAXOUT",  oppSprite: "robot",   result: "win",  mark: "X", when: "12m ago" },
  { opp: "PIX3L",   oppSprite: "ghost",   result: "loss", mark: "O", when: "31m ago" },
  { opp: "ECHO",    oppSprite: "cat",     result: "win",  mark: "X", when: "1h ago" },
  { opp: "SOL_77",  oppSprite: "ufo",     result: "draw", mark: "O", when: "1h ago" },
  { opp: "NEONFOX", oppSprite: "invader", result: "win",  mark: "X", when: "2h ago" },
  { opp: "TURBO_K", oppSprite: "rocket",  result: "loss", mark: "O", when: "3h ago" },
  { opp: "VECTOR",  oppSprite: "alienb",  result: "win",  mark: "X", when: "yesterday" },
  { opp: "GLITCH",  oppSprite: "squid",   result: "win",  mark: "X", when: "yesterday" },
];

Object.assign(window, { ME, PLAYERS, SEED_CHAT, AMBIENT_CHAT, HISTORY });
