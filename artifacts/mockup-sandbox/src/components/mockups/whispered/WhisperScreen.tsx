export function WhisperScreen() {
  const presets = [
    { icon: "💗", text: "I miss you" },
    { icon: "🌊", text: "Thinking of you" },
    { icon: "🏄", text: "Wish you were here" },
    { icon: "🌙", text: "Goodnight 🌙" },
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
      <div style={{ padding: "6px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 22, color: "#A78BFA" }}>←</div>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>Whisper</span>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#A78BFA" }}>↻</div>
      </div>

      {/* Neon orb */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 8, paddingBottom: 24, flexShrink: 0, position: "relative" }}>
        {/* Outer glow layer */}
        <div style={{
          position: "absolute",
          width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,180,255,0.12) 0%, transparent 70%)",
          boxShadow: "0 0 80px 20px rgba(0,100,255,0.2)",
        }}/>

        {/* Ring */}
        <div style={{
          width: 220, height: 220, borderRadius: "50%",
          border: "2.5px solid transparent",
          background: "linear-gradient(#080812, #080812) padding-box, linear-gradient(135deg, #00C6FF, #7B2FFF, #00C6FF) border-box",
          boxShadow: "0 0 40px rgba(0,180,255,0.5), 0 0 80px rgba(123,47,255,0.25), inset 0 0 40px rgba(0,180,255,0.1)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          position: "relative",
        }}>
          {/* Inner glow dots */}
          <div style={{ position: "absolute", top: 20, left: "50%", transform: "translateX(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#00C6FF", boxShadow: "0 0 12px #00C6FF" }}/>
          <div style={{ position: "absolute", bottom: 30, right: 30, width: 5, height: 5, borderRadius: "50%", background: "#7B2FFF", boxShadow: "0 0 8px #7B2FFF" }}/>
          <div style={{ position: "absolute", top: 50, left: 20, width: 4, height: 4, borderRadius: "50%", background: "#00C6FF", boxShadow: "0 0 6px #00C6FF" }}/>

          <div style={{ fontSize: 28 }}>💙</div>
          <div style={{ textAlign: "center", lineHeight: 1.35 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>Send a</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: "#fff" }}>whisper</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>to Alex</div>
          </div>
        </div>
      </div>

      {/* Preset options */}
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {presets.map((p) => (
          <div key={p.text} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: "#E0DCFF" }}>{p.text}</span>
          </div>
        ))}
      </div>

      {/* Send button */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 32px", flexShrink: 0 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, #0072FF, #00C6FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "#fff",
          boxShadow: "0 0 30px rgba(0,180,255,0.7), 0 8px 24px rgba(0,114,255,0.5)"
        }}>
          ▶
        </div>
      </div>
    </div>
  );
}
