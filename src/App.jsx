import { useEffect, useMemo, useRef, useState } from "react";
import chatsBg from "./assets/chats-bg.png";
import chatPattern from "./assets/chat-pattern.png";

const U = ["#E66866", "#5DAB35", "#E0904D", "#2EA6DA", "#9A5BAA", "#2DAFA0", "#D27EAF", "#5C6AC4"];

function svgData(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function colorFromText(text, offset = 0) {
  const palette = ["#E66866", "#5DAB35", "#E0904D", "#2EA6DA", "#9A5BAA", "#2DAFA0", "#D27EAF", "#5C6AC4", "#34C759", "#FFB300"];
  const sum = Array.from(String(text)).reduce((acc, char) => acc + char.charCodeAt(0), offset);
  return palette[sum % palette.length];
}

function callerImage(caller) {
  const name = caller?.name || "caller";
  const bg = caller?.color?.startsWith("#") ? caller.color : colorFromText(name);
  const accent = colorFromText(name, 17);
  const initial = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 1).toUpperCase() || "C";
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${bg}"/><stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#g)"/>
      <circle cx="48" cy="38" r="19" fill="rgba(255,255,255,.92)"/>
      <path d="M17 86c6-20 18-31 31-31s25 11 31 31" fill="rgba(255,255,255,.92)"/>
      <circle cx="38" cy="36" r="3" fill="#1f1f22"/><circle cx="58" cy="36" r="3" fill="#1f1f22"/>
      <path d="M39 47c5 4 13 4 18 0" fill="none" stroke="#1f1f22" stroke-width="4" stroke-linecap="round"/>
      <text x="48" y="84" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Arial" font-size="22" font-weight="800" fill="#fff">${initial}</text>
    </svg>
  `);
}

function tokenImage(token) {
  const ticker = token?.ticker || "$TKN";
  const symbol = ticker.replace("$", "").slice(0, 4).toUpperCase();
  const bg = colorFromText(ticker);
  const accent = colorFromText(token?.name || ticker, 31);
  const shape = token?.marketType === "prediction" ? "M24 57c7-20 18-30 32-30 9 0 16 6 16 15 0 20-25 18-25 33" : "M48 16 80 34v28L48 80 16 62V34z";
  return svgData(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="${bg}"/><stop offset="1" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="48" fill="url(#g)"/>
      <path d="${shape}" fill="rgba(255,255,255,.22)" stroke="rgba(255,255,255,.78)" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="70" cy="25" r="8" fill="rgba(255,255,255,.30)"/>
      <text x="48" y="58" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-size="${symbol.length > 3 ? 22 : 28}" font-weight="800" fill="#fff">${symbol}</text>
    </svg>
  `);
}

const callerProfileDefaults = (name, id = 0) => ({
  username: `@${name.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "caller"}`,
  birthday: id % 3 === 0 ? "14 Aug 2001 (24 years old)" : id % 3 === 1 ? "7 Nov 1998 (27 years old)" : "2 Feb 2000 (26 years old)",
  status: id % 2 === 0 ? "online" : "last seen today at 18:07",
});

const CALLERS = [
  { id: 0, name: "cryptokid.sol", username: "@cryptokid_sol", birthday: "18 Sep 1999 (26 years old)", status: "online", meta: "Top 10% caller", wr: "74%", avg: "8.4x", pnl: "+$42.6K", calls: 127, wins: 94, losses: 33, followers: "2.1K", color: U[0] },
  { id: 1, name: "alphahunter", username: "@alphahunter", birthday: "7 Nov 1998 (27 years old)", status: "last seen today at 18:07", meta: "Signal desk", wr: "81%", avg: "12.1x", pnl: "+$96.2K", calls: 89, wins: 72, losses: 17, followers: "4.8K", color: U[4] },
  { id: 2, name: "whalemaster", username: "@whalemaster", birthday: "2 Feb 2000 (26 years old)", status: "last seen 12 minutes ago", meta: "Large-cap caller", wr: "68%", avg: "4.2x", pnl: "+$18.9K", calls: 203, wins: 138, losses: 65, followers: "1.3K", color: U[5] },
  { id: 3, name: "degenking", username: "@degenking", birthday: "14 Aug 2001 (24 years old)", status: "last seen today at 17:48", meta: "Early memes", wr: "62%", avg: "6.7x", pnl: "+$11.4K", calls: 56, wins: 35, losses: 21, followers: "890", color: U[2] },
];

const GROUP_CALLERS = [
  ...CALLERS,
  { id: 4, name: "solanaSensei", wr: "69%", avg: "5.8x", pnl: "+$32.4K", calls: 78, wins: 54, losses: 24, color: U[6] },
  { id: 5, name: "pumpwatcher", wr: "66%", avg: "4.9x", pnl: "+$28.1K", calls: 91, wins: 60, losses: 31, color: U[7] },
  { id: 6, name: "perpTony", wr: "64%", avg: "3.7x", pnl: "+$24.8K", calls: 66, wins: 42, losses: 24, color: "#111" },
  { id: 7, name: "kalshiLin", wr: "61%", avg: "2.6x", pnl: "+$19.6K", calls: 58, wins: 35, losses: 23, color: U[5] },
  { id: 8, name: "memeMechanic", wr: "58%", avg: "3.1x", pnl: "+$15.2K", calls: 84, wins: 49, losses: 35, color: U[3] },
  { id: 9, name: "lowcapLily", wr: "55%", avg: "2.4x", pnl: "+$11.9K", calls: 73, wins: 40, losses: 33, color: U[2] },
  { id: 10, name: "tokyoWhale", wr: "72%", avg: "6.2x", pnl: "+$38.4K", calls: 64, wins: 46, losses: 18, color: "#2EA6DA" },
  { id: 11, name: "mcapMori", wr: "63%", avg: "4.1x", pnl: "+$17.8K", calls: 52, wins: 33, losses: 19, color: "#5DAB35" },
  { id: 12, name: "chainScout", wr: "59%", avg: "3.6x", pnl: "+$13.3K", calls: 47, wins: 28, losses: 19, color: "#9A5BAA" },
  { id: 13, name: "snipeSensei", wr: "57%", avg: "2.9x", pnl: "+$9.6K", calls: 41, wins: 23, losses: 18, color: "#E0904D" },
];

const HARU_CALLER = {
  id: 14,
  name: "haru",
  username: "@memetics6900",
  birthday: "23 Mar 2004 (22 years old)",
  status: "last seen today at 18:07",
  meta: "CAVE member",
  wr: "63%",
  avg: "3.4x",
  pnl: "+$8.2K",
  calls: 34,
  wins: 21,
  losses: 13,
  followers: "640",
  color: U[4],
  hiddenTrades: true,
};

const TOKENS = [
  { ticker: "$DEGEN", name: "DegenProtocol", change: "+184%", mc: "$420K", vol: "$1.2M", liq: "$85K", ath: "$0.0089", price: "$0.0042", calls: 15, color: "linear-gradient(135deg,#34C759,#2EA6DA)", data: [12, 15, 14, 18, 22, 20, 28, 35, 32, 38, 42, 45, 40, 48] },
  { ticker: "$SHILL", name: "ShillDAO", change: "+320%", mc: "$180K", vol: "$890K", liq: "$62K", ath: "$0.00042", price: "$0.00018", calls: 23, color: "linear-gradient(135deg,#9A5BAA,#2EA6DA)", data: [5, 8, 7, 14, 20, 18, 30, 42, 38, 55, 62, 70, 65, 82] },
  { ticker: "$PUMP", name: "PumpFun V2", change: "+42%", mc: "$1.2M", vol: "$4.5M", liq: "$210K", ath: "$0.0028", price: "$0.0012", calls: 8, color: "linear-gradient(135deg,#E0904D,#FFB300)", data: [30, 32, 29, 35, 38, 42, 40, 45, 50, 48, 55, 62, 60, 68] },
  { ticker: "$MOON", name: "MoonShot", change: "+1,240%", mc: "$45K", vol: "$220K", liq: "$28K", ath: "$0.031", price: "$0.018", calls: 31, color: "linear-gradient(135deg,#FFB300,#34C759)", data: [4, 5, 9, 8, 12, 20, 32, 50, 78, 120, 138, 155, 170, 188] },
  { ticker: "$BONK", name: "BonkInu", change: "+89%", mc: "$8.4M", vol: "$32M", liq: "$1.1M", ath: "$0.000044", price: "$0.000029", calls: 6, color: "linear-gradient(135deg,#E66866,#E0904D)", data: [22, 24, 25, 28, 30, 29, 34, 37, 36, 40, 44, 45, 48, 50] },
  { ticker: "$PEPE", name: "Pepe2.0", change: "-12%", mc: "$2.1M", vol: "$890K", liq: "$320K", ath: "$0.00019", price: "$0.00009", calls: 2, color: "linear-gradient(135deg,#5DAB35,#FF3B30)", data: [50, 48, 46, 42, 44, 40, 38, 35, 37, 32, 30, 28, 29, 24] },
];

const MARKET_TOKENS = {
  TSLA: { ticker: "$TSLA", name: "Tesla Perp", change: "+3.8%", mc: "$812B", vol: "$2.4B", liq: "$42M", ath: "$414.50", price: "$184.20", calls: 18, color: "linear-gradient(135deg,#111111,#E66866)", data: [120, 122, 121, 126, 130, 128, 134, 138, 136, 142, 147, 146, 151, 156] },
  BTC: { ticker: "$BTC", name: "Bitcoin Perp", change: "+1.6%", mc: "$2.01T", vol: "$18.6B", liq: "$94M", ath: "$112K", price: "$101,840", calls: 24, color: "linear-gradient(135deg,#FFB300,#E0904D)", data: [90, 92, 91, 94, 96, 95, 98, 101, 99, 103, 106, 105, 109, 111] },
  SOL: { ticker: "$SOL", name: "Solana Perp", change: "-2.4%", mc: "$84B", vol: "$3.2B", liq: "$38M", ath: "$294", price: "$164.80", calls: 16, color: "linear-gradient(135deg,#5C6AC4,#2DAFA0)", data: [120, 118, 117, 119, 115, 113, 116, 112, 110, 109, 111, 108, 106, 104] },
  FOMC: { ticker: "FOMC", name: "Fed cuts in June?", marketType: "prediction", market: "Kalshi", question: "Will the Fed cut rates at the June meeting?", change: "+9.2%", mc: "$7.4M", vol: "$640K", liq: "$210K", ath: "64¢", price: "41¢", calls: 11, color: "linear-gradient(135deg,#339DFF,#5C6AC4)", data: [20, 22, 21, 24, 28, 31, 29, 35, 39, 37, 42, 45, 48, 51] },
  CPI: { ticker: "CPI", name: "CPI under 3.0%?", marketType: "prediction", market: "Kalshi", question: "Will US CPI print below 3.0% this month?", change: "+4.5%", mc: "$3.1M", vol: "$280K", liq: "$96K", ath: "58¢", price: "37¢", calls: 9, color: "linear-gradient(135deg,#2DAFA0,#34C759)", data: [30, 29, 32, 34, 33, 36, 38, 37, 40, 43, 42, 45, 47, 49] },
};

const DITT_TOKEN = {
  ticker: "$DITT",
  name: "Ditto",
  change: "+58%",
  mc: "$96K",
  vol: "$310K",
  liq: "$42K",
  ath: "$0.0018",
  price: "$0.00031",
  calls: 7,
  color: "linear-gradient(135deg,#2DAFA0,#339DFF)",
  data: [8, 9, 11, 10, 13, 17, 16, 21, 24, 23, 28, 31, 30, 36],
  description: "Ditto is a CAVE-discovered Solana memecoin with early holder growth, clean liquidity, and live Daikogram call flow.",
};

const ALL_TOKENS = [...TOKENS, DITT_TOKEN, ...Object.values(MARKET_TOKENS)];

const CHATS = [
  { id: "cave", title: "CAVE meme alpha group", avatar: "C", color: "linear-gradient(135deg,#5C6AC4,#34C759)", message: "haru: $DITT flow looks clean", time: "18:31", unread: 763, meta: "3,146 members, 189 online" },
  { id: "tony", title: "Tony's calls (Hyperliquid perp)", avatar: "T", color: "linear-gradient(135deg,#050505,#339DFF)", message: "Tony: BTC long is still valid above 101.2K", time: "18:30", unread: 12, muted: true, meta: "" },
  { id: "lin", title: "Lin's insights for Kalshi", avatar: "L", color: "linear-gradient(135deg,#2DAFA0,#FFB300)", message: "Lin: FOMC cut odds moved too far", time: "18:28", unread: 4, meta: "" },
];

const CONTACTS = [
  { name: "Noah", meta: "last seen 4 minutes ago", avatar: "N", color: "#F3E96F", star: true },
  { name: "Yutaro | JP Windfall", meta: "last seen 6 minutes ago", avatar: "Y", color: "#CAD2FF" },
  { name: "Bee-utiful bee tomato", meta: "last seen 6 minutes ago", avatar: "B", color: "#F5D36D" },
  { name: "256hax | Superteam JP", meta: "last seen 10 minutes ago", avatar: "2", color: "#EFA0BB" },
  { name: "SEN UHI", meta: "last seen 35 minutes ago", avatar: "S", color: "#B7D4FF" },
  { name: "Mike Eidlin", meta: "last seen 2 hours ago", avatar: "M", color: "#F8EAD7" },
  { name: "Rocky Rocks 873", meta: "last seen 4 hours ago", avatar: "RR", color: "#86D477", star: true },
  { name: "Fly", meta: "last seen 9 hours ago", avatar: "F", color: "#16171B" },
  { name: "asuma | Daiko AI", meta: "last seen 11 hours ago", avatar: "A", color: "#5E7C5E", star: true },
  { name: "Olivia Lo | BitGo (NYC)", meta: "last seen 12 hours ago", avatar: "O", color: "#F44336", star: true },
  { name: "Thomukas1", meta: "last seen yesterday at 22:08", avatar: "T", color: "#75D7C8" },
];

const RECENT_CALLS = [
  { name: "Sam Sam | Aphelion", detail: "Outgoing (1 min)", date: "Fri", video: true, avatar: "S", color: "#93A4CC" },
  { name: "Sam Sam | Aphelion", detail: "Outgoing", date: "Tue", video: true, avatar: "S", color: "#93A4CC" },
  { name: "Sam Sam | Aphelion", detail: "Outgoing", date: "Tue", avatar: "S", color: "#93A4CC" },
  { name: "Sam Sam | Aphelion", detail: "Outgoing (26 sec)", date: "04/30", avatar: "S", color: "#93A4CC" },
  { name: "Sam Sam | Aphelion", detail: "Outgoing", date: "04/27", avatar: "S", color: "#93A4CC" },
  { name: "Sam Sam | Aphelion", detail: "Outgoing (13 sec)", date: "04/04", avatar: "S", color: "#93A4CC" },
  { name: "Yuma JP", detail: "Outgoing", date: "04/04", avatar: "Y", color: "#66D9D9" },
  { name: "Atsushi", detail: "Outgoing", date: "04/04", avatar: "A", color: "#CDBBEB" },
];

const SETTINGS_GROUPS = [
  [{ label: "My Profile", icon: "user", color: "#F45B55" }],
  [{ label: "Wallet", icon: "wallet", color: "#4099FF" }],
  [
    { label: "Saved Messages", icon: "bookmark", color: "#4099FF" },
    { label: "Recent Calls", icon: "calls", color: "#62D96B" },
    { label: "Devices", icon: "devices", color: "#FDBB45", value: "7" },
    { label: "Chat Folders", icon: "folder", color: "#62BDEB" },
  ],
  [
    { label: "Privacy and Security", icon: "lock", color: "#B8B8BE" },
    { label: "Notifications and Sounds", icon: "bell", color: "#FF3B30" },
  ],
];

const MESSAGES = [
  { type: "date", label: "Today" },
  { type: "msg", user: "solhunter.sol", userId: 2, text: "GM everyone. Market looks good today, let's go hard", time: "13:02" },
  { type: "msg", user: "ren", userId: 5, text: "BTC dominance is dropping. Alt season might be coming.", time: "13:05" },
  { type: "own", text: "SOL is doing well too", time: "13:06" },
  { type: "call", caller: CALLERS[0], token: TOKENS[0], time: "14:30" },
  { type: "msg", user: "pepelord", userId: 3, text: "aping 2 SOL", time: "14:31" },
  { type: "own", text: "Chart looks good. Put in 0.5 SOL", time: "14:32" },
  { type: "call", caller: CALLERS[1], token: TOKENS[1], time: "16:12" },
  { type: "msg", user: "Kate", userId: 6, text: "Was watching $SHILL too. MC is small but the flow is real.", time: "16:14" },
  { type: "own", text: "alphahunter WR 81%... should I ape", time: "16:15" },
  { type: "call", caller: CALLERS[2], token: TOKENS[2], time: "19:45" },
];

const CALLER_CALL_HISTORY = [
  ["$DEGEN", "$34K", "$300K", "2 hours ago", "+782%", TOKENS[0]],
  ["$SHILL", "$72K", "$640K", "4 hours ago", "+789%", TOKENS[1]],
  ["$MOON", "$18K", "$1.1M", "Yesterday", "+6,011%", TOKENS[3]],
  ["$PUMP", "$180K", "$420K", "04/30", "+133%", TOKENS[2]],
  ["$BONK", "$6.2M", "$8.4M", "04/28", "+35%", TOKENS[4]],
  ["$PEPE", "$2.4M", "$2.1M", "04/26", "-12%", TOKENS[5]],
  ["$WIF", "$410K", "$980K", "04/24", "+139%", { ...TOKENS[3], ticker: "$WIF", name: "Dogwifhat", color: "linear-gradient(135deg,#F7C76D,#E0904D)" }],
  ["$JUP", "$820K", "$1.4M", "04/21", "+70%", { ...TOKENS[2], ticker: "$JUP", name: "Jupiter", color: "linear-gradient(135deg,#2DAFA0,#339DFF)" }],
  ["$MEW", "$96K", "$61K", "04/19", "-36%", { ...TOKENS[5], ticker: "$MEW", name: "Cat in Dogs World", color: "linear-gradient(135deg,#D27EAF,#FF3B30)" }],
  ["$POPCAT", "$230K", "$790K", "04/16", "+243%", { ...TOKENS[0], ticker: "$POPCAT", name: "Popcat", color: "linear-gradient(135deg,#5C6AC4,#D27EAF)" }],
  ["$GOAT", "$1.8M", "$1.2M", "04/12", "-33%", { ...TOKENS[5], ticker: "$GOAT", name: "Goatseus Maximus", color: "linear-gradient(135deg,#111,#FF3B30)" }],
  ["$BOME", "$540K", "$2.8M", "04/08", "+419%", { ...TOKENS[4], ticker: "$BOME", name: "Book of Meme", color: "linear-gradient(135deg,#34C759,#FFB300)" }],
];

const GROUP_CALL_HISTORY = [
  [CALLERS[0], "$DEGEN", "$34K MC", "2 hours ago", TOKENS[0]],
  [CALLERS[1], "$SHILL", "$72K MC", "4 hours ago", TOKENS[1]],
  [CALLERS[2], "$PUMP", "$180K MC", "Yesterday", TOKENS[2]],
  [CALLERS[3], "$MOON", "$18K MC", "2 days ago", TOKENS[3]],
  [GROUP_CALLERS[4], "$BONK", "$6.2M MC", "04/30", TOKENS[4]],
  [GROUP_CALLERS[6], "$TSLA", "$812B MC", "04/29", MARKET_TOKENS.TSLA],
  [GROUP_CALLERS[7], "$FOMC", "$7.4M MC", "04/28", MARKET_TOKENS.FOMC],
  [GROUP_CALLERS[10], "$DITT", "$96K MC", "04/27", DITT_TOKEN],
  [GROUP_CALLERS[5], "$MEW", "$410K MC", "04/26", { ...TOKENS[5], ticker: "$MEW", name: "Cat in Dogs World", change: "-38%", mc: "$410K", price: "$0.000061", color: "linear-gradient(135deg,#D27EAF,#FF3B30)", data: [46, 44, 43, 41, 38, 39, 35, 32, 33, 29, 26, 24, 22, 19] }],
  [GROUP_CALLERS[8], "$WEN", "$1.8M MC", "04/25", { ...TOKENS[5], ticker: "$WEN", name: "Wen", change: "-24%", mc: "$1.8M", price: "$0.00012", color: "linear-gradient(135deg,#5C6AC4,#FF3B30)", data: [58, 56, 54, 51, 49, 48, 45, 43, 41, 40, 36, 34, 32, 29] }],
  [GROUP_CALLERS[9], "$SLERF", "$760K MC", "04/24", { ...TOKENS[5], ticker: "$SLERF", name: "Slerf", change: "-51%", mc: "$760K", price: "$0.0011", color: "linear-gradient(135deg,#E0904D,#FF3B30)", data: [72, 70, 65, 61, 58, 54, 50, 46, 41, 39, 33, 28, 24, 18] }],
  [GROUP_CALLERS[11], "$GOAT", "$2.4M MC", "04/23", { ...TOKENS[5], ticker: "$GOAT", name: "Goatseus Maximus", change: "-19%", mc: "$2.4M", price: "$0.0038", color: "linear-gradient(135deg,#111111,#FF3B30)", data: [44, 43, 45, 42, 40, 41, 37, 36, 34, 32, 31, 28, 27, 24] }],
  [GROUP_CALLERS[12], "$POPCAT", "$940K MC", "04/22", { ...TOKENS[0], ticker: "$POPCAT", name: "Popcat", change: "+31%", mc: "$940K", price: "$0.0024", color: "linear-gradient(135deg,#5C6AC4,#D27EAF)", data: [20, 21, 23, 22, 26, 28, 27, 30, 31, 34, 33, 36, 38, 41] }],
  [GROUP_CALLERS[13], "$BOME", "$1.1M MC", "04/21", { ...TOKENS[5], ticker: "$BOME", name: "Book of Meme", change: "-28%", mc: "$1.1M", price: "$0.00074", color: "linear-gradient(135deg,#34C759,#FF3B30)", data: [50, 48, 46, 45, 43, 40, 42, 38, 35, 34, 31, 30, 27, 25] }],
  [CALLERS[0], "$JUP", "$4.2M MC", "04/20", { ...TOKENS[5], ticker: "$JUP", name: "Jupiter", change: "-14%", mc: "$4.2M", price: "$0.61", color: "linear-gradient(135deg,#2DAFA0,#FF3B30)", data: [62, 60, 61, 58, 56, 54, 55, 52, 50, 49, 48, 46, 44, 42] }],
  [CALLERS[1], "$WIF", "$2.9M MC", "04/19", { ...TOKENS[5], ticker: "$WIF", name: "Dogwifhat", change: "-33%", mc: "$2.9M", price: "$0.0049", color: "linear-gradient(135deg,#F7C76D,#FF3B30)", data: [80, 77, 73, 71, 68, 64, 61, 59, 55, 52, 49, 45, 42, 38] }],
  [CALLERS[2], "$MOTHER", "$620K MC", "04/18", { ...TOKENS[5], ticker: "$MOTHER", name: "Mother", change: "-46%", mc: "$620K", price: "$0.00033", color: "linear-gradient(135deg,#9A5BAA,#FF3B30)", data: [66, 62, 59, 56, 52, 49, 44, 41, 37, 34, 31, 27, 24, 20] }],
  [CALLERS[3], "$RETARDIO", "$330K MC", "04/17", { ...TOKENS[0], ticker: "$RETARDIO", name: "Retardio", change: "+18%", mc: "$330K", price: "$0.00021", color: "linear-gradient(135deg,#FFB300,#34C759)", data: [13, 14, 13, 15, 16, 15, 18, 19, 18, 20, 21, 23, 22, 25] }],
];

const TONY_CALL_HISTORY = [
  [GROUP_CALLERS[6], "$BTC", "$101.2K support", "18:00", MARKET_TOKENS.BTC],
  [GROUP_CALLERS[6], "$TSLA", "$184.20 price", "18:09", MARKET_TOKENS.TSLA],
  [GROUP_CALLERS[6], "$SOL", "$164.80 price", "18:14", MARKET_TOKENS.SOL],
  [GROUP_CALLERS[6], "$BTC", "$102.4K trigger", "Yesterday", { ...MARKET_TOKENS.BTC, change: "+0.9%" }],
  [GROUP_CALLERS[6], "$SOL", "$171 rejection", "04/30", { ...MARKET_TOKENS.SOL, change: "-3.1%" }],
];

const LIN_CALL_HISTORY = [
  [GROUP_CALLERS[7], "FOMC", "41¢ odds", "18:03", MARKET_TOKENS.FOMC],
  [GROUP_CALLERS[7], "CPI", "37¢ odds", "18:10", MARKET_TOKENS.CPI],
  [GROUP_CALLERS[7], "FOMC", "46¢ fade", "Yesterday", { ...MARKET_TOKENS.FOMC, change: "+5.2%" }],
  [GROUP_CALLERS[7], "CPI", "33¢ entry", "04/30", { ...MARKET_TOKENS.CPI, change: "-2.1%" }],
];

const GROUP_PROFILES = {
  cave: {
    title: "CAVE",
    subtitle: "3,146 members, 189 online",
    link: "https://t.me/CAVE_JPN",
    description: "JP TRENCHES 神風 LOW CAPS",
    tabs: ["Callers", "Calls", "Members", "Media", "Saved"],
    calls: GROUP_CALL_HISTORY,
    stats: [["284", "Calls", "green"], ["71%", "Win rate", "green"], ["12.4x", "Avg return", "blue"]],
    metrics: [["Volume", "$4.8M"], ["Callers", "43"], ["Global rank", "#14"]],
    pnl: "+$284K",
    chart: [10, 24, 18, 42, 38, 65, 58, 90, 84, 112, 108, 140, 135, 168],
  },
  tony: {
    title: "Tony's calls",
    subtitle: "Hyperliquid perp calls",
    link: "https://t.me/tony_perp_calls",
    description: "One-way BTC, SOL, and TSLA perp calls from Tony.",
    tabs: ["Calls"],
    calls: TONY_CALL_HISTORY,
    stats: [["96", "Calls", "green"], ["64%", "Win rate", "green"], ["5.9x", "Avg return", "blue"]],
    metrics: [["Volume", "$12.4M"], ["Markets", "3"], ["Global rank", "#22"]],
    pnl: "+$221K",
    chart: [14, 22, 19, 36, 44, 41, 62, 58, 77, 74, 91, 99, 104, 118],
  },
  lin: {
    title: "Lin's insights",
    subtitle: "Kalshi prediction market notes",
    link: "https://t.me/lin_kalshi",
    description: "One-way macro prediction market calls for FOMC, CPI, and headline-driven odds.",
    tabs: ["Calls", "Media", "Saved"],
    calls: LIN_CALL_HISTORY,
    stats: [["72", "Calls", "green"], ["61%", "Win rate", "green"], ["3.2x", "Avg return", "blue"]],
    metrics: [["Volume", "$3.6M"], ["Markets", "8"], ["Global rank", "#31"]],
    pnl: "+$188K",
    chart: [8, 18, 16, 21, 29, 27, 34, 42, 39, 47, 55, 53, 60, 68],
  },
};

const CALLER_TRADE_HISTORY = [
  ["$MOON", "MoonShot", "+$18,420", "+602%", TOKENS[3]],
  ["$SHILL", "ShillDAO", "+$9,860", "+318%", TOKENS[1]],
  ["$DEGEN", "DegenProtocol", "+$6,240", "+184%", TOKENS[0]],
  ["$BOME", "Book of Meme", "+$4,920", "+141%", { ...TOKENS[4], ticker: "$BOME", name: "Book of Meme" }],
  ["$PUMP", "PumpFun V2", "+$2,180", "+42%", TOKENS[2]],
  ["$JUP", "Jupiter", "+$1,340", "+28%", { ...TOKENS[2], ticker: "$JUP", name: "Jupiter" }],
  ["$BONK", "BonkInu", "+$860", "+18%", TOKENS[4]],
  ["$MEW", "Cat in Dogs World", "-$420", "-9%", { ...TOKENS[5], ticker: "$MEW", name: "Cat in Dogs World" }],
  ["$PEPE", "Pepe2.0", "-$740", "-12%", TOKENS[5]],
  ["$GOAT", "Goatseus Maximus", "-$1,120", "-21%", { ...TOKENS[5], ticker: "$GOAT", name: "Goatseus Maximus" }],
  ["$WIF", "Dogwifhat", "-$1,860", "-31%", { ...TOKENS[3], ticker: "$WIF", name: "Dogwifhat" }],
  ["$SLERF", "Slerf", "-$2,430", "-44%", { ...TOKENS[5], ticker: "$SLERF", name: "Slerf" }],
];

const GROUP_LEADERBOARD = [
  ["SOLTRENDING Elite", "+$912K", "83%", "18.8x", "#2DAFA0"],
  ["Whale Room Tokyo", "+$801K", "81%", "16.4x", "#339DFF"],
  ["Pump Prime", "+$744K", "79%", "15.2x", "#FFB300"],
  ["Meme Syndicate", "+$690K", "78%", "14.9x", "#9A5BAA"],
  ["Apex Perps", "+$612K", "76%", "13.1x", "#111111"],
  ["Kalshi Macro Desk", "+$558K", "75%", "11.8x", "#2DAFA0"],
  ["KOLscope Pro", "+$502K", "74%", "10.7x", "#339DFF"],
  ["Daiko Factory", "+$468K", "73%", "10.2x", "#F7C76D"],
  ["Hyperdash Flows", "+$421K", "72%", "9.6x", "#17171a"],
  ["Soylana Manlets", "+$386K", "72%", "9.1x", "#E0904D"],
  ["CryptoKudasaiJP", "+$344K", "71%", "8.8x", "#FFB300"],
  ["Moby Mobile Product", "+$319K", "71%", "8.2x", "#5DAB35"],
  ["Tony's calls", "+$301K", "69%", "6.1x", "linear-gradient(135deg,#050505,#339DFF)"],
  ["CAVE meme alpha group", "+$284K", "71%", "12.4x", "linear-gradient(135deg,#5C6AC4,#34C759)"],
  ["Lin's Kalshi desk", "+$271K", "68%", "5.9x", "linear-gradient(135deg,#2DAFA0,#FFB300)"],
  ["Microcap Garden", "+$244K", "67%", "5.6x", "#D27EAF"],
  ["BSC Watchtower", "+$221K", "66%", "5.1x", "#5C6AC4"],
  ["Base Trenches", "+$204K", "65%", "4.9x", "#2EA6DA"],
  ["Solana Sensei Room", "+$188K", "64%", "4.6x", "#5DAB35"],
  ["Onchain Runners", "+$171K", "63%", "4.2x", "#E66866"],
  ["Degen Research JP", "+$158K", "62%", "3.9x", "#E0904D"],
  ["Alpha Breakfast", "+$144K", "61%", "3.7x", "#FFB300"],
  ["Liquidity Hunters", "+$132K", "60%", "3.4x", "#2DAFA0"],
  ["Chart Monks", "+$118K", "59%", "3.1x", "#339DFF"],
  ["Perp Scouts", "+$104K", "58%", "2.9x", "#111111"],
  ["Meme Radar", "+$92K", "57%", "2.7x", "#9A5BAA"],
  ["Launchpad Watch", "+$81K", "56%", "2.5x", "#34C759"],
  ["Tokyo Call Hub", "+$74K", "55%", "2.3x", "#5C6AC4"],
  ["Kanto Degens", "+$63K", "54%", "2.1x", "#E0904D"],
  ["Night Shift Alpha", "+$52K", "53%", "1.9x", "#D27EAF"],
];

const CHAT_MESSAGES = {
  cave: [
    { type: "date", label: "Today" },
    { type: "msg", user: "cryptokid.sol", userId: 0, text: "$DEGEN rotation cooled off. Looking for cleaner new pairs.", time: "17:58" },
    { type: "own", text: "watching that pump address now", time: "18:02" },
    { type: "call", caller: CALLERS[0], token: TOKENS[0], time: "18:04" },
    { type: "msg", user: "haru", userId: 4, text: "$DITT has real holders and no ugly sniper cluster", time: "18:11" },
  ],
  tony: [
    { type: "date", label: "Today" },
    { type: "msg", user: "Tony", userId: 6, text: "BTC price is holding the 101.2K shelf. If it accepts above 102.4K, I expect a push into 104K.", time: "18:00" },
    { type: "token", token: MARKET_TOKENS.BTC },
    { type: "msg", user: "Tony", userId: 6, text: "TSLA perp is a momentum long only. I want continuation while Nasdaq stays bid, invalidation below the premarket low.", time: "18:09" },
    { type: "token", token: MARKET_TOKENS.TSLA },
    { type: "msg", user: "Tony", userId: 6, text: "SOL is the laggard. If BTC stalls, SOL probably flushes first. I only like it after funding cools down.", time: "18:14" },
    { type: "token", token: MARKET_TOKENS.SOL },
    { type: "msg", user: "Tony", userId: 6, text: "Priority for now: BTC long above support, TSLA scalp if equities keep squeezing, no SOL chase.", time: "18:18" },
  ],
  lin: [
    { type: "date", label: "Today" },
    { type: "msg", user: "Lin", userId: 5, text: "FOMC cut odds moved too far after the morning speaker. I am fading the spike.", time: "18:03" },
    { type: "token", token: MARKET_TOKENS.FOMC },
    { type: "msg", user: "Lin", userId: 5, text: "CPI under 3.0 still has room if energy keeps softening, but size it like a headline market.", time: "18:10" },
    { type: "token", token: MARKET_TOKENS.CPI },
    { type: "msg", user: "Lin", userId: 5, text: "Yes. Small positions. These markets reprice violently on headlines.", time: "18:17" },
  ],
};

const NOTIFICATIONS = [
  { title: "Trade Executed", body: "Bought 0.5 SOL of $DEGEN", time: "2m", color: "#34C759" },
  { title: "cryptokid.sol called", body: "$SHILL - MC $180K - 3.2x potential", time: "14m", color: U[0] },
  { title: "Price Alert Triggered", body: "$DEGEN hit +200% target", time: "1h", color: "#FFB300" },
  { title: "Agent Auto-Traded", body: "Bought 0.3 SOL $BONK via alphahunter", time: "2h", color: U[4] },
];

const tokenBySymbol = (symbol) => {
  const key = String(symbol || "").replace("$", "").toUpperCase();
  return ALL_TOKENS.find((token) => token.ticker.replace("$", "").toUpperCase() === key || token.name.toUpperCase() === key) || TOKENS[0];
};
const tokenDescription = (token) => {
  if (token.description) return token.description;
  if (token.marketType === "prediction") return token.question || `${token.name} prediction market on ${token.market}.`;
  if (token.name.includes("Perp")) return `${token.name} is tracked from Hyperliquid call flow with live perp price, volume, and liquidation context.`;
  return `${token.name} is moving through Daikogram calls with live market, liquidity, and holder activity.`;
};
const callerFromMessage = (message) => {
  if (!message?.user) return null;
  if (message.user === "haru") return HARU_CALLER;
  return GROUP_CALLERS.find((caller) => caller.name === message.user) || {
    ...callerProfileDefaults(message.user, message.userId),
    id: message.userId,
    name: message.user,
    color: callerColor(message.userId || 0),
    meta: "Group member",
    wr: "58%",
    avg: "2.1x",
    pnl: "+$1.2K",
    calls: 12,
    wins: 7,
    losses: 5,
    followers: "320",
  };
};
const callerColor = (id) => U[id % U.length];
const callerWalletAddress = (caller) => {
  const seeds = [
    "8J69rbVQZkT7sXv9mPQb4LwH3aNf2YxC6dE1pR5uAaK",
    "3bYkAq9HnVwM7sLpQ4cT8Dr6ZxF2uNgPjE5mSaR1oKL",
    "Gm7Rk2pQvL9xHaT5dC4nEw8YuB3sZfPq6JcM1tN9aV",
    "5CtPqN8vYxL3mRa6KeF9sDg2WbU4hZjQp7AnT1cVsE",
    "CAVEharuHiddenWalletMode1111111111111111111111",
  ];
  return seeds[(caller?.id || 0) % seeds.length];
};
const tokenInitial = (token) => token.ticker.replace("$", "").slice(0, 1);
const tokenDisplay = (token) => token.marketType === "prediction" ? token.name : token.ticker;
const CALL_MESSAGES = [
  "Clean early flow. I like this while liquidity keeps building.",
  "Entry is only valid if volume follows through in the next hour.",
  "Small size. Good chart, but do not chase the first candle.",
  "This one has the right holder mix for a second leg.",
  "Momentum is strong, taking profit into the next spike.",
  "Risk is higher here. Invalidation is below the last consolidation.",
  "Whales are rotating in. Watching for a clean breakout.",
  "Narrative is early and the market cap still gives room.",
  "I am fading the crowd here unless buyers reclaim the prior high.",
  "Good setup, but keep stop tight because liquidity is thin.",
  "Looks like a stealth accumulation range before the next push.",
  "Bad entry if you are late. Only scaling on pullbacks.",
];
const callMessageFor = (seed = 0) => CALL_MESSAGES[Math.abs(seed) % CALL_MESSAGES.length];

function Icon({ name, size = 24 }) {
  const paths = {
    chats: "M4 5.5C4 4.7 4.7 4 5.5 4h13c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5H8l-4 4v-14.5z",
    calls: "M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z",
    home: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8 4a7.9 7.9 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2-1.2L15.2 3H8.8l-.4 2.7a8 8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7.9 7.9 0 0 0 4 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2 1.2l.4 2.7h6.4l.4-2.7a8 8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
    search: "M11 19a8 8 0 1 1 5.7-2.3L21 21",
    bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
    edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
    back: "M15 18l-6-6 6-6",
    history: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2",
    star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z",
    share: "M12 3v12M7 8l5-5 5 5M5 13v6h14v-6",
    deposit: "M12 3v12M7 10l5 5 5-5M5 19h14",
    import: "M4 12h12M11 7l5 5-5 5M20 5v14",
    send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z",
    x: "M18 6 6 18M6 6l12 12",
    chevronDown: "m6 9 6 6 6-6",
    plus: "M12 5v14M5 12h14",
    mic: "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3",
    paperclip: "M21.4 11.1 12.2 20.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5",
    trade: "M7 7h11l-3-3M17 17H6l3 3M18 7 6 0M6 17H0",
    wallet: "M3 7h17a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm0 0V6a2 2 0 0 1 2-2h13M17 13h.01",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c0-4 3.6-7 8-7s8 3 8 7",
    info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 10v7M12 7h.01",
    grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2M20 14h-2M14 20h6M20 20v-6",
    bookmark: "M6 4h12v17l-6-4-6 4V4z",
    devices: "M5 5h8v14H5zM15 8h4v11h-4z",
    folder: "M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z",
    lock: "M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6z",
    camera: "M4 8h4l2-3h4l2 3h4v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || paths.home} />
    </svg>
  );
}

function Avatar({ label, color, size = "md", image }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ background: color }}>
      {image ? <img src={image} alt="" className="avatar-image" /> : label}
    </span>
  );
}

function AvatarGroup({ count, max = 3, size = 18 }) {
  const avatars = Array.from({ length: Math.min(count, max) }, (_, i) => {
    const caller = CALLERS[i % CALLERS.length];
    return { label: caller.name[0].toUpperCase(), color: caller.color, image: callerImage(caller) };
  });
  return (
    <span className="avatar-group">
      <span className="avatar-stack" aria-hidden="true">
        {avatars.map((avatar, index) => (
          <span key={`${avatar.label}-${index}`} className="avatar-mini" style={{ width: size, height: size, background: avatar.color, marginLeft: index ? -5 : 0, fontSize: Math.max(8, size * 0.48) }}>
            <img src={avatar.image} alt="" />
          </span>
        ))}
      </span>
      <span className="mono avatar-count">+{count}</span>
    </span>
  );
}

function Sparkline({ data, color, height = 58, marker }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 180;
  const points = data.map((value, index) => `${(index / (data.length - 1)) * width},${height - ((value - min) / range) * (height - 6) - 3}`);
  const pointPairs = points.map((point) => point.split(",").map(Number));
  const markerIndex = marker ? Math.min(Math.max(marker.index ?? data.length - 1, 0), data.length - 1) : null;
  const markerPoint = marker ? pointPairs[markerIndex] : null;
  const markerX = markerPoint ? Math.max(0, Math.min(width, markerPoint[0] + (marker.offsetX || 0))) : null;
  const markerY = markerPoint ? (() => {
    const nextIndex = pointPairs.findIndex(([x]) => x >= markerX);
    if (nextIndex <= 0) return pointPairs[0][1];
    const [x1, y1] = pointPairs[nextIndex - 1];
    const [x2, y2] = pointPairs[nextIndex];
    const t = (markerX - x1) / (x2 - x1 || 1);
    return y1 + (y2 - y1) * t;
  })() : null;
  const fill = `${points.join(" ")} ${width},${height} 0,${height}`;
  const id = `spark-${data.join("-").replace(/\W/g, "")}`;
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sparkline">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${id})`} />
      <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {markerPoint ? (
        <g>
          <circle cx={markerX} cy={markerY} r="4.2" fill="#FF3B30" stroke="#fff" strokeWidth="1.4" />
          {marker.label ? <text x={Math.min(markerX + 7, width - 52)} y={Math.max(markerY - 6, 10)} className="spark-marker-label">{marker.label}</text> : null}
        </g>
      ) : null}
    </svg>
  );
}

function LiveSparkline({ data, color, height = 44, marker }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1600);
    return () => window.clearInterval(id);
  }, []);
  const liveData = useMemo(() => data.map((value, index) => {
    const phase = tick % 24;
    const wave = Math.sin((phase + index) * 0.42) * 3.1;
    const drift = phase * 0.35;
    const pulse = index === data.length - 1 ? (tick % 2 ? 3.2 : -1.4) : 0;
    const trend = index > data.length - 4 ? drift : 0;
    return Math.max(1, value + wave + pulse + trend);
  }), [data, tick]);
  const liveMarker = marker ? { ...marker, offsetX: -((tick % 24) * 1.8) } : null;
  return <Sparkline data={liveData} color={color} height={height} marker={liveMarker} />;
}

function LivePrice({ price }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1500);
    return () => window.clearInterval(id);
  }, []);
  const live = useMemo(() => {
    const raw = String(price);
    const numeric = Number(raw.replace(/[$,¢]/g, ""));
    if (!Number.isFinite(numeric)) return { text: raw, direction: "up" };
    const priceSteps = [0.0024, -0.0016, 0.0031, 0.0012, -0.0022, 0.004, -0.0009, 0.0028, -0.003, 0.0017, 0.0035, -0.0011, 0.0046, -0.0025, 0.0021, 0.0008];
    const visibleSteps = [2, -1, 3, 1, -2, 4, -1, 2, -3, 1, 3, -1, 4, -2, 2, 1];
    const move = priceSteps[tick % priceSteps.length];
    const decimals = raw.includes(".") ? Math.min(raw.split(".")[1].replace(/[^0-9]/g, "").length, 6) : 0;
    const displayUnit = raw.includes("¢") ? 1 : 10 ** -decimals;
    const visibleMove = visibleSteps[tick % visibleSteps.length] * displayUnit;
    const marketMove = numeric * move;
    const next = Math.max(0, numeric + (Math.abs(marketMove) > Math.abs(visibleMove) ? marketMove : visibleMove));
    const direction = next >= numeric ? "up" : "down";
    const text = raw.includes("¢") ? `${next.toFixed(0)}¢` : `$${next.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    return { text, direction };
  }, [price, tick]);
  return <b className={`mono live-price ${live.direction}`}>{live.text}</b>;
}

function Candles() {
  const candles = [
    { o: 40, h: 55, l: 35, c: 50 }, { o: 50, h: 60, l: 45, c: 44 }, { o: 44, h: 52, l: 40, c: 48 },
    { o: 48, h: 58, l: 46, c: 56 }, { o: 56, h: 62, l: 50, c: 52 }, { o: 52, h: 54, l: 42, c: 45 },
    { o: 45, h: 50, l: 38, c: 47 }, { o: 47, h: 55, l: 44, c: 53 }, { o: 53, h: 60, l: 48, c: 58 },
    { o: 58, h: 65, l: 55, c: 62 }, { o: 62, h: 68, l: 58, c: 60 }, { o: 60, h: 63, l: 52, c: 54 },
    { o: 54, h: 59, l: 50, c: 57 }, { o: 57, h: 64, l: 53, c: 61 }, { o: 61, h: 66, l: 56, c: 58 },
  ];
  const height = 160;
  const width = 320;
  const candleWidth = 10;
  const gap = 8;
  const values = candles.flatMap((candle) => [candle.h, candle.l]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const scale = (value) => height - ((value - min) / (max - min)) * (height - 18) - 9;
  return (
    <svg className="candles" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Candlestick chart">
      {[0.25, 0.5, 0.75].map((p) => <line key={p} x1="0" y1={height * p} x2={width} y2={height * p} className="candle-grid" />)}
      {candles.map((candle, index) => {
        const x = index * (candleWidth + gap) + 12;
        const green = candle.c >= candle.o;
        const color = green ? "#34C759" : "#FF3B30";
        const top = scale(Math.max(candle.o, candle.c));
        const bottom = scale(Math.min(candle.o, candle.c));
        return (
          <g key={index}>
            <line x1={x + candleWidth / 2} y1={scale(candle.h)} x2={x + candleWidth / 2} y2={scale(candle.l)} stroke={color} strokeWidth="1" />
            <rect x={x} y={top} width={candleWidth} height={Math.max(bottom - top, 1)} rx="1" fill={color} stroke={color} />
          </g>
        );
      })}
    </svg>
  );
}

function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-time mono">18:36</div>
      <div className="dynamic-island"><span>D</span><b>DAIKOGRAM</b></div>
      <div className="status-icons">
        <span className="signal"><i /><i /><i /><i /></span>
        <span className="wifi" />
        <span className="battery"><span /></span>
      </div>
    </div>
  );
}

function AuthStatusBar({ back, onBack }) {
  return (
    <div className="auth-status-bar">
      <div className="auth-status-time">11:30</div>
      {back ? <button className="auth-back" type="button" onClick={onBack} aria-label="Back"><Icon name="back" size={34} /></button> : null}
      <div className="auth-status-icons">
        <span className="signal"><i /><i /><i /><i /></span>
        <b>5G</b>
        <span className="auth-battery"><b>89</b><i /></span>
      </div>
    </div>
  );
}

function AuthLogo({ small = false }) {
  return (
    <span className={`auth-logo ${small ? "small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 96 96">
        <path d="M73 25 23 46c-3 1.3-2.9 5.7.2 6.8l13.5 4.7 5.2 16.4c.9 2.9 4.8 3.4 6.4.8l7.6-12.2 14.8 11c2.5 1.8 6 .4 6.6-2.6l8.5-40.6c.7-3.5-3.6-6.8-6.8-5.3zM39.4 54.5 70 34.8 46.1 61.7l-1.4 8.5-5.3-15.7z" />
      </svg>
    </span>
  );
}

function AuthScreen({ onDone }) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const normalizedPhone = phone.replace(/\D/g, "");
  const formattedPhone = `+1 ${normalizedPhone || "4155550198"}`;
  const submitPhone = (event) => {
    event.preventDefault();
    if (normalizedPhone.length < 5) return;
    setStep("code");
  };
  const updateCode = (value) => {
    const next = value.replace(/\D/g, "").slice(0, 5);
    setCode(next);
    if (next.length === 5) window.setTimeout(onDone, 120);
  };

  if (step === "code") {
    return (
      <main className="auth-screen">
        <AuthStatusBar back onBack={() => setStep("phone")} />
        <section className="auth-code-panel">
          <AuthLogo small />
          <h1>{formattedPhone}</h1>
          <p>We have sent you a message with the code<br />to the number above.</p>
          <label className="code-input-wrap">
            <input value={code} onChange={(event) => updateCode(event.target.value)} inputMode="numeric" autoComplete="one-time-code" autoFocus aria-label="Confirmation code" />
            <span className="code-boxes" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => <i key={index} className={code[index] ? "filled" : ""}>{code[index] || ""}</i>)}
            </span>
          </label>
          <div className="auth-resend">Resend code in <b>0:60</b></div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <AuthStatusBar />
      <form className="auth-phone-panel" onSubmit={submitPhone}>
        <AuthLogo />
        <h1>Daikogram</h1>
        <p>Please confirm your country code<br />and enter your phone number.</p>
        <div className="auth-field country">
          <span>🇺🇸</span>
          <strong>United States</strong>
          <em>+1</em>
          <Icon name="back" size={26} />
        </div>
        <label className="auth-field phone">
          <strong>+1</strong>
          <i />
          <input value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^\d ]/g, ""))} inputMode="tel" autoComplete="tel-national" placeholder="Phone Number" autoFocus />
        </label>
        <button className="auth-next" type="submit" disabled={normalizedPhone.length < 5}>Next</button>
      </form>
    </main>
  );
}

function HomeHeader({ title = "Daikogram", onDiscover, onNotify, onBack }) {
  return (
    <header className="home-header">
      <button className="pill nav-pill text-pill" onClick={onBack || onDiscover} type="button">{onBack ? "Back" : "Edit"}</button>
      <div className="center-title">
        <span className="app-logo">D</span>
        <span>{title}</span>
      </div>
      <button className="pill nav-pill icon-pill" onClick={onNotify || onDiscover} type="button" aria-label={onNotify ? "Notifications" : "Search"}>
        <Icon name={onNotify ? "bell" : "search"} size={21} />
      </button>
    </header>
  );
}

function TelegramHeader({ title, leftLabel = "Edit", rightIcon = "plus", onLeft, onRight, children }) {
  return (
    <header className="telegram-header">
      <button className="pill nav-pill text-pill" type="button" onClick={onLeft}>{leftLabel}</button>
      <div className="telegram-title">{children || title}</div>
      <button className="pill nav-pill icon-pill" type="button" onClick={onRight} aria-label={rightIcon}>
        <Icon name={rightIcon} size={24} />
      </button>
    </header>
  );
}

function HeaderSegment({ value, onChange, items }) {
  return (
    <div className="header-segment">
      {items.map((item) => (
        <button key={item} type="button" className={value === item ? "active" : ""} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

function ChatHeader({ title, meta, color, onBack, onProfile }) {
  return (
    <header className="chat-header">
      <button className="pill chat-back" onClick={onBack} type="button" aria-label="Back">
        <Icon name="back" size={21} />
        <span className="unread-badge">9</span>
      </button>
      <button className="pill chat-title-pill" onClick={onProfile} type="button">
        <span>{title}</span>
        {meta ? <small>{meta}</small> : null}
      </button>
      <button className="avatar-button" onClick={onProfile} type="button" aria-label="Open profile">
        <Avatar label={title[0]} color={color} size="sm" />
      </button>
    </header>
  );
}

function SearchField({ value, onChange, placeholder = "Search" }) {
  return (
    <label className="search-field">
      <Icon name="search" size={15} />
      <input value={value || ""} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function SectionLabel({ children }) {
  return <div className="section-label">{children}</div>;
}

function Card({ children, className = "" }) {
  return <div className={`tg-card ${className}`}>{children}</div>;
}

function Row({ children, onClick, className = "" }) {
  return (
    <button className={`tg-row ${className}`} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function FilterChips({ items, active, onChange }) {
  return (
    <div className="chip-row">
      {items.map((item) => (
        <button key={item} type="button" className={`filter-chip ${active === item ? "active" : ""}`} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

function PortfolioHero() {
  return (
    <Card className="portfolio-hero">
      <div className="hero-tag">Daikogram Wallet <span>Hidden from contacts</span></div>
      <div className="balance mono">$12,847<span>.50</span></div>
      <div className="delta-pill mono">▲ +$612.40 - +12.4%</div>
      <Sparkline data={[38, 40, 39, 43, 49, 47, 55, 61, 59, 67, 75, 83, 91, 89, 98, 105]} color="#34C759" height={58} />
      <div className="action-row">
        <button type="button" className="action-button primary"><Icon name="deposit" size={18} />Deposit</button>
        <button type="button" className="action-button"><Icon name="import" size={18} />Import</button>
        <button type="button" className="action-button"><Icon name="send" size={18} />Send</button>
      </div>
    </Card>
  );
}

function TrendRow({ token, onOpen, onBuy }) {
  const positive = token.change.startsWith("+");
  return (
    <div className="trend-row">
      <button className="trend-main" type="button" onClick={onOpen}>
        <Avatar label={token.ticker[1]} color={token.color} size="md" image={tokenImage(token)} />
        <span className="trend-copy">
          <span className="trend-title">
            <b>{token.ticker}</b>
            <em className={`mono ${positive ? "green" : "red"}`}>{token.change}</em>
          </span>
          <span className="trend-subline">
            <span>MC <span className="mono">{token.mc}</span></span>
            <i className="square-dot" />
            <AvatarGroup count={token.calls} />
          </span>
        </span>
      </button>
      <span className="trend-side">
        <Sparkline data={token.data} color={positive ? "#34C759" : "#FF3B30"} height={22} />
      </span>
    </div>
  );
}

function CallerRow({ caller, rank, onClick }) {
  return (
    <Row onClick={onClick} className="caller-row">
      <span className={`rank mono ${rank === 1 ? "gold" : ""}`}>{rank}</span>
      <Avatar label={caller.name[0].toUpperCase()} color={caller.color} size="sm" image={callerImage(caller)} />
      <span className="row-copy">
        <b>{caller.name}</b>
        <small><span className="mono">WR {caller.wr}</span> - Avg <span className="mono">{caller.avg}</span></small>
      </span>
      <span className="right-stat">
        <b className="mono green">{caller.pnl}</b>
        <small>30d PnL</small>
      </span>
    </Row>
  );
}

function ChatListRow({ chat, onClick }) {
  return (
    <Row onClick={onClick} className="telegram-list-row chat-list-row">
      <Avatar label={chat.avatar} color={chat.color} size="md" />
      <span className="row-copy">
        <b>{chat.title} {chat.muted ? <span className="muted-dot">muted</span> : null}</b>
        <small>{chat.message}</small>
      </span>
      <span className="chat-meta">
        <small className="mono">{chat.time}</small>
        {chat.unread ? <b>{chat.unread}</b> : chat.pinned ? <span>pin</span> : null}
      </span>
    </Row>
  );
}

function ContactRow({ contact }) {
  return (
    <Row className="telegram-list-row contact-row">
      <Avatar label={contact.avatar} color={contact.color} size="md" />
      <span className="row-copy">
        <b>{contact.name} {contact.star ? <span className="star">★</span> : null}</b>
        <small>{contact.meta}</small>
      </span>
    </Row>
  );
}

function CallRow({ call }) {
  return (
    <Row className="telegram-list-row call-row">
      <span className="call-kind"><Icon name={call.video ? "grid" : "calls"} size={20} /></span>
      <Avatar label={call.avatar} color={call.color} size="md" />
      <span className="row-copy">
        <b>{call.name}</b>
        <small>{call.detail}</small>
      </span>
      <span className="call-date">{call.date}</span>
      <span className="info-button"><Icon name="info" size={24} /></span>
    </Row>
  );
}

function SettingsRow({ item }) {
  return (
    <Row className="settings-row">
      <span className="settings-icon" style={{ background: item.color }}>
        <Icon name={item.icon} size={22} />
      </span>
      <span className="row-copy"><b>{item.label}</b></span>
      {item.value ? <span className="settings-value">{item.value}</span> : null}
      <span className="chevron">›</span>
    </Row>
  );
}

function CallCard({ caller, token, onTrade, onCaller }) {
  const tags = token.ticker === "$DEGEN"
    ? [["bad", "Bundle 15%"], ["warn", "Sniper 7%"], ["good", "Liq OK"]]
    : [["good", "Bundle 2%"], ["warn", "Sniper 8%"], ["good", "Liq ok"]];
  return (
    <div className="call-message">
      <button className="call-avatar" type="button" onClick={onCaller} style={{ background: caller.color }}>
        <img src={callerImage(caller)} alt="" />
      </button>
      <div className="call-card">
        <button className="call-sender" type="button" onClick={onCaller} style={{ color: caller.color }}>
          {caller.name}<span>- Top 10% - WR {caller.wr}</span>
        </button>
        <div className="call-token-row">
          <Avatar label={token.ticker[1]} color={token.color} size="sm" image={tokenImage(token)} />
          <span>
            <b>{token.ticker}</b>
            <small>{token.name}</small>
          </span>
          <span className="price-side">
            <LivePrice price={token.price} />
            <small className={`mono ${token.change.startsWith("+") ? "green" : "red"}`}>{token.change}</small>
          </span>
        </div>
        <div className="call-stats">
          {[["MC", token.mc], ["Vol 24h", token.vol], ["ATH", token.ath], ["Liq", token.liq]].map(([label, value]) => (
            <span key={label}><small>{label}</small><b className="mono">{value}</b></span>
          ))}
        </div>
        <LiveSparkline data={token.data} color={token.change.startsWith("+") ? "#34C759" : "#FF3B30"} height={44} marker={token.ticker === "$DEGEN" ? { index: Math.floor(token.data.length / 2) } : null} />
        <div className="tag-row">
          {tags.map(([kind, label]) => <span key={label} className={`tag ${kind}`}>{label}</span>)}
        </div>
        <button type="button" className="call-cta" onClick={onTrade}>Trade {token.ticker}</button>
        <time>14:30</time>
      </div>
    </div>
  );
}

function ChatTokenCard({ token, onTrade, own = true, sender }) {
  const isPrediction = token.marketType === "prediction";
  return (
    <div className={`chat-token-card-wrap ${own ? "own" : "incoming"}`}>
      {!own ? <Avatar label={(sender || "T")[0].toUpperCase()} color={sender === "Lin" ? U[5] : "#111"} size="xs" image={callerImage({ name: sender || "Tony", color: sender === "Lin" ? U[5] : "#111" })} /> : null}
      <button className={`chat-token-card ${isPrediction ? "prediction-card" : ""}`} type="button" onClick={onTrade}>
        {!own && sender ? <div className="chat-token-sender">{sender}</div> : null}
        <div className="chat-token-head">
          <Avatar label={tokenInitial(token)} color={token.color} size="sm" image={tokenImage(token)} />
          <span>
            <b>{tokenDisplay(token)}</b>
            <small>{isPrediction ? `${token.market} prediction market` : token.name}</small>
          </span>
          <strong><LivePrice price={token.price} /></strong>
        </div>
        {isPrediction ? <p className="prediction-question">{token.question}</p> : null}
        <div className="chat-token-stats">
          {(isPrediction ? [["Chance", token.price], ["Volume", token.vol], ["High", token.ath], ["Open int.", token.liq]] : [["MC", token.mc], ["Vol 24h", token.vol], ["ATH", token.ath], ["Liq", token.liq]]).map(([label, value]) => (
            <span key={label}><small>{label}</small><b className="mono">{value}</b></span>
          ))}
        </div>
        <LiveSparkline data={token.data} color={token.change.startsWith("+") ? "#34C759" : "#FF3B30"} height={44} marker={token.ticker === "$DITT" ? { index: token.data.length - 1 } : null} />
        <div className="tag-row">
          {isPrediction ? (
            <>
              <span className="tag good">High liquidity</span>
              <span className="tag warn">Headline risk</span>
              <span className="tag good">Kalshi</span>
            </>
          ) : (
            <>
              <span className="tag good">Bundle 2%</span>
              <span className="tag warn">Sniper 8%</span>
              <span className="tag good">Liq ok</span>
            </>
          )}
        </div>
        <div className="chat-token-cta">{isPrediction ? "Open market" : `Buy ${token.ticker}`}</div>
        <time>{own ? "now ✓✓" : "now"}</time>
      </button>
    </div>
  );
}

function MessageBubble({ message, onOpenCaller }) {
  if (message.type === "date") return <div className="date-pill">{message.label}</div>;
  if (message.type === "call") return <CallCard caller={message.caller} token={message.token} />;
  if (message.type === "token") return <ChatTokenCard token={message.token} onTrade={message.onTrade} />;
  if (message.type === "own") {
    return (
      <div className="bubble-line own">
        <div className="bubble own-bubble">
          <p>{message.text}</p>
          <span className="bubble-time">{message.time} <b>✓✓</b></span>
        </div>
      </div>
    );
  }
  const color = callerColor(message.userId);
  const caller = callerFromMessage(message);
  return (
    <div className="bubble-line">
      <button className="message-avatar-button" type="button" onClick={() => caller && onOpenCaller?.(caller)} aria-label={`Open ${message.user} profile`}>
        <Avatar label={message.user[0].toUpperCase()} color={color} size="xs" image={caller ? callerImage(caller) : undefined} />
      </button>
      <div className="bubble">
        <b style={{ color }}>{message.user}</b>
        <p>{message.text}</p>
        <span className="bubble-time">{message.time}</span>
      </div>
    </div>
  );
}

function HomeScreen({ openTrade, openDiscover, openCaller, openNotifications, openLeaderboard }) {
  return (
    <>
      <HomeHeader onDiscover={openDiscover} onNotify={openNotifications} />
      <main className="scroll-content">
        <SearchField placeholder="Search tokens, callers, groups" />
        <PortfolioHero onTrade={() => openTrade(TOKENS[0])} />
        <SectionLabel>Trending from your groups</SectionLabel>
        <Card className="list-card">
          {TOKENS.slice(0, 5).map((token) => <TrendRow key={token.ticker} token={token} onOpen={() => openTrade(token)} onBuy={() => openTrade(token)} />)}
        </Card>
        <button className="section-label section-label-button" type="button" onClick={openLeaderboard}>Top callers - 30d</button>
        <Card className="list-card">
          {CALLERS.slice(0, 4).map((caller, index) => <CallerRow key={caller.name} caller={caller} rank={index + 1} onClick={() => openCaller(caller)} />)}
        </Card>
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function ContactsScreen() {
  return (
    <>
      <TelegramHeader title="Contacts" leftLabel="Sort" rightIcon="plus" />
      <main className="scroll-content telegram-page contacts-page">
        <SearchField placeholder="Search" />
        <Card className="plain-list contacts-list">
          <Row className="invite-row">
            <span className="invite-icon"><Icon name="user" size={31} /></span>
            <span>Invite Friends</span>
          </Row>
          {CONTACTS.map((contact) => <ContactRow key={contact.name} contact={contact} />)}
        </Card>
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function ChatsScreen({ openChat }) {
  const [filter, setFilter] = useState("All");
  return (
    <>
      <TelegramHeader leftLabel="Edit" rightIcon="edit">
        <span className="chat-title-logo"><span className="app-logo ringed">D</span>Chats</span>
      </TelegramHeader>
      <main className="scroll-content telegram-page chats-page">
        <SearchField placeholder="Search" />
        <div className="wide-segment">
          {["All", "mentors", "Homie Groups", "DEGEN"].map((item) => (
            <button key={item} type="button" className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}{item === "Homie Groups" ? <span>1</span> : null}
            </button>
          ))}
        </div>
        <Card className="plain-list">
          {CHATS.map((chat) => <ChatListRow key={chat.title} chat={chat} onClick={() => openChat(chat)} />)}
        </Card>
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function ChatScreen({ chat, onBack, openGroup, openTrade, openCaller, focusCallKey }) {
  const [draft, setDraft] = useState(chat.id === "cave" ? "2R2F91ewRgZ6R33TcCDebK6Lh6pVTzAKgiURcpgVpump" : "");
  const [localMessages, setLocalMessages] = useState(() => CHAT_MESSAGES[chat.id] || MESSAGES);
  const callRefs = useRef({});
  useEffect(() => {
    setLocalMessages(CHAT_MESSAGES[chat.id] || MESSAGES);
    setDraft(chat.id === "cave" ? "2R2F91ewRgZ6R33TcCDebK6Lh6pVTzAKgiURcpgVpump" : "");
  }, [chat.id]);
  useEffect(() => {
    if (!focusCallKey) return;
    callRefs.current[focusCallKey]?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [focusCallKey]);
  return (
    <div className="chat-screen" style={{ backgroundImage: `url(${chatPattern})` }}>
      <ChatHeader title={chat.title} meta={chat.meta ?? "1,247 members, 89 online"} color={chat.color} onBack={onBack} onProfile={openGroup} />
      <div className="chat-wallpaper">
        {localMessages.map((message, index) => {
          if (message.type === "call") {
            const callKey = `${message.caller.name}-${message.token.ticker}`;
            return (
              <div key={index} ref={(node) => { if (node) callRefs.current[callKey] = node; }} className={focusCallKey === callKey ? "focused-call-message" : ""}>
                <CallCard caller={message.caller} token={message.token} onTrade={() => openTrade(message.token)} onCaller={() => openCaller(message.caller)} />
              </div>
            );
          }
          if (message.type === "token") {
            const isOwnToken = chat.id === "cave";
            return <ChatTokenCard key={index} token={message.token} onTrade={() => openTrade(message.token)} own={isOwnToken} sender={chat.id === "tony" ? "Tony" : chat.id === "lin" ? "Lin" : undefined} />;
          }
          return <MessageBubble key={index} message={message} onOpenCaller={openCaller} />;
        })}
      </div>
      <form className="chat-input" onSubmit={(event) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text) return;
        if (text === "2R2F91ewRgZ6R33TcCDebK6Lh6pVTzAKgiURcpgVpump") {
          setLocalMessages((items) => [...items, { type: "token", token: DITT_TOKEN }]);
        } else {
          setLocalMessages((items) => [...items, { type: "own", text, time: "now" }]);
        }
        setDraft("");
      }}>
        <label className="chat-compose">
          <Icon name="paperclip" size={22} />
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message" />
          <span>:-)</span>
        </label>
        <button className="mic-button" type="submit" aria-label="Send message"><Icon name={draft ? "plus" : "mic"} size={21} /></button>
      </form>
    </div>
  );
}

function DiscoverScreen({ onBack, openTrade }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => TOKENS.filter((token) => `${token.ticker} ${token.name}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <>
      <HomeHeader title="Discover" onBack={onBack} onNotify={() => {}} />
      <main className="scroll-content">
        <SearchField value={query} onChange={setQuery} placeholder="Search tokens, callers..." />
        <FilterChips items={["trending", "new", "top", "watchlist"]} active="trending" onChange={() => {}} />
        <SectionLabel>{query ? "Search results" : "Trending tokens"}</SectionLabel>
        <Card className="list-card">
          {filtered.map((token) => <TrendRow key={token.ticker} token={token} onOpen={() => openTrade(token)} onBuy={() => openTrade(token)} />)}
        </Card>
        <SectionLabel>Recommended callers</SectionLabel>
        <Card className="list-card">
          {CALLERS.map((caller, index) => <CallerRow key={caller.name} caller={caller} rank={index + 1} onClick={() => {}} />)}
        </Card>
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function TokenAvatar({ token, size = "lg" }) {
  return (
    <span className={`token-avatar token-avatar-${size}`} style={{ background: token.color }} aria-hidden="true">
      <img src={tokenImage(token)} alt="" />
      <span className="verified-dot">✓</span>
    </span>
  );
}

function TokenLineChart({ token, compact = false, showCallers = false, onOpenCaller }) {
  const source = token.data.length > 20 ? token.data : token.data.flatMap((value, index) => [value, value + (index % 2 ? -3 : 4), value + (index % 3 ? 2 : -5)]);
  const data = source.slice(0, 50);
  const positive = token.change.startsWith("+");
  const chartColor = positive ? "#34C759" : "#FF3B30";
  const width = 390;
  const height = compact ? 178 : 390;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data.map((value, index) => `${(index / (data.length - 1)) * width},${height - ((value - min) / (max - min)) * (height - 34) - 17}`);
  const fill = `${points.join(" ")} ${width},${height} 0,${height}`;
  const callerMarkers = showCallers ? CALLERS.slice(0, 4).map((caller, index) => {
    const markerIndexes = [7, 15, 24, 34];
    const point = points[Math.min(markerIndexes[index], points.length - 1)].split(",").map(Number);
    return { caller, point };
  }) : [];
  return (
    <svg className={`token-chart ${compact ? "compact" : ""}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${token.ticker} price chart`}>
      <defs>
        <pattern id="token-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgba(60,60,67,0.10)" />
        </pattern>
        <linearGradient id="token-chart-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={chartColor} stopOpacity="0.20" />
          <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#token-grid)" />
      <polygon points={fill} fill="url(#token-chart-fill)" />
      <polyline points={points.join(" ")} fill="none" stroke={chartColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {callerMarkers.map(({ caller, point }) => (
        <g
          className="token-caller-marker"
          key={caller.name}
          role="button"
          tabIndex="0"
          aria-label={`Open ${caller.name} profile`}
          transform={`translate(${point[0]}, ${point[1]})`}
          onClick={() => onOpenCaller?.(caller)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onOpenCaller?.(caller);
          }}
        >
          <clipPath id={`caller-clip-${caller.id}`}><circle r="14" /></clipPath>
          <image href={callerImage(caller)} x="-14" y="-14" width="28" height="28" clipPath={`url(#caller-clip-${caller.id})`} />
          <circle r="14" fill="none" stroke="#fff" strokeWidth="3" />
        </g>
      ))}
      <circle cx={width - 1} cy={points[points.length - 1].split(",")[1]} r="7" fill={chartColor} />
    </svg>
  );
}

function TokenTopBar({ token, onBack, compact = false }) {
  return (
    <header className={`token-topbar ${compact ? "compact" : ""}`}>
      <button className="token-icon-button" type="button" onClick={onBack} aria-label="Back"><Icon name="back" size={28} /></button>
      <TokenAvatar token={token} size="md" />
      <div className="token-title-block">
        <strong>{token.ticker.replace("$", "")} <span className="chain-pill">=</span></strong>
        <span>{token.name} <small>□</small></span>
      </div>
      <div className="token-actions">
        <div className="token-price-mini">
          <strong className="mono">{token.price}</strong>
          <span className={`mono ${token.change.startsWith("+") ? "up" : "down"}`}>{token.change.replace("+", "")}</span>
        </div>
      </div>
    </header>
  );
}

function TokenTabBar({ active, onChange }) {
  return (
    <div className="token-tabs" role="tablist" aria-label="Token sections">
      {["Calls", "About"].map((item) => (
        <button key={item} type="button" role="tab" className={active === item ? "active" : ""} onClick={() => onChange(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

function TokenTimeframes() {
  return (
    <div className="token-timeframes">
      {["1H", "4H", "1D", "7D", "3M", "ALL"].map((item, index) => <button key={item} type="button" className={index === 0 ? "active" : ""}>{item}</button>)}
      <span className="token-tf-divider" />
      <button className="candle-toggle" type="button" aria-label="Candles"><i /><i /><i /></button>
    </div>
  );
}

function HolderRow({ name, value, change, note, avatar, down = false }) {
  return (
    <div className="holder-row">
      <span className="holder-avatar" style={{ background: avatar }}>{name.slice(0, 1)}</span>
      <div className="holder-copy">
        <strong>{name}</strong>
        <span>◷ {down ? "1d 8h" : "2d 16h"} avg. hold</span>
        {note ? <em>{note}</em> : null}
      </div>
      <div className="holder-value">
        <strong className="mono">{value}</strong>
        <span className={`mono ${down ? "down" : "up"}`}>{down ? "▼" : "▲"} {change}</span>
      </div>
    </div>
  );
}

function TokenCallRow({ caller, token, index, onOpen }) {
  const mc = ["$34K", "$58K", "$81K", "$120K"][index % 4];
  const times = ["2 hours ago", "4 hours ago", "Yesterday", "04/30"];
  const groups = ["CAVE meme alpha group", "Daiko Factory", "SOLTRENDING", "KOLscope"];
  return (
    <button className="token-call-row" type="button" onClick={() => onOpen(caller, token)}>
      <Avatar label={caller.name[0].toUpperCase()} color={caller.color} size="sm" image={callerImage(caller)} />
      <div>
        <strong>{caller.name}</strong>
        <span>Called at <b className="mono">{mc}</b></span>
        <p className="call-message-preview">{callMessageFor(index)}</p>
        <p>{times[index % times.length]} · {groups[index % groups.length]}</p>
      </div>
      <em className="mono">{caller.wr} WR</em>
    </button>
  );
}

function TokenAboutContent({ token }) {
  const stats = token.marketType === "prediction" ? [
    ["Market", token.market || "Kalshi"],
    ["Chance", token.price],
    ["Volume", token.vol],
    ["Open interest", token.liq],
    ["High", token.ath],
    ["Updated", "Live"],
    ["Category", "Prediction"],
    ["Settlement", "Event result"],
  ] : [
    ["Market cap", token.mc],
    ["24h volume", token.vol],
    ["Liquidity", token.liq],
    ["ATH", token.ath],
    ["Supply", token.supply || "999.8M"],
    ["Created", token.created || "6 mo. ago"],
    ["Launchpad", token.launchpad || "Pump.fun"],
    ["Blockchain", token.chain || "Solana"],
    ["Contract address □", token.address || "8J69rb...R"],
  ];
  return (
    <div className="token-about">
      <div className="token-description">
        <div><h2>Description</h2><button type="button"><Icon name="search" size={20} />Search on Twitter</button></div>
        <p>{tokenDescription(token)}</p>
        <div className="token-links">
          {["Website", "Twitter", "Telegram"].map((item) => <button key={item} type="button">{item}</button>)}
        </div>
      </div>
      <div className="token-transactions">
        <div className="token-section-head"><h2>Transactions</h2><span>5M <b>1H</b> 1D</span></div>
        {[[["334", "buys"], ["271", "sells"]], [["$43.3K", "vol."], ["$55.1K", "vol."]], [["168", "buyers"], ["183", "sellers"]]].map((row, index) => (
          <div className="tx-row" key={index}>
            <div><strong>{row[0][0]}</strong> <span>{row[0][1]}</span></div>
            <div><strong>{row[1][0]}</strong> <span>{row[1][1]}</span></div>
            <span className="tx-bars"><i /><i /></span>
          </div>
        ))}
      </div>
      <div className="token-stats-list">
        <h2>Stats</h2>
        {stats.map(([label, value]) => <div key={label}><span>{label}</span><i /><strong>{value}</strong></div>)}
      </div>
    </div>
  );
}

function TokenDetailScreen({ token, onBack, onBuy, onOpenCallMessage, onOpenCaller }) {
  const [tab, setTab] = useState("Calls");
  const positive = token.change.startsWith("+");
  return (
    <main className="token-screen">
      <TokenTopBar token={token} onBack={onBack} compact={tab !== "Calls"} />
      <div className={`token-scroll ${tab === "About" ? "about-mode" : ""}`}>
        {tab === "Calls" ? (
          <>
            <section className="token-price-hero">
              <div><strong className="mono">{token.price}</strong><span className={`mono ${positive ? "up" : "down"}`}>{positive ? "▲" : "▼"} {token.change.replace("+", "")} <em>Past hour</em></span></div>
              <div><strong className="mono">{token.mc}</strong><span>Market cap</span></div>
            </section>
            <TokenLineChart token={token} showCallers onOpenCaller={onOpenCaller} />
          </>
        ) : (
          <TokenLineChart token={token} compact />
        )}
        <TokenTimeframes />
        <TokenTabBar active={tab} onChange={setTab} />
        {tab === "Calls" ? (
          <section className="token-calls-list">
            {CALLERS.map((caller, index) => <TokenCallRow key={caller.name} caller={caller} token={token} index={index} onOpen={onOpenCallMessage} />)}
          </section>
        ) : <TokenAboutContent token={token} />}
      </div>
      <button className="token-buy-cta" type="button" onClick={onBuy}>Buy</button>
    </main>
  );
}

function TradeAmountScreen({ token, onBack }) {
  const [amount, setAmount] = useState("");
  const [bought, setBought] = useState(false);
  const addDigit = (digit) => {
    setAmount((current) => {
      if (digit === "." && current.includes(".")) return current;
      if (current === "0" && digit !== ".") return digit;
      return `${current}${digit}`;
    });
  };
  const removeDigit = () => setAmount((current) => current.slice(0, -1));
  if (bought) {
    return (
      <main className="trade-amount-screen trade-complete-screen">
        <button className="trade-complete-back" type="button" onClick={onBack}>Back</button>
        <div className="trade-complete-message">
          <TokenAvatar token={token} size="md" />
          <h1>Swapped for {token.ticker}</h1>
        </div>
      </main>
    );
  }
  return (
    <main className="trade-amount-screen">
      <button className="trade-sheet-handle" type="button" onClick={onBack} aria-label="Back to token" />
      <header className="trade-amount-header">
        <div><TokenAvatar token={token} size="sm" /><span><strong>{token.ticker.replace("$", "")}</strong><small>{token.mc} MC</small></span></div>
        <div><strong className="mono">{token.price}</strong><small className={`mono ${token.change.startsWith("+") ? "up" : "down"}`}>{token.change.startsWith("+") ? "▲" : "▼"} {token.change.replace("+", "")}</small></div>
      </header>
      <output className={`trade-amount-value mono ${amount ? "has-value" : ""}`}>{bought ? "Bought" : `$${amount || "0"}`}</output>
      <div className="quick-percent-row">
        {["10%", "25%", "50%", "Max"].map((item) => <button key={item} type="button" onClick={() => setAmount(item === "Max" ? "2.81" : String((2.81 * parseInt(item, 10) / 100).toFixed(2)))}>{item}</button>)}
      </div>
      <div className="number-pad">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].map((item) => <button key={item} type="button" onClick={() => addDigit(item)}>{item}</button>)}
        <button type="button" className="backspace-key" onClick={removeDigit} aria-label="Delete"><Icon name="x" size={26} /></button>
      </div>
      <div className="trade-footer-row">
        <span>$2.81 available</span>
        {amount ? <button type="button">$0.95 fee <Icon name="chevronDown" size={18} /></button> : <button type="button" aria-label="Select wallet"><Icon name="chevronDown" size={20} /></button>}
      </div>
      {amount ? (
        <div className="slide-buy">
          <span>»</span>
          <strong>Slide to buy</strong>
          <input type="range" min="0" max="100" defaultValue="0" aria-label="Slide to buy" onChange={(event) => { if (Number(event.target.value) > 82) setBought(true); }} />
        </div>
      ) : (
        <button className="enter-amount" type="button" disabled>Enter an amount</button>
      )}
    </main>
  );
}

function TradeScreen({ token, onBack, onOpenCallMessage, onOpenCaller }) {
  const [stage, setStage] = useState("token");
  if (stage === "amount") return <TradeAmountScreen token={token} onBack={() => setStage("token")} />;
  return <TokenDetailScreen token={token} onBack={onBack} onBuy={() => setStage("amount")} onOpenCallMessage={onOpenCallMessage} onOpenCaller={onOpenCaller} />;
}

function ProfileBackButton({ onBack }) {
  return (
    <button className="tg-profile-back" type="button" onClick={onBack} aria-label="Back">
      <Icon name="back" size={34} />
    </button>
  );
}

function ProfileAction({ icon, label }) {
  return (
    <button className="tg-profile-action" type="button">
      <Icon name={icon} size={30} />
      <span>{label}</span>
    </button>
  );
}

function CaveLogo() {
  return (
    <span className="cave-logo" aria-hidden="true">
      <span className="cave-ghost"><i /><i /><i /></span>
      <b>CAVE</b>
    </span>
  );
}

function GroupLogo({ chat }) {
  if (chat.id === "cave") return <CaveLogo />;
  return <Avatar label={chat.avatar} color={chat.color} size="lg" />;
}

function ProfileInfoCard({ children }) {
  return <section className="tg-profile-info-card">{children}</section>;
}

function ProfileSegment({ items, active, onChange }) {
  return (
    <div className="tg-profile-segment">
      {items.map((item) => (
        <button key={item} type="button" className={active === item ? "active" : ""} onClick={() => onChange?.(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}

function ProfileListRow({ avatar, color, title, meta, image, badge }) {
  return (
    <div className="tg-profile-list-row">
      {image ? <Avatar label={title[0]} color={color} size="md" image={image} /> : <Avatar label={avatar} color={color} size="md" />}
      <span>
        <b>{title}</b>
        <small className={meta === "online" ? "blue" : ""}>{meta}</small>
      </span>
      {badge ? <em>{badge}</em> : null}
    </div>
  );
}

function ProfilePerformancePanel({ caller }) {
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const stats = [
    [caller.wr, "Win rate", "green"],
    [caller.avg, "Avg return", "blue"],
    [String(caller.calls), "Total calls", "black"],
  ];
  return (
    <section className="profile-performance-card">
      <button className={`profile-alert-button ${alertsEnabled ? "active" : ""}`} type="button" onClick={() => setAlertsEnabled((value) => !value)}>
        {alertsEnabled ? "Alerts On" : "Get Alerts"}
      </button>
      {alertsEnabled ? <div className="profile-alert-state">You will be notified when {caller.name} posts a new call.</div> : null}
      <div className="profile-stat-grid">
        {stats.map(([value, label, color]) => (
          <span key={label}>
            <b className={`mono ${color}`}>{value}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
      <div className="profile-winloss">
        <div><span>Win</span><b className="mono green">{caller.wins}</b></div>
        <div><span>Loss</span><b className="mono red">{caller.losses}</b></div>
        <i><em style={{ width: `${(caller.wins / (caller.wins + caller.losses)) * 100}%` }} /></i>
      </div>
      <div className="profile-performance-chart">
        <div className="performance-chart-head">
          <span>Follower PnL · 30d</span>
          <b className="mono green">{caller.pnl}</b>
        </div>
        <Sparkline data={[100, 120, 115, 140, 180, 170, 210, 250, 240, 280, 320, 350, 340, 380]} color="#34C759" height={66} />
      </div>
    </section>
  );
}

function CallerCallsPanel({ caller }) {
  return (
    <section className="tg-profile-list-card profile-tab-panel">
      {CALLER_CALL_HISTORY.map(([ticker, from, to, time, change, token], index) => (
        <div className="profile-call-entry" key={`${ticker}-${time}`}>
          <Avatar label={token.ticker[1]} color={token.color} size="sm" image={tokenImage(token)} />
          <span>
            <b>{ticker}</b>
            <small>called at <em className="mono">{from}→{to} MC</em></small>
            <p>{callMessageFor(index + caller.id)}</p>
          </span>
          <span className="profile-entry-result">
            <strong className={`mono ${change.startsWith("+") ? "green" : "red"}`}>{change}</strong>
            <small>{time}</small>
          </span>
        </div>
      ))}
    </section>
  );
}

function CallerTradesPanel({ caller }) {
  if (caller?.hiddenTrades) {
    return (
      <section className="tg-profile-list-card profile-tab-panel hidden-wallet-panel">
        <p>The wallet is hidden mode.</p>
      </section>
    );
  }
  return (
    <section className="tg-profile-list-card profile-tab-panel">
      {CALLER_TRADE_HISTORY.map(([ticker, name, pnl, percent, token]) => (
        <div className="profile-trade-entry" key={ticker}>
          <Avatar label={ticker[1]} color={token.color} size="sm" image={tokenImage(token)} />
          <span>
            <b>{ticker}</b>
            <small>{name}</small>
          </span>
          <span className="profile-entry-result">
            <strong className={`mono ${pnl.startsWith("+") ? "green" : "red"}`}>{pnl}</strong>
            <small className={percent.startsWith("+") ? "green" : "red"}>{percent}</small>
          </span>
        </div>
      ))}
    </section>
  );
}

function CallerGroupsPanel() {
  return (
    <section className="tg-profile-list-card">
      <ProfileListRow avatar="D" color="#86D477" title="daiko fb" meta="" />
      <ProfileListRow avatar="C" color="#F7C76D" title="cave dev" meta="" />
      <ProfileListRow avatar="C" color="#fff" title="CAVE" meta="" />
      <ProfileListRow avatar="S" color="linear-gradient(135deg,#E0904D,#34C759)" title="Superteam Japan" meta="" />
    </section>
  );
}

function CallerPostsPanel() {
  return (
    <section className="tg-profile-list-card profile-tab-panel">
      {["Watching low caps after lunch", "Shared $DEGEN thesis", "Reposted CAVE member note"].map((post, index) => (
        <div className="profile-post-entry" key={post}>
          <span>
            <b>{post}</b>
            <small>{index + 1}d ago · {index === 0 ? "12 replies" : index === 1 ? "38 reactions" : "saved"}</small>
          </span>
        </div>
      ))}
    </section>
  );
}

function GroupPerformancePanel({ onOpenLeaderboard, profile = GROUP_PROFILES.cave }) {
  return (
    <section className="profile-performance-card group-performance">
      <div className="profile-stat-grid">
        {profile.stats.map(([value, label, color]) => (
          <span key={label}>
            <b className={`mono ${color}`}>{value}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
      <div className="profile-performance-chart">
        <div className="performance-chart-head">
          <span>Group performance · 30d</span>
          <b className="mono green">{profile.pnl}</b>
        </div>
        <Sparkline data={profile.chart} color="#34C759" height={66} />
      </div>
      <div className="group-performance-metrics">
        {profile.metrics.slice(0, 2).map(([label, value]) => <span key={label}><small>{label}</small><b className="mono">{value}</b></span>)}
        <span className="global-rank-metric">
          <small>{profile.metrics[2][0]} <button type="button" onClick={onOpenLeaderboard} aria-label="Open global leaderboard">?</button></small>
          <b className="mono">{profile.metrics[2][1]}</b>
        </span>
      </div>
    </section>
  );
}

function GroupCallersPanel({ openCaller }) {
  return (
    <section className="tg-profile-list-card">
      {GROUP_CALLERS.map((caller) => (
        <button className="tg-profile-list-row" type="button" key={caller.name} onClick={() => openCaller?.(caller)}>
          <Avatar label={caller.name[0].toUpperCase()} color={caller.color} size="md" image={callerImage(caller)} />
          <span>
            <b>{caller.name}</b>
            <small className="mono">WR {caller.wr} · Avg {caller.avg}</small>
          </span>
          <em className="calls-count mono">{caller.wr}</em>
        </button>
      ))}
    </section>
  );
}

function GroupCallsPanel({ calls = GROUP_CALL_HISTORY }) {
  return (
    <section className="tg-profile-list-card group-calls-list">
      {calls.map(([caller, ticker, mc, time, token]) => (
        <div className="group-call-row" key={`${caller.name}-${ticker}-${time}`}>
          <Avatar label={token.ticker[1]} color={token.color} size="sm" image={tokenImage(token)} />
          <span>
            <b>{ticker}</b>
            <small>called by {caller.name} · <em className="mono">{mc}</em> · {time}</small>
          </span>
          <strong className={`mono ${token.change.startsWith("+") ? "green" : "red"}`}>{token.change}</strong>
        </div>
      ))}
    </section>
  );
}

function GroupMembersPanel() {
  return (
    <section className="tg-profile-list-card">
      <ProfileListRow avatar="A" color="#5E7C5E" title="asuma | Daiko AI ★" meta="last seen 2 hours ago" />
      <ProfileListRow avatar="Y" color="#F7D9C6" title="Yuki | Daiko" meta="online" image={chatsBg} />
      <ProfileListRow avatar="K" color="linear-gradient(180deg,#83D2F8,#4399E8)" title="Kazuki 🪁" meta="last seen a long time ago" />
      <ProfileListRow avatar="S" color="#E8B7D8" title="Stray Ebi 🐬" meta="last seen 2 minutes ago" />
      <ProfileListRow avatar="S" color="#8AA8FF" title="🐸 Senshi" meta="" badge="admin" />
    </section>
  );
}

function EmptyProfilePanel() {
  return <section className="tg-profile-list-card profile-empty-panel" aria-label="Empty section" />;
}

function CallerProfile({ caller, onBack }) {
  const [activeTab, setActiveTab] = useState("Calls");
  const profile = { ...callerProfileDefaults(caller.name, caller.id), ...caller };
  return (
    <main className="tg-profile-screen caller-profile-screen">
      <ProfileBackButton onBack={onBack} />
      <section className="tg-profile-hero">
        <Avatar label={profile.name[0].toUpperCase()} color={profile.color} size="lg" image={callerImage(profile)} />
        <h1>{profile.name}</h1>
        <p>{profile.status}</p>
      </section>
      <div className="tg-profile-actions five">
        <ProfileAction icon="chats" label="message" />
        <ProfileAction icon="calls" label="call" />
        <ProfileAction icon="grid" label="video" />
        <ProfileAction icon="bell" label="mute" />
        <ProfileAction icon="settings" label="more" />
      </div>
      <ProfileInfoCard>
        <div className="tg-info-row qr-row"><span><b>username</b><a>{profile.username}</a></span><Icon name="grid" size={28} /></div>
        <div className="tg-info-row"><span><b>birthday</b><strong>{profile.birthday}</strong></span></div>
        <button className="tg-info-link" type="button">Add to Contacts</button>
        <button className="tg-info-link danger" type="button">Block User</button>
      </ProfileInfoCard>
      {!profile.hiddenTrades ? (
        <ProfileInfoCard>
          <div className="tg-info-row wallet-info-row">
            <span><b>Wallet</b><a className="mono">{callerWalletAddress(profile)}</a></span>
            <Icon name="wallet" size={28} />
          </div>
        </ProfileInfoCard>
      ) : null}
      <ProfilePerformancePanel caller={caller} />
      <ProfileSegment items={["Calls", "Trades", "Posts", "Groups"]} active={activeTab} onChange={setActiveTab} />
      {activeTab === "Calls" ? <CallerCallsPanel caller={caller} /> : null}
      {activeTab === "Trades" ? <CallerTradesPanel caller={caller} /> : null}
      {activeTab === "Posts" ? <CallerPostsPanel /> : null}
      {activeTab === "Groups" ? <CallerGroupsPanel /> : null}
      <div className="bottom-spacer" />
    </main>
  );
}

function GroupProfile({ chat = CHATS[0], onBack, openCaller, openLeaderboard }) {
  const profile = GROUP_PROFILES[chat.id] || GROUP_PROFILES.cave;
  const [activeTab, setActiveTab] = useState(profile.tabs[0]);
  useEffect(() => {
    setActiveTab(profile.tabs[0]);
  }, [profile.tabs]);
  return (
    <main className="tg-profile-screen group-profile-screen">
      <ProfileBackButton onBack={onBack} />
      <section className="tg-profile-hero group">
        <GroupLogo chat={chat} />
        <h1>{profile.title}</h1>
        <p>{profile.subtitle}</p>
      </section>
      <div className="tg-profile-actions four">
        <ProfileAction icon="bell" label="unmute" />
        <ProfileAction icon="search" label="search" />
        <ProfileAction icon="share" label="leave" />
        <ProfileAction icon="settings" label="more" />
      </div>
      <ProfileInfoCard>
        <div className="tg-info-row qr-row"><span><b>share link</b><a>{profile.link}</a></span><Icon name="grid" size={28} /></div>
        <div className="tg-info-row"><span><b>description</b><strong>{profile.description}</strong></span></div>
      </ProfileInfoCard>
      <GroupPerformancePanel profile={profile} onOpenLeaderboard={openLeaderboard} />
      <ProfileSegment items={profile.tabs} active={activeTab} onChange={setActiveTab} />
      {activeTab === "Callers" ? <GroupCallersPanel openCaller={openCaller} /> : null}
      {activeTab === "Calls" ? <GroupCallsPanel calls={profile.calls} /> : null}
      {activeTab === "Members" ? <GroupMembersPanel /> : null}
      {activeTab === "Media" || activeTab === "Saved" ? <EmptyProfilePanel /> : null}
      <div className="bottom-spacer" />
    </main>
  );
}

function CallsScreen({ openCaller }) {
  const [callTab, setCallTab] = useState("All");
  return (
    <>
      <header className="calls-header">
        <button className="pill nav-pill text-pill" type="button">Edit</button>
        <HeaderSegment value={callTab} onChange={setCallTab} items={["All", "Missed"]} />
        <span />
      </header>
      <main className="scroll-content telegram-page calls-page">
        <Card className="plain-list calls-list">
          <Row className="invite-row start-call-row">
            <span className="invite-icon"><Icon name="calls" size={31} /></span>
            <span>Start New Call</span>
          </Row>
          <SectionLabel>Recent calls</SectionLabel>
          {RECENT_CALLS.map((call, index) => <CallRow key={`${call.name}-${index}`} call={call} />)}
        </Card>
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function SettingsScreen({ openNotifications }) {
  return (
    <>
      <main className="scroll-content telegram-page settings-page">
        <div className="settings-profile">
          <button className="settings-grid-button" type="button" aria-label="QR"><Icon name="grid" size={27} /></button>
          <button className="settings-edit-button pill nav-pill text-pill" type="button" onClick={openNotifications}>Edit</button>
          <Avatar label="Y" color="linear-gradient(135deg,#F7D9C6,#E8E4DC)" size="lg" image={chatsBg} />
          <h1>Yuki | Daiko</h1>
          <p>+81 80 9584 7088 - @zkyuki</p>
        </div>
        <Card className="settings-camera">
          <Row className="invite-row">
            <span className="invite-icon"><Icon name="camera" size={31} /></span>
            <span>Change Profile Photo</span>
          </Row>
        </Card>
        {SETTINGS_GROUPS.map((group, index) => (
          <Card key={index} className="settings-group">
            {group.map((item) => <SettingsRow key={item.label} item={item} />)}
          </Card>
        ))}
        <div className="bottom-spacer" />
      </main>
    </>
  );
}

function NotificationsScreen({ onBack }) {
  return (
    <>
      <HomeHeader title="Notifications" onBack={onBack} onNotify={() => {}} />
      <main className="scroll-content">
        <SectionLabel>Today</SectionLabel>
        <Card className="list-card">
          {NOTIFICATIONS.map((item) => (
            <Row key={item.title}>
              <Avatar label={item.title[0]} color={item.color} size="sm" />
              <span className="row-copy"><b>{item.title}</b><small>{item.body}</small></span>
              <span className="mono subtle">{item.time}</span>
            </Row>
          ))}
        </Card>
      </main>
    </>
  );
}

function LeaderboardScreen({ onBack, openCaller, initialKind = "Callers" }) {
  const [period, setPeriod] = useState("1D");
  const [kind, setKind] = useState(initialKind);
  const callerRows = Array.from({ length: 30 }, (_, index) => {
    const base = GROUP_CALLERS[index % GROUP_CALLERS.length];
    return index < GROUP_CALLERS.length ? base : {
      ...base,
      id: 100 + index,
      name: `${base.name}${index + 1}`,
      wr: `${Math.max(48, 74 - index)}%`,
      avg: `${Math.max(1.2, 8.8 - index * 0.18).toFixed(1)}x`,
      pnl: `+$${Math.max(18, 220 - index * 6)}K`,
    };
  });
  const rows = kind === "Callers" ? callerRows : GROUP_LEADERBOARD.map(([name, pnl, wr, avg, color]) => ({ name, pnl, wr, avg, color }));
  return (
    <main className="leaderboard-screen">
      <header className="leaderboard-header">
        <button className="pill nav-pill text-pill" type="button" onClick={onBack}>Back</button>
        <strong>Leaderboard</strong>
        <div className="leaderboard-period">
          {["1D", "1W", "1M"].map((item) => (
            <button key={item} type="button" className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>
          ))}
        </div>
      </header>
      <div className="leaderboard-tabs">
        {["Callers", "Groups"].map((item) => (
          <button key={item} type="button" className={kind === item ? "active" : ""} onClick={() => setKind(item)}>{item}</button>
        ))}
      </div>
      <section className="tg-card leaderboard-list">
        {rows.map((row, index) => (
          <button className="leaderboard-row" type="button" key={row.name} onClick={() => kind === "Callers" && openCaller?.(row)}>
            <span className={`leaderboard-rank mono rank-${index + 1}`}>{index + 1}</span>
            <Avatar label={row.name[0].toUpperCase()} color={row.color} size="sm" image={callerImage(row)} />
            <span>
              <b>{row.name}</b>
              <small className="mono">WR {row.wr} · Avg {row.avg}</small>
            </span>
            <strong className="mono green">{row.pnl}</strong>
          </button>
        ))}
      </section>
      <div className="bottom-spacer" />
    </main>
  );
}

function TabBar({ active, onTab }) {
  const tabs = [
    ["contacts", "Contacts", "user"],
    ["calls", "Calls", "calls"],
    ["chats", "Chats", "chats"],
    ["home", "Home", "home"],
    ["settings", "Settings", "settings"],
  ];
  return (
    <nav className="tabbar-wrap">
      <div className="tabbar-fade" />
      <div className="tabbar-main">
        {tabs.map(([id, label, icon]) => (
          <button key={id} type="button" className={active === id ? "active" : ""} onClick={() => onTab(id)}>
            <span className="tab-icon"><Icon name={icon} size={25} />{id === "chats" ? <b>9</b> : null}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState("chats");
  const [view, setView] = useState(null);
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [selectedCaller, setSelectedCaller] = useState(CALLERS[0]);
  const selectedChat = view?.type === "chat" || view?.type === "group" ? view.chat : CHATS[0];

  if (!authenticated) {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <div className="phone-screen mode-auth">
            <AuthScreen onDone={() => setAuthenticated(true)} />
          </div>
        </div>
      </div>
    );
  }

  const openTrade = (token) => {
    setSelectedToken(typeof token === "object" && token?.ticker ? token : tokenBySymbol(token));
    setView({ type: "trade" });
  };
  const openCaller = (caller) => {
    setSelectedCaller(caller);
    setView({ type: "caller" });
  };
  const openCallMessage = (caller, token) => {
    setView({ type: "chat", chat: CHATS[0], focusCallKey: `${caller.name}-${token.ticker}` });
  };
  const closeView = () => setView(null);
  const switchTab = (nextTab) => {
    if (nextTab === "discover") {
      setView({ type: "discover" });
      return;
    }
    setTab(nextTab);
    setView(null);
  };

  let screen;
  if (view?.type === "chat") {
    screen = <ChatScreen chat={selectedChat} onBack={closeView} openGroup={() => setView({ type: "group", chat: selectedChat })} openTrade={openTrade} openCaller={openCaller} focusCallKey={view.focusCallKey} />;
  } else if (view?.type === "trade") {
    screen = <TradeScreen token={selectedToken} onBack={closeView} onOpenCallMessage={openCallMessage} onOpenCaller={openCaller} />;
  } else if (view?.type === "discover") {
    screen = <DiscoverScreen onBack={closeView} openTrade={openTrade} />;
  } else if (view?.type === "caller") {
    screen = <CallerProfile caller={selectedCaller} onBack={closeView} />;
  } else if (view?.type === "group") {
    screen = <GroupProfile chat={selectedChat} onBack={closeView} openCaller={openCaller} openLeaderboard={() => setView({ type: "leaderboard", initialKind: "Groups" })} />;
  } else if (view?.type === "notifications") {
    screen = <NotificationsScreen onBack={closeView} />;
  } else if (view?.type === "leaderboard") {
    screen = <LeaderboardScreen onBack={closeView} openCaller={openCaller} initialKind={view.initialKind} />;
  } else if (tab === "contacts") {
    screen = <ContactsScreen />;
  } else if (tab === "chats") {
    screen = <ChatsScreen openChat={(chat) => setView({ type: "chat", chat })} />;
  } else if (tab === "calls") {
    screen = <CallsScreen openCaller={openCaller} />;
  } else if (tab === "settings") {
    screen = <SettingsScreen openNotifications={() => setView({ type: "notifications" })} />;
  } else {
    screen = <HomeScreen openTrade={openTrade} openDiscover={() => setView({ type: "discover" })} openCaller={openCaller} openNotifications={() => setView({ type: "notifications" })} openLeaderboard={() => setView({ type: "leaderboard" })} />;
  }

  const showTabs = !["chat", "trade", "caller", "group", "discover", "notifications", "leaderboard"].includes(view?.type);
  const screenMode = view?.type ? `mode-${view.type}` : `mode-${tab}`;

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <div className={`phone-screen ${screenMode}`}>
          <StatusBar />
          <div className="screen-body">{screen}</div>
          {showTabs ? <TabBar active={tab} onTab={switchTab} /> : null}
        </div>
      </div>
    </div>
  );
}
