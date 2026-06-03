/* app.jsx — shell, navigation, state, tweaks */

const { useState, useEffect, useRef, useCallback } = React;

/* ---- accent derivation: one base hex -> full token set ---- */
function hexToRgb(h) {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(h, amt) {
  // amt > 0 lighten toward white, < 0 darken toward black
  let [r, g, b] = hexToRgb(h);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `rgb(${r}, ${g}, ${b})`;
}
function rgba(h, a) {
  const [r, g, b] = hexToRgb(h);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
function applyAccent(hex) {
  const r = document.documentElement.style;
  r.setProperty("--accent", hex);
  r.setProperty("--accent-bright", shade(hex, 0.45));
  r.setProperty("--accent-deep", shade(hex, -0.4));
  r.setProperty("--accent-glow", rgba(hex, 0.55));
  r.setProperty("--accent-soft", rgba(hex, 0.12));
  r.setProperty("--accent-line", rgba(hex, 0.3));
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2fe6ff",
  "displayFont": "Bungee",
  "crt": 70,
  "motion": "full",
  "density": "regular"
}/*EDITMODE-END*/;

const MOTION_MAP = { full: 1, calm: 0.62, off: 0 };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState("lobby");
  const [chat, setChat] = useState(SEED_CHAT);
  const [incoming, setIncoming] = useState(null);   // coin-drop modal
  const [matching, setMatching] = useState(null);   // outgoing overlay
  const [opponent, setOpponent] = useState(PLAYERS[4]);
  const ambientIdx = useRef(0);
  const challengedOnce = useRef(false);

  /* ---- apply tweaks to :root ---- */
  useEffect(() => { applyAccent(t.accent); }, [t.accent]);
  useEffect(() => {
    document.documentElement.style.setProperty("--font-display",
      `"${t.displayFont}", "Arial Black", sans-serif`);
  }, [t.displayFont]);
  useEffect(() => {
    document.documentElement.style.setProperty("--crt", String(t.crt / 100));
  }, [t.crt]);
  useEffect(() => {
    const m = MOTION_MAP[t.motion] ?? 1;
    document.documentElement.style.setProperty("--anim", String(m || 0.001));
    document.documentElement.setAttribute("data-motion", t.motion);
  }, [t.motion]);
  useEffect(() => {
    document.documentElement.setAttribute("data-density", t.density);
  }, [t.density]);

  /* ---- live chat: keep the room talking ---- */
  useEffect(() => {
    const id = setInterval(() => {
      const base = AMBIENT_CHAT[ambientIdx.current % AMBIENT_CHAT.length];
      ambientIdx.current++;
      const now = new Date();
      const ts = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      setChat((c) => [...c.slice(-40), { ...base, t: ts }]);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  /* ---- auto coin-drop once, ~8s after landing, to show the moment ---- */
  useEffect(() => {
    if (challengedOnce.current) return;
    const id = setTimeout(() => {
      if (screen === "lobby" && !incoming && !matching) {
        challengedOnce.current = true;
        setIncoming(PLAYERS[4]); // MAXOUT — he called you out in chat
      }
    }, 8000);
    return () => clearTimeout(id);
  }, [screen, incoming, matching]);

  const startGame = (p) => { setOpponent(p); setScreen("game"); };

  const challenge = (p) => setMatching(p);
  const playRandom = () => {
    const pool = PLAYERS.filter((p) => p.status === "lobby");
    setMatching(pool[Math.floor(Math.random() * pool.length)]);
  };
  const simIncoming = () => {
    const pool = PLAYERS.filter((p) => p.status === "lobby");
    setIncoming(pool[Math.floor(Math.random() * pool.length)]);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <Wordmark />
        <nav className="nav">
          {[["lobby", "LOBBY"], ["game", "GAME"], ["leaderboard", "SCORES"], ["history", "HISTORY"]].map(([k, label]) => (
            <button key={k} className={"nav-item" + (screen === k ? " active" : "")} onClick={() => setScreen(k)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="me-chip">
          <Avatar player={{ ...ME, status: "lobby" }} size={30} />
          <div style={{ lineHeight: 1.2 }}>
            <div className="mono" style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{ME.name}</div>
            <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{ME.wins}W · {ME.losses}L</div>
          </div>
        </div>
      </header>

      <main style={{ minHeight: 0 }}>
        {screen === "lobby" && (
          <Lobby
            players={PLAYERS}
            messages={chat}
            onChallenge={challenge}
            onRandom={playRandom}
            onPlayTTT={playRandom}
            onSimIncoming={simIncoming}
          />
        )}
        {screen === "game" && (
          <GameScreen
            opponent={opponent}
            onRematch={() => {}}
            onExit={() => setScreen("lobby")}
          />
        )}
        {screen === "leaderboard" && <Leaderboard players={PLAYERS} />}
        {screen === "history" && <MatchHistory history={HISTORY} />}
      </main>

      {matching && (
        <Matchmaking
          opponent={matching}
          onReady={() => { startGame(matching); setMatching(null); }}
          onCancel={() => setMatching(null)}
        />
      )}
      {incoming && (
        <ChallengeModal
          from={incoming}
          onAccept={() => { startGame(incoming); setIncoming(null); }}
          onDecline={() => setIncoming(null)}
        />
      )}

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Neon" value={t.accent}
          options={["#2fe6ff", "#ff9d2e", "#ff2d92", "#7CFF6B", "#c69bff"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Type" />
        <TweakSelect label="Display font" value={t.displayFont}
          options={["Bungee", "Press Start 2P", "Monoton", "Audiowide"]}
          onChange={(v) => setTweak("displayFont", v)} />
        <TweakSection label="Atmosphere" />
        <TweakSlider label="CRT texture" value={t.crt} min={0} max={100} unit="%"
          onChange={(v) => setTweak("crt", v)} />
        <TweakRadio label="Motion" value={t.motion}
          options={["full", "calm", "off"]}
          onChange={(v) => setTweak("motion", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density}
          options={["compact", "regular", "roomy"]}
          onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
