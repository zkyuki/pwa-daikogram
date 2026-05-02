import { useState, useCallback, useRef, useEffect } from "react";

// ─── View Transition CSS ───────────────────────────────────────
const VT_STYLES = `
  ::view-transition-old(screen) {
    animation: none;
  }
  ::view-transition-new(screen) {
    animation: none;
  }

  /* push: new screen slides in from right, old slides out to left */
  :root[data-vt="push"] ::view-transition-old(screen) {
    animation: vt-slide-out-left 280ms cubic-bezier(0.4,0,0.2,1) forwards;
  }
  :root[data-vt="push"] ::view-transition-new(screen) {
    animation: vt-slide-in-right 280ms cubic-bezier(0.4,0,0.2,1) forwards;
  }

  /* pop: new screen slides in from left, old slides out to right */
  :root[data-vt="pop"] ::view-transition-old(screen) {
    animation: vt-slide-out-right 260ms cubic-bezier(0.4,0,0.2,1) forwards;
  }
  :root[data-vt="pop"] ::view-transition-new(screen) {
    animation: vt-slide-in-left 260ms cubic-bezier(0.4,0,0.2,1) forwards;
  }

  /* tab: fade + subtle scale (iOS tab switch feel) */
  :root[data-vt="tab"] ::view-transition-old(screen) {
    animation: vt-tab-out 180ms ease forwards;
  }
  :root[data-vt="tab"] ::view-transition-new(screen) {
    animation: vt-tab-in 220ms ease forwards;
  }

  @keyframes vt-slide-out-left {
    from { transform: translateX(0); opacity: 1; }
    to   { transform: translateX(-30%); opacity: 0.6; }
  }
  @keyframes vt-slide-in-right {
    from { transform: translateX(100%); opacity: 0.8; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes vt-slide-out-right {
    from { transform: translateX(0); opacity: 1; }
    to   { transform: translateX(100%); opacity: 0.8; }
  }
  @keyframes vt-slide-in-left {
    from { transform: translateX(-30%); opacity: 0.6; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes vt-tab-out {
    from { opacity: 1; transform: scale(1); }
    to   { opacity: 0; transform: scale(0.97); }
  }
  @keyframes vt-tab-in {
    from { opacity: 0; transform: scale(0.97); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

// inject styles once
if (typeof document !== "undefined" && !document.getElementById("vt-styles")) {
  const el = document.createElement("style");
  el.id = "vt-styles";
  el.textContent = VT_STYLES;
  document.head.appendChild(el);
}

const TG = "#3390EC";
const BG = "#EFEFF4";
const GREEN = "#34C759";
const RED = "#FF3B30";
const ORANGE = "#FF9500";
const PURPLE = "#7C4DFF";

const Sparkline = ({ data, color = GREEN, width = 200, height = 26 }) => {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return <svg width={width} height={height} style={{ display: "block", width: "100%" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

const CandleChart = ({ h = 100 }) => {
  const candles = [{o:40,h:55,l:35,c:50},{o:50,h:60,l:45,c:44},{o:44,h:52,l:40,c:48},{o:48,h:58,l:46,c:56},{o:56,h:62,l:50,c:52},{o:52,h:54,l:42,c:45},{o:45,h:50,l:38,c:47},{o:47,h:55,l:44,c:53},{o:53,h:60,l:48,c:58},{o:58,h:65,l:55,c:62},{o:62,h:68,l:58,c:60},{o:60,h:63,l:52,c:54},{o:54,h:59,l:50,c:57},{o:57,h:64,l:53,c:61},{o:61,h:66,l:56,c:58}];
  const w = 300, cw = 12, gap = 8;
  const allV = candles.flatMap(c => [c.h, c.l]);
  const mn = Math.min(...allV), mx = Math.max(...allV);
  const s = v => h - ((v - mn) / (mx - mn)) * (h - 8) - 4;
  return (
    <svg width={w} height={h} style={{ display: "block", width: "100%" }}>
      {[0.25,0.5,0.75].map(p => <line key={p} x1={0} y1={h*p} x2={w} y2={h*p} stroke="#E5E5EA" strokeWidth="0.5" strokeDasharray="4,4" />)}
      {candles.map((c, i) => {
        const x = i * (cw + gap) + gap, green = c.c >= c.o, color = green ? GREEN : RED;
        const bT = s(Math.max(c.o, c.c)), bB = s(Math.min(c.o, c.c));
        return <g key={i}><line x1={x+cw/2} y1={s(c.h)} x2={x+cw/2} y2={s(c.l)} stroke={color} strokeWidth="1"/><rect x={x} y={bT} width={cw} height={Math.max(bB-bT,1)} fill={green?color:"none"} stroke={color} strokeWidth="1" rx="1"/></g>;
      })}
    </svg>
  );
};

const WinLossBar = ({ wins, losses }) => {
  const wp = (wins / (wins + losses)) * 100;
  return <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "#eee" }}><div style={{ width: `${wp}%`, background: GREEN }} /><div style={{ flex: 1, background: RED }} /></div>;
};

const Toast = ({ message, visible }) => (
  <div style={{ position: "absolute", bottom: 70, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`, background: visible ? "#2C2C2E" : "#000c", color: "#fff", padding: "10px 22px", borderRadius: 14, fontSize: 14, fontWeight: 500, opacity: visible ? 1 : 0, transition: "all 0.3s", zIndex: 100, whiteSpace: "nowrap", pointerEvents: "none", display: "flex", alignItems: "center", gap: 8 }}>
    {message}
  </div>
);

const Toggle = ({ on, onChange }) => (
  <div onClick={onChange} style={{ width: 44, height: 26, borderRadius: 13, background: on ? GREEN : "#E5E5EA", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 10, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left 0.2s" }} />
  </div>
);

const CALLERS = [
  { name: "cryptokid.sol", wr: "74%", avg: "8.4x", pnl: "+$42.6K", calls: 127, wins: 94, losses: 33, c: "#D84315", followers: "2.1K" },
  { name: "alphahunter", wr: "81%", avg: "12.1x", pnl: "+$96.2K", calls: 89, wins: 72, losses: 17, c: "#7C4DFF", followers: "4.8K" },
  { name: "whalemaster", wr: "68%", avg: "4.2x", pnl: "+$18.9K", calls: 203, wins: 138, losses: 65, c: "#00838F", followers: "1.3K" },
  { name: "degenking", wr: "62%", avg: "6.7x", pnl: "+$11.4K", calls: 56, wins: 35, losses: 21, c: "#FF6D00", followers: "890" },
];

const PAST_CALLS = [
  { token: "$DEGEN", result: "+412%", win: true, time: "2h ago", c: "#00C853" },
  { token: "$BONK", result: "+89%", win: true, time: "1d ago", c: "#00ACC1" },
  { token: "$RUGG", result: "-100%", win: false, time: "2d ago", c: RED },
  { token: "$MOON", result: "+1,240%", win: true, time: "3d ago", c: "#FF9500" },
];

const PERP_POSITIONS = [
  { pair: "SOL-PERP", side: "LONG", size: "5 SOL", entry: "$132.40", mark: "$137.59", pnl: "+$26.00", pnlPct: "+3.9%", lev: "5x", liq: "$105.90", win: true },
  { pair: "ETH-PERP", side: "SHORT", size: "0.3 ETH", entry: "$3,480", mark: "$3,210", pnl: "+$81.00", pnlPct: "+7.8%", lev: "3x", liq: "$4,100", win: true },
  { pair: "BTC-PERP", side: "LONG", size: "0.01 BTC", entry: "$68,200", mark: "$67,400", pnl: "-$8.00", pnlPct: "-1.2%", lev: "2x", liq: "$51,000", win: false },
];

const NOTIFICATIONS = [
  { type: "trade", icon: "⚡", title: "Trade Executed", msg: "Bought 0.5 SOL of $DEGEN", time: "2 min ago", color: GREEN, read: false },
  { type: "caller", icon: "🔥", title: "cryptokid.sol called", msg: "$SHILL · MC $180K · 3.2x potential", time: "14 min ago", color: "#D84315", read: false },
  { type: "alert", icon: "📈", title: "Price Alert Triggered", msg: "$DEGEN hit +200% target", time: "1h ago", color: ORANGE, read: false },
  { type: "agent", icon: "🤖", title: "Agent Auto-Traded", msg: "Bought 0.3 SOL $BONK via alphahunter signal", time: "2h ago", color: PURPLE, read: true },
  { type: "caller", icon: "🐋", title: "whalemaster called", msg: "$PUMP · MC $1.2M · new ATH incoming", time: "3h ago", color: "#00838F", read: true },
  { type: "alert", icon: "⚠️", title: "Liquidation Warning", msg: "BTC-PERP position near liquidation ($67,400)", time: "5h ago", color: RED, read: true },
  { type: "trade", icon: "✅", title: "Trade Completed", msg: "Sold $RUGG → -100% loss. RIP 🫡", time: "2d ago", color: "#8E8E93", read: true },
];

const TRENDING_TOKENS = [
  { token: "$DEGEN", name: "DegenProtocol", change: "+184%", mc: "$420K", vol: "$1.2M", c: "#00C853", hot: true, calls: 15, msgId: "call1" },
  { token: "$SHILL", name: "ShillDAO", change: "+320%", mc: "$180K", vol: "$890K", c: PURPLE, hot: true, calls: 23, msgId: "call2" },
  { token: "$PUMP", name: "PumpFun", change: "+42%", mc: "$1.2M", vol: "$4.5M", c: ORANGE, hot: false, calls: 8, msgId: "call3" },
  { token: "$MOON", name: "MoonShot", change: "+1,240%", mc: "$45K", vol: "$220K", c: "#FFD700", hot: true, calls: 31 },
  { token: "$BONK", name: "BonkInu", change: "+89%", mc: "$8.4M", vol: "$32M", c: "#FF6D00", hot: false, calls: 6 },
  { token: "$PEPE", name: "Pepe2.0", change: "-12%", mc: "$2.1M", vol: "$890K", c: RED, hot: false, calls: 2 },
];

export default function App() {
  const [tab, setTab] = useState("chats");  // contacts|calls|chats|home|settings
  const [chatOpen, setChatOpen] = useState(null);
  const [profileOpen, setProfileOpen] = useState(null);
  const [tradeToken, setTradeToken] = useState(null);
  const [callerIdx, setCallerIdx] = useState(-1);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [perpOpen, setPerpOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [discoveryOpen, setDiscoveryOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [tradeMode, setTradeMode] = useState("buy");
  const [perpMode, setPerpMode] = useState("long");
  const [selAmt, setSelAmt] = useState("0.1");
  const [perpLev, setPerpLev] = useState(5);
  const [perpSize, setPerpSize] = useState("1");
  const [toast, setToast] = useState({ message: "", visible: false });
  const [followedCallers, setFollowedCallers] = useState({});
  const [groupTab, setGroupTab] = useState("Top Callers");
  const [chartTf, setChartTf] = useState("4H");
  const [perpPair, setPerpPair] = useState("SOL-PERP");
  const [perpTab, setPerpTab] = useState("positions");
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [agentSettings, setAgentSettings] = useState({
    autoTrade: true, maxPerCall: "0.5", followCallers: true, perpEnabled: false,
    minWR: "65", maxSlippage: "15", tpPct: "50", slPct: "30",
  });
  const [discoveryTab, setDiscoveryTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifFilter, setNotifFilter] = useState("all");
  const [scrollToMsg, setScrollToMsg] = useState(null); // 'call1'|'call2'|'call3'
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const [authenticated, setAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState("phone"); // "phone" | "code"
  const [authPhone, setAuthPhone] = useState("");

  const showToast = (m) => { setToast({ message: m, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200); };

  // ─── View Transition navigator ────────────────────────────────
  const navigate = useCallback((fn, direction = "push") => {
    if (!document.startViewTransition) {
      fn();
      return;
    }
    document.documentElement.dataset.vt = direction;
    const transition = document.startViewTransition(() => {
      fn();
    });
    transition.finished.finally(() => {
      delete document.documentElement.dataset.vt;
    });
  }, []);

  const goChat = (name) => navigate(() => { setChatOpen(name); setProfileOpen(null); setTradeToken(null); setCallerIdx(-1); setPortfolioOpen(false); setPerpOpen(false); setAgentOpen(false); setNotifOpen(false); setDiscoveryOpen(false); setLeaderboardOpen(false); });
  const goToCall = (msgId) => navigate(() => {
    setChatOpen("CAVE Alpha Group");
    setProfileOpen(null); setTradeToken(null); setCallerIdx(-1);
    setPortfolioOpen(false); setPerpOpen(false); setAgentOpen(false);
    setNotifOpen(false); setDiscoveryOpen(false); setLeaderboardOpen(false);
    setScrollToMsg(msgId);
  });

  const goBack = () => {
    if (leaderboardOpen) { navigate(() => setLeaderboardOpen(false), "pop"); return; }
    if (discoveryOpen) { navigate(() => setDiscoveryOpen(false), "pop"); return; }
    if (notifOpen) { navigate(() => setNotifOpen(false), "pop"); return; }
    if (agentOpen) { navigate(() => setAgentOpen(false), "pop"); return; }
    if (perpOpen) { navigate(() => setPerpOpen(false), "pop"); return; }
    if (portfolioOpen) { navigate(() => setPortfolioOpen(false), "pop"); return; }
    if (callerIdx >= 0) { navigate(() => setCallerIdx(-1), "pop"); return; }
    if (tradeToken) { navigate(() => setTradeToken(null), "pop"); return; }
    if (profileOpen) { navigate(() => setProfileOpen(null), "pop"); return; }
    navigate(() => setChatOpen(null), "pop");
  };
  const toggleFollow = (idx) => {
    setFollowedCallers(f => ({ ...f, [idx]: !f[idx] }));
    showToast(followedCallers[idx] ? "Unfollowed" : "✅ Following");
  };

  // ─── Theme helpers ───
  const isDark = theme === "dark";
  const T = {
    bg: isDark ? "#000" : "#fff",
    bg2: isDark ? "#1C1C1E" : "#F2F2F7",
    bg3: isDark ? "#2C2C2E" : "#EFEFF4",
    card: isDark ? "#1C1C1E" : "#fff",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text: isDark ? "#fff" : "#000",
    text2: isDark ? "#8E8E93" : "#8E8E93",
    text3: isDark ? "#636366" : "#C7C7CC",
    tg: TG,
    navBg: isDark ? "#1C1C1E" : "#F7F7F7",
    navBorder: isDark ? "rgba(255,255,255,0.1)" : "#B5B5B5",
    headerBg: isDark ? "#1C1C1E" : "#fff",
    chatBg: isDark ? "#0D1117" : "#C8E0D0",
    msgBg: isDark ? "#2C2C2E" : "#fff",
    msgOut: isDark ? "#2B5278" : "#EEFFDE",
    searchBg: isDark ? "#2C2C2E" : "#E8E8ED",
    sectionBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  };

  // ─── Status Bar (PWA: safe-area top spacer only) ───
  const StatusBar = () => (
    <div style={{ background: isDark ? "#000" : "#fff", height: "env(safe-area-inset-top, 44px)", flexShrink: 0 }} />
  );

  // ─── Tab Bar ───
  const TabBar = () => {
    const tabs = [
      { id: "contacts", label: "Contacts", d: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
      { id: "calls", label: "Calls", d: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" },
      { id: "chats", label: "Chats", badge: 971, d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" },
      { id: "home", label: "Home", d: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" },
      { id: "settings", label: "Settings", alert: true, d: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81a.49.49 0 00-.48-.41h-3.84a.49.49 0 00-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.71 8.87a.49.49 0 00.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.03-1.58z" },
    ];
    const notifBadge = NOTIFICATIONS.filter(n => !n.read).length;
    // Liquid glass style — iOS 26 frosted bar
    const glassBase = {
      backdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
      WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
    };
    const darkGlass = {
      ...glassBase,
      background: "rgba(28,28,30,0.78)",
      borderTop: "0.5px solid rgba(255,255,255,0.12)",
      boxShadow: "0 -1px 0 rgba(255,255,255,0.06), 0 -8px 32px rgba(0,0,0,0.5)",
    };
    const lightGlass = {
      ...glassBase,
      background: "rgba(249,249,249,0.82)",
      borderTop: "0.5px solid rgba(255,255,255,0.9)",
      boxShadow: "0 -1px 0 rgba(0,0,0,0.08), 0 -8px 24px rgba(0,0,0,0.06)",
    };
    const glassStyle = isDark ? darkGlass : lightGlass;
    const inactiveColor = isDark ? "rgba(235,235,245,0.50)" : "rgba(60,60,67,0.50)";

    return (
      <div style={{ ...glassStyle, display: "flex", paddingTop: 8, paddingBottom: "max(22px, env(safe-area-inset-bottom))", position: "relative", zIndex: 10 }}>
        {tabs.map(t => {
          const active = (t.id === "home" ? tab === "home" : tab === t.id) && !chatOpen && !portfolioOpen && !perpOpen && !agentOpen && !notifOpen && !discoveryOpen && !leaderboardOpen;
          const iconFill   = active ? TG : "none";
          const iconStroke = active ? "none" : inactiveColor;
          return (
            <div key={t.id} onClick={() => navigate(() => { setTab(t.id); setChatOpen(null); setProfileOpen(null); setTradeToken(null); setCallerIdx(-1); setPortfolioOpen(false); setPerpOpen(false); setAgentOpen(false); setNotifOpen(false); setDiscoveryOpen(false); setLeaderboardOpen(false); }, "tab")}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", paddingTop: 2, position: "relative" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 30 }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill={iconFill} stroke={iconStroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.d}/>
                  {t.id === "settings" && <circle cx="12" cy="12" r="3" fill={iconFill} stroke={iconStroke} strokeWidth="1.6"/>}
                </svg>
                {t.badge && <div style={{ position: "absolute", top: -3, right: -10, background: RED, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 9, minWidth: 18, height: 16, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px", border: `1.5px solid ${isDark?"rgba(28,28,30,0.9)":"rgba(249,249,249,0.9)"}` }}>{t.badge}</div>}
                {t.alert && notifBadge > 0 && <div style={{ position: "absolute", top: 0, right: -1, width: 7, height: 7, background: RED, borderRadius: 4, border: `1.5px solid ${isDark?"rgba(28,28,30,0.9)":"rgba(249,249,249,0.9)"}` }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 500 : 400, color: active ? TG : inactiveColor, letterSpacing: 0 }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ═══════════════════════════════════════
  // CHATS LIST
  // ═══════════════════════════════════════
  const chatList = [
    { name: "CAVE Alpha Group", avatar: "🐋", bg: "linear-gradient(135deg,#7B68EE,#00C853)", msg: "Kate🚀: Just bought the dip, watchi…", time: "22:01", unread: 9, muted: true },
    { name: "Solana Builders", avatar: "◎", bg: "linear-gradient(135deg,#9945FF,#14F195)", msg: "new SDK update just dropped", time: "21:58", unread: 24 },
    { name: "cryptokid.sol", avatar: "🔥", bg: "#D84315", msg: "$DEGEN looking good, aping in", time: "21:45", unread: 3 },
    { name: "Solana Founders Hub", avatar: "🛠️", bg: "linear-gradient(135deg,#FF6B35,#FFD600)", msg: "Alex: hackathon results!", time: "21:30" },

    { name: "DeFi Alpha", avatar: "💎", bg: "linear-gradient(135deg,#00BCD4,#7C4DFF)", msg: "Rose: yield farm update…", time: "19:42", unread: 156, muted: true },
    { name: "Saved Messages", avatar: "🔖", bg: TG, msg: "debot-query", time: "Wed", pinned: true },
  ];
  const ChatsListScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: isDark ? "#000" : "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 4px", background: T.headerBg }}>
        <div style={{ fontSize: 17, padding: "6px 14px", background: T.bg2, borderRadius: 18, color: T.text }}>Edit</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 28, height: 28, borderRadius: 14, background: TG, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>D</span></div>
          <span style={{ fontSize: 17, fontWeight: 600, color: T.text }}>Chats</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div onClick={() => navigate(() => setNotifOpen(true))} style={{ position: "relative", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {NOTIFICATIONS.filter(n=>!n.read).length > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: 4, background: RED, border: "1.5px solid #fff" }}/>}
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
      </div>
      <div style={{ padding: "4px 16px 6px", background: T.headerBg }}>
        <div style={{ background: T.searchBg, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span style={{ fontSize: 16, color: T.text2 }}>Search</span>
        </div>
      </div>
      <div style={{ display: "flex", padding: "0 16px 6px" }}>
        {["All","mentors","Homie Groups","Nice"].map((f,i) => (
          <div key={f} style={{ padding: "4px 14px", fontSize: 14, fontWeight: i===0?600:400, color: i===0?TG:T.text2, borderBottom: i===0?`2px solid ${TG}`:"none", whiteSpace: "nowrap", cursor: "pointer" }}>{f}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {chatList.map((c,i) => (
          <div key={i} onClick={() => goChat(c.name)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 16px", cursor: "pointer", background: T.card }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.avatar.length > 1 ? 22 : 24, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{c.avatar}</div>
            <div style={{ flex: 1, minWidth: 0, borderBottom: "0.5px solid #C6C6C830", paddingBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.name}{c.muted && <span style={{ marginLeft: 4, fontSize: 12, color: "#C7C7CC" }}>🔇</span>}</span>
                <span style={{ fontSize: 14, color: "#8E8E93", flexShrink: 0, marginLeft: 8 }}>{c.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                <span style={{ fontSize: 15, color: "#8E8E93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{c.msg}</span>
                {c.unread && <div style={{ background: c.muted?"#C7C7CC":TG, color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, minWidth: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px", marginLeft: 8, flexShrink: 0 }}>{c.unread}</div>}
                {c.pinned && <span style={{ color: "#C7C7CC", fontSize: 14, marginLeft: 8 }}>📌</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CHAT VIEW
  // ═══════════════════════════════════════
  const ChatView = () => {
    const scrollAreaRef = (el) => {
      if (!el || !scrollToMsg) return;
      const msgId = scrollToMsg;
      setTimeout(() => {
        const target = el.querySelector("[data-msgid='" + msgId + "']");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToMsg(null);
      }, 150);
    };

    const DateSep = ({ label }) => (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <span style={{ background: "rgba(0,0,0,0.18)", color: "#fff", fontSize: 12, padding: "3px 14px", borderRadius: 12, fontWeight: 500 }}>{label}</span>
      </div>
    );

    const SysMsg = ({ text }) => (
      <div style={{ textAlign: "center", padding: "2px 0" }}>
        <span style={{ background: "rgba(0,0,0,0.12)", color: "#fff", fontSize: 12, padding: "3px 12px", borderRadius: 12 }}>{text}</span>
      </div>
    );

    const Msg = ({ avatar, avatarBg, name, nameColor, badge: msgBadge, text, time, replyTo }) => (
      <div style={{ maxWidth: "82%", display: "flex", gap: 4, alignItems: "flex-end" }}>
        <div style={{ width: 28, height: 28, borderRadius: 14, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "#fff", fontWeight: 700 }}>{avatar}</div>
        <div style={{ background: "#fff", borderRadius: "2px 16px 16px 16px", padding: "5px 10px 4px", boxShadow: "0 1px 1px rgba(0,0,0,0.06)", maxWidth: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: nameColor }}>{name}</span>
            {msgBadge && <span style={{ background: "#E3F2FD", color: "#1565C0", fontSize: 10, padding: "1px 5px", borderRadius: 4, fontWeight: 600 }}>{msgBadge}</span>}
          </div>
          {replyTo && (
            <div style={{ borderLeft: "3px solid " + replyTo.color, paddingLeft: 7, marginBottom: 4, background: "rgba(0,0,0,0.03)", borderRadius: "0 4px 4px 0", padding: "3px 7px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: replyTo.color }}>{replyTo.name}</div>
              <div style={{ fontSize: 12, color: "#8E8E93", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{replyTo.text}</div>
            </div>
          )}
          <div style={{ fontSize: 15.5, color: "#000", lineHeight: 1.4 }}>{text}</div>
          <div style={{ fontSize: 11, color: "#8E8E93", textAlign: "right", marginTop: 2 }}>{time}</div>
        </div>
      </div>
    );

    const OwnMsg = ({ text, time, read }) => (
      <div style={{ alignSelf: "flex-end", maxWidth: "76%" }}>
        <div style={{ background: "#DCFFD4", borderRadius: "16px 2px 16px 16px", padding: "5px 10px 4px", boxShadow: "0 1px 1px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 15.5, color: "#000", lineHeight: 1.4 }}>{text}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 3, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: "#5aab4f" }}>{time}</span>
            {read !== false && <svg width="15" height="10" viewBox="0 0 20 10"><path d="M1 5l4 4L14 1M8 5l4 4L21 1" stroke="#4CAF50" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
          </div>
        </div>
      </div>
    );

    const CallCard = ({ msgId, callerName, callerColor, callerIdxVal, badge: cardBadge, winRate,
      token, tokenSub, tokenPrice, tokenChange, tokenBg, tokenLetter,
      mc, vol, ath, liq, tags, links, sparkData, time }) => (
      <div data-msgid={msgId} style={{ maxWidth: "93%", display: "flex", gap: 4, alignItems: "flex-end" }}>
        <div onClick={() => navigate(() => setCallerIdx(callerIdxVal))}
          style={{ width: 28, height: 28, borderRadius: 14, background: callerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, cursor: "pointer", color: "#fff", fontWeight: 700 }}>
          {callerName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ background: "#fff", borderRadius: "2px 16px 16px 16px", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: "6px 10px 4px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <span onClick={() => navigate(() => setCallerIdx(callerIdxVal))}
                style={{ fontSize: 13.5, fontWeight: 700, color: callerColor, cursor: "pointer" }}>{callerName}</span>
              <span style={{ background: "#FBE9E7", color: "#C62828", fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{cardBadge}</span>
              <span style={{ background: "#E8F5E9", color: "#2E7D32", fontSize: 10, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>WR {winRate}</span>
            </div>
            <div style={{ margin: "0 8px 0", borderRadius: 12, border: "1px solid #EBEBEB", overflow: "hidden", background: "#FAFAFA" }}>
              <div style={{ padding: "10px 12px 6px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 19, background: tokenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>{tokenLetter}</div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 15, height: 15, borderRadius: 8, overflow: "hidden", border: "2px solid #FAFAFA" }}>
                    <img src="https://assets.coingecko.com/coins/images/28207/large/mSOL.png" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="SOL" />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#000" }}>{token}</div>
                  <div style={{ fontSize: 12, color: "#8E8E93" }}>{tokenSub}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#000" }}>{tokenPrice}</div>
                  <div style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{tokenChange}</div>
                </div>
              </div>
              <div style={{ display: "flex", padding: "0 12px 6px", gap: 12, fontSize: 12 }}>
                {[["MC", mc], ["Vol", vol], ["ATH", ath], ["Liq", liq]].map(function(item) {
                  return <div key={item[0]}><span style={{ color: "#8E8E93" }}>{item[0]} </span><span style={{ color: "#444", fontWeight: 500 }}>{item[1]}</span></div>;
                })}
              </div>
              <div style={{ padding: "0 12px 4px" }}><Sparkline data={sparkData} color={GREEN} /></div>
              <div style={{ display: "flex", gap: 4, padding: "2px 12px 8px", flexWrap: "wrap" }}>
                {tags.map(function(tag) {
                  var tagColor = tag[1] === "good" ? { bg: "#E8F5E9", text: "#2E7D32" } : tag[1] === "warn" ? { bg: "#FFF8E1", text: "#E65100" } : { bg: "#FCE4EC", text: "#880E4F" };
                  return <span key={tag[0]} style={{ background: tagColor.bg, color: tagColor.text, fontSize: 11, padding: "2px 7px", borderRadius: 5, fontWeight: 500 }}>{tag[0]}</span>;
                })}
              </div>
              <div style={{ padding: "6px 12px 8px", borderTop: "1px solid #EBEBEB", display: "flex", alignItems: "center", gap: 6, fontSize: 12, flexWrap: "wrap" }}>
                {links.map(function(link) {
                  return <span key={link[0]} style={{ color: TG, fontWeight: 500, cursor: "pointer" }}>{link[0]}{link[1] ? "✅" : "❌"}</span>;
                })}
                <span style={{ color: "#DDD", margin: "0 2px" }}>·</span>
                <span style={{ color: TG, fontWeight: 500, cursor: "pointer" }}>Chart</span>
                <span style={{ color: "#DDD", margin: "0 2px" }}>·</span>
                <span style={{ color: TG, fontWeight: 500, cursor: "pointer" }}>Bubble</span>
              </div>
            </div>
            <div onClick={() => navigate(() => setTradeToken(token.replace("$", "")))}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "8px", padding: "10px", borderRadius: 10, background: TG, cursor: "pointer", fontWeight: 600, fontSize: 14, color: "#fff" }}>
              ⚡ Trade {token}
            </div>
            <div style={{ fontSize: 11, color: "#8E8E93", textAlign: "right", padding: "0 10px 5px" }}>{time}</div>
          </div>
        </div>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "6px 12px 6px 4px", background: TG, color: "#fff", gap: 6 }}>
          <div onClick={goBack} style={{ cursor: "pointer", padding: "4px 6px", fontSize: 26, fontWeight: 300, lineHeight: 1 }}>‹</div>
          <div onClick={() => navigate(() => setProfileOpen("group"))}
            style={{ width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>🐋</div>
          <div onClick={() => navigate(() => setProfileOpen("group"))} style={{ flex: 1, cursor: "pointer", minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>CAVE Alpha Group</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>1,247 members, 89 online</div>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" style={{ marginLeft: 6 }}><circle cx="12" cy="5" r="1.5" fill="rgba(255,255,255,0.85)"/><circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.85)"/><circle cx="12" cy="19" r="1.5" fill="rgba(255,255,255,0.85)"/></svg>
        </div>

        <div ref={scrollAreaRef} style={{ flex: 1, overflowY: "auto", padding: "6px 8px 8px", display: "flex", flexDirection: "column", gap: 4,
          background: isDark ? "#0F1C12" : "#C8DFCC",
          backgroundImage: isDark ? "none" : "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a8c4ae' fill-opacity='0.20'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }}>



          <DateSep label="Today" />
          <Msg avatar="S" avatarBg="#E3A04F" name="solhunter.sol" nameColor="#C88A30" time="13:02" text="GM everyone 🫡 Market looks good today, let's go hard" />
          <Msg avatar="R" avatarBg="#00838F" name="ren" nameColor="#00695C" time="13:05" text="BTC dominance is dropping, alt season might be coming 👀" />
          <OwnMsg text="SOL is doing well too" time="13:06" />

          <CallCard msgId="call1" callerName="cryptokid.sol" callerColor="#D84315" callerIdxVal={0}
            badge="TOP 10% CALLER" winRate="74%"
            token="$DEGEN" tokenSub="DegenProtocol" tokenPrice="$0.0042" tokenChange="+184%"
            tokenBg="linear-gradient(135deg,#00C853,#00ACC1)" tokenLetter="D"
            mc="$420K" vol="$1.2M" ath="$0.0089" liq="$85K"
            tags={[["Bundle 2%","good"],["Insider 0.5%","good"],["Sniper 8%","warn"]]}
            links={[["🔗 Twitter",true],["Telegram",false],["Website",false]]}
            sparkData={[12,15,14,18,22,20,28,35,32,38,42,45,40,48,52,55,50,58,62]}
            time="14:30" />

          <Msg avatar="P" avatarBg="#0277BD" name="pepelord" nameColor="#0277BD" badge="WHALE" time="14:31"
            replyTo={{ name: "cryptokid.sol", text: "$DEGEN call", color: "#D84315" }} text="aping 2 SOL 🫡" />
          <OwnMsg text="Chart looks good. Put in 0.5 SOL 🔥" time="14:32" />
          <Msg avatar="K" avatarBg="#7B1FA2" name="Kate🚀" nameColor="#7B1FA2" time="14:34" text="Bought the dip, just watching~ Went in with DP" />
          <Msg avatar="S" avatarBg="#E3A04F" name="solhunter.sol" nameColor="#C88A30" time="14:38" text="$DEGEN is already over +250%, cryptokid is literally a god" />
          <OwnMsg text="TP set at 50% 👍" time="14:40" />
          <Msg avatar="R" avatarBg="#00838F" name="ren" nameColor="#00695C" time="14:44" text="If the next call comes in with this momentum it's gonna be insane" />

          <CallCard msgId="call2" callerName="alphahunter" callerColor="#7C4DFF" callerIdxVal={1}
            badge="TOP 10% CALLER" winRate="81%"
            token="$SHILL" tokenSub="ShillDAO" tokenPrice="$0.00018" tokenChange="+320%"
            tokenBg="linear-gradient(135deg,#7C4DFF,#E040FB)" tokenLetter="S"
            mc="$180K" vol="$890K" ath="$0.00042" liq="$62K"
            tags={[["Bundle 1%","good"],["Dev doxxed","good"],["Sniper 12%","warn"]]}
            links={[["🔗 Twitter",true],["Telegram",true],["Website",false]]}
            sparkData={[5,8,7,14,20,18,30,42,38,55,62,70,65,82,95,110,105,128,142]}
            time="16:12" />

          <Msg avatar="P" avatarBg="#0277BD" name="pepelord" nameColor="#0277BD" badge="WHALE" time="16:13" text="alphahunter calling again 🔥🔥🔥 going in 5 SOL" />
          <Msg avatar="K" avatarBg="#7B1FA2" name="Kate🚀" nameColor="#7B1FA2" time="16:14" text="Was watching $SHILL too! MC is so small it's scary… but going in 1 SOL" />
          <OwnMsg text="alphahunter WR 81%… should I ape" time="16:15" />
          <Msg avatar="S" avatarBg="#E3A04F" name="solhunter.sol" nameColor="#C88A30" time="16:20" text="Took out half when $SHILL 2x'd 💰 letting the rest ride" />
          <OwnMsg text="Smart! I took back 0.3 SOL too" time="16:22" />
          <Msg avatar="R" avatarBg="#00838F" name="ren" nameColor="#00695C" time="16:28" text="Volume is picking up, could hit +500% Can't look away" />
          <Msg avatar="K" avatarBg="#7B1FA2" name="Kate🚀" nameColor="#7B1FA2" time="16:35" text="This is starting to feel like the $CAVE gram portfolio lol 😂" />
          <OwnMsg text="For real 😂 can't wait for the next call" time="16:36" />

          <CallCard msgId="call3" callerName="whalemaster" callerColor="#00838F" callerIdxVal={2}
            badge="TOP 10% CALLER" winRate="68%"
            token="$PUMP" tokenSub="PumpFun V2" tokenPrice="$0.0012" tokenChange="+42%"
            tokenBg="linear-gradient(135deg,#FF6D00,#FFC400)" tokenLetter="P"
            mc="$1.2M" vol="$4.5M" ath="$0.0028" liq="$210K"
            tags={[["Bundle 3%","good"],["Insider 1.2%","good"],["Sniper 5%","good"]]}
            links={[["🔗 Twitter",true],["Telegram",true],["Website",true]]}
            sparkData={[30,32,29,35,38,42,40,45,50,48,55,62,60,68,72,70,78,82,88]}
            time="19:45" />

          <Msg avatar="P" avatarBg="#0277BD" name="pepelord" nameColor="#0277BD" badge="WHALE" time="19:46" text="$PUMP looks solid, MC is bigger so easier to enter with lower risk" />
          <Msg avatar="S" avatarBg="#E3A04F" name="solhunter.sol" nameColor="#C88A30" time="19:47" text="whalemaster always plays the larger MC ones steadily, love it" />
          <OwnMsg text="Went in 2 SOL! Liquidity over $200K so feeling safe" time="19:48" />
          <Msg avatar="K" avatarBg="#7B1FA2" name="Kate🚀" nameColor="#7B1FA2" time="19:52" text="If all 3 calls today finish green it's legendary 🙏" />
          <Msg avatar="R" avatarBg="#00838F" name="ren" nameColor="#00695C" time="20:01" text="$PUMP just hit +80%! whalemaster never misses 🐋" />
          <OwnMsg text="CAVE callers are the best fr 🔥" time="20:03" />
          <Msg avatar="S" avatarBg="#E3A04F" name="solhunter.sol" nameColor="#C88A30" time="20:10" text="Did anyone's total CAVE pf gains cross +$4200 today? lol" />
          <Msg avatar="P" avatarBg="#0277BD" name="pepelord" nameColor="#0277BD" badge="WHALE" time="20:12" text="+$9K secured 🤝" />
          <OwnMsg text="lol typical whale 😂" time="20:13" />
        </div>

        <div style={{ padding: "6px 8px", borderTop: "0.5px solid " + (isDark ? "rgba(255,255,255,0.1)" : "#C6C6C8"), background: isDark ? "#1C1C1E" : "#fff", display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: isDark ? "#2C2C2E" : "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
          </div>
          <div style={{ flex: 1, background: isDark ? "#2C2C2E" : "#F2F2F7", borderRadius: 20, padding: "8px 14px", fontSize: 16, color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>Message</div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: isDark ? "#2C2C2E" : "#F2F2F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 17, background: TG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // GROUP PROFILE
  // ═══════════════════════════════════════
  const GroupProfile = () => {
    const gTabs = ["Top Callers","Members","Media","Saved","Files","Links"];
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
        <div style={{ background: "#fff", textAlign: "center", paddingBottom: 16 }}>
          <div style={{ display: "flex", padding: "8px 16px" }}><div onClick={goBack} style={{ cursor: "pointer", fontSize: 28, color: TG, fontWeight: 300 }}>‹</div></div>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: "linear-gradient(135deg,#7B68EE,#00C853)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 8px" }}>🐋</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#000" }}>CAVE Alpha Group</div>
          <div style={{ fontSize: 15, color: "#8E8E93", marginTop: 2 }}>1,247 members, 89 online</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, padding: "0 30px" }}>
            {[["🔔","unmute"],["🔍","search"],["🚪","leave"],["•••","more"]].map(([ic,lb]) => (
              <div key={lb} style={{ flex: 1, background: "#F2F2F7", borderRadius: 12, padding: "10px 4px 8px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 18 }}>{ic}</div>
                <div style={{ fontSize: 12, color: TG, marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ background: "#fff", margin: "8px 0", padding: "12px 16px" }}>
            <div style={{ fontSize: 13, color: "#8E8E93" }}>share link</div>
            <div style={{ fontSize: 16, color: TG, marginTop: 2 }}>https://t.me/CAVE_Alpha</div>
            <div style={{ height: 0.5, background: "#C6C6C830", margin: "10px 0" }} />
            <div style={{ fontSize: 13, color: "#8E8E93" }}>description</div>
            <div style={{ fontSize: 16, color: "#000", marginTop: 2 }}>CAVE Alpha · Solana Degen Calls</div>
          </div>

          {/* ── Group Performance Stats ── */}
          <div style={{ background: "#fff", margin: "0 0 8px", padding: "14px 16px" }}>
            <div style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500, marginBottom: 10, letterSpacing: 0.2 }}>GROUP PERFORMANCE</div>
            {/* 4 stat boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Calls (30d)", value: "284", color: "#000" },
                { label: "Win Rate", value: "71%", color: GREEN },
                { label: "Avg Return", value: "6.8x", color: TG },
                { label: "Total PnL", value: "+$284K", color: GREEN },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: "#F7F7F7", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: 10, color: "#8E8E93", marginTop: 3, lineHeight: 1.2 }}>{label}</div>
                </div>
              ))}
            </div>
            {/* Win/Loss bar */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8E8E93", marginBottom: 5 }}>
              <span>Win <span style={{ color: GREEN, fontWeight: 600 }}>202</span></span>
              <span>Loss <span style={{ color: RED, fontWeight: 600 }}>82</span></span>
            </div>
            <WinLossBar wins={202} losses={82} />
            {/* Cumulative PnL sparkline */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 4 }}>Cumulative PnL (30d)</div>
              <Sparkline data={[10,24,18,42,38,65,58,90,84,112,108,140,135,168,180,172,210,225,215,248,260,245,280,275,284]} color={GREEN} height={44} />
            </div>
            {/* Top calls */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: "#8E8E93", marginBottom: 6 }}>Top calls this month</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["$MOON","🚀","+1,240%","#FFD700"],["$DEGEN","🔥","+412%",GREEN],["$SHILL","⚡","+320%",PURPLE]].map(([token, emoji, ret, c]) => (
                  <div key={token} style={{ flex: 1, background: "#F7F7F7", borderRadius: 10, padding: "8px 6px", textAlign: "center" }}>
                    <div style={{ fontSize: 14 }}>{emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#000", marginTop: 2 }}>{token}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c, marginTop: 1 }}>{ret}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Footer stats row */}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "0.5px solid #C6C6C830" }}>
              {[["Volume (30d)","$8.4M"],["Callers","12"],["Members","1,247"]].map(([l,v]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#000" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "#fff" }}>
            <div style={{ display: "flex", padding: "0 8px", borderBottom: "0.5px solid #C6C6C830", overflowX: "auto" }}>
              {gTabs.map(t => (
                <div key={t} onClick={() => setGroupTab(t)} style={{ padding: "8px 10px", fontSize: 14, fontWeight: groupTab===t?600:400, color: groupTab===t?TG:"#000", borderBottom: groupTab===t?`2px solid ${TG}`:"none", cursor: "pointer", whiteSpace: "nowrap" }}>{t}</div>
              ))}
            </div>
            {groupTab === "Top Callers" ? (
              <div style={{ padding: "4px 0" }}>
                {CALLERS.map((cl, i) => (
                  <div key={i} onClick={() => navigate(() => setCallerIdx(i))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "0.5px solid #C6C6C830", cursor: "pointer" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: i < 3 ? ["#FFD700","#C0C0C0","#CD7F32"][i] : "#C7C7CC", width: 22, textAlign: "center" }}>#{i+1}</div>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: cl.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{cl.name[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>{cl.name}</div><div style={{ fontSize: 13, color: "#8E8E93" }}>WR {cl.wr} · Avg {cl.avg} · {cl.calls} calls</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontSize: 14, color: GREEN }}>{cl.pnl}</div><div style={{ fontSize: 11, color: "#8E8E93" }}>{cl.followers} followers</div></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: "4px 0" }}>
                {["Yuki | Daiko","SEN UHI","Kazuki","Kate 🚀"].map((n,i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: "0.5px solid #C6C6C830" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 20, background: ["#D84315","#FF9500","#5C6BC0","#00BCD4","#E91E63"][i], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{n[0]}</div>
                    <div><div style={{ fontSize: 16, fontWeight: 500, color: "#000" }}>{n}</div><div style={{ fontSize: 13, color: i===0?GREEN:"#8E8E93" }}>{i===0?"online":"last seen recently"}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // TRADE SCREEN
  // ═══════════════════════════════════════
  const TradeScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
      <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: TG, color: "#fff", gap: 8 }}>
        <div onClick={goBack} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px" }}>‹</div>
        <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>⚡ Trade $DEGEN</div>
        <span style={{ fontSize: 13, opacity: 0.8 }}>💰 12.4 SOL</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, background: "linear-gradient(135deg,#00C853,#00ACC1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff" }}>D</div>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 18, color: "#000" }}>$DEGEN</div><div style={{ fontSize: 13, color: "#8E8E93" }}>DegenProtocol</div></div>
          <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, fontSize: 20, color: "#000" }}>$0.0042</div><div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>▲ 184.2%</div></div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
            {["1H","4H","1D","1W"].map(t => (
              <span key={t} onClick={() => setChartTf(t)} style={{ color: chartTf===t?TG:"#C7C7CC", fontWeight: chartTf===t?600:400, cursor: "pointer", padding: "2px 8px", borderRadius: 6, background: chartTf===t?"#EBF3FE":"transparent" }}>{t}</span>
            ))}
          </div>
          <CandleChart h={110} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#C7C7CC" }}>
            <span>12:00</span><span>14:00</span><span>16:00</span><span>Now</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
          {[["MC","$420K"],["24h Vol","$1.2M"],["Liquidity","$85K"]].map(([l,v]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 10, padding: "10px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#8E8E93" }}>{l}</div><div style={{ fontSize: 15, fontWeight: 600, color: "#000", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", background: "#fff", borderRadius: 10, padding: 3, marginBottom: 8 }}>
          {["buy","sell"].map(m => (
            <div key={m} onClick={() => setTradeMode(m)} style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", background: tradeMode===m?(m==="buy"?GREEN:RED):"transparent", color: tradeMode===m?"#fff":"#C7C7CC", transition: "all 0.2s" }}>{m.toUpperCase()}</div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 5, fontWeight: 500 }}>Amount (SOL)</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {["0.1","0.5","1","2","5"].map(a => (
            <div key={a} onClick={() => setSelAmt(a)} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", background: selAmt===a?TG:"#fff", color: selAmt===a?"#fff":"#333", transition: "all 0.15s" }}>{a}</div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8E8E93", marginBottom: 14 }}><span>Slippage</span><span style={{ color: "#333" }}>15%</span></div>
        <div onClick={() => showToast(tradeMode==="buy" ? `✅ Bought ${selAmt||"0.5"} SOL of $DEGEN` : "✅ Sold $DEGEN → 12.9 SOL")} style={{ padding: "14px", borderRadius: 12, textAlign: "center", fontWeight: 700, fontSize: 16, cursor: "pointer", background: tradeMode==="buy"?GREEN:RED, color: "#fff" }}>
          {tradeMode==="buy"?`BUY ${selAmt||"___"} SOL`:"SELL $DEGEN"}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CALLER PROFILE
  // ═══════════════════════════════════════
  const CallerProfile = () => {
    const cl = CALLERS[callerIdx] || CALLERS[0];
    const isFollowed = followedCallers[callerIdx];
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
        <div style={{ background: "#fff", textAlign: "center", paddingBottom: 16 }}>
          <div style={{ display: "flex", padding: "8px 16px" }}><div onClick={goBack} style={{ cursor: "pointer", fontSize: 28, color: TG, fontWeight: 300 }}>‹</div></div>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: cl.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 8px", color: "#fff", fontWeight: 700 }}>{cl.name[0].toUpperCase()}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#000" }}>{cl.name}</div>
          <div style={{ fontSize: 15, color: "#8E8E93", marginTop: 2 }}>last seen recently · {cl.followers} followers</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, padding: "0 16px" }}>
            {[["💬","message"],["📞","call"],["🎥","video"],["🔔","mute"],["•••","more"]].map(([ic,lb]) => (
              <div key={lb} style={{ flex: 1, background: "#F2F2F7", borderRadius: 12, padding: "10px 4px 8px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 18 }}>{ic}</div>
                <div style={{ fontSize: 12, color: TG, marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ padding: "10px 16px" }}>
            <div onClick={() => toggleFollow(callerIdx)} style={{ padding: "12px", borderRadius: 12, textAlign: "center", fontWeight: 600, fontSize: 16, cursor: "pointer", background: isFollowed ? "#fff" : TG, color: isFollowed ? TG : "#fff", border: isFollowed ? `1.5px solid ${TG}` : "1.5px solid transparent" }}>
              {isFollowed ? "✓ Following" : "＋ Follow Caller"}
            </div>
          </div>
          <div style={{ padding: "0 16px 0", fontSize: 13, color: "#8E8E93", fontWeight: 500 }}>CALLER STATS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "6px 16px" }}>
            {[[cl.wr,"Win Rate",GREEN],[cl.avg,"Avg Return",TG],[String(cl.calls),"Total Calls","#FF9500"]].map(([v,l,c]) => (
              <div key={l} style={{ background: "#fff", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", borderRadius: 12, margin: "8px 16px", padding: "12px" }}>
            <div style={{ fontSize: 13, color: "#8E8E93", marginBottom: 4 }}>Follower PnL (30d)</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: GREEN, marginBottom: 4 }}>{cl.pnl}</div>
            <Sparkline data={[100,120,115,140,180,170,210,250,240,280,320,350,340,380,420,460]} />
          </div>
          <div style={{ background: "#fff", borderRadius: 12, margin: "0 16px 8px", padding: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#8E8E93", marginBottom: 6 }}>
              <span>Win <span style={{ color: GREEN, fontWeight: 600 }}>{cl.wins}</span></span>
              <span>Loss <span style={{ color: RED, fontWeight: 600 }}>{cl.losses}</span></span>
            </div>
            <WinLossBar wins={cl.wins} losses={cl.losses} />
          </div>
          <div style={{ padding: "0 16px", fontSize: 13, color: "#8E8E93", fontWeight: 500 }}>RECENT CALLS</div>
          <div style={{ background: "#fff", borderRadius: 12, margin: "6px 16px 16px", overflow: "hidden" }}>
            {PAST_CALLS.map((pc,i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderTop: i?"0.5px solid #C6C6C830":"none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 17, background: pc.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>{pc.token[1]}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 15, color: "#000" }}>{pc.token}</div><div style={{ fontSize: 12, color: "#8E8E93" }}>{pc.time}</div></div>
                <div style={{ fontWeight: 700, fontSize: 15, color: pc.win?GREEN:RED }}>{pc.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // PORTFOLIO SCREEN
  // ═══════════════════════════════════════
  const PortfolioScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
      <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: TG, color: "#fff", gap: 8 }}>
        <div onClick={goBack} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px" }}>‹</div>
        <div style={{ flex: 1, textAlign: "center" }}><span style={{ fontSize: 16, fontWeight: 600 }}>◎ Solana ▾</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" opacity="0.8"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" opacity="0.8"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "18px", marginBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 15, color: "#000", fontWeight: 500 }}>Daikogram Wallet ▾</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: "#000" }}>1,247.50</span>
            <span style={{ fontSize: 18, color: "#8E8E93" }}>USD</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 14, color: "#8E8E93" }}>MuC5...CDS</span>
            <span style={{ background: "#E8F5E9", color: "#2E7D32", fontSize: 11, padding: "1px 6px", borderRadius: 4, fontWeight: 500 }}>Main</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["↑","Send"],["↓","Receive"],["⇄","Swap"]].map(([ic,lb]) => (
              <div key={lb} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 12, border: "1px solid #E5E5EA", cursor: "pointer", fontSize: 15, color: "#000", fontWeight: 500 }}>
                <span style={{ fontSize: 14 }}>{ic}</span>{lb}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", padding: "0 0 8px" }}>
          {["Token","NFT","dApps"].map((t,i) => (
            <span key={t} style={{ fontSize: 16, fontWeight: i===0?600:400, color: i===0?"#000":"#8E8E93", marginRight: 20, borderBottom: i===0?`2px solid ${TG}`:"none", paddingBottom: 4, cursor: "pointer" }}>{t}</span>
          ))}
        </div>
        {[
          { name: "SOL", price: "$137.59", amount: "8.24", value: "$1,133.74", change: "+3.9%", up: true,
            logo: "https://assets.coingecko.com/coins/images/28207/large/mSOL.png",
            fallbackBg: "linear-gradient(135deg,#9945FF,#14F195)", fallbackIcon: "◎" },
          { name: "DEGEN", price: "$0.0042", amount: "24,500", value: "$102.90", change: "+184%", up: true,
            logo: "https://cdn.dexscreener.com/cms/images/c865067e6e29f660b5d0c2a69814875c7415c3fc0022434651525c21f03cc24a?width=64&height=64&fit=crop&quality=95&format=auto",
            fallbackBg: "linear-gradient(135deg,#00C853,#00ACC1)", fallbackIcon: "D" },
          { name: "RAY", price: "$0.5924", amount: "15.2", value: "$9.01", change: "-2.1%", up: false,
            logo: "https://cdn.dexscreener.com/cms/images/654ec0cee3ecf3fd5d55c56302d82300ee114ee1ff91e52897798b486993f6c8?width=64&height=64&fit=crop&quality=95&format=auto",
            fallbackBg: "#7C4DFF", fallbackIcon: "R" },
          { name: "USDT", price: "$0.9998", amount: "1.85", value: "$1.85", change: "+0.0%", up: true,
            logo: "https://upload.wikimedia.org/wikipedia/commons/0/01/USDT_Logo.png",
            fallbackBg: "#26A17B", fallbackIcon: "₮" },
        ].map((tk, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 12, padding: "12px 14px", marginBottom: 4, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 21, background: tk.fallbackBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, overflow: "hidden" }}>
              {tk.logo
                ? <img src={tk.logo} alt={tk.name} style={{ width: 42, height: 42, borderRadius: 21, objectFit: "cover" }} onError={e => { e.target.style.display="none"; }} />
                : tk.fallbackIcon}
            </div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 16, color: T.text }}>{tk.name}</div><div style={{ fontSize: 13, color: T.text2 }}>{tk.price}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 600, fontSize: 16, color: T.text }}>{tk.amount}</div><div style={{ fontSize: 13, color: tk.up?GREEN:RED }}>{tk.change}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // DAIKOGRAM TAB
  // ═══════════════════════════════════════
  const DaikogramScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg3 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 6px", background: T.headerBg }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: T.text }}>🏠 Home</span>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div onClick={() => navigate(() => setLeaderboardOpen(true))} style={{ cursor: "pointer" }} title="Leaderboard">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          </div>
          <div onClick={() => navigate(() => setDiscoveryOpen(true))} style={{ cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </div>
          <div onClick={() => navigate(() => setNotifOpen(true))} style={{ position: "relative", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            {NOTIFICATIONS.filter(n=>!n.read).length > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, background: RED, border: "1.5px solid #EFEFF4" }}/>}
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        <div style={{ fontSize: 13, color: "#8E8E93", fontWeight: 500, padding: "8px 0 6px" }}>PORTFOLIO</div>
        <div onClick={() => navigate(() => setPortfolioOpen(true))} style={{ background: T.card, borderRadius: 12, padding: "14px", marginBottom: 12, cursor: "pointer", boxShadow: isDark?"none":"0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 13, color: T.text2 }}>Total Value</div><div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginTop: 2 }}>$1,247.50</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>+12.4%</div><div style={{ fontSize: 13, color: "#8E8E93" }}>today</div></div>
          </div>
          <div style={{ marginTop: 8 }}><Sparkline data={[800,820,810,850,900,880,950,1000,980,1050,1100,1150,1200,1180,1247]} width={300} height={40} /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>

        <div style={{ fontSize: 13, color: T.text2, fontWeight: 500, padding: "4px 0 6px", letterSpacing: 0.3 }}>TRENDING CALLS</div>
        {[
          { token: "$DEGEN", change: "+184%", mc: "$420K", c: "#00C853", members: 12, groups: ["CAVE","AlphaDAO","+2"], msgId: "call1" },
          { token: "$PUMP", change: "+42%", mc: "$1.2M", c: "#FF6D00", members: 8, groups: ["Solana Builders","DeFi Alpha","+1"], msgId: "call3" },
          { token: "$SHILL", change: "+320%", mc: "$180K", c: "#7C4DFF", members: 23, groups: ["CAVE","MetaDAO","+3"], msgId: "call2" },
        ].map((t, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 14, padding: "12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, boxShadow: isDark?"none":"0 1px 3px rgba(0,0,0,0.06)" }}>
            {/* Left area tappable → Chat at that call */}
            <div onClick={() => goToCall(t.msgId)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, cursor: "pointer" }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: t.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.token[1]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: T.text }}>{t.token}</span>
                  <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>{t.change}</span>
                  <span style={{ fontSize: 12, color: T.text2 }}>MC {t.mc}</span>
                </div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>{t.members} members · {t.groups.join(", ")}</div>
              </div>
            </div>
            {/* Buy button → Trade */}
            <div onClick={(e) => { e.stopPropagation(); navigate(() => setTradeToken(t.token)); }} style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, background: GREEN, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.2 }}>Buy</div>
          </div>
        ))}
        {/* See all calls */}
        <div style={{ textAlign: "center", padding: "4px 0 10px", cursor: "pointer" }}>
          <span style={{ fontSize: 15, color: TG, fontWeight: 500 }}>› See all calls</span>
        </div>

        <div style={{ fontSize: 13, color: T.text2, fontWeight: 500, padding: "10px 0 6px", letterSpacing: 0.3 }}>TOP CALLERS</div>
        {CALLERS.map((c, i) => (
          <div key={i} onClick={() => navigate(() => { setCallerIdx(i); setChatOpen("daikogram_caller"); })} style={{ background: T.card, borderRadius: 14, padding: "12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, cursor: "pointer", boxShadow: isDark?"none":"0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: i<3?["#FFD700","#C0C0C0","#CD7F32"][i]:"#C7C7CC", width: 20, textAlign: "center" }}>{i+1}</div>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: c.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{c.name[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{c.name}</div><div style={{ fontSize: 12, color: T.text2 }}>WR {c.wr} · Avg {c.avg}</div></div>
            <div style={{ fontWeight: 700, fontSize: 14, color: GREEN }}>{c.pnl}</div>
          </div>
        ))}

        {/* See all callers */}
        <div style={{ textAlign: "center", padding: "0 0 10px", cursor: "pointer" }}>
          <span style={{ fontSize: 15, color: TG, fontWeight: 500 }}>› See all callers</span>
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // PERP TRADE SCREEN (NEW)
  // ═══════════════════════════════════════
  const PerpTradeScreen = () => {
    const PAIRS = ["SOL-PERP","ETH-PERP","BTC-PERP","JUP-PERP","WIF-PERP"];
    const pairPrices = { "SOL-PERP": "$137.59", "ETH-PERP": "$3,210", "BTC-PERP": "$67,400", "JUP-PERP": "$0.842", "WIF-PERP": "$2.14" };
    const pairChanges = { "SOL-PERP": "+3.9%", "ETH-PERP": "+7.8%", "BTC-PERP": "-1.2%", "JUP-PERP": "+12.4%", "WIF-PERP": "+28.6%" };
    const pairUp = { "SOL-PERP": true, "ETH-PERP": true, "BTC-PERP": false, "JUP-PERP": true, "WIF-PERP": true };
    const levPresets = [2,3,5,10,20];
    const totalUnrealPnl = PERP_POSITIONS.reduce((sum, p) => {
      const v = parseFloat(p.pnl.replace(/[+$,]/g,"")) * (p.pnl.startsWith("-")?-1:1);
      return sum + v;
    }, 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d0d0d" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "6px 10px 6px", background: "#111", gap: 8, borderBottom: "0.5px solid #222" }}>
          <div onClick={() => navigate(() => setPerpOpen(false), "pop")} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px", color: "#fff" }}>‹</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>📊 Perp Trading</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#666" }}>Unrealized PnL</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: totalUnrealPnl >= 0 ? GREEN : RED }}>{totalUnrealPnl >= 0 ? "+" : ""}${totalUnrealPnl.toFixed(0)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#111", borderBottom: "0.5px solid #222" }}>
          {["positions","trade","orders"].map(t => (
            <div key={t} onClick={() => setPerpTab(t)} style={{ flex: 1, textAlign: "center", padding: "10px", fontSize: 14, fontWeight: perpTab===t?600:400, color: perpTab===t?TG:"#555", borderBottom: perpTab===t?`2px solid ${TG}`:"none", cursor: "pointer", textTransform: "capitalize" }}>{t}</div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {perpTab === "positions" && (
            <div style={{ padding: "8px 12px" }}>
              {/* Summary row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                {[["Margin Used","$485.20","#fff"],["Free Margin","$762.30","#fff"],["Total PnL",`+$${totalUnrealPnl.toFixed(0)}`,GREEN]].map(([l,v,c]) => (
                  <div key={l} style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#555" }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* Position cards */}
              {PERP_POSITIONS.map((pos, i) => (
                <div key={i} style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px", marginBottom: 8, border: `0.5px solid ${pos.win?"#1a3a1a":"#3a1a1a"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>{pos.pair}</div>
                      <span style={{ background: pos.side==="LONG"?"#1a3a1a":"#3a1a1a", color: pos.side==="LONG"?GREEN:RED, fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{pos.side}</span>
                      <span style={{ background: "#222", color: "#888", fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>{pos.lev}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: pos.win?GREEN:RED }}>{pos.pnl}</div>
                      <div style={{ fontSize: 12, color: pos.win?GREEN:RED }}>{pos.pnlPct}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, fontSize: 11 }}>
                    {[["Size",pos.size],["Entry",pos.entry],["Mark",pos.mark],["Liq.",pos.liq]].map(([l,v]) => (
                      <div key={l}><div style={{ color: "#555" }}>{l}</div><div style={{ color: "#ccc", marginTop: 1 }}>{v}</div></div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <div onClick={() => showToast(`✅ Added margin to ${pos.pair}`)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #333", textAlign: "center", fontSize: 12, color: "#aaa", cursor: "pointer" }}>+ Margin</div>
                    <div onClick={() => showToast(`⚠️ TP/SL set for ${pos.pair}`)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: "1px solid #333", textAlign: "center", fontSize: 12, color: "#aaa", cursor: "pointer" }}>TP / SL</div>
                    <div onClick={() => showToast(`🔴 Closed ${pos.pair}`)} style={{ flex: 1, padding: "7px", borderRadius: 8, background: "#3a1a1a", textAlign: "center", fontSize: 12, color: RED, cursor: "pointer", fontWeight: 600 }}>Close</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {perpTab === "trade" && (
            <div style={{ padding: "8px 12px" }}>
              {/* Pair selector */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
                {PAIRS.map(p => (
                  <div key={p} onClick={() => setPerpPair(p)} style={{ flexShrink: 0, padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: perpPair===p?TG:"#1a1a1a", color: perpPair===p?"#fff":"#888", border: `1px solid ${perpPair===p?TG:"#333"}` }}>{p}</div>
                ))}
              </div>
              {/* Price card */}
              <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#555" }}>{perpPair}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginTop: 2 }}>{pairPrices[perpPair]}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: pairUp[perpPair]?GREEN:RED }}>{pairChanges[perpPair]}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>24h</div>
                </div>
              </div>
              {/* Mini chart */}
              <div style={{ background: "#1a1a1a", borderRadius: 12, padding: "10px", marginBottom: 8 }}>
                <CandleChart h={80} />
              </div>
              {/* Long/Short */}
              <div style={{ display: "flex", background: "#1a1a1a", borderRadius: 10, padding: 3, marginBottom: 10 }}>
                {["long","short"].map(m => (
                  <div key={m} onClick={() => setPerpMode(m)} style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", background: perpMode===m?(m==="long"?GREEN:RED):"transparent", color: perpMode===m?"#fff":"#555", transition: "all 0.2s", textTransform: "uppercase" }}>{m}</div>
                ))}
              </div>
              {/* Leverage */}
              <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>Leverage: <span style={{ color: "#fff", fontWeight: 600 }}>{perpLev}x</span></div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {levPresets.map(l => (
                  <div key={l} onClick={() => setPerpLev(l)} style={{ flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", background: perpLev===l?"#7C4DFF":"#1a1a1a", color: perpLev===l?"#fff":"#666", border: `1px solid ${perpLev===l?"#7C4DFF":"#333"}` }}>{l}x</div>
                ))}
              </div>
              {/* Size */}
              <div style={{ fontSize: 13, color: "#555", marginBottom: 6 }}>Size (SOL)</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {["0.5","1","2","5"].map(a => (
                  <div key={a} onClick={() => setPerpSize(a)} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", background: perpSize===a?TG:"#1a1a1a", color: perpSize===a?"#fff":"#666", border: `1px solid ${perpSize===a?TG:"#333"}` }}>{a}</div>
                ))}
              </div>
              {/* Order details */}
              <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                {[["Order Value",`~$${(parseFloat(perpSize||"1") * parseFloat(pairPrices[perpPair].replace(/[$,]/g,"")) * perpLev).toLocaleString("en",{maximumFractionDigits:0})}`],["Liq. Price","~$"+(perpMode==="long"?"105.90":"169.30")],["Fees","~$0.32"]].map(([l,v],i) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderTop: i?"0.5px solid #222":"none" }}>
                    <span style={{ fontSize: 13, color: "#555" }}>{l}</span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div onClick={() => showToast(`✅ ${perpMode.toUpperCase()} ${perpSize} ${perpPair} @ ${perpLev}x`)} style={{ padding: "14px", borderRadius: 12, textAlign: "center", fontWeight: 700, fontSize: 16, cursor: "pointer", background: perpMode==="long"?GREEN:RED, color: "#fff" }}>
                {perpMode==="long"?`LONG ${perpPair}`:`SHORT ${perpPair}`}
              </div>
            </div>
          )}

          {perpTab === "orders" && (
            <div style={{ padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Open Orders</span>
                <span style={{ fontSize: 13, color: RED, cursor: "pointer" }}>Cancel All</span>
              </div>
              {[
                { pair: "SOL-PERP", type: "Limit", side: "LONG", price: "$130.00", size: "3 SOL", lev: "5x", filled: "0%" },
                { pair: "WIF-PERP", type: "Stop", side: "SHORT", price: "$2.50", size: "100 WIF", lev: "3x", filled: "0%" },
              ].map((o, i) => (
                <div key={i} style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{o.pair}</span>
                      <span style={{ background: o.side==="LONG"?"#1a3a1a":"#3a1a1a", color: o.side==="LONG"?GREEN:RED, fontSize: 11, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{o.side}</span>
                      <span style={{ background: "#222", color: "#666", fontSize: 11, padding: "2px 6px", borderRadius: 4 }}>{o.type}</span>
                    </div>
                    <div onClick={() => showToast(`❌ Order cancelled`)} style={{ fontSize: 12, color: RED, cursor: "pointer", padding: "4px 10px", borderRadius: 8, background: "#2a1010" }}>Cancel</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, fontSize: 11 }}>
                    {[["Price",o.price],["Size",o.size],["Lev",o.lev],["Filled",o.filled]].map(([l,v]) => (
                      <div key={l}><div style={{ color: "#555" }}>{l}</div><div style={{ color: "#ccc", marginTop: 1 }}>{v}</div></div>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: "center", padding: "20px", color: "#555", fontSize: 14 }}>No order history</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // AI AGENT SCREEN (NEW)
  // ═══════════════════════════════════════
  const AgentScreen = () => {
    const [localSettings, setLocalSettings] = useState(agentSettings);
    const [localEnabled, setLocalEnabled] = useState(agentEnabled);
    const AGENT_LOGS = [
      { time: "22:01", action: "Bought 0.3 SOL $BONK", reason: "alphahunter signal · WR 81%", color: GREEN, icon: "⚡" },
      { time: "20:45", action: "Sold $RUGG (stop loss hit)", reason: "-30% → stop triggered at -30%", color: RED, icon: "🛑" },
      { time: "19:22", action: "Skipped $SHILL call", reason: "MC $180K < min threshold $200K", color: "#555", icon: "⏭" },
      { time: "18:10", action: "Bought 0.5 SOL $DEGEN", reason: "cryptokid.sol signal · WR 74%", color: GREEN, icon: "⚡" },
      { time: "15:33", action: "Skipped degenking call", reason: "WR 62% < min 65%", color: "#555", icon: "⏭" },
    ];
    const toggle = (key) => setLocalSettings(s => ({ ...s, [key]: !s[key] }));
    const save = () => { setAgentSettings(localSettings); setAgentEnabled(localEnabled); showToast("✅ Agent settings saved"); navigate(() => setAgentOpen(false), "pop"); };
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0a0a0a" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: "#111", gap: 8, borderBottom: "0.5px solid #222" }}>
          <div onClick={() => navigate(() => setAgentOpen(false), "pop")} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px", color: "#fff" }}>‹</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>🤖 AI Agent</div>
            <div style={{ fontSize: 12, color: localEnabled ? GREEN : "#555" }}>{localEnabled ? "● Active" : "○ Inactive"}</div>
          </div>
          <Toggle on={localEnabled} onChange={() => setLocalEnabled(e => !e)} />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Status card */}
          <div style={{ margin: "10px 12px", background: "#111", borderRadius: 14, padding: "14px", border: `1px solid ${localEnabled?"#1a4a1a":"#222"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Today's Activity</div>
              <span style={{ fontSize: 12, color: GREEN }}>4 trades</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[["Deployed","1.6 SOL","#fff"],["Realized","+$42","#34C759"],["Win Rate","75%","#34C759"]].map(([l,v,c]) => (
                <div key={l} style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#555" }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div style={{ margin: "0 12px 8px", fontSize: 12, color: "#555", fontWeight: 600, letterSpacing: 0.5, padding: "4px 0" }}>TRADE SETTINGS</div>
          <div style={{ margin: "0 12px 10px", background: "#111", borderRadius: 14, overflow: "hidden" }}>
            {[
              { key: "autoTrade", label: "Auto Trade on Caller Signal", sub: "Execute trades automatically" },
              { key: "followCallers", label: "Follow Tracked Callers Only", sub: "Only trade callers you follow" },
              { key: "perpEnabled", label: "Enable Perp Trading", sub: "Agent can open perp positions" },
            ].map((item, i) => (
              <div key={item.key} style={{ display: "flex", alignItems: "center", padding: "12px 14px", borderTop: i?"0.5px solid #1a1a1a":"none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: "#fff" }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 1 }}>{item.sub}</div>
                </div>
                <Toggle on={localSettings[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>

          <div style={{ margin: "0 12px 8px", fontSize: 12, color: "#555", fontWeight: 600, letterSpacing: 0.5, padding: "4px 0" }}>RISK LIMITS</div>
          <div style={{ margin: "0 12px 10px", background: "#111", borderRadius: 14, overflow: "hidden" }}>
            {[
              { label: "Max SOL per Call", key: "maxPerCall", unit: "SOL", opts: ["0.1","0.3","0.5","1","2"] },
              { label: "Min Caller Win Rate", key: "minWR", unit: "%", opts: ["50","60","65","70","80"] },
              { label: "Take Profit", key: "tpPct", unit: "%", opts: ["30","50","100","200"] },
              { label: "Stop Loss", key: "slPct", unit: "%", opts: ["15","20","30","50"] },
            ].map((item, i) => (
              <div key={item.key} style={{ padding: "12px 14px", borderTop: i?"0.5px solid #1a1a1a":"none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "#fff" }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: TG }}>{localSettings[item.key]} {item.unit}</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {item.opts.map(o => (
                    <div key={o} onClick={() => setLocalSettings(s => ({...s, [item.key]: o}))} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: localSettings[item.key]===o?TG:"#1a1a1a", color: localSettings[item.key]===o?"#fff":"#555", border: `1px solid ${localSettings[item.key]===o?TG:"#333"}` }}>{o}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Agent log */}
          <div style={{ margin: "0 12px 8px", fontSize: 12, color: "#555", fontWeight: 600, letterSpacing: 0.5, padding: "4px 0" }}>AGENT LOG</div>
          <div style={{ margin: "0 12px 10px", background: "#111", borderRadius: 14, overflow: "hidden" }}>
            {AGENT_LOGS.map((log, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderTop: i?"0.5px solid #1a1a1a":"none" }}>
                <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{log.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: log.color, fontWeight: 500 }}>{log.action}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{log.reason}</div>
                </div>
                <div style={{ fontSize: 11, color: "#444", flexShrink: 0 }}>{log.time}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: "0 12px 16px" }}>
            <div onClick={save} style={{ padding: "14px", borderRadius: 12, textAlign: "center", fontWeight: 700, fontSize: 16, cursor: "pointer", background: localEnabled?"linear-gradient(135deg,#00C853,#007A33)":"#1a1a1a", color: localEnabled?"#fff":"#555" }}>
              {localEnabled ? "💾 Save & Activate Agent" : "💾 Save Settings"}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // NOTIFICATION SCREEN (NEW)
  // ═══════════════════════════════════════
  const NotifScreen = () => {
    const filters = ["all","trade","caller","alert","agent"];
    const filtered = notifFilter === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter(n => n.type === notifFilter);
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
        <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: TG, color: "#fff", gap: 8 }}>
          <div onClick={() => navigate(() => setNotifOpen(false), "pop")} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px" }}>‹</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>Notifications</div>
          <span style={{ fontSize: 13, opacity: 0.8, cursor: "pointer" }}>Mark all read</span>
        </div>
        {/* Filter tabs */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #E5E5EA", overflowX: "auto" }}>
          {filters.map(f => (
            <div key={f} onClick={() => setNotifFilter(f)} style={{ flexShrink: 0, padding: "8px 14px", fontSize: 13, fontWeight: notifFilter===f?600:400, color: notifFilter===f?TG:"#8E8E93", borderBottom: notifFilter===f?`2px solid ${TG}`:"none", cursor: "pointer", textTransform: "capitalize" }}>{f}</div>
          ))}
        </div>
        {/* Unread count */}
        {filtered.filter(n=>!n.read).length > 0 && (
          <div style={{ padding: "8px 16px 4px", fontSize: 12, color: "#8E8E93", fontWeight: 500 }}>{filtered.filter(n=>!n.read).length} UNREAD</div>
        )}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((notif, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: notif.read?"#fff":"#F0F8FF", borderBottom: "0.5px solid #E5E5EA" }}>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: notif.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{notif.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#000" }}>{notif.title}</div>
                  <div style={{ fontSize: 12, color: "#8E8E93", flexShrink: 0, marginLeft: 8 }}>{notif.time}</div>
                </div>
                <div style={{ fontSize: 14, color: "#444", marginTop: 2 }}>{notif.msg}</div>
                {notif.type === "caller" && (
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    <div onClick={() => navigate(() => { setTradeToken("SHILL"); setDiscoveryOpen(false); setNotifOpen(false); showToast("⚡ Opening trade..."); })} style={{ padding: "5px 12px", borderRadius: 8, background: TG, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⚡ Trade</div>
                    <div style={{ padding: "5px 12px", borderRadius: 8, background: "#F2F2F7", color: "#666", fontSize: 12, cursor: "pointer" }}>View Call</div>
                  </div>
                )}
                {!notif.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: TG, position: "absolute", right: 16 }}/>}
              </div>
            </div>
          ))}
        </div>
        {/* Alert settings quick link */}
        <div style={{ padding: "10px 16px", borderTop: "0.5px solid #E5E5EA", background: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4"/></svg>
            <span style={{ fontSize: 15, color: TG }}>Alert Settings</span>
            <div style={{ flex: 1 }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // DISCOVERY / SEARCH SCREEN (NEW)
  // ═══════════════════════════════════════
  const DiscoveryScreen = () => {
    const filtered = searchQuery ? TRENDING_TOKENS.filter(t => t.token.toLowerCase().includes(searchQuery.toLowerCase()) || t.name.toLowerCase().includes(searchQuery.toLowerCase())) : TRENDING_TOKENS;
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG }}>
        <div style={{ display: "flex", alignItems: "center", padding: "6px 10px", background: TG, color: "#fff", gap: 8 }}>
          <div onClick={() => navigate(() => setDiscoveryOpen(false), "pop")} style={{ cursor: "pointer", fontSize: 22, fontWeight: 300, padding: "0 4px" }}>‹</div>
          <div style={{ flex: 1, fontWeight: 600, fontSize: 16 }}>🔍 Discover</div>
        </div>
        {/* Search bar */}
        <div style={{ padding: "8px 12px", background: "#fff", borderBottom: "0.5px solid #E5E5EA" }}>
          <div style={{ background: "#F2F2F7", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search tokens, callers..." style={{ border: "none", background: "transparent", fontSize: 15, color: "#000", outline: "none", flex: 1 }} />
            {searchQuery && <span onClick={()=>setSearchQuery("")} style={{ color: "#8E8E93", cursor: "pointer" }}>✕</span>}
          </div>
        </div>
        {/* Tabs */}
        {!searchQuery && (
          <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #E5E5EA" }}>
            {["trending","new","top","watchlist"].map(t => (
              <div key={t} onClick={() => setDiscoveryTab(t)} style={{ flex: 1, textAlign: "center", padding: "8px", fontSize: 13, fontWeight: discoveryTab===t?600:400, color: discoveryTab===t?TG:"#8E8E93", borderBottom: discoveryTab===t?`2px solid ${TG}`:"none", cursor: "pointer", textTransform: "capitalize" }}>{t}</div>
            ))}
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!searchQuery && (
            /* Hot alert banner */
            <div style={{ margin: "10px 12px 0", background: "linear-gradient(135deg,#FF6D00,#FFD600)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🔥</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>$MOON just hit +1,240%</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>31 members from your groups bought</div>
              </div>
            </div>
          )}
          {/* Token list */}
          <div style={{ padding: "10px 12px" }}>
            {!searchQuery && <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>{discoveryTab.toUpperCase()} TOKENS</div>}
            {filtered.map((tk, i) => (
              <div key={i} onClick={() => navigate(() => { setTradeToken(tk.token); setDiscoveryOpen(false); })} style={{ background: "#fff", borderRadius: 12, padding: "12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 22, background: tk.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>{tk.token[1]}</div>
                  {tk.hot && <div style={{ position: "absolute", top: -2, right: -2, fontSize: 12 }}>🔥</div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: "#000" }}>{tk.token}</span>
                    <span style={{ fontSize: 12, color: tk.change.startsWith("+")?GREEN:RED, fontWeight: 600 }}>{tk.change}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#8E8E93", marginTop: 1 }}>MC {tk.mc} · Vol {tk.vol}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <div style={{ display: "flex" }}>
                      {[...Array(Math.min(tk.calls, 4))].map((_,j) => (
                        <div key={j} style={{ width: 16, height: 16, borderRadius: 8, background: ["#D84315","#7C4DFF","#00838F","#FF6D00"][j%4], border: "1.5px solid #fff", marginLeft: j?-4:0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700 }}>{["C","A","W","D"][j]}</div>
                      ))}
                    </div>
                    <span style={{ fontSize: 12, color: "#8E8E93" }}>{tk.calls} callers</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ padding: "5px 10px", borderRadius: 8, background: TG, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Trade</div>
                  <div onClick={(e) => { e.stopPropagation(); goToCall(tk.token==="$DEGEN"?"call1":tk.token==="$SHILL"?"call2":tk.token==="$PUMP"?"call3":"call1"); }} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(0,0,0,0.05)", color: TG, fontSize: 11, fontWeight: 500, cursor: "pointer", textAlign: "center" }}>View</div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#8E8E93" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: 16 }}>No tokens found</div>
              </div>
            )}
          </div>
          {/* Callers section */}
          {!searchQuery && discoveryTab === "trending" && (
            <div style={{ padding: "0 12px 16px" }}>
              <div style={{ fontSize: 12, color: "#8E8E93", fontWeight: 600, marginBottom: 8, letterSpacing: 0.5 }}>HOT CALLERS</div>
              {CALLERS.slice(0,3).map((c, i) => (
                <div key={i} onClick={() => navigate(() => setCallerIdx(i))} style={{ background: "#fff", borderRadius: 12, padding: "12px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: c.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>{c.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#000" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#8E8E93" }}>WR {c.wr} · {c.calls} calls · {c.followers} followers</div>
                  </div>
                  <div onClick={(e) => { e.stopPropagation(); toggleFollow(i); }} style={{ padding: "6px 12px", borderRadius: 8, background: followedCallers[i]?"#F2F2F7":TG, color: followedCallers[i]?TG:"#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", border: followedCallers[i]?`1px solid ${TG}`:"none" }}>
                    {followedCallers[i]?"✓ Following":"+Follow"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // LEADERBOARD SCREEN
  // ═══════════════════════════════════════
  const LeaderboardScreen = () => {
    const GROUPS = [
      { name: "CAVE Alpha Group", members: "1,247", callers: 12, avgWr: "71%", pnl: "+$284K", emoji: "🐋", bg: "linear-gradient(135deg,#7B68EE,#00C853)", rank: 1, volume: "$8.4M" },
      { name: "AlphaDAO", members: "3,420", callers: 24, avgWr: "65%", pnl: "+$190K", emoji: "🏴", bg: "linear-gradient(135deg,#FF6D00,#FFD600)", rank: 2, volume: "$12.1M" },
      { name: "Solana Builders", members: "8,900", callers: 8, avgWr: "78%", pnl: "+$142K", emoji: "◎", bg: "linear-gradient(135deg,#9945FF,#14F195)", rank: 3, volume: "$6.2M" },
      { name: "DeFi Alpha", members: "2,100", callers: 15, avgWr: "62%", pnl: "+$98K", emoji: "💎", bg: "linear-gradient(135deg,#00BCD4,#7C4DFF)", rank: 4, volume: "$4.8M" },
      { name: "MetaDAO Signals", members: "940", callers: 6, avgWr: "59%", pnl: "+$44K", emoji: "🦾", bg: "linear-gradient(135deg,#FF2D55,#FF9500)", rank: 5, volume: "$2.1M" },
    ];
    const rankColors = ["#FFD700","#C0C0C0","#CD7F32","#8E8E93","#8E8E93"];
    const [lbTab, setLbTab] = useState("groups");
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg3 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px 6px", background: T.headerBg, borderBottom: `0.5px solid ${T.border}` }}>
          <div onClick={() => navigate(() => setLeaderboardOpen(false), "pop")} style={{ cursor: "pointer", fontSize: 17, color: TG, marginRight: 8, padding: "2px 4px" }}>‹</div>
          <span style={{ fontSize: 17, fontWeight: 600, color: T.text, flex: 1, textAlign: "center" }}>Leaderboard</span>
          <div style={{ width: 40 }} />
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", background: T.headerBg, borderBottom: `0.5px solid ${T.border}` }}>
          {["groups","callers"].map(t => (
            <div key={t} onClick={() => setLbTab(t)} style={{ flex: 1, textAlign: "center", padding: "10px", fontSize: 14, fontWeight: lbTab===t?600:400, color: lbTab===t?TG:T.text2, borderBottom: lbTab===t?`2px solid ${TG}`:"2px solid transparent", cursor: "pointer", textTransform: "capitalize" }}>{t === "groups" ? "Alpha Groups" : "Top Callers"}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {lbTab === "groups" ? (
            <>
              {/* Podium top 3 */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 20, padding: "0 8px" }}>
                {[GROUPS[1], GROUPS[0], GROUPS[2]].map((g, pi) => {
                  const heights = [90, 110, 70];
                  const rnks = [2,1,3];
                  return (
                    <div key={g.rank} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 46, height: 46, borderRadius: 23, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `2px solid ${rankColors[rnks[pi]-1]}`, boxShadow: `0 0 12px ${rnks[pi]===1?"rgba(255,215,0,0.4)":"rgba(0,0,0,0.15)"}` }}>{g.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.text, textAlign: "center", maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name.split(" ")[0]}</div>
                      <div style={{ width: "100%", height: heights[pi], borderRadius: "6px 6px 0 0", background: rnks[pi]===1?"linear-gradient(180deg,#FFD700,#FF9500)":rnks[pi]===2?"linear-gradient(180deg,#C0C0C0,#9E9E9E)":"linear-gradient(180deg,#CD7F32,#8D4E00)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8 }}>
                        <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>#{rnks[pi]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Full list */}
              {GROUPS.map((g, i) => (
                <div key={i} onClick={() => goChat(g.name)} style={{ background: T.card, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: isDark?"none":"0 1px 4px rgba(0,0,0,0.07)", border: i===0?`1px solid rgba(255,215,0,0.3)`:"none" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: rankColors[i], width: 24, textAlign: "center", flexShrink: 0 }}>#{g.rank}</div>
                  <div style={{ width: 42, height: 42, borderRadius: 21, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{g.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginTop: 1 }}>{g.members} members · WR {g.avgWr} · Vol {g.volume}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: GREEN }}>{g.pnl}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{g.callers} callers</div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {CALLERS.map((c, i) => (
                <div key={i} onClick={() => navigate(() => setCallerIdx(i))} style={{ background: T.card, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", boxShadow: isDark?"none":"0 1px 4px rgba(0,0,0,0.07)", border: i===0?`1px solid rgba(255,215,0,0.3)`:"none" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: rankColors[i], width: 24, textAlign: "center", flexShrink: 0 }}>#{i+1}</div>
                  <div style={{ width: 42, height: 42, borderRadius: 21, background: c.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0 }}>{c.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: T.text }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: T.text2, marginTop: 1 }}>WR {c.wr} · Avg {c.avg} · {c.calls} calls</div>
                    <div style={{ marginTop: 4 }}><WinLossBar wins={c.wins} losses={c.losses} /></div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: GREEN }}>{c.pnl}</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>{c.followers} followers</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // CONTACTS
  // ═══════════════════════════════════════
  const ContactsScreen = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 16px 4px", background: T.headerBg }}>
        <div style={{ fontSize: 17, padding: "6px 14px", background: T.bg2, borderRadius: 18, color: T.text }}>Sort</div>
        <span style={{ fontSize: 17, fontWeight: 600, color: T.text }}>Contacts</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
      </div>
      <div style={{ padding: "4px 16px 6px", background: T.headerBg }}>
        <div style={{ background: T.searchBg, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text2} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span style={{ fontSize: 16, color: T.text2 }}>Search</span>
        </div>
      </div>
      <div style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "0.5px solid #C6C6C830" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        <span style={{ fontSize: 17, color: TG }}>Invite Friends</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {[["Alex | Superteam","4 min ago","#E91E63"],["Noah ⭐","6 min ago","#4CAF50"],["Ryan | Windfall Capital","57 min ago","#FF9800"],["SEN UHI","1 hour ago","#00BCD4"],["Mike Eidlin 🧿","1 hour ago","#9C27B0"]].map(([n,t,c]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: `0.5px solid ${T.border}`, background: T.card }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, background: c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>{n[0]}</div>
            <div><div style={{ fontSize: 16.5, fontWeight: 500, color: T.text }}>{n}</div><div style={{ fontSize: 14, color: "#8E8E93" }}>last seen {t}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CALLS (Screenshot-accurate)
  // ═══════════════════════════════════════
  const CallsScreen = () => {
    const [callFilter, setCallFilter] = useState("All");
    const callData = [
      { name: "Ryan | Windfall Capital", sub: "Outgoing (8 sec)", date: "Mon", c: "#5C6BC0", type: "out", missed: false },
      { name: "Alex | Superteam", sub: "Incoming (39 min)", date: "05/16/25", c: "#E91E63", type: "in", missed: false },
      { name: "Connor", sub: "Outgoing, Incoming", date: "03/18/25", c: "#7C4DFF", type: "out", missed: false },
      { name: "Duke +1", sub: "Missed", date: "03/17/25", c: "#FF6D00", type: "missed", missed: true },
      { name: "Connor", sub: "Incoming (2 min)", date: "02/07/25", c: "#7C4DFF", type: "in", missed: false },
      { name: "JK", sub: "Incoming (27 min)", date: "09/24/24", c: "#00838F", type: "in", missed: false },
      { name: "JK", sub: "Incoming (1 min)", date: "09/24/24", c: "#00838F", type: "in", missed: false },
      { name: "Max | PixeLAW", sub: "Outgoing, Incoming", date: "09/21/24", c: "#FF2D55", type: "out", missed: false },
      { name: "Max | PixeLAW", sub: "Outgoing (11 min)", date: "09/21/24", c: "#FF2D55", type: "video", missed: false },
      { name: "Max | PixeLAW", sub: "Outgoing, Incoming", date: "09/21/24", c: "#FF2D55", type: "out", missed: false },
    ];
    const filtered = callFilter === "Missed" ? callData.filter(c => c.missed) : callData;

    // Arrow: small, left-aligned like Telegram screenshot
    const Arrow = ({ type }) => {
      // out = diagonal arrow pointing up-right (green), in = down-left (green), missed = up-right (red)
      const color = type === "missed" ? RED : GREEN;
      const d = type === "out"
        ? "M7 17L17 7M17 7H9M17 7v8"   // ↗ outgoing
        : type === "video"
          ? "M7 17L17 7M17 7H9M17 7v8"
          : "M17 7L7 17M7 17h8M7 17V9"; // ↙ incoming
      return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={d}/>
        </svg>
      );
    };

    const InfoBtn = () => (
      <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${TG}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      </div>
    );

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
        {/* Header — matches screenshot: Edit left, All|Missed center pill, empty right */}
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px 8px", background: T.bg, gap: 0 }}>
          <div style={{ fontSize: 16, padding: "5px 16px", background: T.bg2, borderRadius: 20, color: T.text, cursor: "pointer", fontWeight: 400 }}>Edit</div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", background: T.bg2, borderRadius: 20, padding: 2 }}>
              {["All","Missed"].map(f => (
                <div key={f} onClick={() => setCallFilter(f)} style={{ padding: "5px 18px", fontSize: 15, fontWeight: callFilter===f?600:400, color: callFilter===f?T.text:T.text2, background: callFilter===f?T.card:"transparent", borderRadius: 18, cursor: "pointer", boxShadow: callFilter===f?"0 1px 3px rgba(0,0,0,0.15)":"none", transition: "all 0.15s" }}>{f}</div>
              ))}
            </div>
          </div>
          <div style={{ width: 60 }} />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Start New Call — matches screenshot: phone icon left in TG blue, text right */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px 10px", background: T.bg, borderBottom: `0.5px solid ${T.border}`, cursor: "pointer" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="1.8" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.12 12.12 19.79 19.79 0 012.1 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91"/>
              <line x1="17" y1="8" x2="17" y2="14"/><line x1="20" y1="11" x2="14" y2="11"/>
            </svg>
            <span style={{ fontSize: 17, color: TG, fontWeight: 400 }}>Start New Call</span>
          </div>

          {/* Section label */}
          <div style={{ fontSize: 13, color: T.text2, padding: "10px 16px 2px", fontWeight: 400, letterSpacing: 0.3 }}>RECENT CALLS</div>

          {/* Rows */}
          {filtered.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, padding: "8px 16px", background: T.bg }}>
              {/* Small arrow — far left, same column as Telegram */}
              <div style={{ width: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Arrow type={c.type} />
              </div>
              {/* Avatar */}
              <div style={{ width: 46, height: 46, borderRadius: 23, background: c.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 17, flexShrink: 0, marginRight: 12 }}>{c.name[0]}</div>
              {/* Name + sub — flex 1 */}
              <div style={{ flex: 1, minWidth: 0, borderBottom: `0.5px solid ${T.border}`, paddingBottom: 8, paddingTop: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 400, color: c.missed ? RED : T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                <div style={{ fontSize: 13, color: T.text2, marginTop: 1 }}>{c.sub}</div>
              </div>
              {/* Date + ⓘ */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderBottom: `0.5px solid ${T.border}`, paddingBottom: 8, paddingTop: 1 }}>
                <span style={{ fontSize: 15, color: T.text2, flexShrink: 0 }}>{c.date}</span>
                <InfoBtn />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // SETTINGS (Telegram iOS style)
  // ═══════════════════════════════════════
  const SettingsScreen = () => {
    const SettingRow = ({ icon, iconBg, label, value, action, chevron=true, danger=false, isToggle=false, toggleVal=false, onToggle=null }) => (
      <div onClick={action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: `0.5px solid ${T.border}`, cursor: action||onToggle?"pointer":"default", background: T.card }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg||TG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
        </div>
        <span style={{ fontSize: 16, color: danger?RED:T.text, flex: 1 }}>{label}</span>
        {value && <span style={{ fontSize: 15, color: T.text2, marginRight: 4 }}>{value}</span>}
        {isToggle && <Toggle on={toggleVal} onChange={onToggle} />}
        {chevron && !isToggle && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>}
      </div>
    );
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg3 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 6px", background: T.bg3 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TG} strokeWidth="1.5"><rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/><rect x="3" y="16" width="5" height="5" rx="1"/><path d="M16 16h5M18.5 16v5M16 18.5h2.5"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: T.text }}>Settings</span>
          <div style={{ fontSize: 15, padding: "6px 14px", background: T.bg2, borderRadius: 18, color: T.text, cursor: "pointer" }}>Edit</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Profile card */}
          <div style={{ background: T.card, margin: "8px 0 0", padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, borderBottom: `0.5px solid ${T.border}` }}>
            <div style={{ width: 62, height: 62, borderRadius: 31, background: "linear-gradient(135deg,#3390EC,#00C853)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", fontWeight: 700, flexShrink: 0 }}>Y</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 600, color: T.text }}>Alex</div>
              <div style={{ fontSize: 14, color: T.text2, marginTop: 1 }}>+1 415 923 7042</div>
              <div style={{ fontSize: 14, color: TG, marginTop: 1 }}>@alex</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          {/* My Profile shortcuts */}
          <div style={{ background: T.card, borderBottom: `0.5px solid ${T.border}` }}>
            {[["😊","Change Emoji Status","#FF9500"],["🎨","Change Profile Color","#5856D6"],["📷","Change Profile Photo","#FF2D55"]].map(([ic,lb,bg],i) => (
              <SettingRow key={lb} icon={ic} iconBg={bg} label={lb} />
            ))}
          </div>
          {/* Section 1: Daiko features */}
          <div style={{ background: T.card, margin: "8px 0 0", borderTop: `0.5px solid ${T.border}` }}>
            <SettingRow icon="💰" iconBg="#30D158" label="Wallet" action={()=>navigate(()=>setPortfolioOpen(true))} />
          </div>
          {/* Section 2: Main settings */}
          <div style={{ background: T.card, margin: "8px 0 0", borderTop: `0.5px solid ${T.border}` }}>
            <SettingRow icon="🔔" iconBg="#FF3B30" label="Notifications and Sounds" action={()=>navigate(()=>setNotifOpen(true))} />
            <SettingRow icon="🔒" iconBg="#636366" label="Privacy and Security" />
            <SettingRow icon="💾" iconBg="#30D158" label="Data and Storage" />
            <SettingRow icon="🌓" iconBg="#1C1C1E" label="Appearance" value={isDark?"Dark":"Light"} action={()=>setTheme(t=>t==="dark"?"light":"dark")} />
            <SettingRow icon="⚡" iconBg="#FF9F0A" label="Power Saving" value="Off" />
            <SettingRow icon="🌐" iconBg="#5856D6" label="Language" value="English" />
          </div>
          {/* Section 3: Premium */}
          <div style={{ background: T.card, margin: "8px 0 0", borderTop: `0.5px solid ${T.border}` }}>
            <SettingRow icon="⭐" iconBg="#BF5AF2" label="Telegram Premium" />
            <SettingRow icon="⭐" iconBg="#FF9F0A" label="My Stars" />
            <SettingRow icon="🏪" iconBg="#FF2D55" label="Telegram Business" />
            <SettingRow icon="🎁" iconBg="#30D158" label="Send a Gift" />
          </div>
          {/* Section 4: Help */}
          <div style={{ background: T.card, margin: "8px 0 0", borderTop: `0.5px solid ${T.border}` }}>
            <SettingRow icon="💬" iconBg="#30D158" label="Ask a Question" />
            <SettingRow icon="❓" iconBg="#0A84FF" label="Telegram FAQ" />
            <SettingRow icon="💡" iconBg="#FF9F0A" label="Telegram Features" />
          </div>
          <div style={{ height: 20 }} />
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════
  // AUTH SCREEN
  // ═══════════════════════════════════════
  const AuthScreen = () => {
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState(["", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [timerActive, setTimerActive] = useState(false);
    const codeRef0 = useRef(null);
    const codeRef1 = useRef(null);
    const codeRef2 = useRef(null);
    const codeRef3 = useRef(null);
    const codeRef4 = useRef(null);
    const codeRefs = [codeRef0, codeRef1, codeRef2, codeRef3, codeRef4];

    useEffect(() => {
      if (!timerActive || timer <= 0) return;
      const id = setTimeout(() => setTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    }, [timer, timerActive]);

    const handleNext = () => {
      if (phone.length < 7) return;
      setAuthPhone(phone);
      navigate(() => setAuthStep("code"), "push");
      setTimeout(() => codeRef0.current?.focus(), 320);
      setTimerActive(true);
    };

    const handleCodeChange = (idx, val) => {
      if (!/^\d?$/.test(val)) return;
      const next = [...code];
      next[idx] = val;
      setCode(next);
      if (val && idx < 4) codeRefs[idx + 1].current?.focus();
      if (next.every(d => d !== "")) {
        setTimeout(() => completeAuth(), 150);
      }
    };

    const handleCodeKeyDown = (idx, e) => {
      if (e.key === "Backspace" && !code[idx] && idx > 0) {
        codeRefs[idx - 1].current?.focus();
      }
    };

    const completeAuth = () => {
      navigate(() => {
        setAuthenticated(true);
        setTab("chats");
      }, "push");
    };

    const resendCode = () => {
      setTimer(60);
      setTimerActive(true);
      setCode(["", "", "", "", ""]);
      setTimeout(() => codeRef0.current?.focus(), 100);
    };

    if (authStep === "phone") return (
      <div
        ref={el => { if (el) el.style.cssText += "; view-transition-name: screen;"; }}
        style={{
          display: "flex", flexDirection: "column",
          height: "100dvh", background: "#fff",
          paddingTop: "env(safe-area-inset-top, 44px)"
        }}
      >
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-start",
          paddingTop: 60, paddingBottom: 24, paddingLeft: 24, paddingRight: 24
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: 50,
            background: `linear-gradient(145deg, ${TG}, #2479D8)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20, boxShadow: `0 8px 32px rgba(51,144,236,0.35)`
          }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#000", margin: "0 0 6px", textAlign: "center" }}>
            Daikogram
          </h1>
          <p style={{ fontSize: 15, color: "#8E8E93", margin: "0 0 36px", textAlign: "center", lineHeight: 1.5 }}>
            Please confirm your country code<br />and enter your phone number.
          </p>
          <div
            onClick={() => showToast("🌐 Country selection coming soon")}
            style={{
              width: "100%", background: "#F2F2F7", borderRadius: 12,
              padding: "14px 16px", marginBottom: 10,
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
            }}
          >
            <span style={{ fontSize: 22 }}>🇯🇵</span>
            <span style={{ fontSize: 16, color: "#000", flex: 1 }}>Japan</span>
            <span style={{ fontSize: 16, color: "#8E8E93" }}>+81</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C7C7CC" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
          <div style={{
            width: "100%", background: "#F2F2F7", borderRadius: 12,
            padding: "14px 16px", marginBottom: 32,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <span style={{ fontSize: 16, color: TG, fontWeight: 600 }}>+81</span>
            <div style={{ width: 1, height: 20, background: "#C7C7CC" }} />
            <input
              type="tel"
              inputMode="numeric"
              autoFocus
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              style={{
                border: "none", background: "transparent",
                fontSize: 16, color: "#000", outline: "none",
                flex: 1, letterSpacing: 0.5
              }}
            />
          </div>
          <div
            onClick={handleNext}
            style={{
              width: "100%", padding: "15px", borderRadius: 12,
              textAlign: "center", fontWeight: 700, fontSize: 16,
              cursor: phone.length >= 7 ? "pointer" : "default",
              background: phone.length >= 7 ? TG : "#C7C7CC",
              color: "#fff", transition: "background 0.2s", userSelect: "none"
            }}
          >
            Next
          </div>
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 34px)" }} />
      </div>
    );

    return (
      <div
        ref={el => { if (el) el.style.cssText += "; view-transition-name: screen;"; }}
        style={{
          display: "flex", flexDirection: "column",
          height: "100dvh", background: "#fff",
          paddingTop: "env(safe-area-inset-top, 44px)"
        }}
      >
        <div style={{ padding: "8px 16px 0" }}>
          <div
            onClick={() => navigate(() => setAuthStep("phone"), "pop")}
            style={{ fontSize: 28, color: TG, fontWeight: 300, cursor: "pointer", display: "inline-block" }}
          >
            ‹
          </div>
        </div>
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center",
          paddingTop: 40, paddingLeft: 24, paddingRight: 24
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: 40,
            background: "#EBF3FE",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 20
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={TG} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#000", margin: "0 0 6px", textAlign: "center" }}>
            +81 {authPhone}
          </h1>
          <p style={{ fontSize: 15, color: "#8E8E93", margin: "0 0 36px", textAlign: "center", lineHeight: 1.5 }}>
            We have sent you a message with the code<br />to the number above.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 32, justifyContent: "center" }}>
            {code.map((digit, i) => (
              <div key={i} style={{
                width: 52, height: 56, borderRadius: 12,
                background: "#F2F2F7",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                border: digit ? `2px solid ${TG}` : "2px solid transparent",
                transition: "border-color 0.15s"
              }}>
                <input
                  ref={codeRefs[i]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  style={{
                    position: "absolute", inset: 0,
                    border: "none", background: "transparent",
                    textAlign: "center", fontSize: 22,
                    fontWeight: 600, color: "#000",
                    outline: "none", width: "100%", height: "100%",
                    borderRadius: 12, caretColor: TG
                  }}
                />
              </div>
            ))}
          </div>
          {timer > 0 ? (
            <p style={{ fontSize: 14, color: "#8E8E93", textAlign: "center" }}>
              Resend code in{" "}
              <span style={{ color: TG, fontWeight: 600 }}>0:{String(timer).padStart(2, "0")}</span>
            </p>
          ) : (
            <div
              onClick={resendCode}
              style={{ fontSize: 15, color: TG, fontWeight: 500, cursor: "pointer", textAlign: "center" }}
            >
              Resend Code
            </div>
          )}
        </div>
        <div style={{ height: "env(safe-area-inset-bottom, 34px)" }} />
      </div>
    );
  };

  // ═══════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════
  const renderContent = () => {
    if (leaderboardOpen) return <LeaderboardScreen />;
    if (discoveryOpen) return <DiscoveryScreen />;
    if (notifOpen) return <NotifScreen />;
    if (agentOpen) return <AgentScreen />;
    if (perpOpen) return <PerpTradeScreen />;
    if (portfolioOpen) return <PortfolioScreen />;
    if (callerIdx >= 0) return <CallerProfile />;
    if (tradeToken) return <TradeScreen />;
    if (profileOpen === "group") return <GroupProfile />;
    if (chatOpen && chatOpen !== "daikogram_caller") return <ChatView />;
    switch (tab) {
      case "contacts": return <ContactsScreen />;
      case "calls": return <CallsScreen />;
      case "chats": return <ChatsListScreen />;
      case "home": return <DaikogramScreen />;
      case "settings": return <SettingsScreen />;
    }
  };

  return (
    <div style={{ width: "100dvw", height: "100dvh", background: T.bg, fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif', display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {!authenticated ? (
        <AuthScreen />
      ) : (
        <>
          <StatusBar />
          <div ref={el => { if (el) el.style.cssText += "; view-transition-name: screen;"; }} style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>{renderContent()}</div>
          <TabBar />
          <Toast {...toast} />
        </>
      )}
    </div>
  );
}