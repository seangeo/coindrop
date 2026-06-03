/* ttt.ts — pure tic-tac-toe logic.
 *
 * This is deliberately NOT behind the Supabase stub seam: it is framework- and
 * backend-agnostic pure logic the front-end legitimately owns. It serves two
 * roles:
 *   1. Instant client-side feedback / board derivation in the UI.
 *   2. The mocked opponent (`aiMove`) used by the match.ts stub so a single
 *      player can play a full game against the mock.
 *
 * In the real app the authoritative referee is the human's `make_move` Postgres
 * RPC; `winnerOf` can still run client-side for instant feedback, and `aiMove`
 * is dropped entirely (replaced by moves received over Realtime).
 */

export type Mark = 'X' | 'O';
export type Cell = '' | Mark;
export type Board = Cell[]; // length 9

/** The 8 winning lines on a 3x3 board. */
export const LINES: ReadonlyArray<readonly [number, number, number]> = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];

export interface WinResult {
	mark: Mark;
	line: [number, number, number];
}

/** Returns the winning mark + line, or null if no winner yet. */
export function winnerOf(b: Board): WinResult | null {
	for (const [a, c, d] of LINES) {
		if (b[a] && b[a] === b[c] && b[a] === b[d]) {
			return { mark: b[a] as Mark, line: [a, c, d] };
		}
	}
	return null;
}

/** True when every cell is filled. */
export function isFull(b: Board): boolean {
	return b.every(Boolean);
}

/**
 * A simple competent opponent for the mock: win > block > center > corner > side.
 * Returns the index it would play, or -1 if the board is full.
 */
export function aiMove(b: Board, ai: Mark = 'O', human: Mark = 'X'): number {
	const empties = b.map((v, i) => (v ? -1 : i)).filter((v) => v !== -1);
	if (empties.length === 0) return -1;

	const tryWin = (mark: Mark): number | null => {
		for (const i of empties) {
			const c = b.slice();
			c[i] = mark;
			if (winnerOf(c)) return i;
		}
		return null;
	};

	let m = tryWin(ai);
	if (m !== null) return m;
	m = tryWin(human);
	if (m !== null) return m;
	if (b[4] === '') return 4;
	const corners = [0, 2, 6, 8].filter((i) => b[i] === '');
	if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
	return empties[Math.floor(Math.random() * empties.length)];
}
