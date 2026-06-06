export function ChatScreen() {
  const messages = [
    { id: 1, text: "Had the most insane session today 🏄‍♂️ the wake was perfect", sent: false, time: "7:32 PM" },
    { id: 2, text: "No way!! I'm so jealous 😍 how high were you getting?", sent: true, time: "7:33 PM", read: true },
    { id: 3, text: "I wish you were here\nwould've been perfect", sent: false, time: "7:34 PM" },
    { id: 4, text: "Soon babe. We'll ride\ntogether again 🤍", sent: true, time: "7:35 PM", read: true },
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

      {/* Chat header */}
      <div style={{ padding: "6px 16px 14px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 20, color: "#38BDF8", cursor: "pointer" }}>←</div>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #0EA5E9)", padding: 2.5, display: "flex", flexShrink: 0 }}>
          <div style={{ flex: 1, borderRadius: "50%", background: "#0c1624", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏄‍♂️</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Alex</div>
          <div style={{ fontSize: 12, color: "#22D3A5", display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22D3A5", boxShadow: "0 0 6px #22D3A5" }}/>
            on the water
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 20, color: "#38BDF8" }}>📞</span>
          <span style={{ fontSize: 20, color: "#38BDF8" }}>📹</span>
        </div>
      </div>

      {/* Hero photo — wakeboarding sunset */}
      <div style={{ margin: "12px 16px", borderRadius: 18, overflow: "hidden", height: 148, position: "relative", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0d1f3c 0%, #1a3a6b 30%, #2d5a8e 55%, #FF7B3A 80%, #cc3300 100%)" }}/>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 65% 35%, rgba(255,150,50,0.35) 0%, transparent 55%)" }}/>
        {/* Water surface line */}
        <div style={{ position: "absolute", bottom: "38%", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent 5%, rgba(255,200,100,0.4) 50%, transparent 95%)" }}/>
        {/* Wake spray */}
        <div style={{ position: "absolute", bottom: "37%", left: "55%", fontSize: 36, transform: "scaleX(-1)", filter: "drop-shadow(0 0 14px rgba(255,180,0,0.7))" }}>🏄‍♂️</div>
        <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>Today • Sunrise session</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 18, border: "1px solid rgba(255,120,58,0.2)" }}/>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: 10, overflowY: "hidden" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.sent ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "75%", padding: "11px 15px", borderRadius: msg.sent ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: msg.sent
                ? "linear-gradient(135deg, #7B2FFF, #0EA5E9)"
                : "rgba(255,255,255,0.06)",
              border: msg.sent ? "none" : "1px solid rgba(255,255,255,0.09)",
              boxShadow: msg.sent ? "0 4px 20px rgba(123,47,255,0.4)" : "none",
              fontSize: 14, lineHeight: 1.45, whiteSpace: "pre-line"
            }}>
              {msg.text}
            </div>
            <div style={{ fontSize: 11, color: "#8B89A0", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              {msg.time} {msg.read && <span style={{ color: "#38BDF8" }}>✓✓</span>}
            </div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 6 }}>
          <div style={{ background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)", borderRadius: 20, padding: "3px 10px", fontSize: 14 }}>🤙</div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "10px 16px 8px", background: "rgba(6,9,15,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#38BDF8" }}>+</div>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 22, padding: "10px 16px", fontSize: 14, color: "#8B89A0" }}>
          Type a message...
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B35, #FF4500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 4px 16px rgba(255,107,53,0.5)" }}>
          ▶
        </div>
      </div>
      <div style={{ height: 34, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8, background: "rgba(6,9,15,0.95)", flexShrink: 0 }}>
        <div style={{ width: 120, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.2)" }}/>
      </div>
    </div>
  );
}
