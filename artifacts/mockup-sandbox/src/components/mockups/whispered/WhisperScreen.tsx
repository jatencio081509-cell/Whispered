export function WhisperScreen() {
  const presets = [
    { icon: "💗", text: "You make waves in my heart" },
    { icon: "🌊", text: "I'm lost in your current" },
    { icon: "💫", text: "Come find me" },
    { icon: "🌙", text: "Drowning in thoughts of you" },
  ];

  return (
    <div style={{
      width: 390, height: 844, background: "#04060E",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden", position: "relative", color: "#EEF2FF",
      display: "flex", flexDirection: "column"
    }}>
      {/* Deep space bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 35%, rgba(0,229,255,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(123,47,255,0.07) 0%, transparent 45%)", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)", pointerEvents: "none" }}/>

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
        <div style={{ fontSize: 22, color: "#00E5FF", lineHeight: 1 }}>←</div>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: 0.5, color: "#EEF2FF" }}>Whisper</span>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#00E5FF" }}>↺</div>
      </div>

      {/* Holographic orb */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 22, flexShrink: 0, position: "relative" }}>
        {/* Outermost diffuse halo */}
        <div style={{ position: "absolute", width: 310, height: 310, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)", boxShadow: "0 0 80px 10px rgba(0,229,255,0.06)" }}/>
        {/* Ripple rings (wake motif) */}
        {[280, 248, 220].map((s, i) => (
          <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: `1px solid rgba(0,229,255,${0.05 + i * 0.04})` }}/>
        ))}

        {/* Main holographic ring */}
        <div style={{
          width: 204, height: 204, borderRadius: "50%",
          border: "2px solid transparent",
          background: "linear-gradient(#04060E, #04060E) padding-box, linear-gradient(135deg, #00E5FF 0%, #7B2FFF 40%, #FF4FA3 70%, #00E5FF 100%) border-box",
          boxShadow: "0 0 50px rgba(0,229,255,0.5), 0 0 100px rgba(123,47,255,0.2), inset 0 0 50px rgba(0,229,255,0.07)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          position: "relative"
        }}>
          {/* Data readout dots */}
          {[
            { top: 12, left: "50%", tx: "-50%", c: "#00E5FF", s: 8 },
            { top: 46, right: 16, c: "#FF4FA3", s: 5 },
            { bottom: 36, left: 18, c: "#7B2FFF", s: 5 },
            { bottom: 14, left: "50%", tx: "-50%", c: "#00E5FF", s: 6 },
            { top: 50, left: 16, c: "#00E5FF", s: 4 },
          ].map((d, i) => (
            <div key={i} style={{ position: "absolute", top: d.top, bottom: (d as any).bottom, left: d.left, right: (d as any).right, transform: d.tx ? `translateX(${d.tx})` : undefined, width: d.s, height: d.s, borderRadius: "50%", background: d.c, boxShadow: `0 0 ${d.s * 1.5}px ${d.c}` }}/>
          ))}
          {/* Inner scan line */}
          <div style={{ position: "absolute", top: "50%", left: "15%", right: "15%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.2), transparent)", transform: "translateY(-50%)" }}/>

          <div style={{ fontSize: 26 }}>💙</div>
          <div style={{ textAlign: "center", lineHeight: 1.3 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Send a</div>
            <div style={{ fontSize: 17, fontWeight: 700, background: "linear-gradient(120deg, #00E5FF, #FF4FA3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>whisper</div>
            <div style={{ fontSize: 12, color: "rgba(0,229,255,0.55)", marginTop: 5, letterSpacing: 0.5 }}>to Alex</div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div style={{ flex: 1, padding: "0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {presets.map((p, i) => (
          <div key={p.text} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "14px 18px",
            background: i === 0 ? "rgba(0,229,255,0.05)" : "rgba(255,255,255,0.025)",
            border: `1px solid ${i === 0 ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: 16,
            boxShadow: i === 0 ? "0 0 18px rgba(0,229,255,0.08)" : "none",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: 18 }}>{p.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: i === 0 ? "#B0F0FF" : "#8B9EC0", letterSpacing: 0.2 }}>{p.text}</span>
          </div>
        ))}
      </div>

      {/* Send */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "16px 0 28px", flexShrink: 0, gap: 0, position: "relative" }}>
        {/* Outer pulse ring */}
        <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: "1px solid rgba(0,229,255,0.15)", boxShadow: "0 0 24px rgba(0,229,255,0.1)" }}/>
        <div style={{
          width: 66, height: 66, borderRadius: "50%",
          background: "linear-gradient(135deg, #7B2FFF, #00E5FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "#fff",
          boxShadow: "0 0 36px rgba(0,229,255,0.6), 0 0 18px rgba(123,47,255,0.4), 0 8px 20px rgba(0,0,0,0.5)"
        }}>▶</div>
      </div>
    </div>
  );
}
