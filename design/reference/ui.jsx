/* ui.jsx — primitive components shared across screens */

function Wordmark({ size = "var(--fs-wordmark)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span aria-hidden style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, color: "var(--accent)",
      }}>
        <PixelSprite name="invader" size={26} />
      </span>
      <span className="display glow" style={{
        fontSize: size, lineHeight: 1, color: "var(--text)", letterSpacing: "0.04em",
      }}>
        COINDROP
      </span>
    </div>
  );
}

/* Avatar: pixel sprite inside a neon-edged cabinet tile + presence dot */
function Avatar({ player, size = 44, showPresence = true }) {
  const status = player.status || (player.you ? "lobby" : "lobby");
  return (
    <div style={{ position: "relative", flex: "none", width: size, height: size }}>
      <div style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--bg-3)",
        border: "1px solid var(--accent-line)",
        borderRadius: "var(--r-sm)",
        color: "var(--accent)",
        boxShadow: "inset 0 0 12px -4px var(--accent-glow)",
      }}>
        <PixelSprite name={player.sprite} size={size * 0.6} />
      </div>
      {showPresence && (
        <span className={"presence is-" + status} />
      )}
    </div>
  );
}

function StatusBadge({ status, vs }) {
  if (status === "game") {
    return (
      <span className="badge badge-game" title={vs ? "Playing " + vs : "In a game"}>
        <span className="dot" />
        {vs ? "VS " + vs : "IN GAME"}
      </span>
    );
  }
  if (status === "idle") {
    return <span className="badge badge-idle"><span className="dot" />AWAY</span>;
  }
  return <span className="badge badge-lobby"><span className="dot" />IN LOBBY</span>;
}

function SectionLabel({ children, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 10,
    }}>
      <div className="eyebrow">{children}</div>
      {right}
    </div>
  );
}

/* a little animated equalizer to signal "live / activity" */
function LiveDot({ label = "LIVE" }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 11 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 3, background: "var(--accent)", borderRadius: 1,
            boxShadow: "0 0 5px var(--accent-glow)",
            animation: `eq calc(${0.7 + i * 0.18}s / var(--anim,1)) ease-in-out ${i * 0.12}s infinite alternate`,
          }} />
        ))}
      </span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.22em", color: "var(--accent-bright)",
      }}>{label}</span>
    </span>
  );
}

Object.assign(window, { Wordmark, Avatar, StatusBadge, SectionLabel, LiveDot });
