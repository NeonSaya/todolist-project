# 拾序

拾序是一款中文待办清单应用。按优先级和日期安排任务，在今天、即将到来、已逾期、全部和已完成视图之间切换。也可以连接自己的 OpenAI 兼容服务，将粘贴的文字整理成可编辑的任务。

## Windows 桌面版

运行 x64 安装包后，从开始菜单打开「拾序」。任务和主题保存在本机，重启后仍能读取，断网时也能继续管理待办。AI 设置保存在应用的 WebView 本地存储。测试连接或分析文字时，拾序直接请求你配置的接口。

首次启动有一组示例任务，用来展示各个日期视图。Windows 安装程序在缺少 WebView2 时会下载运行时。

## 开发和测试

需要 Node.js 20.19+ 和 pnpm 10。构建桌面版还需要 Windows、Rust MSVC 工具链及 WebView2。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm check
pnpm exec playwright install chromium --only-shell
pnpm test
```

在仓库根目录运行 `pnpm build`，网页产物生成在 `dist/`。`pnpm desktop dev` 启动桌面开发窗口，`pnpm desktop build` 生成 Windows 安装包。默认安装包目录为 `src-tauri/target/release/bundle/nsis/`。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `src/` | React 界面、路由、本地任务库和 AI 配置 |
| `src-tauri/` | Rust 桌面外壳、Windows 安装配置和 AI 请求 |
| `public/` | 字体、图标和网页运行时配置 |
| `backend/` | 可选的 ICP Motoko 后端及其构建配置和迁移基线 |
| `tests/e2e/` | Playwright 端到端测试 |
| `docs/` | 界面设计文档 |

## 可选的 ICP 后端

网页默认使用当前浏览器的本地任务库。为现有网页接回 ICP 任务库时，在 `public/env.json` 提供 `backend_canister_id` 和可选的 `backend_host`。

在 `backend/` 运行 `mops check` 和 `mops build`。修改 Motoko 接口后，回到仓库根目录运行 `pnpm bindgen` 更新前端绑定。
