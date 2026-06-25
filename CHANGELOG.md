# Changelog / 更新日志

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
