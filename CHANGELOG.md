# Changelog / 更新日志

## 1.4.5 — 2026-09-05

- Changed item-only unlocking into a cumulative unlock session.
- Previously unlocked Projects and chats now remain visible when another item is unlocked.
- A new successful PIN entry extends the shared session timer; expiry or Lock Now clears every unlocked item together.

## 1.4.4 — 2026-09-05

- Prevented unlocking one Project from revealing unrelated Projects in the same sidebar section.
- Removed the broad DOM-ancestor fallback that could treat the entire Projects list as one group.
- Reapplies masks before the next browser paint after ChatGPT sidebar DOM changes to prevent reveal-and-relock flicker.

## 1.4.3 — 2026-09-05

- Fixed project conversations being mislabeled as projects after expanding a project.
- Sidebar item type detection now prioritizes each row's own navigation route and owned icon markers.
- Prevented composite project containers from masking all nested conversations as one project item.

## 1.4.2 — 2026-09-05

- Separates a Pinned row's location from its actual type: Project links are labeled Project and conversation links are labeled Chat.
- Recognizes Project roots and Project child conversations separately while keeping them in the same temporary Project unlock group.

## 1.4.1 — 2026-09-05

- Treats an unlocked Project as a group so its child chats and related controls remain available for the unlock duration.
- Adds a dedicated General navigation protection option for Scheduled, Plugins, Apps, and similar top-level entries.
- Keeps protected general-navigation names readable and labels private rows generically as Project, Chat, or Pinned chat.

## 1.4.0 — 2026-09-05

- Added three compact mask-glass tints: Indigo, Emerald, and Rose.
- Added a user-defined unlock duration from 1 to 120 minutes.
- Added two unlock scopes: only the clicked item, or the entire sidebar.
- Unlock sessions now remain open when switching tabs or windows and close only when their timer expires or Lock Now is used.
- Keeps public directory labels such as Search, Library, Pinned, Projects, and Chats readable while still requiring a PIN when protected.
- Reduced observer work, removed animated row effects, and lowered expensive backdrop blur to improve PIN-entry responsiveness.

## 1.3.0 — 2026-09-05

- Redesigned the popup around a clearer protection-status card and compact settings panels.
- Reworked protected sidebar rows into translucent, strongly blurred liquid-glass masks.
- Introduced the first glass-tint controls, including an experimental Follow ChatGPT option later simplified in 1.4.0.
- Added a responsive, touch-friendly PIN dialog for narrow web layouts.
- Improved mobile sidebar detection and Simplified Chinese landmark matching.
- Added privacy-preserving links for voluntary feedback and honest store reviews.
- Added clearer local-only privacy copy and extension version information.
- Made the master protection switch apply or remove masking immediately.
- Added direct popup-to-page refresh messaging so Save settings and Lock Now no longer require a page reload.
- Replaced the extension icon with Marcel's blue liquid-glass privacy-lock artwork.

## 1.2.1 — 2026-06-25

- Reworked the locked sidebar visual effect from floating mask overlays to stable in-row skeleton masks.
- Fixed a visual issue where unselected areas such as Library could be partially covered by neighboring overlays.
- Improved category handling for top sidebar controls such as More and Library.

## 1.2.0 — 2026-06-25

- Added a manual language selector: Auto, Chinese, and English.
- Added user-selectable protected areas: Search chats, Library, Pinned chats, Projects, and Previous chats.
- Replaced the single large sidebar curtain with granular mask fragments so disabled areas can remain visible.
- Updated README and store copy for the new customization controls.

## 1.1.0 — 2026-06-25

- Added Chrome i18n support with English and Simplified Chinese UI.
- Upgraded PIN storage from plain SHA-256 to PBKDF2 + random salt.
- Kept backward compatibility for older SHA-256 PIN hashes and migrates them after a successful unlock.
- Added short cooldown after repeated incorrect PIN attempts.
- Added automatic re-lock when the ChatGPT page is hidden or the window loses focus.
- Added popup countdown/status copy for locked and temporarily unlocked states.
- Added extension icons, privacy policy, changelog, and release checklist.
- Cleaned documentation encoding and expanded bilingual usage instructions.

## 1.0.0 — 2026-06-23

- Initial Manifest V3 extension.
- Added ChatGPT sidebar masking, PIN modal, 5-minute temporary unlock, popup toggle, and Lock Now.
- Added private/confidential notice for Marcel (@Marcel330-ait).
