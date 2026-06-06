export function ChatScreen() {
  const messages = [
    { id: 1, text: "Been thinking about you nonstop today 💭", sent: false, time: "7:32 PM" },
    { id: 2, text: "Same. You make everything feel like the best day 🌊", sent: true, time: "7:33 PM", read: true },
    { id: 3, text: "I keep replaying our last moment together\nit's all I think about", sent: false, time: "7:34 PM" },
    { id: 4, text: "Let's not wait so long\nnext time ❤️", sent: true, time: "7:35 PM", read: true },
  ];

  return (
    <div style={{
      width: 390, height: 844, background: "#04060E",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden", position: "relative", color: "#EEF2FF",
      display: "flex", flexDirection: "column"
    }}>
      {/* bg glow */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 20%, rgba(0,229,255,0.05) 0%, transparent 55%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.35), transparent)", pointerEvents: "none" }}/>

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
      <div style={{ padding: "4px 16px 12px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: "1px solid rgba(0,229,255,0.07)" }}>
        <div style={{ fontSize: 20, color: "#00E5FF" }}>←</div>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #00E5FF, #7B2FFF)", padding: 2.5, display: "flex" }}>
            <div style={{ flex: 1, borderRadius: "50%", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
          </div>
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#00E5FF", border: "2px solid #04060E", boxShadow: "0 0 6px #00E5FF" }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Alex</div>
          <div style={{ fontSize: 11, color: "#00E5FF", letterSpacing: 0.3, marginTop: 1 }}>always with you</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["📞","📹"].map(ic => (
            <div key={ic} style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{ic}</div>
          ))}
        </div>
      </div>

      {/* Bioluminescent water surface photo */}
      <div style={{ margin: "12px 16px", borderRadius: 20, overflow: "hidden", height: 140, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #020810 0%, #071428 30%, #031830 60%, #051220 100%)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 60%, rgba(0,229,255,0.22) 0%, transparent 55%), radial-gradient(ellipse at 75% 35%, rgba(123,47,255,0.18) 0%, transparent 45%)" }}/>
        {/* Wake line ripples */}
        {[0.7, 0.55, 0.4, 0.28].map((o, i) => (
          <div key={i} style={{ position: "absolute", left: `${10 + i * 8}%`, right: `${10 + i * 8}%`, top: "50%", height: 1, background: `rgba(0,229,255,${o * 0.25})`, borderRadius: 1 }}/>
        ))}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.06) 0%, transparent 70%)" }}/>
        <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 11, color: "rgba(0,229,255,0.5)", letterSpacing: 0.5, fontWeight: 500 }}>Today · Still waters</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 20, border: "1px solid rgba(0,229,255,0.1)" }}/>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sent ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "74%", padding: "11px 15px",
              borderRadius: msg.sent ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.sent
                ? "linear-gradient(135deg, #7B2FFF, #00AAFF)"
                : "rgba(0,229,255,0.05)",
              border: msg.sent ? "none" : "1px solid rgba(0,229,255,0.1)",
              boxShadow: msg.sent ? "0 4px 20px rgba(123,47,255,0.35)" : "none",
              fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-line"
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: 11, color: "#3D5068", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {msg.time} {msg.read && <span style={{ color: "#00E5FF" }}>✓✓</span>}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 6 }}>
          <div style={{ background: "rgba(255,79,163,0.12)", border: "1px solid rgba(255,79,163,0.25)", borderRadius: 20, padding: "3px 10px", fontSize: 13 }}>💗</div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "10px 16px 8px", background: "rgba(4,6,14,0.96)", borderTop: "1px solid rgba(0,229,255,0.07)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#00E5FF" }}>+</div>
        <div style={{ flex: 1, background: "rgba(0,229,255,0.04)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 22, padding: "10px 16px", fontSize: 14, color: "#3D5068" }}>
          Type a message...
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00E5FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: "0 4px 18px rgba(0,229,255,0.4)" }}>▶</div>
      </div>
      <div style={{ height: 32, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8, background: "rgba(4,6,14,0.96)", flexShrink: 0 }}>
        <div style={{ width: 120, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }}/>
      </div>
    </div>
  );
}
