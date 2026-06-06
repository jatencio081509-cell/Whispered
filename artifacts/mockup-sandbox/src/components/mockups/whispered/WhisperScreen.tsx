export function WhisperScreen() {
  const presets = [
    { icon: "🤙", text: "Come ride with me" },
    { icon: "🌅", text: "Thinking of you on the water" },
    { icon: "🏄‍♀️", text: "Save a wake for me" },
    { icon: "🌊", text: "Sunset session together soon?" },
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
      <div style={{ padding: "6px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ fontSize: 22, color: "#38BDF8" }}>←</div>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3 }}>Whisper</span>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#38BDF8" }}>↺</div>
      </div>

      {/* Neon orb — wake ring */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6, paddingBottom: 20, flexShrink: 0, position: "relative" }}>
        {/* Wake ripple rings */}
        <div style={{ position: "absolute", width: 290, height: 290, borderRadius: "50%", border: "1px solid rgba(14,165,233,0.12)", boxShadow: "0 0 60px 10px rgba(14,165,233,0.08)" }}/>
        <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", border: "1px solid rgba(14,165,233,0.18)" }}/>

        {/* Main ring */}
        <div style={{
          width: 216, height: 216, borderRadius: "50%",
          border: "2.5px solid transparent",
          background: "linear-gradient(#06090F, #06090F) padding-box, linear-gradient(135deg, #FF6B35, #38BDF8, #7B2FFF, #FF6B35) border-box",
          boxShadow: "0 0 44px rgba(14,165,233,0.55), 0 0 90px rgba(255,107,53,0.2), inset 0 0 44px rgba(14,165,233,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          position: "relative",
        }}>
          {/* Sparkle dots */}
          <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 7, height: 7, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 12px #38BDF8" }}/>
          <div style={{ position: "absolute", bottom: 28, right: 28, width: 5, height: 5, borderRadius: "50%", background: "#FF6B35", boxShadow: "0 0 8px #FF6B35" }}/>
          <div style={{ position: "absolute", top: 48, left: 18, width: 4, height: 4, borderRadius: "50%", background: "#7B2FFF", boxShadow: "0 0 7px #7B2FFF" }}/>
          <div style={{ position: "absolute", bottom: 48, left: 26, width: 4, height: 4, borderRadius: "50%", background: "#38BDF8", boxShadow: "0 0 6px #38BDF8" }}/>

          <div style={{ fontSize: 30 }}>🤙</div>
          <div style={{ textAlign: "center", lineHeight: 1.3 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Send a</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>whisper</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>to Alex</div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {presets.map((p, i) => (
          <div key={p.text} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${i === 0 ? "rgba(255,107,53,0.25)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: i === 0 ? "0 0 16px rgba(255,107,53,0.1)" : "none",
          }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 500, color: i === 0 ? "#FFD0B8" : "#D4D0F0" }}>{p.text}</span>
          </div>
        ))}
      </div>

      {/* Send button */}
      <div style={{ display: "flex", justifyContent: "center", padding: "18px 0 30px", flexShrink: 0 }}>
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: "linear-gradient(135deg, #FF6B35, #38BDF8)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, color: "#fff",
          boxShadow: "0 0 34px rgba(14,165,233,0.65), 0 0 18px rgba(255,107,53,0.4), 0 8px 20px rgba(0,0,0,0.4)"
        }}>
          ▶
        </div>
      </div>
    </div>
  );
}
