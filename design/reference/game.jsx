/* game.jsx — playable tic-tac-toe + win/draw flourish */

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function winnerOf(b) {
  for (const [a,c,d] of LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line: [a,c,d] };
  }
  return null;
}

/* simple competent AI for "O": win > block > center > corner > side */
function aiMove(b, ai = "O", human = "X") {
  const empties = b.map((v,i)=>v?null:i).filter(v=>v!==null);
  const tryWin = (mark) => {
    for (const i of empties) {
      const c = b.slice(); c[i] = mark;
      if (winnerOf(c)) return i;
    }
    return null;
  };
  let m = tryWin(ai); if (m !== null) return m;
  m = tryWin(human); if (m !== null) return m;
  if (b[4] === "") return 4;
  const corners = [0,2,6,8].filter(i=>b[i]==="");
  if (corners.length) return corners[Math.floor(Math.random()*corners.length)];
  return empties[Math.floor(Math.random()*empties.length)];
}

function TurnIndicator({ status, yourTurn, opponent }) {
  let label, cls, color;
  if (status === "win")  { label = "YOU WIN"; color = "var(--accent)"; }
  else if (status === "loss") { label = opponent.name + " WINS"; color = "var(--danger)"; }
  else if (status === "draw") { label = "DRAW GAME"; color = "var(--text-dim)"; }
  else if (yourTurn) { label = "YOUR TURN"; color = "var(--accent)"; }
  else { label = opponent.name + " IS THINKING"; color = "var(--warm)"; }

  const live = status === "playing";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      padding: "10px 20px", borderRadius: "99px",
      border: "1px solid " + (live && yourTurn ? "var(--accent-line)" : "var(--line-strong)"),
      background: live && yourTurn ? "var(--accent-soft)" : "var(--bg-2)",
      transition: "all .25s",
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: 99, background: color,
        boxShadow: `0 0 8px ${color}`,
        animation: live ? "ping-solid 1.2s ease-in-out infinite" : "none",
      }} />
      <span className="display" style={{
        fontSize: 17, color, letterSpacing: "0.04em", whiteSpace: "nowrap",
        textShadow: `0 0 12px ${color}66`,
      }}>{label}</span>
    </div>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  const bits = Array.from({ length: 36 });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 5 }}>
      {bits.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const dur = 1.2 + Math.random() * 1.1;
        const colors = ["var(--accent)", "var(--accent-bright)", "var(--warm)", "#fff"];
        const c = colors[i % colors.length];
        const sz = 5 + Math.random() * 6;
        return (
          <span key={i} style={{
            position: "absolute", top: -20, left: left + "%",
            width: sz, height: sz * 1.6, background: c,
            boxShadow: `0 0 6px ${c}`,
            animation: `confetti-fall ${dur}s cubic-bezier(.3,.6,.5,1) ${delay}s forwards`,
          }} />
        );
      })}
    </div>
  );
}

function Board({ board, onPlay, winLine, status, yourTurn }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        width: "min(56vh, 440px)", aspectRatio: "1",
      }}>
        {board.map((cell, i) => {
          const winning = winLine && winLine.includes(i);
          const playable = status === "playing" && yourTurn && !cell;
          return (
            <button
              key={i}
              onClick={() => playable && onPlay(i)}
              disabled={!playable}
              className="ttt-cell"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: winning ? "var(--accent-soft)" : "var(--bg-2)",
                border: "1px solid " + (winning ? "var(--accent)" : "var(--line-strong)"),
                borderRadius: "var(--r)",
                cursor: playable ? "pointer" : "default",
                boxShadow: winning ? "0 0 24px -4px var(--accent-glow), inset 0 0 20px -8px var(--accent-glow)" : "none",
                transition: "background .2s, border-color .2s, box-shadow .3s",
                position: "relative",
              }}
            >
              {cell && (
                <span style={{ animation: "mark-in .35s cubic-bezier(.2,.8,.3,1.2) both" }}>
                  {cell === "X"
                    ? <MarkX size="min(16vh,120px)" />
                    : <MarkO size="min(16vh,120px)" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Confetti show={status === "win"} />
    </div>
  );
}

function GameScreen({ opponent, onRematch, onExit }) {
  const [board, setBoard] = React.useState(Array(9).fill(""));
  const [yourTurn, setYourTurn] = React.useState(true);
  const [status, setStatus] = React.useState("playing"); // playing|win|loss|draw
  const [winLine, setWinLine] = React.useState(null);

  const reset = React.useCallback(() => {
    setBoard(Array(9).fill(""));
    setYourTurn(true);
    setStatus("playing");
    setWinLine(null);
  }, []);

  // opponent move
  React.useEffect(() => {
    if (status !== "playing" || yourTurn) return;
    const t = setTimeout(() => {
      setBoard((prev) => {
        if (winnerOf(prev) || prev.every(Boolean)) return prev;
        const mv = aiMove(prev, "O", "X");
        const next = prev.slice();
        next[mv] = "O";
        const w = winnerOf(next);
        if (w) { setWinLine(w.line); setStatus("loss"); }
        else if (next.every(Boolean)) { setStatus("draw"); }
        else { setYourTurn(true); }
        return next;
      });
    }, 650 + Math.random() * 500);
    return () => clearTimeout(t);
  }, [yourTurn, status]);

  const play = (i) => {
    setBoard((prev) => {
      if (prev[i] || status !== "playing") return prev;
      const next = prev.slice();
      next[i] = "X";
      const w = winnerOf(next);
      if (w) { setWinLine(w.line); setStatus("win"); }
      else if (next.every(Boolean)) { setStatus("draw"); }
      else { setYourTurn(false); }
      return next;
    });
  };

  const ended = status !== "playing";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
      gap: "var(--gap)", height: "100%", padding: "0 var(--pad)",
    }}>
      {/* left: you */}
      <PlayerCard player={ME} mark="X" align="left" active={status==="playing" && yourTurn} you />

      {/* center: board + turn + end controls */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--gap)" }}>
        <TurnIndicator status={status} yourTurn={yourTurn} opponent={opponent} />
        <Board board={board} onPlay={play} winLine={winLine} status={status} yourTurn={yourTurn} />
        <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12 }}>
          {ended ? (
            <div style={{ display: "flex", gap: 12, animation: "win-pop .4s both" }}>
              <button className="btn btn-accent btn-lg" onClick={() => { onRematch(); reset(); }}>
                ↻ REMATCH
              </button>
              <button className="btn btn-ghost btn-lg" onClick={onExit}>
                ← BACK TO LOBBY
              </button>
            </div>
          ) : (
            <span className="eyebrow">best of one · winner takes the points</span>
          )}
        </div>
      </div>

      {/* right: opponent */}
      <PlayerCard player={opponent} mark="O" align="right" active={status==="playing" && !yourTurn} />
    </div>
  );
}

function PlayerCard({ player, mark, align, active, you }) {
  const right = align === "right";
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start",
      gap: 14, justifySelf: right ? "end" : "start",
      maxWidth: 260,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14, flexDirection: right ? "row-reverse" : "row",
      }}>
        <div style={{
          width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-3)", borderRadius: "var(--r)",
          border: "1px solid " + (active ? "var(--accent)" : "var(--line-strong)"),
          color: "var(--accent)", transition: "all .25s",
          boxShadow: active ? "0 0 22px -4px var(--accent-glow)" : "none",
        }}>
          <PixelSprite name={player.sprite} size={40} />
        </div>
        <div style={{ textAlign: right ? "right" : "left" }}>
          <div className="display" style={{ fontSize: 19, color: "var(--text)", whiteSpace: "nowrap" }}>
            {player.name}{you ? " (you)" : ""}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 2 }}>
            {player.wins}W · {player.losses}L
          </div>
        </div>
      </div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "5px 12px", borderRadius: 99,
        border: "1px solid var(--line)", background: "var(--bg-2)",
      }}>
        <span style={{ color: mark === "X" ? "var(--accent)" : "var(--warm)" }}>
          {mark === "X" ? <MarkX size={18} /> : <MarkO size={18} />}
        </span>
        <span className="eyebrow" style={{ letterSpacing: "0.2em" }}>PLAYS {mark}</span>
      </div>
    </div>
  );
}

Object.assign(window, { GameScreen, winnerOf, aiMove });
