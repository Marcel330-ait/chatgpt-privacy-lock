# ChatGPT Privacy Lock

> **PROPRIETARY AND CONFIDENTIAL — Private source code**<br>
> Copyright © 2026 Marcel ([@Marcel330-ait](https://github.com/Marcel330-ait)). All rights reserved.<br>
> Personal, private, non-commercial use only. See [CONFIDENTIAL_NOTICE.txt](CONFIDENTIAL_NOTICE.txt).

**中文**：一个 Chrome Manifest V3 扩展，用来保护 ChatGPT 左侧栏、Chat/Work 切换和 Work 历史目录中的隐私入口，同时不影响当前对话、消息输入框或发送按钮。

**English**: A Chrome Manifest V3 extension that protects ChatGPT sidebar navigation, the Chat/Work switch, and Work history—without affecting the active conversation, message composer, or send button.

## 功能亮点 / Highlights

| 中文 | English |
| --- | --- |
| 使用半透明液态玻璃遮挡并强模糊会暴露历史记录的侧边栏区域 | Uses translucent liquid-glass masks with strong blur on sensitive sidebar areas |
| 当前聊天、输入框、发送按钮保持可用 | Keeps the active chat, composer, and send button usable |
| PIN 正确后按用户设置的时间临时解锁 | Unlocks for the user-selected duration after a correct PIN |
| 到达用户设置的时间或点击“立即锁定”后重新锁定 | Re-locks when the chosen timer expires or Lock Now is pressed |
| PIN 使用 PBKDF2 + 随机 salt 存储 | Stores PIN with PBKDF2 + a random salt |
| 错误 PIN 多次后进入短暂冷却 | Adds a short cooldown after repeated incorrect PIN attempts |
| 可手动选择 Auto / 中文 / English | Lets users choose Auto / Chinese / English manually |
| 可选择保护 Search、Library、New chat、More、Pinned、Projects、Chats 以及 Chat/Work 与 Work 历史 | Lets users protect Search, Library, New chat, More, Pinned, Projects, Chats, and Chat/Work history |
| 遮挡玻璃可选择蓝紫、翡翠或玫瑰 | Offers Indigo, Emerald, and Rose mask-glass tints |
| 可自定义 1–120 分钟的解锁时间 | Lets users choose an unlock time from 1–120 minutes |
| 可选择仅打开点击项或解锁整个侧边栏 | Unlocks only the clicked item or the entire sidebar |
| PIN 弹窗支持窄屏网页和触摸操作 | Makes the PIN dialog responsive and touch-friendly |
| 可自愿提交反馈或留下真实评价 | Provides optional feedback and honest-review links |
| 开启、关闭、保存和立即锁定无需刷新页面 | Applies enable, disable, save, and Lock Now actions without reloading ChatGPT |

## 工作原理 / How it works

```mermaid
flowchart LR
    A["ChatGPT sidebar / ChatGPT 左侧栏"] --> B{"Enabled? / 已开启？"}
    B -->|No / 否| C["Normal UI / 正常界面"]
    B -->|Yes / 是| D["Mask history, pinned chats, projects, library, search / 遮罩历史、置顶、项目、资料库、搜索"]
    D -->|Click / 点击| E["PIN modal / PIN 弹窗"]
    E -->|Wrong / 错误| F["Incorrect PIN + cooldown / 错误提示 + 冷却"]
    E -->|Correct / 正确| G["Unlock clicked item or all / 打开点击项或全部"]
    G --> H["Auto lock again / 自动重新锁定"]
```

锁定后的侧边栏布局 / Locked sidebar layout:

```text
┌──────────── ChatGPT sidebar / 左侧栏 ────────────┐
│ New chat / More                 ← PIN protected   │
│ ─────── 🔒 Sidebar history locked ─────────────── │
│ Search chats / Library                            │
│ Pinned chat names / 置顶聊天名                    │
│ Project names / 项目名                            │
│ Previous chats / 历史聊天                         │
│                                                   │
│ Click mask → PIN → chosen scope + duration        │
│ 点击遮挡 → PIN → 按所选范围和时间打开             │
└───────────────────────────────────────────────────┘
```

## 安装 / Installation

1. **中文**：在 Chrome 地址栏打开 `chrome://extensions`。<br>
   **English**: Open `chrome://extensions` in Chrome.
2. **中文**：打开右上角的 **开发者模式**。<br>
   **English**: Turn on **Developer mode** in the upper-right corner.
3. **中文**：点击 **加载已解压的扩展程序**。<br>
   **English**: Click **Load unpacked**.
4. **中文**：选择本项目文件夹 `B:\chatgpt-privacy-lock`。<br>
   **English**: Select this project folder: `B:\chatgpt-privacy-lock`.
5. **中文**：打开 [chatgpt.com](https://chatgpt.com) 或 `chat.openai.com`。<br>
   **English**: Open [chatgpt.com](https://chatgpt.com) or `chat.openai.com`.

## 首次设置 / First-time setup

1. **中文**：点击 Chrome 工具栏里的扩展图标，打开 **ChatGPT Privacy Lock**。<br>
   **English**: Click the extension icon in Chrome's toolbar and open **ChatGPT Privacy Lock**.
2. **中文**：在 **设置 PIN / Set a PIN** 输入至少 4 位字符。<br>
   **English**: Enter a PIN with at least 4 characters.
3. **中文**：开启 **侧边栏保护 / Sidebar protection**。<br>
   **English**: Turn on **Sidebar protection**.
4. **中文**：选择语言：**Auto / 中文 / English**。<br>
   **English**: Choose a language: **Auto / 中文 / English**.
5. **中文**：勾选你想保护的区域：Search chats、Library、New chat/More、Pinned chats、Projects、Previous chats，以及 Chat/Work 与 Work 历史。<br>
   **English**: Select the areas to protect: Search chats, Library, New chat/More, Pinned chats, Projects, Previous chats, and Chat/Work with Work history.
6. **中文**：设置解锁时间，并选择 **仅打开点击项** 或 **打开全部侧边栏**。<br>
   **English**: Set the unlock time and choose **Clicked item only** or **Entire sidebar**.
7. **中文**：选择遮挡玻璃颜色：**蓝紫 / 翡翠 / 玫瑰**。颜色会实时改变遮挡玻璃，不需要保存，也不会改变扩展面板。<br>
   **English**: Choose a mask-glass tint: **Indigo / Emerald / Rose**. The masks update immediately without Save, while the popup UI remains neutral.
8. **中文**：点击 **保存设置 / Save settings**。<br>
   **English**: Click **Save settings**.
9. **中文**：刷新 ChatGPT 页面，或在 `chrome://extensions` 里重载扩展后再刷新页面。<br>
   **English**: Refresh ChatGPT, or reload the extension in `chrome://extensions` and then refresh the page.

## 日常使用 / Daily use

- **中文**：锁定时会显示 **🔒 History locked / 历史已锁定**，侧边栏历史区域会被遮罩。<br>
  **English**: When locked, **🔒 History locked** appears and sidebar history areas are masked.
- **中文**：遮挡层采用平衡透明度和模糊度的半透明玻璃效果，可选择蓝紫、翡翠或玫瑰。<br>
  **English**: Masks balance translucency and blur and are available in Indigo, Emerald, or Rose.
- **中文**：点击被保护区域会弹出 PIN 输入框。在累计模式中，已经打开的项目和聊天会一起保持显示，直到倒计时结束或立即锁定。<br>
  **English**: Clicking a protected area opens a PIN dialog. In cumulative mode, previously opened Projects and chats remain visible until the timer ends or Lock Now is pressed.
- **中文**：在“仅打开点击项”模式中，打开一个 Project 会同时显示这个 Project 里的子聊天，但其他 Project 继续锁定。<br>
  **English**: In Clicked item only mode, opening a Project also reveals that Project's child chats while other Projects remain locked.
- **中文**：Scheduled、Plugins、Apps 等常用目录以及 Pinned、Projects、Chats 标题会显示名称；私人条目只显示“项目”“聊天”或“置顶聊天”等类型，不显示真实标题。<br>
  **English**: General navigation and section labels remain identifiable; private rows show only generic labels such as Project or Chat.
- **中文**：Pinned 只是位置。扩展会根据链接和页面标记自动判断其中的条目是 Project 还是 Chat，并显示对应的通用类型。<br>
  **English**: Pinned is only a location. The extension uses link and DOM markers to identify whether each pinned row is a Project or Chat.
- **中文**：点击弹窗里的 **Lock Now / 立即锁定** 可以马上重新锁定。<br>
  **English**: Click **Lock Now** in the popup to re-lock immediately.
- **中文**：切换标签页或窗口不会提前锁定；只有倒计时结束或点击 **立即锁定** 才会重新锁定。<br>
  **English**: Switching tabs or windows does not end an unlock session; it re-locks only when the timer expires or **Lock Now** is pressed.
- **中文**：如果你只想隐藏 Projects 或 Previous chats，可以在弹窗里取消其它区域。<br>
  **English**: If you only want to hide Projects or Previous chats, uncheck the other areas in the popup.
- **中文**：主开关会立即锁定或取消保护；保存设置和立即锁定也会直接更新当前 ChatGPT 页面。<br>
  **English**: The master switch immediately enables or removes protection; Save settings and Lock Now also update the current ChatGPT page directly.
- **中文**：只有在安装或重新加载扩展后的第一个旧标签页需要刷新一次，以载入新版内容脚本。<br>
  **English**: An already-open tab only needs one refresh after installing or reloading the extension so it can load the new content script.
- **中文**：弹窗底部可以自愿提交反馈或留下真实评价，不会自动收集使用数据。<br>
  **English**: The popup footer provides optional feedback and honest-review links without collecting usage analytics.

## 文件结构 / Project structure

| File | 中文说明 | English |
| --- | --- | --- |
| `manifest.json` | Manifest V3 配置、权限、图标和 ChatGPT 匹配范围 | MV3 config, permissions, icons, and ChatGPT match patterns |
| `content.js` | 侧边栏识别、按区域遮罩、点击拦截、PIN 验证、自动锁定 | Sidebar detection, per-area masking, click interception, PIN verification, auto lock |
| `popup.html` / `popup.js` | 扩展弹窗、PIN 设置、语言与主题选择、隐藏范围、倒计时状态、立即锁定 | Popup, PIN setup, language and theme picker, protected-area choices, countdown status, Lock Now |
| `styles.css` | 遮罩、徽章、弹窗和弹窗 UI 样式 | Mask, badge, modal, and popup styles |
| `_locales/` | 中英双语文案 | Chinese/English localization strings |
| `PRIVACY_POLICY.md` | 隐私政策草案 | Privacy policy draft |
| `CHANGELOG.md` | 版本变更记录 | Version changelog |
| `CONFIDENTIAL_NOTICE.txt` | 权属、保密与非商业使用声明 | Ownership, confidentiality, and non-commercial-use notice |

## 隐私与安全边界 / Privacy and security scope

**中文**：这是面对肩窥和临时借用电脑场景的隐私 UX 层，不替代 ChatGPT 账号安全、设备锁屏、浏览器配置文件保护或账户级安全措施。扩展不会读取、上传或保存你的聊天内容。PIN 派生值和锁定状态仅存储在 `chrome.storage.local`。

**English**: This is a privacy UX layer for shoulder-surfing and casual-access scenarios. It does not replace ChatGPT account security, device locking, browser-profile protection, or account-level security. The extension does not read, upload, or store your chat contents. PIN-derived data and lock state are stored only in `chrome.storage.local`.

## 发布前清单 / Release checklist

See [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md).

## 权利声明 / Rights notice

**中文**：本项目为 Marcel 的私有、保密代码，未授予开源许可。禁止未经书面授权的商业使用、销售、分发、再授权或公开发布。

**English**: This project is Marcel's private and confidential code. No open-source license is granted. Commercial use, sale, distribution, sublicensing, or public release is prohibited without prior written permission.
