# Unigent — Frontend Design System

*Distilled from the Unigent marketing site (hero, feature grid, AI agent showcase, integrations showcase, proof/testimonials, final CTA). v1.0 — June 17, 2026.*

## 0. How to use this document

This file is the single source of truth for visual style on Unigent. Any agent — design, frontend, or AI — building a new page, component, or screen for this product should read this top to bottom before writing code, then implement using the tokens and component specs below rather than inventing new colors, spacing, or patterns.

Rules of engagement:

- If a value is defined here (a hex code, a radius, a font), use it exactly. Don't approximate or substitute a "close enough" Tailwind default.
- If a new component is needed that isn't covered below, build it by combining existing tokens and the design tenets in section 2 — don't introduce a new visual language for it.
- Section 13 ("Page composition recipes") shows how these pieces assemble into real screens, including a dedicated recipe for a three-pane Gmail / AI chat / Calendar application dashboard.
- Section 14 is a fast Do/Don't gut-check — when in doubt, scan it before shipping.

## 1. Brand essence

Unigent is a keyboard-first AI agent workspace: type a plain-language command, watch the agent parse it, plan it, and act across connected tools, then report back. The product's confidence comes from showing its work — extracted intent, a reasoning trace, real before/after state in Gmail and Calendar — not from claiming to be smart.

Personality: efficient, technical-but-warm, quietly confident. It talks like an engineer (snake_case intent tags, monospace command prompts, real window chrome) but proves itself with human warmth (named testimonials, avatar faces, a running hours-saved counter). The audience is builders, operators, and power users who want to feel like they're piloting something, not chatting with a bot.

## 2. Design tenets

These six rules generate everything else in this document. When a new design decision isn't covered explicitly, decide by these.

1. **Near-black, never pure black.** The canvas sits just off true black so accent colors and glows have room to breathe against it.
2. **Color is a verdict, not decoration.** Each hue has exactly one job (brand/AI, mail, calendar, success, caution, critical, neutral). Never assign color by sequence or for visual variety.
3. **Every surface is a window, not a poster.** Product moments borrow real OS chrome — traffic-light dots, "live" indicators, terminal prompts — so the page feels like software running, not software being advertised.
4. **Numbers are receipts.** Every stat (hours saved, percentage, action count) is large, bold, and paired with a one-line plain-language caption that explains what it proves.
5. **Quiet by default, bright with intent.** Most of the interface is muted gray-on-dark. Saturation and brightness are spent only on the one thing that matters right now — an active step, a critical badge, the brand glow.
6. **Type does the talking.** There is no decorative illustration or stock imagery. Bold sans headlines plus monospace command snippets carry the entire visual voice.

## 3. Color system

### 3.1 Base & surface tokens

| Token | Hex / value | Usage |
|---|---|---|
| `--bg-canvas` | `#0B0B0D` | Page background, app shell background |
| `--bg-surface` | `#131316` | Cards, panels, command windows, nav bar |
| `--bg-surface-hover` | `#1A1A1F` | Hover state for rows, list items, buttons |
| `--bg-surface-inset` | `#1C1C22` | Chips, pills, input fields, nested elements |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Dividers inside a panel (e.g. window-bar underline) |
| `--border-default` | `rgba(255,255,255,0.10)` | Default card/panel border |
| `--border-strong` | `rgba(255,255,255,0.16)` | Hover/focus emphasis border |

### 3.2 Text tokens

| Token | Hex | Usage |
|---|---|---|
| `--text-primary` | `#F5F5F7` | Headlines, titles, primary values |
| `--text-secondary` | `#9B9BA3` | Body copy, descriptions, subheads |
| `--text-tertiary` | `#6E6E76` | Captions, timestamps, helper text |
| `--text-disabled` | `#4B4B52` | Disabled labels |

### 3.3 Brand accent ramp — Indigo (AI actions, chat, primary CTAs)

| Token | Value | Usage |
|---|---|---|
| `--accent-100` | `rgba(111,107,239,0.12)` | Tinted badge/pill backgrounds (e.g. "AI AGENT" eyebrow) |
| `--accent-300` | `#A5A3F7` | Logotype, inline links ("Built into every keystroke →") |
| `--accent-400` | `#8B87F2` | Icon strokes, secondary accents on dark |
| `--accent-500` | `#6F6BEF` | Solid primary button fill, progress bar fill, active states |
| `--accent-600` | `#5A55D9` | Button hover/active |
| `--accent-glow` | `rgba(111,107,239,0.35)` | Blurred halo behind brand nodes/icons |

### 3.4 Functional / domain color mapping

This is the most important table in the document for any dashboard or multi-tool surface. Each connected tool and system state owns one hue — never swap them.

| Domain | Family | Tint bg | Icon/stroke | Text-on-tint | Where it appears in source |
|---|---|---|---|---|---|
| AI / brand / chat | Indigo | `--accent-100` | `--accent-400` | `--accent-300` | Logo, primary buttons, "Understand"/"Plan" reasoning steps, extracted-intent time chip |
| Mail / Gmail | Coral | `rgba(216,90,48,0.14)` | `#E2683E` | `#F0997B` | Gmail icon, "Confirmation sent" card accent, "Act · Gmail" step, "100% automated coverage" stat |
| Calendar | Blue | `rgba(55,138,221,0.14)` | `#4C97E0` | `#85B7EB` | Calendar icon, "Event created" card accent, "Act · Calendar" step, selected Google Calendar row, mini week-view active day |
| Success / confirm | Green | `rgba(34,197,134,0.14)` | `#2ECC8F` | `#6FE3B4` | "Invite sent" banner, "Confirm" reasoning step, live-status dots |
| Caution / high priority | Amber | `rgba(239,159,39,0.16)` | `#EF9F27` | `#FAC775` | "High" priority badge |
| Critical / urgent | Red | `rgba(226,75,74,0.16)` | `#E24B4A` | `#F09595` | "Critical" priority badge |
| Neutral / low / ignore | Gray | `rgba(255,255,255,0.06)` | — | `#8B8D98` | "Low" / "Ignore" badges, generic/start/end steps |

**Rule:** when building a multi-pane surface (e.g. a dashboard combining mail, chat, and calendar), each pane inherits its domain's hue for icons, accents, and highlight borders. Don't let the brand indigo bleed into the Gmail or Calendar panes except where the AI agent itself is acting on them.

### 3.5 Ambient glow & atmosphere

Backgrounds are not flat — each major section carries one soft, blurred, low-opacity radial glow for atmosphere, never more than one per viewport:

- Hero / agent showcase: warm glow, `--bg-canvas-glow-warm` at 6–10% opacity, positioned upper-center, blur ~120px.
- Integrations / network graph / final CTA: cool glow, `--bg-canvas-glow-cool` (accent indigo) at 6–10% opacity, blur ~120px.
- Never stack both glows in the same section, and never let a glow raise contrast enough to affect text legibility — it's texture, not lighting.

### 3.6 CSS variables (drop-in)

```css
:root {
  color-scheme: dark;

  /* Canvas */
  --bg-canvas: #0B0B0D;
  --bg-canvas-glow-warm: #D85A30;
  --bg-canvas-glow-cool: #6F6BEF;

  /* Surfaces */
  --bg-surface: #131316;
  --bg-surface-hover: #1A1A1F;
  --bg-surface-inset: #1C1C22;

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.16);

  /* Text */
  --text-primary: #F5F5F7;
  --text-secondary: #9B9BA3;
  --text-tertiary: #6E6E76;
  --text-disabled: #4B4B52;

  /* Brand accent — Indigo */
  --accent-100: rgba(111, 107, 239, 0.12);
  --accent-300: #A5A3F7;
  --accent-400: #8B87F2;
  --accent-500: #6F6BEF;
  --accent-600: #5A55D9;
  --accent-glow: rgba(111, 107, 239, 0.35);

  /* Mail — Coral */
  --coral-100: rgba(216, 90, 48, 0.14);
  --coral-400: #E2683E;
  --coral-500: #D85A30;
  --coral-text: #F0997B;

  /* Calendar — Blue */
  --blue-100: rgba(55, 138, 221, 0.14);
  --blue-400: #4C97E0;
  --blue-500: #378ADD;
  --blue-text: #85B7EB;

  /* Success — Green */
  --green-100: rgba(34, 197, 134, 0.14);
  --green-400: #2ECC8F;
  --green-text: #6FE3B4;

  /* Caution — Amber */
  --amber-100: rgba(239, 159, 39, 0.16);
  --amber-400: #EF9F27;
  --amber-text: #FAC775;

  /* Critical — Red */
  --red-100: rgba(226, 75, 74, 0.16);
  --red-400: #E24B4A;
  --red-text: #F09595;

  /* Neutral — Gray */
  --gray-100: rgba(255, 255, 255, 0.06);
  --gray-text: #8B8D98;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --radius-xl: 22px;
  --radius-pill: 999px;

  /* Fonts */
  --font-sans: 'Inter', 'Geist', -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Geist Mono', 'IBM Plex Mono', monospace;
}
```

### 3.7 Tailwind config (drop-in)

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: '#0B0B0D',
        surface: { DEFAULT: '#131316', hover: '#1A1A1F', inset: '#1C1C22' },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.16)',
        },
        ink: { primary: '#F5F5F7', secondary: '#9B9BA3', tertiary: '#6E6E76' },
        accent: { 100: 'rgba(111,107,239,0.12)', 300: '#A5A3F7', 400: '#8B87F2', 500: '#6F6BEF', 600: '#5A55D9' },
        mail: { 100: 'rgba(216,90,48,0.14)', 400: '#E2683E', 500: '#D85A30', text: '#F0997B' },
        cal: { 100: 'rgba(55,138,221,0.14)', 400: '#4C97E0', 500: '#378ADD', text: '#85B7EB' },
        success: { 100: 'rgba(34,197,134,0.14)', 400: '#2ECC8F', text: '#6FE3B4' },
        warning: { 100: 'rgba(239,159,39,0.16)', 400: '#EF9F27', text: '#FAC775' },
        critical: { 100: 'rgba(226,75,74,0.16)', 400: '#E24B4A', text: '#F09595' },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'monospace'],
      },
      borderRadius: { sm: '6px', md: '8px', lg: '14px', xl: '22px' },
    },
  },
};
```

## 4. Typography

### 4.1 Type families

Unigent uses one grotesk sans for both display and body (a deliberate developer-tool choice in the spirit of Linear/Vercel/Raycast, not a missing pairing), plus a monospace face reserved for anything machine-generated.

| Role | Family | Fallback stack |
|---|---|---|
| Display & body | Inter (or Geist) | `-apple-system, "Segoe UI", sans-serif` |
| Command / code / data | JetBrains Mono (or Geist Mono) | `"IBM Plex Mono", monospace` |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 4.2 Type scale

Only two weights are used anywhere: 400 (regular) and 500–600 (medium/semibold for emphasis). Avoid 700+ except hero display type.

| Role | Size | Weight | Line-height | Letter-spacing | Color token |
|---|---|---|---|---|---|
| Display / H1 (hero) | 56–64px | 700 | 1.08 | -0.02em | `--text-primary` |
| H2 (section headline) | 32–36px | 600 | 1.15 | -0.01em | `--text-primary` |
| H3 (card/feature headline) | 22–24px | 600 | 1.3 | 0 | `--text-primary` |
| Body large (hero subhead) | 18–19px | 400 | 1.6 | 0 | `--text-secondary` |
| Body (default) | 15–16px | 400 | 1.6 | 0 | `--text-secondary` |
| Eyebrow / pill label | 11–12px | 500 | 1.4 | 0.06em, uppercase | `--text-secondary` |
| Panel header label (e.g. "CONNECTED") | 11–12px | 600 | 1.4 | 0.05em, uppercase | `--text-tertiary` |
| Component title (list item, name) | 13–14px | 500 | 1.4 | 0 | `--text-primary` |
| Component subtitle / meta | 12–13px | 400 | 1.4 | 0 | `--text-tertiary` |
| Stat number | 32–40px | 600 | 1.1 | -0.01em | `--text-primary` or functional color |
| Button label | 14–15px | 500 | 1 | 0 | varies |
| Command / monospace text | 13–14px | 400 | 1.5 | 0 | `--text-primary`, prompt glyph in `--accent-400` |

### 4.3 Numerals & stats

Big numbers (`12,796`, `94%`, `100%`, `6`) always render at the "Stat number" scale, use comma separators for counts, and are always immediately followed by a smaller plain-language caption on the next line (`--text-tertiary`) explaining what the number proves. A thin progress bar or ring beneath reinforces the same value visually — never present a stat number alone without one of these two supports.

## 5. Layout, spacing & radius

### 5.1 Spacing scale (4px base)

| Token | px | Typical use |
|---|---|---|
| space-1 | 4px | icon-to-text gap |
| space-2 | 8px | chip internal padding |
| space-3 | 12px | row internal gap |
| space-4 | 16px | small card padding, default gap |
| space-5 | 20px | default card padding |
| space-6 | 24px | large card padding, grid gutter |
| space-8 | 32px | gap between stacked cards |
| space-10 | 40px | sub-section gap |
| space-14 | 56px | gap between components within a section |
| space-20 | 80px | mobile section padding |
| space-30 | 120px | desktop section padding |

### 5.2 Radius scale

| Token | px | Use |
|---|---|---|
| `--radius-sm` | 6px | kbd chip, small tags |
| `--radius-md` | 8px | buttons, inputs, icon bubbles |
| `--radius-lg` | 14px | cards, panels, command windows |
| `--radius-xl` | 22px | hero demo frame, large showcase containers |
| `--radius-pill` | 999px | badges, avatars, eyebrow tags |

Never apply radius to a single-sided border (e.g. a left accent border on an activity row) — rounded corners only read correctly with a border on all sides.

### 5.3 Section rhythm

Desktop sections use 120px top/bottom padding; mobile drops to 80px. Content max-width is ~1200–1280px, centered, with 24–40px side gutters on mobile.

### 5.4 Breakpoints

| Name | Range | Behavior |
|---|---|---|
| Mobile | <640px | Single column everywhere; a 3-pane dashboard collapses to one tabbed pane at a time |
| Tablet | 640–1023px | Marketing 2-col sections may collapse to 1 col; dashboard stays tabbed or shows 2 of 3 panes |
| Desktop | 1024–1439px | Full layouts as documented; dashboard shows all 3 panes at reduced width |
| Wide | ≥1440px | Reference width from source screenshots |

## 6. Surfaces, elevation & borders

There are no drop shadows anywhere in this system. Depth is communicated purely through three flat luminance steps plus hairline borders:

1. **Canvas** (`--bg-canvas`) — the page itself.
2. **Surface** (`--bg-surface`) — anything that reads as a discrete panel: cards, command windows, nav bar, list containers. Always paired with a `0.5px solid var(--border-default)` border and `--radius-lg`.
3. **Inset** (`--bg-surface-inset`) — anything nested one level deeper inside a surface: chips, pills, text inputs, the highlighted row inside an activity feed.

A fourth, occasional layer is the **glow halo**: a blurred, colored, low-opacity circle sitting behind a focal icon or node (see 3.5 and the network-graph component in 8.12). Use it only behind brand/system-level icons — never behind ordinary content cards.

## 7. Iconography

- Style: thin outline icons only, no filled/solid variants, consistent ~1.5px stroke weight.
- Recommended set: **Lucide** (closest match to the source product's icon weight and pairs cleanly with Inter).
- Icon bubble — the standard container for any icon attached to a list row or card header:
  - Small (28px): activity feed rows, reasoning-step nodes.
  - Medium (40px): card header icons (e.g. the mail icon on a "GMAIL" card, the calendar icon on a "CALENDAR" card), connected-integration rows.
  - Background = the domain's `-100` tint, icon stroke = the domain's `-400`, radius = `--radius-md`.
- Concept → icon name reference: mail → `mail`, calendar → `calendar`, send/confirmation → `send`, time → `clock`, success → `check-circle-2`, priority/alert → `alert-triangle`, conflict/sync → `git-merge`, info → `info`, brand mark → `zap`, command palette → `command`, disclosure → `chevron-right`, person fallback → `user`.

## 8. Core components

Default component states, unless noted otherwise per component:

| State | Treatment |
|---|---|
| Default | as specified |
| Hover | `--border-default` → `--border-strong`, background steps one level lighter — no transform/scale |
| Selected / active | border becomes the domain's functional color at full opacity, background gains that domain's `-100` tint |
| Disabled | text → `--text-disabled`, 50% opacity, no hover response |

### 8.1 Navbar

Fixed top bar, `--bg-canvas` background, `0.5px solid var(--border-subtle)` bottom border, 64px height. Logo + wordmark left (`--accent-300`, weight 600), nav links center-left (`--text-secondary`, 14px), theme toggle + "Sign in" (ghost) + primary button right.

### 8.2 Buttons

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--accent-500`, hover `--accent-600` | `--text-primary` (white) | none | Main CTAs ("Get early access", "Connect now") |
| Secondary / outline | `--bg-surface` | `--text-primary` | `0.5px solid var(--border-default)` | Secondary actions ("Watch 60-second tour") |
| Link | transparent | `--accent-300` | none | Inline links, always end with a trailing `→` glyph |

Height 40–44px, `--radius-md`, horizontal padding 20–24px, label weight 500. Secondary buttons may carry a trailing **kbd chip** — a tiny bordered tag (e.g. `⌘K`) in `--bg-surface-inset`, `--radius-sm`, 11px monospace, `--text-tertiary`.

### 8.3 Eyebrow / pill badge

Section-opening tag, e.g. "AI AGENT", "AI-POWERED INTEGRATIONS". Pill shape (`--radius-pill`), `1px solid var(--accent-100)` border tinted to match, background `--accent-100`, text `--accent-300`, 11–12px uppercase weight 500, optional leading `zap` icon at 12px.

### 8.4 Status / priority badge

```css
.badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: var(--radius-pill); font-size: 12px; font-weight: 500; }
.badge--critical { background: var(--red-100); color: var(--red-text); }
.badge--high     { background: var(--amber-100); color: var(--amber-text); }
.badge--low      { background: var(--gray-100); color: var(--gray-text); }
.badge--success  { background: var(--green-100); color: var(--green-text); }
```

### 8.5 Chip / extracted-intent tag

Used to show parsed, machine-extracted values (`schedule_event`, `send_email`, `Thu · 3:00 PM`). Background `--bg-surface-inset`, `0.5px solid var(--border-default)`, `--radius-sm`, padding 4px 10px, font `--font-mono` 12–13px, color `--text-secondary`. A chip representing a confirmed/locked value (like a resolved time) upgrades its border to `--accent-400` at 40% opacity.

### 8.6 Window chrome

The signature "this is real software" frame wrapping any command panel or live demo.

```html
<div class="window">
  <div class="window__bar">
    <span class="dot dot--red"></span>
    <span class="dot dot--amber"></span>
    <span class="dot dot--green"></span>
    <span class="window__label">unigent · command</span>
    <span class="window__status">● live</span>
  </div>
  <div class="window__body"><!-- content --></div>
</div>
```

```css
.window { background: var(--bg-surface); border: 0.5px solid var(--border-default); border-radius: var(--radius-lg); overflow: hidden; }
.window__bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-bottom: 0.5px solid var(--border-subtle); font-family: var(--font-mono); font-size: 12px; color: var(--text-tertiary); }
.dot { width: 8px; height: 8px; border-radius: 50%; }
.dot--red { background: #E2683E; } .dot--amber { background: #EF9F27; } .dot--green { background: #2ECC8F; }
.window__status { margin-left: auto; display: flex; align-items: center; gap: 6px; color: var(--green-text); }
```

The three traffic-light dots are decorative chrome only (not functional controls). The `live` status uses the **pulse-dot** animation from section 9.

### 8.7 Command / prompt input

Monospace text field inside a window body. Background `--bg-surface-inset`, `0.5px solid var(--border-default)`, `--radius-md`, height ~44px. A static `>` glyph in `--accent-400` prefixes the typed value, which renders in `--font-mono` 14px `--text-primary`.

### 8.8 Reasoning stepper (vertical)

For showing an agent's trace: Understand → Plan → Act → Confirm. A 1px `--border-subtle` line runs vertically through a column of icon nodes (28px circle, domain-colored per step — indigo for Understand/Plan, the acted-on tool's color for Act, green for Confirm). Each node pairs right with a title (`--text-primary`, 14px, 500) and subtitle (`--text-tertiary`, 12px). The stepper ends with a labeled progress bar ("Action complete" + percentage), 4px height, `--bg-surface-inset` track, `--accent-500` fill.

### 8.9 Workflow stepper (horizontal)

For showing a multi-step automation run (Trigger → Parse → Act → Notify). A row of numbered circular nodes (32–36px) connected by a horizontal line. States: active = `--accent-500` fill + glow, pending = outline only in `--border-default` with muted text, complete = filled with a checkmark. Title + subtitle stack centered beneath each node.

### 8.10 Activity feed row (with recency fade)

The defining list pattern of the product — used for inbox triage, agent activity logs, and any "things that just happened" feed.

- Anatomy: icon bubble (small, domain-colored) + title (`--text-primary`, 13–14px, 500) + subtitle (`--text-tertiary`, 12px) stacked, optional trailing badge/status icon.
- The most recent row gets full opacity, a `--bg-surface-hover` background, and a 2px solid left accent border in the domain's color (radius reset to 0 on that side per the no-rounded-single-border rule).
- Every row after that fades: opacity follows `max(35%, 100% − 22% × index)` — so row 2 ≈ 78%, row 3 ≈ 56%, row 4 ≈ 35%. No left border or background tint on faded rows.

### 8.11 Connected-integration row

Anatomy: medium icon bubble (domain-colored) + integration name (14px, 500) + one-line permission description (`--text-tertiary`, 12px) + a small trailing dot indicator when selected. Default border `--border-default`; selected state upgrades the border to the domain color at ~40% opacity and adds a filled dot in that same color on the right edge.

### 8.12 Stat / metric card

Background `--bg-surface`, padding `space-5`, `--radius-lg`. Uppercase label (11px, `--text-tertiary`) → big number (32–40px, 600, `--text-primary` or a domain color when the stat belongs to one tool) → one-line caption (`--text-tertiary`) → optional thin progress bar (`--accent-500` fill on `--bg-surface-inset` track) or a circular progress ring (6–8px stroke, round linecap, track in `--border-default`, progress arc in the relevant functional color) for percentage-style stats like "100% automated coverage."

### 8.13 Avatar & stacked avatar group

Circle, 32–40px, solid saturated background (rotate through green/pink/purple/amber/blue across different people), 2-letter initials in white, weight 500. Stacked groups overlap avatars ~40% with a `2px solid var(--bg-canvas)` ring to separate them, plus a trailing `+N` bubble in `--bg-surface-inset` / `--text-tertiary` for overflow.

### 8.14 Network / connection graph

A small system-overview visualization: one central brand node (80–90px circle, `--accent-500` fill, `--accent-glow` halo blurred ~35px behind it, labeled "Unigent · AI Agent" beneath) connects via 1px dashed `--border-strong` lines to smaller satellite nodes (48–56px, `--bg-surface` fill with a domain-colored ring stroke and a matching faint glow) representing each connected tool. A one-line caption sits beneath the whole graph (e.g. "Gmail & Google Calendar — live"). Use sparingly — this is the one illustrative exception in an otherwise UI-only visual language.

### 8.15 Mini calendar week strip

A row of 5–7 equal rounded cells (~32–40px), each showing a single capital day letter. Inactive cells: transparent background, `--text-tertiary`. Active/selected day: `--blue-100` background, `--blue-500` border, `--text-primary` letter.

### 8.16 Mini testimonial row

Small avatar (28px) + a single-line quote in `--text-primary` at 13–14px, stacked in a list of 2–3 inside a card.

### 8.17 Email capture form (final CTA only)

A single flex row: text input (`--bg-surface-inset`, `--border-default`, `--radius-md`, `--text-tertiary` placeholder) immediately followed by a primary button, both 44–48px tall. This pattern is reserved for the marketing site's final conversion moment — don't reuse it for in-product forms.

### 8.18 Marquee ticker

A full-bleed, single-line, continuously auto-scrolling strip of short value-prop phrases separated by a small `--accent-400` dot. `--text-secondary`, 14px. Purely textural — sits at a section seam, never carries primary content.

## 9. Motion & interaction

Motion is restrained and purposeful — it signals state changes, never decorates. All animations respect `prefers-reduced-motion: no-preference`; reduced-motion users get instant state changes instead.

| Name | Spec | Use |
|---|---|---|
| pulse-dot | opacity 1 → 0.4 → 1, 1.6–2s ease-in-out infinite | "live" status indicators |
| blinking-cursor | opacity step 1/0 every 0.5s, `steps(1)` | typewriter-style quote animation |
| progress-fill | width or stroke-dashoffset 0 → target, 0.8–1.2s ease-out, plays once on mount/in-view | stat bars, rings, "Action complete" bar |
| fade-in-stagger | opacity 0→1 + translateY 8px→0, 0.4s ease-out, 60–80ms stagger per child | activity rows and cards entering viewport |
| hover-lift | border-default → border-strong + one-step-lighter background, 150ms ease — no transform/scale | cards, buttons, list rows |
| glow-pulse | halo opacity 25% → 45% → 25%, 3–4s ease-in-out infinite | brand node, central graph icon |
| cross-pane highlight | left border + background tint animate 0→full over 200ms, hold 1.5–2s, fade over 600ms | the signature dashboard interaction — see 13.2 |

## 10. Imagery & illustration policy

No photography, no 3D renders, no stock illustration, no mascots. Visual richness comes only from: real coded UI chrome (rendered as live components, never flat screenshots), ambient blurred gradient glows (max one or two colors, low opacity, per section), and the network-graph diagram as the single allowed abstract-illustrative element, reserved for system/connection concepts.

## 11. Voice & content guidelines

- Sentence case everywhere — headlines, buttons, labels. Never Title Case, never all-caps body copy (all-caps is reserved for 11–12px eyebrow/panel labels only).
- Headlines are short declarative sentences or two-line fragments built on contrast ("Stop managing tasks. Start delegating them.").
- Body copy stays to one or two plain sentences per section; concrete verbs ("automate," "draft," "schedule," "report back") over marketing adjectives.
- Use an em dash to append a one-clause proof or clarification after a claim or number — e.g. "and counting — across all active users", "Gmail & Google Calendar — live". This is a recurring, deliberate voice device, not a typo.
- System-facing tags (extracted intent chips) use `snake_case` in monospace — deliberately exposing the machine's literal parse to build trust that the agent understood correctly.
- Every stat number ships with a one-line caption explaining what it proves; never present a number in isolation.
- No exclamation marks. Confidence comes from brevity, not punctuation.

## 12. Accessibility & theming notes

- Maintain at least 4.5:1 contrast for body text. `--text-tertiary` (`#6E6E76`) is for captions and large/non-critical text only — don't use it for primary reading content at small sizes.
- Functional colors always pair their `-text` variant for text-on-tint; never set a badge's label in the raw `-400`/`-500` swatch.
- All interactive elements need a visible focus ring: `2px solid var(--accent-400)` with 2px offset. None of the source screenshots show this state explicitly — it must be added as a hard requirement.
- This system is documented dark-mode-only; the source nav includes a theme toggle but no light-mode screen was provided. If light mode is required, invert the neutral tokens (canvas → near-white, surface → white/very-light-gray, text inverted) while keeping all six functional hues, shifting each to a darker/more saturated stop for sufficient contrast on a light background. Treat this as a follow-up task, not an assumption to extrapolate silently.

## 13. Page composition recipes

### 13.1 Marketing site section order

Hero (headline + dual CTA + product frame) → feature grid (alternating text/visual pairs: command demo, workflow stepper, inbox triage) → AI agent showcase (command window + reasoning stepper, two-column) → integrations showcase (network graph + activity feed + stat cards, asymmetric grid) → proof (quote card + stat cards + mini testimonials + marquee) → final CTA (headline + email capture).

### 13.2 Application dashboard recipe — Gmail / AI chat / Calendar

A three-pane workspace shell using the exact visual language of sections 8.6–8.11.

```
┌──────────────────────────────────────────────────────────────────┐
│  Unigent         [Search / Cmd+K]                    [Bell] [You] │  top bar — 64px
├────────────────┬──────────────────────────────┬───────────────────┤
│ INBOX           │  unigent · command   ● live  │  CALENDAR          │
│ (coral domain)  │ ┌────────────────────────┐   │  (blue domain)     │
│                 │ │ chat thread              │   │  M  T  W  T  F     │
│ [row] unread    │ │ understand → plan →      │   │  [agenda row]      │
│ [row]           │ │ act → confirm             │   │  [agenda row]      │
│ [row] read      │ └────────────────────────┘   │  [agenda row]      │
│ ...             │ > type a command...   [Send] │  ...               │
├────────────────┼──────────────────────────────┼───────────────────┤
│ Gmail connected │                                │ Calendar connected│
└────────────────┴──────────────────────────────┴───────────────────┘
   ~320px                  flexible (≥600px)             ~360px
```

Pane-by-pane:

- **Left — Inbox.** Header uses the panel-header label style ("INBOX") plus a live/sync `pulse-dot`. Each email is an activity-feed row (8.10) in the coral domain — unread mail sits at full opacity with the coral left border, older/read mail fades per the recency formula. Each row's trailing element is a priority badge (8.4: Critical/High/Low/Ignore) reused verbatim from the source's inbox-triage pattern. A connected-integration row (8.11) for the Gmail account pins to the bottom of the pane.
- **Center — AI chat.** The entire pane is wrapped in window chrome (8.6), titled "unigent · command" with a live dot. The thread shows the user's plain-language messages right-aligned in `--bg-surface-inset` bubbles, and the agent's replies left-aligned as a compact reasoning stepper (8.8: Understand → Plan → Act → Confirm) followed by inline result cards mirroring the source's two-up Gmail/Calendar result cards. The input field at the bottom is the command prompt (8.7) with a leading `>` glyph and a trailing send button.
- **Right — Calendar.** Header "CALENDAR" plus live dot. A mini week strip (8.15) sits at top with the current day highlighted in blue. Below it, a vertical agenda list reuses the activity-feed row pattern (8.10) in the blue domain — each row is an event with a time subtitle and an optional status badge (e.g. amber for a scheduling conflict). A connected-integration row for Google Calendar pins to the bottom.
- **Signature interaction.** When the agent in the center pane completes an action, the affected row in the left or right pane plays the cross-pane highlight animation (section 9) — its border and background tint flash that pane's domain color, then settle. This is the one moment of motion that ties all three panes together and should be the dashboard's single most memorable detail, per tenet 4.

Below 1024px, collapse to a tabbed single-pane view (Inbox / Chat / Calendar as a top tab row) rather than shrinking all three panes simultaneously.

## 14. Do / Don't checklist

**Do:** keep the canvas near-black with hairline borders · give brand/AI actions exactly one accent color · let mail and calendar keep their own established hues · render real window chrome for any product/command demo · let big numbers carry the proof, always with a caption · fade older list items to show recency · write in sentence case everywhere · use monospace for anything machine-parsed or command-like.

**Don't:** use pure `#000` anywhere · add drop shadows or skeuomorphic depth · fill buttons or text with gradients · write buttons or headlines in Title Case · let more than two functional colors compete in one view · use emoji in product copy · reach for stock photography or 3D illustration · cycle colors rainbow-style across unrelated items · round a single-sided border · add bounce or scale to hover states.

## 15. Quick-reference cheat sheet

| Token | Value |
|---|---|
| Canvas | `#0B0B0D` |
| Surface | `#131316` |
| Surface inset | `#1C1C22` |
| Border default | `rgba(255,255,255,0.10)` |
| Text primary | `#F5F5F7` |
| Text secondary | `#9B9BA3` |
| Text tertiary | `#6E6E76` |
| Brand accent | `#6F6BEF` (button), `#8B87F2` (icon/text) |
| Mail / Gmail | `#D85A30` |
| Calendar | `#378ADD` |
| Success | `#2ECC8F` |
| Caution | `#EF9F27` |
| Critical | `#E24B4A` |
| Radius — button/input | `8px` |
| Radius — card/panel | `14px` |
| Radius — badge/pill | `999px` |
| Font — display/body | Inter / Geist |
| Font — command/data | JetBrains Mono / Geist Mono |
