export function MemoriesScreen() {
  const memories = [
    { id: 1, label: "Sunset ride", date: "May 12", cols: 1, grad: "linear-gradient(135deg, #FF6B35, #F7931E, #c04000)", emoji: "🏄" },
    { id: 2, label: "Lake day", date: "May 8", cols: 1, grad: "linear-gradient(135deg, #1a3a6b, #0d5faa, #00B4FF)", emoji: "⛵" },
    { id: 3, label: "Best weekend", date: "May 5", cols: 1, grad: "linear-gradient(135deg, #3d1060, #7B2FFF, #b44fff)", emoji: "🌅" },
    { id: 4, label: "You & me", date: "Apr 28", cols: 1, grad: "linear-gradient(135deg, #1a4a2a, #22D3A5, #0d8f6b)", emoji: "💑" },
    { id: 5, label: "Golden hour", date: "Apr 20", cols: 1, grad: "linear-gradient(135deg, #7a1a1a, #FF4D4D, #ff8c42)", emoji: "🌄" },
    { id: 6, label: "Beach night", date: "Apr 15", cols: 1, grad: "linear-gradient(135deg, #0a0a2e, #1a1a6b, #00B4FF)", emoji: "🌙" },
  ];

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
      <div style={{ padding: "4px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Memories</div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#A78BFA" }}>≡</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px 14px", display: "flex", gap: 0, flexShrink: 0 }}>
        {["All", "Photos", "Videos", "Places"].map((tab, i) => (
          <div key={tab} style={{
            padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            background: i === 0 ? "linear-gradient(135deg, rgba(123,47,255,0.4), rgba(0,180,255,0.4))" : "transparent",
            border: i === 0 ? "1px solid rgba(123,47,255,0.5)" : "1px solid transparent",
            color: i === 0 ? "#fff" : "#8B89A0",
            boxShadow: i === 0 ? "0 2px 12px rgba(123,47,255,0.3)" : "none"
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, overflowY: "hidden", alignContent: "start" }}>
        {memories.map((m, i) => (
          <div key={m.id} style={{ borderRadius: 16, overflow: "hidden", position: "relative", height: i % 3 === 0 ? 180 : 155 }}>
            <div style={{ position: "absolute", inset: 0, background: m.grad }}/>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.4 }}>{m.emoji}</div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 50%)" }}/>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{m.date}</div>
            </div>
            {/* Heart */}
            <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤍</div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", bottom: 98, right: 20, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00B4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 6px 24px rgba(123,47,255,0.6)", color: "white", fontWeight: 700 }}>+</div>

      {/* Tab bar */}
      <div style={{ height: 84, background: "rgba(8,8,18,0.96)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0 }}>
        {[
          { icon: "🏠", label: "Home", active: false },
          { icon: "💬", label: "Chat", active: false },
          { icon: "🌊", label: "Whisper", active: false },
          { icon: "🖼️", label: "Memories", active: true },
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
