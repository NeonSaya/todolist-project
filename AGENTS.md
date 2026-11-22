# Project Guidance

## User Preferences

- 界面要精致：有层次感的卡片布局、非默认字体、柔和配色、悬停和聚焦过渡动效
- 界面使用中文
- 前端要炫酷、好看、易用，不能有廉价感
- 产品名为「拾序」
- AI 使用用户自己配置的接口（地址、Key、模型），Key 只存于浏览器本地
- 更精致，展示最好的设计水准
- 同时支持浅色和深色模式，默认跟随系统，可手动切换并记住
- 信息更一目了然

## Accepted Requirements

- 一个待办清单助手应用
- 界面精致
- 帮助用户更好地安排事情（通过优先级、日期和今天/即将到来/逾期视图）
- 去掉登录、账户和管理员审批等用户功能，打开即用
- 粘贴文本由 AI 智能分析成任务，让添加任务更容易
- 可以自己配置 AI 的 API（地址、Key、模型等）
- 做成产品级工具，起一个正式名字，真正好用，能管理生活
- 前端炫酷、好看、易用，不能有廉价感
- 界面更精致
- 同时提供浅色和深色模式
- 信息展示更一目了然

## Verified Commands

- **typecheck**: `pnpm typecheck` (frontend), `mops check` from `backend/` (optional ICP backend)
- **fix**: `pnpm fix`
- **test**: `pnpm exec playwright install chromium --only-shell`, then `pnpm test`
- **build**: `pnpm build` (web), `pnpm desktop build` (Windows), `mops build` from `backend/` then `pnpm bindgen` from the root (ICP bindings)

## Learnings

- Route '/' validateSearch requires view; every Link/Navigate to '/' must pass search={{ view }}.
- Bundled fonts lack CJK glyphs; font vars include PingFang SC/Noto Sans SC fallbacks for Chinese text.
- border/input/card/sidebar/chart colors have no alpha placeholder; avoid opacity modifiers like border-border/70, use arbitrary oklch classes.
- DateField uses Popover quick picks and a native date input with an explicit apply action.
- Desktop and default web builds use an IndexedDB task store. Web deployments with a configured canister use the shared anonymous ICP task store.
- The frozen ICP migrations depend on the auth/approval packages. Task endpoints are anonymous and the stable baseline lives in `backend/stable`.
- AI settings are saved in localStorage. AI requests go directly to the configured OpenAI-compatible endpoint via browser fetch or the desktop transport.
- Routes are '/' (view search), '/smart-add' and '/settings'. The desktop build uses hash history.
- useCreateTask/useUpdateTask/useCreateTasks take TaskFields (date and note string or null).
- Biome rejects role=status on divs (use aria-live) and requires <title> in inline svg.
- List.map with a lambda in Motoko needs explicit type instantiation.
- App has light (:root 晨瓷) and dark (.dark 夜航) themes. The next-themes key is 'shixu-theme'. `public/theme.js` applies the saved theme before paint.
- Status colors are index.css utilities (pill-priority-*, pill-date-*, text-date-*, pill-success, pill-warning, bg-overdue-soft), not Tailwind color keys; no /alpha on them.
- Use datePillClass(date, today, completed)/dateTextClass from lib/tasks for date chips; PRIORITY_STYLE/PRIORITY_META map to pill-priority-* utilities.
- Shadows in tailwind.config.js read theme-aware CSS vars; never hardcode dark-only oklch glows.
- motion/react JS animations are not covered by the CSS reduced-motion rule; guard them with useReducedMotion.
- TaskList groups today/all views into 进行中/已完成; TaskItem shows edit/delete always below md, on hover at md+.
