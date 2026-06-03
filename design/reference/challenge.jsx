/* challenge.jsx — the incoming-challenge "coin drop" + outgoing matchmaking */

function ChallengeModal({ from, onAccept, onDecline }) {
  const [count, setCount] = React.useState(10);
  React.useEffect(() => {
    if (count <= 0) { onDecline(); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div
      onClick={onDecline}
      style={{
        position: "fixed", inset: 0, zIndex: 8000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(2,5,8,0.78)",
        animation: "backdrop-in .25s ease both",
      }}
    >
      {/* white flash on impact */}
      <div style={{
        position: "fixed", inset: 0, background: "var(--accent)",
        animation: "coin-flash .5s ease-out both", pointerEvents: "none",
      }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", left: "50%", top: "calc(50% - 40px)",
          width: "min(420px, 90vw)",
          transformOrigin: "center top",
          animation: "coin-drop .75s cubic-bezier(.3,1.3,.5,1) both",
        }}
      >
        <div className="panel" style={{
          padding: "var(--pad)", textAlign: "center",
          border: "1px solid var(--accent)",
          boxShadow: "0 0 0 1px var(--accent), 0 0 60px -8px var(--accent-glow), 0 30px 60px -20px #000",
          background: "linear-gradient(180deg, var(--accent-soft), transparent 140px), var(--bg-1)",
        }}>
          <div className="eyebrow" style={{ color: "var(--accent)", marginBottom: 16, letterSpacing: "0.34em" }}>
            ◎ &nbsp;COIN DROPPED&nbsp; ◎
          </div>

          <div style={{
            width: 84, height: 84, margin: "0 auto 16px", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "var(--bg-3)", borderRadius: "var(--r)",
            border: "1px solid var(--accent-line)", color: "var(--accent)",
            boxShadow: "inset 0 0 22px -6px var(--accent-glow)",
          }}>
            <PixelSprite name={from.sprite} size={52} />
          </div>

          <div className="display glow" style={{ fontSize: 24, marginBottom: 6, color: "var(--text)" }}>
            {from.name}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--text-dim)", marginBottom: 4 }}>
            wants to play <span style={{ color: "var(--accent-bright)" }}>Tic-Tac-Toe</span>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginBottom: 20 }}>
            {from.wins}W · {from.losses}L · auto-declines in <span style={{ color: "var(--warm)" }}>{count}s</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-danger" style={{ flex: 1, padding: "13px" }} onClick={onDecline}>
              ✕ DECLINE
            </button>
            <button className="btn btn-accent" style={{ flex: 1.4, padding: "13px" }} onClick={onAccept}>
              ▸ ACCEPT &amp; PLAY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Matchmaking({ opponent, onReady, onCancel }) {
  const [phase, setPhase] = React.useState("calling"); // calling -> accepted
  React.useEffect(() => {
    const t1 = setTimeout(() => setPhase("accepted"), 1400);
    const t2 = setTimeout(onReady, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 8000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(2,5,8,0.82)", animation: "backdrop-in .2s both",
    }}>
      <div className="panel" style={{
        padding: "32px var(--pad)", textAlign: "center", width: "min(380px, 90vw)",
        boxShadow: "0 0 50px -12px var(--accent-glow)",
      }}>
        <div style={{
          width: 72, height: 72, margin: "0 auto 18px", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "var(--bg-3)", borderRadius: "var(--r)", color: "var(--accent)",
          border: "1px solid var(--accent-line)",
          animation: phase === "calling" ? "pulse-soft 1s ease-in-out infinite" : "win-pop .4s both",
        }}>
          <PixelSprite name={opponent.sprite} size={44} />
        </div>
        <div className="display" style={{ fontSize: 19, marginBottom: 6 }}>{opponent.name}</div>
        <div className="eyebrow" style={{ color: phase === "accepted" ? "var(--accent)" : "var(--text-dim)", marginBottom: phase==="accepted"?0:18 }}>
          {phase === "calling" ? "DROPPING COIN…" : "✓ CHALLENGE ACCEPTED"}
        </div>
        {phase === "calling" && (
          <button className="btn btn-ghost" style={{ marginTop: 6 }} onClick={onCancel}>CANCEL</button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ChallengeModal, Matchmaking });
