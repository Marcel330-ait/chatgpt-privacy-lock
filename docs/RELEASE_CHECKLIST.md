# Release Checklist / 发布前清单

## Code / 代码

- [ ] Open `chrome://extensions`, click the extension reload button, then refresh ChatGPT.
- [ ] Test `https://chatgpt.com/*`.
- [ ] Test `https://chat.openai.com/*`.
- [ ] Confirm the current chat, composer, attachments, voice, and send button still work.
- [ ] Confirm New chat, More, Search chats, Library, Pinned, Projects, and previous chats are protected when locked.
- [ ] Confirm each protected-area checkbox only hides that selected area.
- [ ] Confirm language selection works in Auto, Chinese, and English.
- [ ] Confirm Indigo, Emerald, and Rose tints change the masks immediately without Save or recoloring the popup, badge, or PIN dialog.
- [ ] Confirm a custom unlock duration from 1–120 minutes is respected.
- [ ] Confirm Clicked item only opens and navigates to that item while other protected rows stay locked.
- [ ] Confirm opening a Project in Clicked item only mode reveals its child chats and controls but not other Projects.
- [ ] Confirm cumulative item mode keeps every previously opened Project or chat visible until expiry or Lock Now.
- [ ] Confirm the Chat/Work switch and both Chat and Work home-history entries request a PIN while the composer and active conversation remain usable.
- [ ] Confirm Entire sidebar reveals every protected row until the timer ends.
- [ ] Confirm switching tabs or windows does not end an unlock session early.
- [ ] Confirm Search, Library, Pinned, Projects, and Chats directory labels remain readable while protected.
- [ ] Confirm Scheduled, Plugins, Apps, and similar General navigation entries show their real directory labels and still request a PIN when protected.
- [ ] Confirm private rows show only generic Project or Chat labels, never their real titles.
- [ ] Confirm edit, rename, menu, share, archive, and other compact row actions stay fully hidden until their row is unlocked.
- [ ] Confirm Pinned Project roots display Project, pinned conversation links display Chat, and Project child conversations also display Chat.
- [ ] Confirm protected rows use strong blur and translucent glass without exposing readable sidebar text.
- [ ] Confirm clicking a masked area opens the PIN modal.
- [ ] Confirm correct PIN unlocks for the configured duration.
- [ ] Confirm incorrect PIN shows an error and repeated failures trigger cooldown.
- [ ] Confirm Lock Now immediately locks the sidebar again.
- [ ] Confirm the master switch immediately enables and disables masking without a reload.
- [ ] Confirm Save settings immediately applies protected-area and glass-tint changes without a reload.
- [ ] Confirm the extension works in both dark and light ChatGPT themes.
- [ ] Confirm narrow-window/sidebar-collapsed states do not break the active chat.
- [ ] Confirm the PIN dialog fits a 360 px-wide mobile web viewport and touch targets remain usable.
- [ ] Confirm feedback and review links open the expected pages and are not shown as mandatory.

## Chrome Web Store assets / Chrome 商店素材

- [ ] Extension name: `ChatGPT Privacy Lock`.
- [ ] Short description: use the description in `STORE_DESCRIPTION.md`.
- [ ] Screenshots: locked sidebar, PIN modal, popup settings, unlocked sidebar.
- [ ] Privacy policy: publish or host `PRIVACY_POLICY.md`.
- [ ] Category: Productivity or Privacy & Security.
- [ ] Confirm whether the release will be public, unlisted, or private.

## Legal / 权利

- [ ] Decide whether the public package should include `CONFIDENTIAL_NOTICE.txt`.
- [ ] If distributing publicly, verify that “private/confidential” wording matches your intended licensing/distribution model.
- [ ] Do not market this as account-level security; describe it as a local privacy UX layer.
