# Design Brief

## Direction

拾序 — two focused themes: **晨瓷** (warm paper canvas, ivory cards, deep jade ink) and **夜航** (soft charcoal canvas, dark green-grey cards, luminous jade). Tagline: 把纷乱拾成秩序.

## Tone

A practical, quietly premium productivity tool: flat paper-like surfaces, crisp Chinese-first typography, one jade action color, and information that reads at a glance.

## Differentiation

The identity is a solid jade seal with one stepped line climbing upward — “拾级成序”. The interface uses the same single jade accent throughout; AI is identified by wording and a small icon, not a separate neon palette. Every priority and date state keeps a dedicated soft-pill token pair tuned per theme.

## Color Palette

| Token       | Light (晨瓷)    | Dark (夜航)     | Role                                |
| ----------- | --------------- | --------------- | ----------------------------------- |
| background  | 0.969 0.008 91  | 0.19 0.012 155  | warm paper / soft charcoal          |
| card        | 0.994 0.003 95  | 0.225 0.014 155 | task, overview and settings cards   |
| foreground  | 0.265 0.014 156 | 0.93 0.012 110  | primary text                        |
| muted-fg    | 0.482 0.016 154 | 0.69 0.016 130  | meta text and labels                |
| primary     | 0.445 0.085 162 | 0.76 0.105 158  | jade CTA, active nav, logo, focus   |
| accent      | 0.929 0.026 155 | 0.31 0.035 155  | low-key selected surfaces           |
| destructive | 0.56 0.185 25   | 0.7 0.17 22     | delete and errors                   |
| success     | 0.55 0.13 152   | 0.78 0.15 152   | completed check, 连接成功           |
| warning     | 0.62 0.14 62    | 0.83 0.13 78    | caution notices                     |

Status tokens (each has base / `-soft` fill; priority also `-edge`): `--priority-high|medium|low`, `--date-today|tomorrow|overdue`, `--success-soft`, `--warning-soft`.

## Typography

- Display: Space Grotesk (CJK → PingFang SC / Noto Sans SC) — titles, stat numbers, wordmark
- Body: Satoshi (CJK → PingFang SC / HarmonyOS Sans / Noto Sans SC) — all UI and task titles
- Mono: Geist Mono — dates, times, base URL / model fields (`tabular`)
- Scale: h1 `text-3xl md:text-4xl font-display font-semibold`; stat `text-4xl font-display font-semibold tabular`; h2 `text-lg font-display font-semibold`; task title `text-[15px] font-semibold`; meta `text-xs`

## Elevation & Depth

Canvas → `surface-card` (subtle border and shadow-card) → hover `shadow-elevated` → dialogs `shadow-float`. Surfaces are opaque; no backdrop blur or decorative glow. Shadows use theme-aware CSS variables.

## Structural Zones

| Zone                | Background           | Border     | Notes                                                                   |
| ------------------- | -------------------- | ---------- | ----------------------------------------------------------------------- |
| Sidebar (desktop)   | `bg-sidebar`         | `border-r` | logo + 拾序 + tagline; views w/ counts; 智能添加, AI 设置; theme toggle at bottom |
| Top bar (mobile)    | `surface-bar` sticky | `border-b` | logo, page title, theme toggle icon button                              |
| Content             | `bg-background`      | —          | max-w-3xl: header → overview → quick add → date groups                  |
| Bottom nav (mobile) | `surface-bar`        | `border-t` | 今天/即将/逾期/全部/智能; active = primary text + `bg-sidebar-accent` tile |
| Footer              | transparent          | `border-t` | small muted attribution                                                 |

## Spacing & Rhythm

Section gap `space-y-6 md:space-y-8`; group header → list `mt-3`; list `space-y-2`; card `p-4 md:p-5`; overview `p-5 md:p-6`; pills `px-2 py-0.5 rounded-full text-[11px]`.

## Component Patterns

- Theme toggle: segmented 浅色/深色/跟随系统 (Sun/Moon/Monitor icons), active segment `bg-card shadow-xs`, track `bg-secondary rounded-full`
- Nav item: active `bg-sidebar-accent text-sidebar-accent-foreground font-semibold` + 2px primary left bar; count pill `bg-secondary tabular`; overdue count `pill-date-overdue`
- Overview: hero row = 今日剩余 (largest), 已完成 + progress ring (primary stroke on `muted` track), 逾期 (`text-date-overdue`); spotlight task below a hairline divider
- Task card: checkbox → title (bold, foreground) → meta row (priority pill · date pill · note icon) aligned left; completed: strike and muted text
- Priority pills: `pill-priority-high|medium|low` (高/中/低); checkbox border `border-priority-*`; dot `bg-priority-*`
- Date pills: `pill-date-today` 今天, `pill-date-tomorrow` 明天, `pill-date-overdue` 逾期, else `pill-date-neutral` (mono)
- Row actions: desktop reveal on hover/focus; mobile always visible
- Buttons: primary `bg-primary text-primary-foreground rounded-lg font-semibold`; secondary `bg-secondary` or outline; pills are reserved for status and segmented controls
- Inputs: `rounded-xl bg-card border-input focus-ring`; key masked with eye toggle; local-only privacy note beside the field
- Feedback: success banner `pill-success`, failure `bg-overdue-soft text-date-overdue`; AI setup uses a plain bordered card and jade icon
- Empty/loading/error: one icon, display title, muted hint and one CTA; neutral shimmer skeleton rows

## Motion

- Theme switch: `transition-theme` on surfaces (350ms color crossfade)
- Entrance: `animate-fade-up` staggered 40ms (max 8); dialogs `animate-scale-in`
- Hover: cards lift 1px + `shadow-elevated`, `transition-smooth` 300ms; controls press down `active:scale-[0.98]`
- Complete: `animate-check-pop` → `animate-strike` → muted state
- AI: one neutral shimmer on the analyzing state; `prefers-reduced-motion` respected globally

## Constraints

- `:root` = 晨瓷 light, `.dark` = 夜航; never hardcode oklch in components — use tokens/utilities above
- Jade is the single action color; no violet, aurora or decorative gradient surfaces
- Radius: 10px controls, 12px inputs, 16px cards, full pills; no full-page gradients or glass blur
- border/input/card/sidebar/chart lack alpha — no `border-border/70`-style modifiers
- Brand mark: jade tile with one off-white stepped line (`public/logo.svg`), repeated in the desktop app icon

## Signature Detail

Status pills with per-theme soft fills and hairline edges — priority and date read instantly in both porcelain and charcoal.
