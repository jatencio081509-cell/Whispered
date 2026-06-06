export function HomeScreen() {
  return (
    <div style={{
      width: 390, height: 844, background: "#04060E",
      fontFamily: "'Inter', system-ui, sans-serif",
      overflow: "hidden", position: "relative", color: "#EEF2FF",
      display: "flex", flexDirection: "column"
    }}>
      {/* Deep water shimmer bg */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% -10%, rgba(0,229,255,0.07) 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, rgba(123,47,255,0.08) 0%, transparent 50%)", pointerEvents: "none" }}/>
      {/* Subtle scan line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)", pointerEvents: "none" }}/>

      {/* Status bar */}
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, position: "relative" }}>
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
      <div style={{ padding: "2px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, fontStyle: "italic", letterSpacing: -0.3, background: "linear-gradient(120deg, #00E5FF 0%, #A78BFA 60%, #FF4FA3 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Whispered ~
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 8px #00E5FF" }}/>
            <span style={{ fontSize: 11, color: "#5B7A9A", letterSpacing: 0.3 }}>Connected with Alex</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #00E5FF, #7B2FFF)", padding: 2, display: "flex" }}>
            <div style={{ flex: 1, borderRadius: "50%", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
          </div>
          <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: "#00E5FF", border: "2px solid #04060E", boxShadow: "0 0 6px #00E5FF" }}/>
        </div>
      </div>

      {/* Hero card — concentric wake rings as design */}
      <div style={{ margin: "0 16px", borderRadius: 24, overflow: "hidden", position: "relative", height: 194, flexShrink: 0 }}>
        {/* Base */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #040C1E 0%, #071428 40%, #0A0620 100%)" }}/>
        {/* Bioluminescent glow pools */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 55%, rgba(0,229,255,0.18) 0%, transparent 50%), radial-gradient(ellipse at 20% 40%, rgba(123,47,255,0.2) 0%, transparent 45%)" }}/>
        {/* Wake ripple rings — decorative */}
        <div style={{ position: "absolute", right: -30, top: "50%", transform: "translateY(-50%)" }}>
          {[130, 100, 72, 48].map((s, i) => (
            <div key={i} style={{ position: "absolute", width: s, height: s, borderRadius: "50%", border: `1px solid rgba(0,229,255,${0.06 + i * 0.05})`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}/>
          ))}
        </div>
        {/* Horizontal scan line */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg, rgba(0,229,255,0.12) 0%, rgba(0,229,255,0.04) 100%)" }}/>

        <div style={{ position: "absolute", top: 22, left: 22, right: 100 }}>
          <div style={{ fontSize: 10, color: "rgba(0,229,255,0.6)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 8, fontWeight: 500 }}>You & Alex</div>
          <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, color: "#fff" }}>Still in<br/>your current 🌊</div>
          <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 20, padding: "4px 10px" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E5FF", boxShadow: "0 0 6px #00E5FF" }}/>
            <span style={{ fontSize: 11, color: "rgba(0,229,255,0.9)", fontWeight: 500 }}>Alex is near</span>
          </div>
        </div>

        <div style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, borderRadius: "50%", background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: "0 0 12px rgba(0,229,255,0.15)" }}>💙</div>
        <div style={{ position: "absolute", inset: 0, borderRadius: 24, border: "1px solid rgba(0,229,255,0.12)" }}/>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "18px 16px 10px", display: "flex", justifyContent: "space-around", flexShrink: 0 }}>
        {[
          { icon: "💬", label: "Chat",    grad: "linear-gradient(135deg, #0072FF, #00E5FF)", glow: "rgba(0,229,255,0.45)" },
          { icon: "🌊", label: "Whisper", grad: "linear-gradient(135deg, #7B2FFF, #C44FFF)", glow: "rgba(123,47,255,0.5)"  },
          { icon: "✨", label: "Memories",grad: "linear-gradient(135deg, #FF4FA3, #FF8CC8)", glow: "rgba(255,79,163,0.45)" },
        ].map(a => (
          <div key={a.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: a.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, boxShadow: `0 8px 28px ${a.glow}`, border: "1px solid rgba(255,255,255,0.08)" }}>
              {a.icon}
            </div>
            <span style={{ fontSize: 11, color: "#5B7A9A", letterSpacing: 0.3 }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Stats cards */}
      <div style={{ margin: "4px 16px", display: "flex", gap: 10, flexShrink: 0 }}>
        {[
          { icon: "🌊", top: "Today", bot: "1 / 2 whispers" },
          { icon: "🔥", top: "Streak",  bot: "12 days"       },
        ].map(s => (
          <div key={s.top} style={{ flex: 1, background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 16, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 10, color: "#5B7A9A", letterSpacing: 0.4 }}>{s.top}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{s.bot}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Prompt card */}
      <div style={{ margin: "10px 16px 0", background: "linear-gradient(135deg, rgba(123,47,255,0.1), rgba(0,229,255,0.06))", border: "1px solid rgba(123,47,255,0.2)", borderRadius: 16, padding: "13px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(123,47,255,0.2)", border: "1px solid rgba(123,47,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💬</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Daily Prompt</div>
          <div style={{ fontSize: 13, color: "#C4C0DF", marginTop: 3, lineHeight: 1.4 }}>What moment with Alex do you replay most?</div>
        </div>
        <span style={{ color: "#A78BFA", fontSize: 18 }}>›</span>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Tab bar */}
      <div style={{ height: 82, background: "rgba(4,6,14,0.98)", borderTop: "1px solid rgba(0,229,255,0.08)", display: "flex", alignItems: "flex-start", paddingTop: 10, flexShrink: 0 }}>
        {[
          { icon: "⌂", label: "Home",     active: true  },
          { icon: "💬", label: "Chat",     active: false },
          { icon: "🌊", label: "Whisper",  active: false },
          { icon: "✨", label: "Memories", active: false },
          { icon: "◯",  label: "More",     active: false },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ width: 46, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: t.active ? 22 : 20, background: t.active ? "rgba(0,229,255,0.08)" : "transparent", boxShadow: t.active ? "0 0 20px rgba(0,229,255,0.2)" : "none", border: t.active ? "1px solid rgba(0,229,255,0.25)" : "none" }}>
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
