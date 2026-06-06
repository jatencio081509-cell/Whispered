export function ChatScreen() {
  const messages = [
    { id: 1, text: "Had an insane sesh today 🏄", sent: false, time: "7:32 PM" },
    { id: 2, text: "That's so cool! 😍", sent: true, time: "7:33 PM", read: true },
    { id: 3, text: "I wish you were here\nwould've been perfect", sent: false, time: "7:34 PM" },
    { id: 4, text: "Soon babe. We'll ride\ntogether again 🤍", sent: true, time: "7:35 PM", read: true },
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

      {/* Chat header */}
      <div style={{ padding: "6px 16px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 20, color: "#A78BFA", cursor: "pointer" }}>←</div>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00B4FF)", padding: 2, display: "flex", flexShrink: 0 }}>
          <div style={{ flex: 1, borderRadius: "50%", background: "#1a1630", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Alex</div>
          <div style={{ fontSize: 12, color: "#22D3A5", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 6px #22D3A5" }}/>
            online
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 20, color: "#A78BFA" }}>📞</span>
          <span style={{ fontSize: 20, color: "#A78BFA" }}>⬜</span>
        </div>
      </div>

      {/* Hero photo */}
      <div style={{ margin: "12px 16px", borderRadius: 16, overflow: "hidden", height: 160, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #0d1a4a 0%, #1a0a3d 40%, #061224 100%)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 30%, rgba(0,180,255,0.35) 0%, transparent 60%), radial-gradient(ellipse at 30% 70%, rgba(255,100,0,0.25) 0%, transparent 50%)" }}/>
        <div style={{ position: "absolute", bottom: 8, left: 12, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Today</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 16, border: "1px solid rgba(0,180,255,0.2)" }}/>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sent ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "72%", padding: "10px 14px", borderRadius: msg.sent ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.sent
                ? "linear-gradient(135deg, #7B2FFF, #00B4FF)"
                : "rgba(255,255,255,0.07)",
              border: msg.sent ? "none" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: msg.sent ? "0 4px 20px rgba(123,47,255,0.4)" : "none",
              fontSize: 15, lineHeight: 1.4, whiteSpace: "pre-line"
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: 11, color: "#8B89A0", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {msg.time} {msg.read && <span style={{ color: "#00B4FF" }}>✓✓</span>}
            </div>
          </div>
        ))}
        {/* Heart reaction */}
        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 8 }}>
          <div style={{ background: "rgba(255,77,141,0.15)", border: "1px solid rgba(255,77,141,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 14 }}>💗</div>
        </div>
      </div>

      {/* Input bar */}
      <div style={{ padding: "10px 16px 8px", background: "rgba(8,8,18,0.9)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#A78BFA" }}>+</div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 22, padding: "10px 16px", fontSize: 15, color: "#8B89A0" }}>
          Type a message...
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7B2FFF, #00B4FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 16px rgba(123,47,255,0.5)" }}>
          ▶
        </div>
      </div>

      {/* Home bar */}
      <div style={{ height: 34, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8, background: "rgba(8,8,18,0.9)", flexShrink: 0 }}>
        <div style={{ width: 120, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.2)" }}/>
      </div>
    </div>
  );
}
