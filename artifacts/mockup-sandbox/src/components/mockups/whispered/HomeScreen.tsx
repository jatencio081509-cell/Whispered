export function HomeScreen() {
  return (
    <div style={{
      width: 390, height: 844, background: "#080812", fontFamily: "'Inter', system-ui, sans-serif",
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
          <div style={{ fontSize: 22, fontWeight: 700, fontStyle: "italic", letterSpacing: -0.5, background: "linear-gradient(135deg, #A78BFA, #60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Whispered ~
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 6px #22D3A5" }}/>
            <span style={{ fontSize: 12, color: "#8B89A0" }}>Connected with Alex</span>
          </div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00B4FF)", padding: 2, display: "flex" }}>
          <div style={{ flex: 1, borderRadius: "50%", background: "#1a1630", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</div>
        </div>
      </div>

      {/* Hero wave card */}
      <div style={{ margin: "0 16px", borderRadius: 20, overflow: "hidden", position: "relative", height: 180, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0a0520 0%, #1a0a3d 30%, #0d1a4a 60%, #061224 100%)" }}/>
        {/* Wave/ocean silhouette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 40%, rgba(123,47,255,0.4) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(0,180,255,0.3) 0%, transparent 50%)" }}/>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(0deg, rgba(0,180,255,0.15) 0%, transparent 100%)" }}/>
        {/* Surfer silhouette text */}
        <div style={{ position: "absolute", top: 20, left: 20, right: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>YOU'RE BOTH</div>
          <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, color: "#fff" }}>Riding the<br/>same wave</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 8px #22D3A5" }}/>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Alex is online</span>
          </div>
        </div>
        {/* Heart */}
        <div style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💙</div>
        {/* Neon border */}
        <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: "1px solid rgba(123,47,255,0.4)", boxShadow: "inset 0 0 30px rgba(0,180,255,0.08)" }}/>
      </div>

      {/* Quick action buttons */}
      <div style={{ padding: "20px 16px 12px", display: "flex", justifyContent: "space-around", flexShrink: 0 }}>
        {[
          { icon: "💬", label: "Chat", grad: "linear-gradient(135deg, #0072FF, #00C6FF)", glow: "rgba(0,114,255,0.5)" },
          { icon: "🌊", label: "Whisper", grad: "linear-gradient(135deg, #7B2FFF, #B44FFF)", glow: "rgba(123,47,255,0.5)" },
          { icon: "🖼️", label: "Memories", grad: "linear-gradient(135deg, #FF4D8D, #FF8C42)", glow: "rgba(255,77,141,0.5)" },
        ].map(a => (
          <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: a.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 8px 24px ${a.glow}` }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 12, color: "#8B89A0" }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ margin: "4px 16px", display: "flex", gap: 10, flexShrink: 0 }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>☁️</span>
          <div>
            <div style={{ fontSize: 11, color: "#8B89A0" }}>Today</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>1 / 2 whispers</div>
          </div>
        </div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🔥</span>
          <div>
            <div style={{ fontSize: 11, color: "#8B89A0" }}>Streak</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>12 days</div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Tab bar */}
      <div style={{ height: 84, background: "rgba(8,8,18,0.96)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0, backdropFilter: "blur(20px)" }}>
        {[
          { icon: "🏠", label: "Home", active: true },
          { icon: "💬", label: "Chat", active: false },
          { icon: "🌊", label: "Whisper", active: false },
          { icon: "🖼️", label: "Memories", active: false },
          { icon: "👤", label: "More", active: false },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: t.active ? "linear-gradient(135deg, rgba(123,47,255,0.3), rgba(0,180,255,0.3))" : "transparent", boxShadow: t.active ? "0 0 16px rgba(123,47,255,0.4)" : "none", border: t.active ? "1px solid rgba(123,47,255,0.4)" : "none" }}>
              {t.icon}
            </div>
            <span style={{ fontSize: 10, color: t.active ? "#A78BFA" : "#8B89A0" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
