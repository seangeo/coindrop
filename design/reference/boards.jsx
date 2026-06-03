/* boards.jsx — Leaderboard (high-score board) + Match history */

function Leaderboard({ players, onChallenge }) {
  const ranked = [...players, { ...ME }]
    .map((p) => ({ ...p, pct: Math.round((p.wins / Math.max(1, p.wins + p.losses)) * 100) }))
    .sort((a, b) => b.wins - a.wins);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--pad)", overflow: "hidden" }}>
      <div style={{ width: "min(760px, 100%)", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--pad)" }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>★ HALL OF FAME ★</div>
          <h1 className="display glow" style={{ margin: 0, fontSize: "var(--fs-title)", letterSpacing: "0.05em" }}>
            HIGH SCORES
          </h1>
        </div>
        <div className="panel" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="lb-row lb-head">
            <span>RANK</span>
            <span>PLAYER</span>
            <span style={{ textAlign: "right" }}>WINS</span>
            <span style={{ textAlign: "right" }}>WIN %</span>
            <span style={{ textAlign: "right" }}>RECORD</span>
          </div>
          <div className="stagger" style={{ overflowY: "auto", minHeight: 0 }}>
            {ranked.map((p, i) => (
              <div
                key={p.id}
                className={"lb-row" + (p.you ? " lb-me" : "")}
                style={{ animationDelay: `calc(${0.05 * i}s / var(--anim,1))` }}
              >
                <span className="display" style={{
                  fontSize: 18,
                  color: i === 0 ? "var(--warm)" : i < 3 ? "var(--accent-bright)" : "var(--text-faint)",
                  textShadow: i === 0 ? "0 0 12px var(--warm-glow)" : i < 3 ? "0 0 10px var(--accent-glow)" : "none",
                }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                  <span style={{
                    width: 30, height: 30, flex: "none", display: "flex", alignItems: "center",
                    justifyContent: "center", background: "var(--bg-3)", borderRadius: "var(--r-sm)",
                    color: i === 0 ? "var(--warm)" : "var(--accent)",
                  }}>
                    <PixelSprite name={p.sprite} size={20} />
                  </span>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 14, color: p.you ? "var(--accent-bright)" : "var(--text)" }}>
                    {p.name}{p.you ? " (you)" : ""}
                  </span>
                  {i === 0 && <span style={{ fontSize: 13 }}>👑</span>}
                </span>
                <span className="display" style={{ textAlign: "right", fontSize: 17, color: "var(--text)" }}>
                  {p.wins}
                </span>
                <span style={{ textAlign: "right", fontSize: 13, color: "var(--text-dim)" }}>{p.pct}%</span>
                <span style={{ textAlign: "right", fontSize: 12, color: "var(--text-faint)" }}>{p.wins}-{p.losses}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchHistory({ history }) {
  const stats = history.reduce((a, h) => { a[h.result]++; return a; }, { win: 0, loss: 0, draw: 0 });
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "var(--pad)", overflow: "hidden" }}>
      <div style={{ width: "min(680px, 100%)", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "var(--pad)", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>YOUR CABINET</div>
            <h1 className="display" style={{ margin: 0, fontSize: "var(--fs-title)", whiteSpace: "nowrap" }}>MATCH HISTORY</h1>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <Stat n={stats.win} label="WINS" color="var(--accent)" />
            <Stat n={stats.loss} label="LOSSES" color="var(--danger)" />
            <Stat n={stats.draw} label="DRAWS" color="var(--text-dim)" />
          </div>
        </div>
        <div className="panel stagger" style={{ overflowY: "auto", minHeight: 0, padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          {history.map((h, i) => (
            <div key={i} className="hist-row" style={{ animationDelay: `calc(${0.04 * i}s / var(--anim,1))` }}>
              <span className={"result-chip result-" + h.result}>
                {h.result.toUpperCase()}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 11, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 12, color: "var(--text-faint)" }}>vs</span>
                <span style={{
                  width: 28, height: 28, flex: "none", display: "flex", alignItems: "center",
                  justifyContent: "center", background: "var(--bg-3)", borderRadius: "var(--r-sm)",
                  color: "var(--accent)",
                }}>
                  <PixelSprite name={h.oppSprite} size={18} />
                </span>
                <span className="mono" style={{ fontWeight: 700, fontSize: 14 }}>{h.opp}</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-faint)", fontSize: 12 }}>
                played
                <span style={{ color: h.mark === "X" ? "var(--accent)" : "var(--warm)" }}>
                  {h.mark === "X" ? <MarkX size={15} /> : <MarkO size={15} />}
                </span>
              </span>
              <span style={{ fontSize: 12, color: "var(--text-faint)", minWidth: 78, textAlign: "right" }}>{h.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="display" style={{ fontSize: 26, color, lineHeight: 1, textShadow: `0 0 12px ${color}55` }}>{n}</div>
      <div className="eyebrow" style={{ marginTop: 5, letterSpacing: "0.16em" }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Leaderboard, MatchHistory });
