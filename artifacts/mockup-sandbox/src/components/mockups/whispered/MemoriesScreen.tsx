export function MemoriesScreen() {
  const memories = [
    { id: 1, label: "Golden hour",     date: "May 12", h: 178, c1: "#FF8C42", c2: "#C14000", emoji: "🌅" },
    { id: 2, label: "Just us two",     date: "May 8",  h: 152, c1: "#00E5FF", c2: "#0060AA", emoji: "💑" },
    { id: 3, label: "Still waters",    date: "May 5",  h: 152, c1: "#7B2FFF", c2: "#2A0870", emoji: "🌊" },
    { id: 4, label: "The best night",  date: "Apr 28", h: 178, c1: "#FF4FA3", c2: "#8B0060", emoji: "🌙" },
    { id: 5, label: "Our place",       date: "Apr 20", h: 152, c1: "#00CFAA", c2: "#005040", emoji: "✨" },
    { id: 6, label: "First light",     date: "Apr 15", h: 152, c1: "#4FA3FF", c2: "#002288", emoji: "💫" },
  ];

  return (
    <div style={{
      width: 390, height: 844, background: "#04060E",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden", position: "relative", color: "#EEF2FF",
      display: "flex", flexDirection: "column"
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -5%, rgba(0,229,255,0.06) 0%, transparent 55%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent)", pointerEvents: "none" }}/>

      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.5 }}>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6"/><rect x="9" y="0" width="3" height="12" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="white"><path d="M8 2.4C10.8 2.4 13.3 3.5 15.1 5.3L16 4.4C13.9 2.3 11.1 1 8 1C4.9 1 2.1 2.3 0 4.4L0.9 5.3C2.7 3.5 5.2 2.4 8 2.4Z"/><path d="M8 5.2C9.9 5.2 11.6 6 12.9 7.2L13.8 6.3C12.2 4.8 10.2 3.9 8 3.9C5.8 3.9 3.8 4.8 2.2 6.3L3.1 7.2C4.4 6 6.1 5.2 8 5.2Z"/><circle cx="8" cy="10" r="1.5"/></svg>
          <div style={{ width: 25, height: 12, border: "1.5px solid rgba(255,255,255,0.4)", borderRadius: 3, display: "flex", alignItems: "center", padding: "0 2px" }}>
            <div style={{ width: 16, height: 7, background: "white", borderRadius: 1.5 }}/>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "4px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Memories</div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#00E5FF" }}>≡</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px 14px", display: "flex", gap: 6, flexShrink: 0 }}>
        {["All", "Photos", "Videos", "Places"].map((tab, i) => (
          <div key={tab} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            background: i === 0 ? "rgba(0,229,255,0.08)" : "transparent",
            border: i === 0 ? "1px solid rgba(0,229,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
            color: i === 0 ? "#00E5FF" : "#3D5068",
            boxShadow: i === 0 ? "0 0 14px rgba(0,229,255,0.15)" : "none",
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, overflowY: "hidden", alignContent: "start" }}>
        {memories.map((m) => (
          <div key={m.id} style={{ borderRadius: 18, overflow: "hidden", position: "relative", height: m.h }}>
            {/* Gradient bg */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${m.c1} 0%, ${m.c2} 100%)` }}/>
            {/* Bioluminescent inner glow */}
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.15) 0%, transparent 60%)` }}/>
            {/* Wake ripple lines as texture */}
            {[0.35, 0.6, 0.85].map((pos, i) => (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${pos * 100}%`, height: 1, background: `rgba(255,255,255,${0.04 + i * 0.03})` }}/>
            ))}
            {/* Emoji watermark */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.2 }}>{m.emoji}</div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 50%)" }}/>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "9px 11px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{m.date}</div>
            </div>
            <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤍</div>
            <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)" }}/>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", bottom: 96, right: 20, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00E5FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 6px 28px rgba(0,229,255,0.45)", color: "white", fontWeight: 700 }}>+</div>

      {/* Tab bar */}
      <div style={{ height: 82, background: "rgba(4,6,14,0.98)", borderTop: "1px solid rgba(0,229,255,0.07)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0 }}>
        {[
          { icon: "⌂",  label: "Home",     active: false },
          { icon: "💬", label: "Chat",     active: false },
          { icon: "🌊", label: "Whisper",  active: false },
          { icon: "✨", label: "Memories", active: true  },
          { icon: "◯",  label: "More",     active: false },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 46, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: t.active ? 22 : 20, background: t.active ? "rgba(0,229,255,0.08)" : "transparent", boxShadow: t.active ? "0 0 20px rgba(0,229,255,0.2)" : "none", border: t.active ? "1px solid rgba(0,229,255,0.22)" : "none" }}>
              {t.icon}
            </div>
            <span style={{ fontSize: 10, color: t.active ? "#00E5FF" : "#3D5068", letterSpacing: 0.3 }}>{t.label}</span>
            {t.active && <div style={{ width: 16, height: 2, borderRadius: 1, background: "#00E5FF", boxShadow: "0 0 6px #00E5FF", marginTop: -2 }}/>}
          </div>
        ))}
      </div>
    </div>
  );
}
