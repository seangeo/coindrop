/* lobby.jsx — the hero screen: roster · games · live chat */

function GamesCatalog({ onPlay }) {
  const games = [
    { id: "ttt", name: "TIC-TAC-TOE", tag: "1v1 · 60s", sprite: "invader", live: true },
    { id: "soon1", name: "???", tag: "COMING SOON", sprite: "ghost", live: false },
    { id: "soon2", name: "???", tag: "COMING SOON", sprite: "ufo", live: false },
  ];
  return (
    <div style={{ display: "grid", gap: "var(--gap-sm)" }}>
      {games.map((g) => (
        <button
          key={g.id}
          disabled={!g.live}
          onClick={() => g.live && onPlay()}
          className="game-tile"
          style={{
            display: "flex", alignItems: "center", gap: "var(--pad-sm)",
            padding: "var(--pad-sm)", textAlign: "left",
            background: g.live ? "var(--bg-2)" : "transparent",
            border: "1px solid " + (g.live ? "var(--accent-line)" : "var(--line)"),
            borderRadius: "var(--r-sm)",
            cursor: g.live ? "pointer" : "not-allowed",
            opacity: g.live ? 1 : 0.45,
            color: "var(--text)",
            position: "relative", overflow: "hidden",
            transition: "border-color .15s, box-shadow .2s, transform .08s",
          }}
        >
          <span style={{
            width: 48, height: 48, flex: "none", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "var(--bg-3)", borderRadius: "var(--r-sm)",
            color: g.live ? "var(--accent)" : "var(--text-faint)",
            boxShadow: g.live ? "inset 0 0 14px -5px var(--accent-glow)" : "none",
          }}>
            <PixelSprite name={g.sprite} size={30} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
            <span className="display" style={{ fontSize: 14, letterSpacing: "0.01em", whiteSpace: "nowrap" }}>{g.name}</span>
            <span className="eyebrow" style={{ letterSpacing: "0.18em" }}>{g.tag}</span>
          </span>
          {g.live && (
            <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 18 }}>▸</span>
          )}
        </button>
      ))}
    </div>
  );
}

function RosterRow({ player, onChallenge, i }) {
  const inGame = player.status === "game";
  const away = player.status === "idle";
  return (
    <div
      className="roster-row"
      style={{
        display: "flex", alignItems: "center", gap: "var(--pad-sm)",
        minHeight: "var(--row-h)", padding: "0 var(--pad-sm)",
        borderRadius: "var(--r-sm)",
        animationDelay: `calc(${0.04 * i}s / var(--anim,1))`,
        opacity: away ? 0.6 : 1,
      }}
    >
      <Avatar player={player} size={40} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ fontWeight: 700, fontSize: "var(--fs-body)", color: "var(--text)" }}>
            {player.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.05em" }}>
            {player.wins}W · {player.losses}L
          </span>
        </div>
      </div>
      <StatusBadge status={player.status} vs={player.vs} />
      <button
        className="btn btn-ghost roster-cta"
        disabled={inGame || away}
        onClick={() => onChallenge(player)}
        style={{ padding: "7px 12px", fontSize: 11 }}
      >
        {inGame ? "BUSY" : "CHALLENGE"}
      </button>
    </div>
  );
}

function Roster({ players, onChallenge }) {
  const online = players.filter((p) => p.status !== "idle").length;
  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="panel-head">
        <div className="panel-title">
          PLAYERS <b>{online}</b> ONLINE
        </div>
        <LiveDot label="LIVE" />
      </div>
      <div className="stagger" style={{ overflowY: "auto", padding: "8px", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
        {players.map((p, i) => (
          <RosterRow key={p.id} player={p} onChallenge={onChallenge} i={i} />
        ))}
      </div>
    </div>
  );
}

function Chat({ messages }) {
  const scrollRef = React.useRef(null);
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="panel" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div className="panel-head">
        <div className="panel-title">LOBBY <b>CHAT</b></div>
        <span className="eyebrow" style={{ letterSpacing: "0.18em" }}>#main-floor</span>
      </div>
      <div ref={scrollRef} style={{
        flex: 1, overflowY: "auto", padding: "var(--pad-sm)",
        display: "flex", flexDirection: "column", gap: 10, minHeight: 0,
      }}>
        {messages.map((m, i) => <ChatLine key={i} m={m} />)}
      </div>
      <div style={{
        display: "flex", gap: 8, padding: "var(--pad-sm)", borderTop: "1px solid var(--line)",
      }}>
        <input
          className="chat-input"
          placeholder="type to the room…"
          style={{
            flex: 1, background: "var(--bg-3)", border: "1px solid var(--line)",
            borderRadius: "var(--r-sm)", color: "var(--text)", padding: "10px 12px",
            fontFamily: "var(--font-mono)", fontSize: "var(--fs-sm)", outline: "none",
          }}
        />
        <button className="btn btn-accent" style={{ padding: "0 16px" }}>SEND</button>
      </div>
    </div>
  );
}

function ChatLine({ m }) {
  if (m.who === "_system") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "2px 0",
        fontSize: 11.5, color: "var(--text-faint)", letterSpacing: "0.04em",
      }}>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--accent-deep)" }}>◆</span>
          {m.text}
        </span>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      <span style={{
        width: 24, height: 24, flex: "none", display: "flex", alignItems: "center",
        justifyContent: "center", color: m.me ? "var(--warm)" : "var(--accent)",
        background: "var(--bg-3)", borderRadius: "var(--r-sm)", marginTop: 1,
      }}>
        <PixelSprite name={m.sprite} size={16} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span className="mono" style={{
            fontWeight: 700, fontSize: 12, color: m.me ? "var(--warm)" : "var(--accent-bright)",
          }}>{m.who}{m.me ? " (you)" : ""}</span>
          <span style={{ fontSize: 10, color: "var(--text-faint)" }}>{m.t}</span>
        </div>
        <div style={{ fontSize: "var(--fs-sm)", color: "var(--text)", lineHeight: 1.45, wordBreak: "break-word" }}>
          {m.text}
        </div>
      </div>
    </div>
  );
}

function Lobby({ players, messages, onChallenge, onRandom, onPlayTTT, onSimIncoming }) {
  return (
    <div className="lobby-grid">
      {/* left column: games + quick play */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)", minHeight: 0 }}>
        <div className="panel" style={{ padding: "var(--pad)" }}>
          <SectionLabel>Games</SectionLabel>
          <GamesCatalog onPlay={onPlayTTT} />
        </div>
        <div className="panel" style={{ padding: "var(--pad)", display: "flex", flexDirection: "column", gap: "var(--gap-sm)" }}>
          <SectionLabel>Quick play</SectionLabel>
          <p style={{ margin: "0 0 4px", fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.5 }}>
            Drop a coin and we'll match you with anyone in the lobby.
          </p>
          <button className="btn btn-accent btn-block btn-lg" onClick={onRandom} style={{ fontSize: 13, letterSpacing: "0.08em" }}>
            ◎ PLAY RANDOM OPPONENT
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "2px 0" }}>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            <span className="eyebrow">or pick someone →</span>
            <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>
          <button className="btn btn-ghost btn-block" onClick={onSimIncoming} style={{ fontSize: 11 }}>
            ◎ SIMULATE INCOMING CHALLENGE
          </button>
        </div>
      </div>

      {/* center column: roster */}
      <Roster players={players} onChallenge={onChallenge} />

      {/* right column: chat */}
      <Chat messages={messages} />
    </div>
  );
}

Object.assign(window, { Lobby, GamesCatalog, Roster, Chat });
