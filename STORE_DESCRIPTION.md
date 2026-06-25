# Store Description / 商店描述

## Short description

Protect your ChatGPT sidebar history with a local PIN lock that keeps the active chat usable.

## Long description

ChatGPT Privacy Lock helps reduce shoulder-surfing and casual-access exposure by masking ChatGPT sidebar areas that can reveal conversation history, pinned chats, project names, library items, and search entry points.

The active conversation stays usable. Your current chat, message input, and send button are not blocked.

Key features:

- Masks ChatGPT sidebar history areas while locked.
- Opens a clean PIN modal when protected sidebar areas are clicked.
- Temporarily unlocks the sidebar for 5 minutes after the correct PIN.
- Re-locks automatically after the timer ends, when the page is hidden, or when the window loses focus.
- Lets users choose Auto, Chinese, or English manually.
- Lets users choose which sidebar areas to hide: Search chats, Library, Pinned chats, Projects, and Previous chats.
- Stores settings locally with `chrome.storage.local`.
- Stores PIN-derived data locally using PBKDF2 with a random salt.
- Does not collect or upload chat content.
- Supports English and Simplified Chinese UI.

Security note: this extension is a privacy UX layer for shoulder-surfing and casual access. It is not a replacement for account-level security, device locking, or browser-profile protection.

## 中文简介

使用本地 PIN 锁保护 ChatGPT 侧边栏历史，同时保持当前聊天可用。

## 中文详细描述

ChatGPT Privacy Lock 通过遮罩 ChatGPT 侧边栏中可能暴露隐私的区域，降低肩窥和临时借用电脑时的聊天历史泄露风险。它会保护历史聊天、置顶聊天、项目名称、资料库和搜索入口。

当前对话仍然可以正常使用。消息输入框、发送按钮和当前聊天区域不会被阻挡。

主要功能：

- 锁定时遮罩 ChatGPT 侧边栏历史区域。
- 点击受保护区域时显示简洁 PIN 弹窗。
- PIN 正确后临时解锁 5 分钟。
- 计时结束、页面隐藏或窗口失焦后自动重新锁定。
- 可手动选择自动、中文或英文界面。
- 可选择隐藏哪些侧边栏区域：搜索聊天、资料库、置顶聊天、项目、历史聊天。
- 使用 `chrome.storage.local` 在本地保存设置。
- 使用 PBKDF2 + 随机 salt 在本地保存 PIN 派生数据。
- 不收集、不上传聊天内容。
- 支持英文和简体中文界面。

安全说明：本扩展是用于防肩窥和临时借用电脑场景的隐私 UX 层，不替代账号级安全、设备锁屏或浏览器配置文件保护。
