# Design Brief

## Direction

拾序 — two fully designed themes: **晨瓷** (light: cool porcelain canvas, white cards, deep jade ink) and **夜航** (dark: obsidian canvas, charcoal cards, luminous jade). Tagline: 把纷乱拾成秩序.

## Tone

Luxury-refined productivity tool (Linear / Things 3 polish): calm layered surfaces, crisp type, one action color, information legible at a glance.

## Differentiation

AI surfaces alone wear the jade→sky→periwinkle aurora (`ai-border`, `text-gradient-aurora`); every status (priority, date) has a dedicated soft-pill token pair tuned per theme.

## Color Palette

| Token       | Light (晨瓷)    | Dark (夜航)     | Role                                   |
| ----------- | --------------- | --------------- | -------------------------------------- |
| background  | 0.972 0.005 250 | 0.155 0.012 255 | canvas + faint jade/periwinkle ambient |
| card        | 0.997 0.002 250 | 0.2 0.014 255   | task / overview / settings cards       |
| foreground  | 0.235 0.022 258 | 0.95 0.008 240  | primary text                           |
| muted-fg    | 0.5 0.02 256    | 0.7 0.018 250   | meta text, labels                      |
| primary     | 0.52 0.115 172  | 0.82 0.14 172   | jade CTA, active nav, ring, focus      |
| accent      | 0.52 0.15 274   | 0.76 0.12 268   | periwinkle — AI only                   |
| destructive | 0.56 0.185 25   | 0.7 0.17 22     | delete, errors                         |
| success     | 0.55 0.13 152   | 0.78 0.15 152   | completed check, 连接成功              |
| warning     | 0.62 0.14 62    | 0.83 0.13 78    | caution notices                        |

Status tokens (each has base / `-soft` fill; priority also `-edge`): `--priority-high|medium|low`, `--date-today|tomorrow|overdue`, `--success-soft`, `--warning-soft`.

## Typography

- Display: Space Grotesk (CJK → PingFang SC / Noto Sans SC) — titles, stat numbers, wordmark
- Body: Satoshi (CJK → PingFang SC / HarmonyOS Sans / Noto Sans SC) — all UI and task titles
- Mono: Geist Mono — dates, times, base URL / model fields (`tabular`)
- Scale: h1 `text-3xl md:text-4xl font-display font-semibold`; stat `text-4xl font-display font-bold tabular`; h2 `text-lg font-display font-semibold`; label `text-xs font-medium text-muted-foreground tracking-wider`; task title `text-[15px] font-medium`; meta `text-xs`

## Elevation & Depth

Canvas → `surface-card` (subtle fill, shadow-card) → hover `shadow-elevated` → dialogs `shadow-float`; overview/quick-add `surface-glass`. All shadows are CSS vars: soft cool-ink diffusion in light, deep ink + inset highlight in dark.

## Structural Zones

| Zone                | Background                | Border     | Notes                                                                   |
| ------------------- | ------------------------- | ---------- | ----------------------------------------------------------------------- |
| Sidebar (desktop)   | `bg-sidebar`              | `border-r` | logo + 拾序 + tagline; views w/ counts; 智能添加, AI 设置; theme toggle at bottom |
| Top bar (mobile)    | `surface-bar` sticky      | `border-b` | logo, page title, theme toggle icon button                              |
| Content             | `bg-background` + ambient | —          | max-w-3xl: header → overview → quick add → date groups                  |
| Bottom nav (mobile) | `surface-bar`             | `border-t` | 今天/即将/逾期/全部/智能; active = primary text + `bg-sidebar-accent` tile |
| Footer              | transparent               | `border-t` | small muted attribution                                                 |

## Spacing & Rhythm

Section gap `space-y-6 md:space-y-8`; group header → list `mt-3`; list `space-y-2`; card `p-4 md:p-5`; overview `p-5 md:p-6`; pills `px-2 py-0.5 rounded-full text-[11px]`.

## Component Patterns

- Theme toggle: segmented 浅色/深色/跟随系统 (Sun/Moon/Monitor icons), active segment `bg-card shadow-xs`, track `bg-secondary rounded-full`
- Nav item: active `bg-sidebar-accent text-sidebar-accent-foreground font-semibold` + 2px primary left bar; count pill `bg-secondary tabular`; overdue count `pill-date-overdue`
- Overview: hero row = 今日剩余 (largest), 已完成 + progress ring (primary stroke on `muted` track), 逾期 (`text-date-overdue`); spotlight task below a hairline divider
- Task card: checkbox → title (bold, foreground) → meta row (priority pill · date pill · note icon) aligned left; completed: `opacity-60`, strike, muted text
- Priority pills: `pill-priority-high|medium|low` (高/中/低); checkbox border `border-priority-*`; dot `bg-priority-*`
- Date pills: `pill-date-today` 今天, `pill-date-tomorrow` 明天, `pill-date-overdue` 逾期, else `pill-date-neutral` (mono)
- Row actions: desktop `opacity-0 group-hover:opacity-100 focus-within:opacity-100`; mobile always visible
- Buttons: primary `bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-glow`; AI `bg-gradient-aurora text-primary-foreground hover:shadow-glow-ai`; ghost secondary
- Inputs: `rounded-xl bg-card border-input focus-ring`; key masked with eye toggle; 仅保存在本地浏览器 note with lock icon
- Feedback: success banner `pill-success`, failure `bg-overdue-soft text-date-overdue`; AI 未配置 = `ai-border` callout with link to 设置
- Empty/loading/error: icon in `rounded-2xl bg-secondary` tile (64px) + display title + muted hint + one CTA; shimmer skeleton rows

## Motion

- Theme switch: `transition-theme` on surfaces (350ms color crossfade); body already transitions
- Entrance: `animate-fade-up` staggered 40ms (max 8); dialogs `animate-scale-in`
- Hover: cards lift 1px + `shadow-elevated`, `transition-smooth` 300ms; press `active:scale-[0.98]`
- Complete: `animate-check-pop` → `animate-strike` → fade to muted
- AI: `animate-aurora` on analyzing bar only; `prefers-reduced-motion` respected globally

## Constraints

- `:root` = 晨瓷 light, `.dark` = 夜航; never hardcode oklch in components — use tokens/utilities above
- Aurora & periwinkle only on AI surfaces; jade is the single action color
- Radius: 8px controls, 12px inputs, 16px cards, full pills; no full-page gradients beyond ambient
- border/input/card/sidebar/chart lack alpha — no `border-border/70`-style modifiers
- Preview's bottom swatch/tag strip is not part of the UI

## Signature Detail

Status pills with per-theme soft fills + hairline edges — priority and date read instantly in both porcelain and obsidian.
