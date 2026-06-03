/* sprites.ts — pixel-art arcade sprite maps (pure data).
 *
 * Identity comes from SHAPE; color stays in-palette (rendered in currentColor)
 * so the single-accent discipline holds. Each entry is a list of rows; an "X"
 * is a filled pixel. Lives outside the Supabase seam because it is static
 * presentation data, not backend state — but the SpriteName type is shared with
 * the stub modules (each player persists a sprite key).
 */

export const SPRITES = {
	invader: [
		'..X.....X..',
		'...X...X...',
		'..XXXXXXX..',
		'.XX.XXX.XX.',
		'XXXXXXXXXXX',
		'X.XXXXXXX.X',
		'X.X.....X.X',
		'...XX.XX...'
	],
	squid: [
		'...XXXXX...',
		'.XXXXXXXXX.',
		'XXXXXXXXXXX',
		'XXX.XXX.XXX',
		'XXXXXXXXXXX',
		'...X...X...',
		'..X.X.X.X..',
		'.X.......X.'
	],
	ghost: [
		'..XXXXX..',
		'.XXXXXXX.',
		'XX.XX.XXX',
		'XX.XX.XXX',
		'XXXXXXXXX',
		'XXXXXXXXX',
		'XXXXXXXXX',
		'X.X.X.X.X'
	],
	ship: [
		'....X....',
		'...XXX...',
		'...XXX...',
		'..XXXXX..',
		'.XXXXXXX.',
		'XXXXXXXXX',
		'X.XX.XX.X',
		'..X...X..'
	],
	robot: [
		'XX.....XX',
		'.X.....X.',
		'.XXXXXXX.',
		'XX.XXX.XX',
		'XXXXXXXXX',
		'XX.XXX.XX',
		'XXXXXXXXX',
		'X.X...X.X'
	],
	skull: [
		'.XXXXXXX.',
		'XXXXXXXXX',
		'XX.XXX.XX',
		'XX.XXX.XX',
		'XXXXXXXXX',
		'XXX.X.XXX',
		'XXXXXXXXX',
		'X.X.X.X.X'
	],
	cat: [
		'X.......X',
		'XX.....XX',
		'XXXXXXXXX',
		'XX.XXX.XX',
		'XXXXXXXXX',
		'XXX.X.XXX',
		'XXXXXXXXX',
		'.XX...XX.'
	],
	ufo: [
		'....X....',
		'..XXXXX..',
		'.XX.X.XX.',
		'XXXXXXXXX',
		'XXXXXXXXX',
		'.XXXXXXX.',
		'..X.X.X..',
		'.X.....X.'
	],
	bug: [
		'X..X..X..X',
		'.XXXXXXXX.',
		'XX.XXXX.XX',
		'XXXXXXXXXX',
		'XX.XXXX.XX',
		'XXXXXXXXXX',
		'.X.X..X.X.',
		'X..X..X..X'
	],
	alienb: [
		'...X.X...',
		'..XXXXX..',
		'.X.XXX.X.',
		'XXXXXXXXX',
		'X.XXXXX.X',
		'X.X...X.X',
		'...X.X...',
		'..X...X..'
	],
	heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
	rocket: ['...X...', '..XXX..', '..XXX..', '.XXXXX.', '.XXXXX.', 'XX.X.XX', 'X.....X']
} as const;

export type SpriteName = keyof typeof SPRITES;

export const SPRITE_NAMES = Object.keys(SPRITES) as SpriteName[];
