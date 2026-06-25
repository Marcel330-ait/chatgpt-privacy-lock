# Release Checklist / 发布前清单

## Code / 代码

- [ ] Open `chrome://extensions`, click the extension reload button, then refresh ChatGPT.
- [ ] Test `https://chatgpt.com/*`.
- [ ] Test `https://chat.openai.com/*`.
- [ ] Confirm the current chat, composer, attachments, voice, and send button still work.
- [ ] Confirm Search chats, Library, Pinned, Projects, and previous chats are masked when locked.
- [ ] Confirm each protected-area checkbox only hides that selected area.
- [ ] Confirm language selection works in Auto, Chinese, and English.
- [ ] Confirm clicking a masked area opens the PIN modal.
- [ ] Confirm correct PIN unlocks for 5 minutes.
- [ ] Confirm incorrect PIN shows an error and repeated failures trigger cooldown.
- [ ] Confirm Lock Now immediately locks the sidebar again.
- [ ] Confirm switching tabs or window focus re-locks after a temporary unlock.
- [ ] Confirm the extension works in both dark and light ChatGPT themes.
- [ ] Confirm narrow-window/sidebar-collapsed states do not break the active chat.

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
