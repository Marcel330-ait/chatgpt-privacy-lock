# Store Description / 商店描述

## Short description

Protect your ChatGPT sidebar history with a local PIN lock that keeps the active chat usable.

## Long description

ChatGPT Privacy Lock helps reduce shoulder-surfing and casual-access exposure by masking ChatGPT navigation that can reveal conversation history, pinned chats, project names, library items, Work history, and search entry points.

The active conversation stays usable. Your current chat, message input, and send button are not blocked.

Key features:

- Masks ChatGPT sidebar history areas with a strongly blurred translucent-glass effect while locked.
- Opens a clean PIN modal when protected sidebar areas are clicked.
- Lets users choose an unlock duration from 1 to 120 minutes.
- Lets users unlock only the clicked item or the entire sidebar after the correct PIN.
- Keeps the unlock session open while switching tabs or windows, then re-locks when the timer ends or Lock Now is pressed.
- Applies enable, disable, Save settings, and Lock Now actions immediately without reloading ChatGPT.
- Lets users choose Auto, Chinese, or English manually.
- Lets users choose which areas to protect: Search chats, Library, New chat/More, general navigation, Pinned chats, Projects, Previous chats, and Chat/Work with Work history.
- Opening one Project in clicked-item mode also reveals that Project's child chats while other Projects remain protected.
- Keeps directory labels identifiable and replaces private titles with generic Project or Chat labels.
- Automatically distinguishes Project and Chat items inside Pinned instead of assuming every pinned item is the same type.
- Offers Indigo, Emerald, and Rose mask-glass tints that update immediately while the popup UI remains neutral.
- Includes a redesigned status-focused popup and a touch-friendly PIN dialog for narrow web layouts.
- Stores settings locally with `chrome.storage.local`.
- Stores PIN-derived data locally using PBKDF2 with a random salt.
- Does not collect or upload chat content.
- Supports English and Simplified Chinese UI.

Security note: this extension is a privacy UX layer for shoulder-surfing and casual access. It is not a replacement for account-level security, device locking, or browser-profile protection.

## 中文简介

使用本地 PIN 锁保护 ChatGPT 侧边栏历史，同时保持当前聊天可用。

## 中文详细描述

ChatGPT Privacy Lock 通过遮罩 ChatGPT 导航中可能暴露隐私的区域，降低肩窥和临时借用电脑时的历史信息泄露风险。它会保护历史聊天、置顶聊天、项目名称、资料库、Work 历史和搜索入口。

当前对话仍然可以正常使用。消息输入框、发送按钮和当前聊天区域不会被阻挡。

主要功能：

- 锁定时遮罩 ChatGPT 侧边栏历史区域。
- 点击受保护区域时显示简洁 PIN 弹窗。
- 可自定义 1–120 分钟的解锁时间。
- PIN 正确后可选择只打开点击项，或打开整个侧边栏。
- 切换标签页或窗口不会提前锁定；计时结束或点击立即锁定后重新保护。
- 开启、关闭、保存设置和立即锁定都会直接生效，无需刷新 ChatGPT。
- 可手动选择自动、中文或英文界面。
- 可选择保护哪些区域：搜索聊天、资料库、新建聊天/更多、常用目录、置顶聊天、项目、历史聊天，以及 Chat/Work 与 Work 历史。
- 仅打开点击项时，打开一个 Project 会同时显示该 Project 的子聊天，其他 Project 继续保持锁定。
- 常用目录名称保持可识别，私人标题只显示“项目”或“聊天”等通用类型。
- 自动判断 Pinned 中的条目是 Project 还是 Chat，并显示对应的通用类型。
- 遮挡玻璃可选择蓝紫、翡翠或玫瑰并实时生效；扩展面板保持中性色。
- 使用以保护状态为核心的新弹窗，并让 PIN 弹窗适配窄屏网页和触摸操作。
- 使用 `chrome.storage.local` 在本地保存设置。
- 使用 PBKDF2 + 随机 salt 在本地保存 PIN 派生数据。
- 不收集、不上传聊天内容。
- 支持英文和简体中文界面。

安全说明：本扩展是用于防肩窥和临时借用电脑场景的隐私 UX 层，不替代账号级安全、设备锁屏或浏览器配置文件保护。
