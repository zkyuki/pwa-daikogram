# Daikogram — Design System Spec (v4 Telegram iOS)

> A handoff document for engineers. Daikogram is a crypto-trading social app that **rides on Telegram's visual DNA** — it should feel like a native Telegram screen with trading content slotted in. Use this as the source of truth for tokens, components, and layout rules.

---

## 1. Foundations

### 1.1 Platform target

- iOS-first, fixed phone frame **390 × 844** (iPhone 14/15 logical).
- Status bar 16px top padding, content scrolls under a `Dynamic Island` pill.
- Bottom safe area = 22px; floating tab bar lives above it.

### 1.2 Typography

| Role | Family | Weight | Size | Letter-spacing |
|---|---|---|---|---|
| Display / balance | SF Pro Display | 700 | 44 | -0.03em |
| H1 (profile name) | SF Pro Display | 700 | 24 | -0.02em |
| H2 (KPI value) | SF Pro Display + tnum | 700 | 22 | -0.02em |
| Nav title | SF Pro Display | 600 | 17 | -0.01em |
| Row title | SF Pro Display | 600 | 17 | -0.01em |
| Body | SF Pro Display | 400 | 15–16 | 0 |
| Caption / meta | SF Pro Display | 400 | 13–14 | 0 |
| Tab label | SF Pro Display | 500 | 10 | -0.01em |
| Section label (all-caps) | SF Pro Display | 400 | 13 | 0.03em, UPPERCASE |
| Numeric (prices, %, MC) | **Roboto Mono** | 500–700 | inherits | `font-feature-settings: "tnum" 1` |

Rule: **any number a trader reads — price, %, market cap, PnL, balance, time-frame chips — is Roboto Mono.** Everything else is SF Pro.

### 1.3 Color tokens

```css
--bg:        #EFEEF3;   /* main app bg */
--bg2:       #F4F3F8;
--surface:   #FFFFFF;   /* cards, rows, pills */
--surface2:  #E9E8ED;   /* search field, segmented control track */
--surface3:  #D9D8DE;
--border:    rgba(60,60,67,0.10);
--border2:   rgba(60,60,67,0.18);
--divider:   rgba(60,60,67,0.10);

--text:  #000000;
--text2: #8E8E93;   /* iOS secondary */
--text3: #B0B0B5;

--blue:     #339DFF;   /* Telegram iOS accent — every interactive label, link, CTA */
--blue2:    #1F8CF2;
--blue-dim: rgba(51,157,255,0.12);

--green:     #34C759;  /* up, win, success */
--green-dim: rgba(52,199,89,0.14);
--red:       #FF3B30;  /* down, loss, danger */
--red-dim:   rgba(255,59,48,0.14);
--gold:      #FFB300;  /* rank-1 only */
```

**Sender-name palette** (Telegram uses 8 deterministic hues, keyed off user ID hash):

```css
--u1:#E66866; --u2:#5DAB35; --u3:#E0904D; --u4:#2EA6DA;
--u5:#9A5BAA; --u6:#2DAFA0; --u7:#D27EAF; --u8:#5C6AC4;
```

Apply to: chat-message sender name text, the user's avatar background, and any inline mention chip for the same user. Hash `userId % 8` to pick.

### 1.4 Radius, shadow, elevation

| Token | Value | Used on |
|---|---|---|
| `radius/pill` | 999px | nav buttons, tab bar, chips, filter buttons, search row alt |
| `radius/card` | 14px | white content cards (`.tg-card`, `.hero`, `.trend-card`, `.summary-card`, `.kpi`, `.stat`) |
| `radius/bubble-other` | 16 16 16 4 | incoming chat bubble |
| `radius/bubble-own` | 16 16 4 16 | outgoing chat bubble |
| `radius/control` | 10–12px | segmented tracks, amount buttons, CTAs |
| `radius/search` | 10px | gray search field |
| `shadow/pill` | `0 1px 2px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)` | floating nav pills, tab bar, chat header pills |
| `shadow/floating` | `0 4px 20px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)` | bottom tab bar, side search button |
| `shadow/bubble` | `0 1px 1px rgba(0,0,0,0.08)` | chat bubbles, call card |
| `shadow/phone` | `0 30px 80px rgba(20,18,28,0.18)` | device bezel only |

No drop shadows beyond these. No glassmorphism except on the chat input bar + chat header (`backdrop-filter: blur(20px)` over `rgba(239,238,243,0.92)`).

### 1.5 Spacing

4-pt scale. Most common units: 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 28 / 32. Card horizontal margin from the screen edge is **always 16px**. Section labels are inset 32px from screen edge (16 card margin + 16 internal).

---

## 2. Layout primitives

### 2.1 Phone frame

- 390 × 844, 48px outer radius, 8px solid `#0d0d10` bezel, `overflow: hidden`.
- Background of the screen is `--bg` (`#EFEEF3`). All inner cards sit on this gray.

### 2.2 Status bar + Dynamic Island

- 44px tall area.
- Left: time (`18:36`, weight 600, 15px).
- Right cluster: signal bars · wifi · battery (1.2–1px strokes, currentColor).
- Centered black pill `34h × ~110w`, 20px radius, with white app glyph + caps label (`TELEGRAM` in the prototype — replace with `DAIKOGRAM` in production).

### 2.3 Nav header (home-style)

- Layout: `[ Edit pill ] ······ [ centered title + logo ] ······ [ icon pill ]`.
- Pills: 44px tall, white surface, `shadow/pill`, blue text (`--blue`) for text buttons, black `--text` for icon-only.
- Centered title is **not** in a pill. 17px / 600, optionally prefixed with a 30px circular logo (paper-plane in a blue gradient).

### 2.4 Nav header (chat-style)

- All three slots are floating white pills with `shadow/pill`, sitting on `rgba(239,238,243,0.92)` blurred backdrop.
- Left: back chevron + numeric unread badge (`badge` style: black `#1f1f22`, 12px white text, 999px radius).
- Center: full-width title pill 50px tall, two-line: name (16/600) + meta (12/`--text2`).
- Right: 38px circular avatar pill.

### 2.5 Search field

- 36px tall, full-width minus 16px side margin, `--surface2` background, 10px radius, centered icon + placeholder in `--text2`.

### 2.6 Filter chip row

- Horizontal scroll, 36px tall pills with `shadow/pill`.
- Inactive: white surface, `--text` label.
- Active: `#1F1F22` (near-black), white label. Optional trailing `count` chip (smaller, dim background).

### 2.7 Section label

- Above every grouped card list.
- 13px / 400, `--text2`, UPPERCASE, letter-spacing 0.03em.
- Padding: `14px 32px 6px`.

### 2.8 Card + row pattern (the workhorse)

- White `--surface` card, 14px radius, 16px horizontal margin.
- Internal rows are `flex` with 12px gap, padded `10px 14px` (chats: `8px 16px`).
- Dividers are **inset hairlines**, not borders: a `::before` pseudo-element on every row after the first, `0.5px` tall, `left: 70px` (i.e. starts after the avatar column), `right: 0`, background `--divider`.

```css
.row + .row::before { content:''; position:absolute; top:0; left: 70px; right: 0;
                     height: 0.5px; background: var(--divider); }
```

### 2.9 Avatars

- Circular only. Background = solid `--uN` color or a 2-stop linear gradient (135°).
- Initials in white, weight 600.
- Sizes: `xs 30`, `sm 38–40`, `md 54`, `lg 96` (profile hero).

### 2.10 Bottom tab bar

- **Floating**, not full-bleed. Sits 22px above the home indicator, 12px from screen edges.
- Two physical pills: a main one (`.tabbar-main`) holding 4 tabs, and a separate 64×64 circular side button (`.tabbar-side`) for search.
- Both white, 999px radius, `shadow/floating`.
- A gradient fade behind the bar (`linear-gradient(180deg, rgba(239,238,243,0) → 1)`) hides scrolling content.
- Tab item: icon 26px + label 10/500. Active uses `--blue` + filled icon stroke. Badge: red `--red`, 20px, white 11/600 number, top-right of icon.
- Always reserve a `100px` spacer at the bottom of the scroll content so it doesn't sit under the tab bar.

---

## 3. Components (per screen)

### 3.1 Portfolio hero card (Home)

- White card with: tiny gray tag → 44/700 balance (cents 32/600 in `--text2`) → green delta pill `▲ +$… · +%` on `--green-dim` → 58px sparkline → 3 equal-width action buttons.
- Action button: 11px padding, 12px radius. **Primary** = solid `--blue` + white. **Secondary** = `--surface2` background + `--blue` text. One primary per row max.

### 3.2 Trending row (token list row)

- 44px gradient circular token icon (first letter of ticker, no `$`).
- Title row: `$TICKER` 17/600 + green % up / red % down (mono, 14).
- Sub line 14/`--text2`: `MC $420K · N callers` joined by a 3px square dot separator.
- Right side: 64×22 mini sparkline above a `Buy` pill (blue solid, 14/600, 7×16 padding, 999px).

### 3.3 Caller row (leaderboard)

- 22px rank chip (mono, 15/600). Rank 1 uses `--gold` color.
- 38px circular avatar.
- Title 16/600; meta `WR 81% · Avg 12.1x` 14/`--text2`.
- Right-aligned PnL in `--green` mono 14/600 over a "30d PnL" caption.

### 3.4 Chat bubbles

- Container: `display:flex; gap:6px; max-width:84%; align-items:flex-end`.
- Incoming: 30px avatar + white bubble, radius `16 16 16 4`.
- Outgoing: no avatar, right-aligned, bubble background `#E1FFC7` (Telegram light-green), radius `16 16 4 16`.
- Inside the bubble:
  - Optional **sender name** line: 13.5/600, colored with `--uN` matching the avatar.
  - Body text 15/1.3.
  - **Inline time + receipt**: floated right, 11px `--text2`. Outgoing adds `✓✓` in `#4FC3F7` after the time.
- Date dividers: centered pill, `rgba(0,0,0,0.18)` bg, white 13/500, `4px 12px` padding, 12px radius.

### 3.5 Pinned message

- Card 14px radius, 8px 12px padding, **3px solid `--blue` left border**.
- Inside: "Pinned Message" 13/600 in `--blue` → 13/`--text` preview, single-line ellipsis. Trailing pin icon in `--text2`.

### 3.6 Call card (chat-embedded — the signature component)

- Acts as a Telegram-attached message: same `16 16 16 4` radius, white surface, attached avatar to its left.
- Width 290px. Internal padding `8 10 10`.
- Stack (top→bottom, all 10px apart):
  1. Sender name line (colored `--uN`) + bullet stats `· Top 10% · WR 74%` in `--text2`.
  2. Token row: 40px gradient icon · ticker + protocol · price (mono 15/600) + % (mono 12, color-coded).
  3. 4-column `call-stats` grid: each cell is 10/`--text2` uppercase 0.04em label over mono 12/600 value (`MC / Vol 24h / ATH / Liq`).
  4. 44px mini sparkline, colored by direction.
  5. Tag row — pill chips 11px, 2×8px padding, 999px:
     - **good** = `--green-dim` bg + `--green` text (e.g. `✓ Bundle 2%`)
     - **warn** = `rgba(255,179,0,0.15)` bg + `--gold` text (`△ Sniper 8%`)
     - **bad** = `--red-dim` bg + `--red` text
  6. Solid `--blue` CTA: `Trade $TICKER · 1-tap`, 10px padding, 10px radius, white 15/600.
  7. Trailing right-aligned timestamp 11/`--text2`.

### 3.7 Chat input bar

- Two floating elements over a blurred backdrop, just like the chat header.
- Left: 44px-tall white pill, 22px radius, with attachment icon + "Message" placeholder + emoji icon. All icons `--text2`, 22px, 1.6 stroke.
- Right: 44px circular mic button, white, blue icon.

### 3.8 Trade screen

- Hero card (white, 14px radius): 48px token icon · 34/700 mono price (cents 18/`--text2`) · `▲ 184.2%` `--green` + `24h` `--text2` meta.
- **Timeframe segmented control** (`.tf-row`): track `--surface2`, 9px radius, 2px padding. Active tab = white pill, 1px shadow, `--text` label. All labels mono 13/500. Labels: `5M / 1H / 4H / 1D / 1W`.
- 160px candlestick chart. Green/red OHLC: thin wick (1px), filled body (10px wide, 1px stroke same color, 1px radius). Three dashed horizontal grid lines at 25/50/75%, `rgba(60,60,67,0.08)`.
- 3-up `stat-grid` cards: tiny label / mono 16/600 value.
- **Buy/Sell toggle** (`.buysell`): same track + active-pill pattern as the timeframe control, but the active state colors text `--green` (buy) or `--red` (sell).
- Amount label (uppercase 13/`--text2`) + amount row of 5 mono pills. Active pill = blue + white.
- Summary card: stacked `summary-row`s separated by `border-top: 0.5px solid --divider`. Left label 15/`--text2`, right value 15/500 mono with optional 12/`--text2` mono sub.
- Big CTA: full-width green pill, 14px padding, 12px radius, white 17/600, ALL CAPS for action verbs.

### 3.9 Caller profile

- **Hero card** (24/16/18 padding, centered): 96px gradient avatar → 24/700 name → 15/`--text2` meta.
- Action triple: three 56px tall `--surface2` pills with vertical icon (20px) + label (14/500, `--blue`). Equal-width.
- **KPI grid**: 3 cards, mono 22/700 value (colored: green / blue / black) + 12/`--text2` label.
- **Follower PnL card**: 13/`--text2` "Follower PnL · 30d" + 30D mono label → 32/700 mono green value → 70px sparkline → win/loss legend with mono inline counts → 6px tall `wl-bar` (green proportional fill on left, red remainder on right).
- **Recent calls list** (same card-with-inset-dividers pattern as trending): 38px token icon, ticker 16/600, mono `$45K → $580K · 3d` meta, right-aligned colored % (green win / red loss).

---

## 4. Charts

### 4.1 Sparkline

- SVG, full width, fixed height (22–70px depending on slot).
- Gradient area fill: `stop-color` = line color, top stop 0.30 alpha, bottom 0 alpha.
- Line: 1.8 stroke, round caps + joins, line color = `--green` for up, `--red` for down (decide by `last >= first`).

### 4.2 Candlestick

- 320×160 viewBox, 10px wide candles, 8px gap.
- Green if `close >= open` else red. Wick = 1px stroke. Body = filled rect, 1px radius, 1px same-color stroke.
- 3 dashed grid lines at 25/50/75% Y, `rgba(60,60,67,0.08)`, dash `2,3`.

---

## 5. Iconography

- 24×24 viewBox, `stroke="currentColor"`, `stroke-width: 1.6–2.0`, round line caps + joins, no fill (except glyphs in pills which use `fill="currentColor"`).
- Tab-bar active icons get filled, inactive stay outlined.
- All UI icons inherit from text color so a parent `color: var(--blue)` paints them.

---

## 6. Interaction rules

- All taps that go somewhere new = `--blue` label.
- Active states in segmented controls = white surface + 1px shadow, **never** color the track.
- Long lists belong in white cards with inset dividers; never use full-bleed dividers or alternating row colors.
- Numbers are right-aligned; labels are left-aligned. Always keep them on the same baseline.
- Show winning and losing values with **color, not arrows alone** — green/red is the primary signal, the `▲ ▼` glyphs are reinforcement.
- Sender-name color in a chat must match that user's avatar background hue.

---

## 7. Telegram conventions to keep

1. **White floating pills** instead of solid headers — chrome never spans full width.
2. **Section labels** all-caps gray above each card group.
3. **Inset dividers** at avatar width, not full row width.
4. **Outgoing bubble color** is the Telegram light-green `#E1FFC7`. Do not switch to blue; that's the Messages app.
5. **Double-check `✓✓`** in `#4FC3F7` for outgoing delivered.
6. **Date pills** are translucent black on the wallpaper, not white.
7. **Wallpaper** under chat: warm radial gradient `#F0EBE5 → #E8E4DC` with a faint 28px dot pattern.

---

## 8. File / token suggestion for the codebase

```text
/tokens
  colors.ts        // exports the CSS-var palette as TS constants
  typography.ts    // font stacks + scale
  radii.ts
  shadows.ts
/components
  Phone/           // 390×844 frame
  StatusBar/
  NavHeader/       // 'home' + 'chat' + 'trade' variants
  Search/
  FilterChip/
  Card/            // white 14px-radius surface + Row primitive w/ inset divider
  Avatar/          // sizes + hashColor() helper
  TabBar/          // main + side variants
  Bubble/          // .own variant
  CallCard/        // composes Bubble + Stats + TagChip + CTA
  TagChip/         // good | warn | bad
  Spark/           // svg sparkline
  Candles/
  SegmentedControl/  // timeframe + buy/sell variants
  KPI/             // value + label
  WinLossBar/
```

Every primitive should accept a `colorKey` prop (`'u1'..'u8' | 'blue' | 'green' | 'red' | 'gold'`) instead of raw hex, so user-coloring stays consistent across avatars, names, mentions, and chips.
