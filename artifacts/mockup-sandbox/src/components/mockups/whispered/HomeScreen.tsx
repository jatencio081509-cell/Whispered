export function HomeScreen() {
  return (
    <div style={{
      width: 390, height: 844, background: "#06090F", fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden", position: "relative", color: "#F0EEFF", display: "flex", flexDirection: "column"
    }}>
      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6"/><rect x="9" y="0" width="3" height="12" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><path d="M8 2.4C10.8 2.4 13.3 3.5 15.1 5.3L16 4.4C13.9 2.3 11.1 1 8 1C4.9 1 2.1 2.3 0 4.4L0.9 5.3C2.7 3.5 5.2 2.4 8 2.4Z"/><path d="M8 5.2C9.9 5.2 11.6 6 12.9 7.2L13.8 6.3C12.2 4.8 10.2 3.9 8 3.9C5.8 3.9 3.8 4.8 2.2 6.3L3.1 7.2C4.4 6 6.1 5.2 8 5.2Z"/><circle cx="8" cy="10" r="1.5"/></svg>
          <div style={{ width: 25, height: 12, border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 3, display: "flex", alignItems: "center", padding: "0 2px" }}>
            <div style={{ width: 16, height: 7, background: "white", borderRadius: 1.5 }}/>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "4px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, fontStyle: "italic", letterSpacing: -0.5, background: "linear-gradient(135deg, #A78BFA, #38BDF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Whispered ~
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 6px #22D3A5" }}/>
            <span style={{ fontSize: 12, color: "#8B89A0" }}>Connected with Alex</span>
          </div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #0EA5E9)", padding: 2, display: "flex" }}>
          <div style={{ flex: 1, borderRadius: "50%", background: "#0c1624", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🏄‍♀️</div>
        </div>
      </div>

      {/* Hero card — wakeboarding sunset */}
      <div style={{ margin: "0 16px", borderRadius: 22, overflow: "hidden", position: "relative", height: 190, flexShrink: 0 }}>
        {/* Sky gradient */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0d1f3c 0%, #1a3a6b 30%, #2d5a8e 55%, #FF7B3A 80%, #FF4500 100%)" }}/>
        {/* Water reflection */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(180deg, rgba(255,120,58,0.3) 0%, rgba(13,31,60,0.8) 100%)" }}/>
        {/* Wake spray highlight */}
        <div style={{ position: "absolute", bottom: "42%", left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)" }}/>
        {/* Glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 75% 35%, rgba(0,180,255,0.2) 0%, transparent 55%)" }}/>

        {/* Wakeboarder silhouette */}
        <div style={{ position: "absolute", right: 28, bottom: "38%", fontSize: 32, filter: "drop-shadow(0 0 12px rgba(255,180,0,0.6))" }}>🏄‍♂️</div>

        <div style={{ position: "absolute", top: 20, left: 20, right: 80 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 6 }}>YOU'RE BOTH</div>
          <div style={{ fontSize: 25, fontWeight: 700, lineHeight: 1.25, color: "#fff", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>Riding the<br/>same wake 🌊</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 8px #22D3A5" }}/>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>Alex is on the water</span>
          </div>
        </div>

        {/* Heart */}
        <div style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💙</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 22, border: "1px solid rgba(255,120,58,0.25)", boxShadow: "inset 0 0 30px rgba(0,150,255,0.06)" }}/>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "18px 16px 10px", display: "flex", justifyContent: "space-around", flexShrink: 0 }}>
        {[
          { icon: "💬", label: "Chat", grad: "linear-gradient(135deg, #0072FF, #38BDF8)", glow: "rgba(0,114,255,0.5)" },
          { icon: "🌊", label: "Whisper", grad: "linear-gradient(135deg, #7B2FFF, #B44FFF)", glow: "rgba(123,47,255,0.5)" },
          { icon: "📸", label: "Memories", grad: "linear-gradient(135deg, #FF6B35, #FF4500)", glow: "rgba(255,107,53,0.55)" },
        ].map(a => (
          <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: a.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 8px 24px ${a.glow}` }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 12, color: "#8B89A0" }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ margin: "4px 16px", display: "flex", gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🏄</span>
          <div>
            <div style={{ fontSize: 10, color: "#8B89A0" }}>Today</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>1 / 2 whispers</div>
          </div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <div style={{ fontSize: 10, color: "#8B89A0" }}>Streak</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>12 days</div>
          </div>
        </div>
      </div>

      {/* Mood / prompt teaser */}
      <div style={{ margin: "10px 16px 0", background: "linear-gradient(135deg, rgba(123,47,255,0.12), rgba(0,180,255,0.08))", border: "1px solid rgba(123,47,255,0.25)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 22 }}>💬</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>Daily Prompt</div>
          <div style={{ fontSize: 13, color: "#D4D0F0", marginTop: 2 }}>What's your favourite lake memory together?</div>
        </div>
        <span style={{ color: "#A78BFA", fontSize: 18 }}>›</span>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Tab bar */}
      <div style={{ height: 84, background: "rgba(6,9,15,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0 }}>
        {[
          { icon: "🏠", label: "Home", active: true },
          { icon: "💬", label: "Chat", active: false },
          { icon: "🌊", label: "Whisper", active: false },
          { icon: "📸", label: "Memories", active: false },
          { icon: "👤", label: "More", active: false },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: t.active ? "linear-gradient(135deg, rgba(123,47,255,0.35), rgba(0,180,255,0.25))" : "transparent", boxShadow: t.active ? "0 0 18px rgba(0,180,255,0.3)" : "none", border: t.active ? "1px solid rgba(56,189,248,0.35)" : "none" }}>
              {t.icon}
            </div>
            <span style={{ fontSize: 10, color: t.active ? "#38BDF8" : "#8B89A0" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
