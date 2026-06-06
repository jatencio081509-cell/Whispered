export function MemoriesScreen() {
  const memories = [
    { id: 1, label: "Sunset session", date: "May 12", h: 175, grad: "linear-gradient(180deg, #FF6B35 0%, #FF4500 40%, #cc2200 100%)", emoji: "🏄‍♂️" },
    { id: 2, label: "Cable park day", date: "May 8",  h: 150, grad: "linear-gradient(180deg, #0d5faa 0%, #1a3a6b 50%, #061224 100%)", emoji: "🌊" },
    { id: 3, label: "Our first tow", date: "May 5",  h: 150, grad: "linear-gradient(180deg, #7B2FFF 0%, #4a1a8f 50%, #1a0a3d 100%)", emoji: "💑" },
    { id: 4, label: "Lake house wknd", date: "Apr 28", h: 175, grad: "linear-gradient(180deg, #22D3A5 0%, #0d8f6b 45%, #052e23 100%)", emoji: "🌅" },
    { id: 5, label: "Sunrise run", date: "Apr 20", h: 150, grad: "linear-gradient(180deg, #FF8C42 0%, #e05c00 50%, #6b2800 100%)", emoji: "☀️" },
    { id: 6, label: "Night wake", date: "Apr 15", h: 150, grad: "linear-gradient(180deg, #0EA5E9 0%, #0369a1 50%, #022038 100%)", emoji: "🌙" },
  ];

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
      <div style={{ padding: "4px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>Memories</div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#38BDF8" }}>≡</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "0 20px 14px", display: "flex", gap: 6, flexShrink: 0 }}>
        {["All", "Photos", "Videos", "Places"].map((tab, i) => (
          <div key={tab} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: i === 0 ? 600 : 400,
            background: i === 0 ? "linear-gradient(135deg, rgba(255,107,53,0.35), rgba(14,165,233,0.25))" : "transparent",
            border: i === 0 ? "1px solid rgba(255,107,53,0.45)" : "1px solid rgba(255,255,255,0.07)",
            color: i === 0 ? "#fff" : "#8B89A0",
            boxShadow: i === 0 ? "0 2px 12px rgba(255,107,53,0.2)" : "none"
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, padding: "0 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, overflowY: "hidden", alignContent: "start" }}>
        {memories.map((m) => (
          <div key={m.id} style={{ borderRadius: 16, overflow: "hidden", position: "relative", height: m.h }}>
            <div style={{ position: "absolute", inset: 0, background: m.grad }}/>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, opacity: 0.35 }}>{m.emoji}</div>
            {/* Wake spray detail */}
            <div style={{ position: "absolute", bottom: "38%", left: 0, right: 0, height: 1.5, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}/>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 55%)" }}/>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 10px" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{m.date}</div>
            </div>
            <div style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤍</div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <div style={{ position: "absolute", bottom: 98, right: 20, width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF4500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 6px 24px rgba(255,107,53,0.55)", color: "white", fontWeight: 700 }}>+</div>

      {/* Tab bar */}
      <div style={{ height: 84, background: "rgba(6,9,15,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0 }}>
        {[
          { icon: "🏠", label: "Home", active: false },
          { icon: "💬", label: "Chat", active: false },
          { icon: "🌊", label: "Whisper", active: false },
          { icon: "📸", label: "Memories", active: true },
          { icon: "👤", label: "More", active: false },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: t.active ? "linear-gradient(135deg, rgba(255,107,53,0.3), rgba(14,165,233,0.2))" : "transparent", boxShadow: t.active ? "0 0 18px rgba(255,107,53,0.3)" : "none", border: t.active ? "1px solid rgba(255,107,53,0.4)" : "none" }}>
              {t.icon}
            </div>
            <span style={{ fontSize: 10, color: t.active ? "#FF8C42" : "#8B89A0" }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
