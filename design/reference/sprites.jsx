/* sprites.jsx — pixel-art arcade sprites.
   Identity comes from SHAPE; color stays in-palette (currentColor)
   so the single-accent discipline holds. */

const SPRITES = {
  invader: [
    "..X.....X..",
    "...X...X...",
    "..XXXXXXX..",
    ".XX.XXX.XX.",
    "XXXXXXXXXXX",
    "X.XXXXXXX.X",
    "X.X.....X.X",
    "...XX.XX...",
  ],
  squid: [
    "...XXXXX...",
    ".XXXXXXXXX.",
    "XXXXXXXXXXX",
    "XXX.XXX.XXX",
    "XXXXXXXXXXX",
    "...X...X...",
    "..X.X.X.X..",
    ".X.......X.",
  ],
  ghost: [
    "..XXXXX..",
    ".XXXXXXX.",
    "XX.XX.XXX",
    "XX.XX.XXX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    "X.X.X.X.X",
  ],
  ship: [
    "....X....",
    "...XXX...",
    "...XXX...",
    "..XXXXX..",
    ".XXXXXXX.",
    "XXXXXXXXX",
    "X.XX.XX.X",
    "..X...X..",
  ],
  robot: [
    "XX.....XX",
    ".X.....X.",
    ".XXXXXXX.",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "X.X...X.X",
  ],
  skull: [
    ".XXXXXXX.",
    "XXXXXXXXX",
    "XX.XXX.XX",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "XXX.X.XXX",
    "XXXXXXXXX",
    "X.X.X.X.X",
  ],
  cat: [
    "X.......X",
    "XX.....XX",
    "XXXXXXXXX",
    "XX.XXX.XX",
    "XXXXXXXXX",
    "XXX.X.XXX",
    "XXXXXXXXX",
    ".XX...XX.",
  ],
  ufo: [
    "....X....",
    "..XXXXX..",
    ".XX.X.XX.",
    "XXXXXXXXX",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..X.X.X..",
    ".X.....X.",
  ],
  bug: [
    "X..X..X..X",
    ".XXXXXXXX.",
    "XX.XXXX.XX",
    "XXXXXXXXXX",
    "XX.XXXX.XX",
    "XXXXXXXXXX",
    ".X.X..X.X.",
    "X..X..X..X",
  ],
  alienb: [
    "...X.X...",
    "..XXXXX..",
    ".X.XXX.X.",
    "XXXXXXXXX",
    "X.XXXXX.X",
    "X.X...X.X",
    "...X.X...",
    "..X...X..",
  ],
  heart: [
    ".XX.XX.",
    "XXXXXXX",
    "XXXXXXX",
    "XXXXXXX",
    ".XXXXX.",
    "..XXX..",
    "...X...",
  ],
  rocket: [
    "...X...",
    "..XXX..",
    "..XXX..",
    ".XXXXX.",
    ".XXXXX.",
    "XX.X.XX",
    "X.....X",
  ],
};

const SPRITE_NAMES = Object.keys(SPRITES);

function PixelSprite({ name = "invader", size = 28, color = "currentColor", style }) {
  const map = SPRITES[name] || SPRITES.invader;
  const rows = map.length;
  const cols = map[0].length;
  const cell = 10;
  const rects = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (map[y][x] === "X") {
        rects.push(
          <rect key={x + "-" + y} x={x * cell} y={y * cell} width={cell} height={cell} fill={color} />
        );
      }
    }
  }
  return (
    <svg
      width={size}
      height={size * (rows / cols)}
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      style={{ display: "block", imageRendering: "pixelated", ...style }}
      shapeRendering="crispEdges"
    >
      {rects}
    </svg>
  );
}

/* The tic-tac-toe marks, also pixel-drawn so they feel native to the cabinet */
function MarkX({ size = 64, color = "var(--accent)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" shapeRendering="geometricPrecision"
         style={{ display: "block", filter: "drop-shadow(0 0 10px var(--accent-glow))" }}>
      <g stroke={color} strokeWidth="13" strokeLinecap="square" fill="none">
        <line x1="22" y1="22" x2="78" y2="78" />
        <line x1="78" y1="22" x2="22" y2="78" />
      </g>
    </svg>
  );
}
function MarkO({ size = 64, color = "var(--warm)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
         style={{ display: "block", filter: "drop-shadow(0 0 10px var(--warm-glow))" }}>
      <circle cx="50" cy="50" r="28" stroke={color} strokeWidth="13" fill="none" />
    </svg>
  );
}

Object.assign(window, { PixelSprite, SPRITES, SPRITE_NAMES, MarkX, MarkO });
