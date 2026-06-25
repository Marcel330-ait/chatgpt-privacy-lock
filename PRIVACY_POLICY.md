# Privacy Policy / 隐私政策

Effective date / 生效日期: 2026-06-25

## English

ChatGPT Privacy Lock is a local browser-extension privacy layer for masking ChatGPT sidebar navigation that may reveal conversation history, pinned chats, projects, library items, or search entry points.

### Data handled

- The extension stores its enabled/disabled state in `chrome.storage.local`.
- The extension stores a PIN-derived value using PBKDF2 with a random salt in `chrome.storage.local`.
- The extension stores temporary lock metadata such as `unlockUntil`, failed-attempt count, and cooldown time in `chrome.storage.local`.

### Data not collected

- The extension does not collect, transmit, sell, or share personal data.
- The extension does not upload ChatGPT conversations, sidebar titles, project names, prompts, files, account details, or browsing history to any server.
- The extension does not use analytics, tracking pixels, advertising identifiers, or remote code.

### Permissions

The extension uses the Chrome `storage` permission to save local settings and PIN-derived lock data. Its content script only runs on `https://chatgpt.com/*` and `https://chat.openai.com/*`.

### Security scope

This is a shoulder-surfing and casual-access privacy UX layer. It is not a replacement for device lock screen, Chrome profile protection, ChatGPT account security, or enterprise security controls.

## 中文

ChatGPT Privacy Lock 是一个本地浏览器扩展，用于遮罩 ChatGPT 侧边栏中可能暴露聊天历史、置顶聊天、项目、资料库或搜索入口的导航区域。

### 处理的数据

- 扩展会把开启/关闭状态存储在 `chrome.storage.local`。
- 扩展会使用 PBKDF2 + 随机 salt 保存 PIN 的派生值，存储位置为 `chrome.storage.local`。
- 扩展会保存临时锁定状态，例如 `unlockUntil`、错误次数和冷却时间，存储位置为 `chrome.storage.local`。

### 不收集的数据

- 扩展不会收集、传输、出售或共享个人数据。
- 扩展不会上传 ChatGPT 对话、侧边栏标题、项目名称、提示词、文件、账号信息或浏览历史到任何服务器。
- 扩展不使用分析工具、追踪像素、广告标识符或远程代码。

### 权限

扩展使用 Chrome 的 `storage` 权限来保存本地设置和 PIN 派生锁定数据。内容脚本只运行在 `https://chatgpt.com/*` 和 `https://chat.openai.com/*`。

### 安全边界

这是用于防肩窥和临时借用电脑场景的隐私 UX 层，不替代设备锁屏、Chrome 用户配置文件保护、ChatGPT 账号安全或企业级安全控制。
