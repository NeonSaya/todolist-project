# 拾序

> 把纷乱拾成秩序

拾序是一款打开即用的中文待办清单：按日期和优先级安排事情，也能接入自己配置的 AI 服务，把聊天记录、会议纪要或随手写下的文字整理成待办。

## 快速开始

### 运行网页版

网页版需要 Node.js 20.19 及以上的 20.x 版本，或 Node.js 22.12 及以上版本（[Vite 环境要求](https://vite.dev/guide/#scaffolding-your-first-vite-project)）。项目使用 pnpm 10，版本锁定在 `10.26.1`。

```sh
git clone https://github.com/NeonSaya/todolist-project.git
cd todolist-project
pnpm install --frozen-lockfile
pnpm dev
```

在浏览器打开终端里显示的本地地址。

### 安装 Windows 桌面版

从 [GitHub Releases](https://github.com/NeonSaya/todolist-project/releases) 下载最新的 x64 安装程序，双击安装后从开始菜单打开「拾序」。安装程序会为当前用户安装，并在系统缺少 WebView2 时联网下载运行时。

也可以从源码构建。先按上文安装项目依赖；Windows 上还需要 Rust MSVC 工具链、Microsoft C++ Build Tools 的「使用 C++ 的桌面开发」工作负载，以及 Microsoft Edge WebView2，详见 [Tauri Windows 开发环境](https://v2.tauri.app/start/prerequisites/#windows)。

调试桌面版时，在仓库根目录运行 `pnpm desktop dev`。生成安装包运行：

```sh
pnpm desktop build
```

Windows x64 上的安装包生成在 `src-tauri/target/release/bundle/nsis/拾序_<版本>_x64-setup.exe`。双击安装，然后从开始菜单打开「拾序」。系统缺少 WebView2 时，安装程序会联网下载运行时，见 [WebView2 安装说明](https://v2.tauri.app/distribute/windows-installer/#webview2-installation-options)。

## 管理任务

第一次打开清单时，拾序会添加一组示例任务，覆盖今天、逾期和之后几天，方便熟悉各个日期视图。

新建任务时填写标题，选择日期和优先级（高、中、低），需要时补一句备注，然后点 **添加** 或按 `Enter` 保存。点任务标题可以编辑。标记完成后，可以在提示里点 **撤销** 恢复，也可以到 **已完成** 视图把任务改回未完成。

| 视图 | 显示内容 |
| --- | --- |
| 今天 | 今天的任务和完成进度 |
| 即将到来 | 日期在今天之后、尚未完成的任务 |
| 已逾期 | 日期已过、尚未完成的任务 |
| 全部 | 所有任务（含无日期），分进行中和已完成 |
| 已完成 | 已完成的任务，最近完成的在前 |

界面默认跟随系统主题。手动选择浅色、深色或跟随系统后，下次打开会沿用这个选择。

## 用 AI 整理待办

1. 打开 **AI 设置**，填写 OpenAI 兼容服务的 **Base URL**、**API Key** 和**模型名称**。
2. 点 **测试连接**，确认连接成功后点 **保存**。
3. 打开 **智能添加**，粘贴要整理的文字，点 **分析**，或按 `Ctrl + Enter`；macOS 上也可以按 `⌘ + Enter`。
4. 检查生成的标题、日期、优先级和备注，按需修改，勾选要保留的条目后批量添加。

Base URL 填到服务商给出的接口前缀即可，拾序会补上 `/chat/completions`；直接粘贴完整请求地址时，末尾的这段路径也会被去掉。

| 服务示例 | Base URL | 模型名称 |
| --- | --- | --- |
| OpenAI（界面默认值） | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com` | `deepseek-flash` |

模型名称以服务商的模型 ID 为准，可参考 [DeepSeek API 文档](https://api-docs.deepseek.com/)。

## 数据与隐私

桌面版可以离线添加、编辑和完成任务，清单保存在应用 WebView 的 IndexedDB 里。网页版默认把清单保存在当前站点的 IndexedDB。两端各存一份，互不同步。

AI 配置保存在当前浏览器或桌面 WebView 的本地存储中。测试连接和分析文字时，API Key 会随请求发送给配置的服务商，分析请求还包含粘贴的文字。网页版由浏览器直接请求接口，服务商需要允许该站点发起跨域请求；桌面版通过应用内的 Rust 侧发请求，不受浏览器跨域限制。要移除本地连接信息，在 **AI 设置** 中点 **清除配置**。

## 开发与测试

在仓库根目录运行以下命令。

```sh
pnpm typecheck
pnpm check
pnpm exec playwright install chromium --only-shell
pnpm test
```

`pnpm check` 运行 Biome 检查，`pnpm fix` 自动修复。Playwright 用例覆盖任务的增删改、跨过本地午夜的日期视图、主题切换和 AI 整理流程；AI 用例使用本地模拟接口，可以反复运行。

`pnpm build` 把网页构建到 `dist/`，`pnpm exec vite preview` 可以本地预览。部署到静态站点时，需要把 `/smart-add`、`/settings` 等路由回退到 `index.html`，直接访问和刷新才能正常工作。

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

主题、色彩和组件规范见 [设计文档](docs/design.md)。

## 可选的 ICP 后端

如果已经部署了项目的 ICP Canister，可以让网页版连过去，共用同一份任务清单。这份清单对所有访客开放读写，没有登录，也没有权限隔离。在 `public/env.json` 填入 Canister ID 和可选的接口地址；省略 `backend_host` 时使用 `https://icp-api.io`。

```json
{
  "backend_canister_id": "<你的后端 Canister ID>",
  "backend_host": "https://icp-api.io"
}
```

构建后的运行配置在 `dist/env.json`。保持 `{}` 时，网页版使用当前浏览器的本地清单。

维护后端需要 Mops CLI，编译器、Lintoko 和 PocketIC 的版本都固定在 `backend/mops.toml` 里（[Mops 构建文档](https://docs.mops.one/cli/mops-build)）。

```sh
cd backend
mops check
mops build
cd ..
pnpm bindgen
```

`mops check` 检查类型、lint 和状态迁移兼容性。`mops build` 在 `backend/dist/` 生成 Wasm 和 Candid 文件，并用 PocketIC 做一次本地安装验证。改过接口后，运行 `pnpm bindgen` 按新生成的 Candid 文件更新前端绑定。
