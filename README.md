# 拾序

> 把纷乱拾成秩序

拾序是一款打开即用的中文待办清单。你可以按日期和优先级安排工作与生活，也可以连接自己的 AI 服务，把聊天记录、会议纪要或随手记下的文字整理成待办。

## 快速开始

### 运行网页版

准备 Node.js 20.19 或更高的 20.x 版本，或 Node.js 22.12 及以上版本。项目使用 pnpm 10，锁定版本为 `10.26.1`。[Vite 环境要求](https://vite.dev/guide/#scaffolding-your-first-vite-project)

```sh
git clone https://github.com/NeonSaya/todolist-project.git
cd todolist-project
pnpm install --frozen-lockfile
pnpm dev
```

在浏览器打开终端显示的本地地址。

### 安装 Windows 桌面版

从源码构建桌面版时，先按上文安装项目依赖。Windows 构建还需要 Rust MSVC 工具链、Microsoft C++ Build Tools 的「使用 C++ 的桌面开发」工作负载和 Microsoft Edge WebView2。需要调试桌面版时，在仓库根目录执行 `pnpm desktop dev`。[Tauri Windows 开发环境](https://v2.tauri.app/start/prerequisites/#windows)

在仓库根目录运行以下命令生成安装包。

```sh
pnpm desktop build
```

在 Windows x64 上，默认生成的安装包为 `src-tauri/target/release/bundle/nsis/拾序_<版本>_x64-setup.exe`。双击安装后，在开始菜单搜索「拾序」。如果系统缺少 WebView2，安装程序会联网下载运行时。[WebView2 安装说明](https://v2.tauri.app/distribute/windows-installer/#webview2-installation-options)

## 管理任务

首次打开本地清单时，拾序会添加一组示例任务，方便熟悉各个日期视图。

创建任务时，输入标题，选择日期和高、中、低优先级，还可以补充备注。点击 **添加** 或按 `Enter` 保存。点击任务标题可以编辑。标记完成后可通过提示撤销，也可以在 **已完成** 视图把任务改回未完成。

| 视图 | 显示内容 |
| --- | --- |
| 今天 | 日期为今天的任务，以及今日完成进度 |
| 即将到来 | 日期在今天之后的未完成任务 |
| 已逾期 | 日期早于今天的未完成任务 |
| 全部 | 所有任务，包括无日期任务，按进行中和已完成分组 |
| 已完成 | 已完成的任务，最近完成的排在前面 |

界面默认跟随系统主题。手动选择浅色或深色后，下次打开会继续使用该设置。

## 用 AI 整理待办

1. 打开 **AI 设置**，填写服务商的 OpenAI 兼容 **Base URL**、**API Key** 和**模型名称**。
2. 点击 **测试连接**，确认服务能够响应后点击 **保存**。
3. 打开 **智能添加**，粘贴要整理的文字，点击 **分析** 或按 `Ctrl + Enter`。在 macOS 网页中也可按 `⌘ + Enter`。
4. 检查生成的标题、日期、优先级和备注，按需编辑，勾选要保留的建议后批量添加。

Base URL 填到服务商提供的接口前缀即可。拾序会追加 `/chat/completions`，粘贴完整请求地址时也会自动整理末尾路径。

| 服务示例 | Base URL | 模型名称 |
| --- | --- | --- |
| OpenAI（界面默认值） | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com` | `deepseek-flash` |

模型名称以所选服务商提供的模型 ID 为准。[DeepSeek API 配置示例](https://api-docs.deepseek.com/quick_start/agent_integrations/)

## 数据与隐私

Windows 版支持离线添加、编辑和完成任务，清单保存在应用 WebView 的 IndexedDB 中。网页版默认使用当前站点的 IndexedDB，两者各有一份本地清单。

AI 配置保存在当前浏览器或桌面 WebView 的本地存储中。测试连接和分析文字时，拾序会将 API Key 随请求发送给配置的服务商。分析请求还包含粘贴的文字。网页版使用跨域接口时，服务商需要允许该站点发起跨域请求。可在 **AI 设置** 中使用 **清除配置** 移除本地连接信息。

## 开发与测试

在仓库根目录运行以下命令。

```sh
pnpm typecheck
pnpm check
pnpm exec playwright install chromium --only-shell
pnpm test
```

`pnpm fix` 会应用 Biome 的自动修复。Playwright 用例覆盖任务增删改、跨午夜的日期视图、主题切换和 AI 整理流程。AI 用例使用模拟接口，可重复运行。

`pnpm build` 将网页构建到 `dist/`，`pnpm exec vite preview` 可在本地预览构建结果。部署到静态站点时，将 `/smart-add` 和 `/settings` 等页面路由回退到 `index.html`，以支持直接访问和刷新。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `src/` | React 页面、组件、路由和业务逻辑 |
| `src/lib/taskStore/` | 本地任务库、ICP 适配层及 Candid 绑定 |
| `src-tauri/` | Rust 桌面外壳、Windows 打包配置和桌面 AI 请求 |
| `public/` | 字体、图标、主题初始化脚本和网页运行时配置 |
| `backend/` | 可选的 ICP Motoko 后端、构建配置和迁移基线 |
| `tests/e2e/` | Playwright 端到端测试 |
| `docs/` | 界面设计与视觉规范 |

主题、色彩和界面组件的设计说明见 [设计文档](docs/design.md)。

## 可选的 ICP 后端

已有部署的 ICP Canister 时，可让网页版连接同一份匿名可读写的任务清单。在 `public/env.json` 填入实际的 Canister ID 和可选的接口地址。省略 `backend_host` 时使用 `https://icp-api.io`。

```json
{
  "backend_canister_id": "<你的后端 Canister ID>",
  "backend_host": "https://icp-api.io"
}
```

构建后可在 `dist/env.json` 找到运行时配置。将网页配置设为 `{}` 时，应用使用当前浏览器的本地清单。

维护后端需要 Mops CLI。编译器、Lintoko 和 PocketIC 的版本已在 `backend/mops.toml` 中固定。[Mops 构建文档](https://docs.mops.one/cli/mops-build)

```sh
cd backend
mops check
mops build
cd ..
pnpm bindgen
```

`mops check` 检查代码和状态迁移兼容性。`mops build` 在 `backend/dist/` 生成 Wasm 和 Candid 文件，并在 PocketIC 中进行本地安装验证。接口变更后，`pnpm bindgen` 根据构建出的 Candid 文件更新前端绑定。
