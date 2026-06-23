/*
 * CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait). All rights reserved.
 * Private, personal, non-commercial use only. Redistribution or commercial
 * use requires Marcel's prior written permission. See CONFIDENTIAL_NOTICE.txt.
 */
(() => {
  const UNLOCK_DURATION_MS = 5 * 60 * 1000;
  const PROTECTED_TEXT = /\b(search(?: chats)?|chats?|history|pinned|projects?|library)\b/i;
  const PROTECTED_TEST_ID = /(conversation|history|project|library|search|pinned)/i;
  const PROTECTED_PATH = /^\/(c|g)(\/|$)|^\/(projects?|library|search)(\/|$)/i;

  let settings = { enabled: false, pinHash: "", unlockUntil: 0 };
  let unlockTimer;
  let refreshQueued = false;
  let modal;
  let badge;
  let sidebarCurtain;
  let sidebarHost;

  const readSettings = () => new Promise((resolve) => {
    chrome.storage.local.get(["enabled", "pinHash", "pin", "unlockUntil"], (stored) => {
      settings = {
        enabled: Boolean(stored.enabled),
        // `pin` is kept as a harmless MVP migration fallback for early builds.
        pinHash: stored.pinHash || stored.pin || "",
        unlockUntil: Number(stored.unlockUntil) || 0
      };
      resolve();
    });
  });

  const isUnlocked = () => settings.enabled && settings.unlockUntil > Date.now();
  const isLocked = () => settings.enabled && !isUnlocked();

  function queueRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => {
      refreshQueued = false;
      refreshProtection();
    });
  }

  function getSidebarHost() {
    const isSidebarShape = (element) => {
      if (element.closest('[role="dialog"]')) return false;
      const rect = element.getBoundingClientRect();
      return rect.width >= 140 && rect.width < 500 &&
        rect.height >= Math.min(300, window.innerHeight * 0.45) &&
        rect.left < window.innerWidth * 0.45;
    };
    const hasSidebarLandmarks = (element) => {
      const text = (element.innerText || element.textContent || '').toLowerCase();
      return ['new chat', 'search chats', 'pinned', 'projects'].filter((landmark) => text.includes(landmark)).length >= 2;
    };

    // ChatGPT regularly changes its layout tags and test IDs. First try the
    // semantic sidebar containers, then locate the narrow left panel by its
    // stable UI landmarks rather than relying on a particular CSS class.
    const semanticCandidates = [
      ...document.querySelectorAll('aside, nav, [data-testid*="sidebar" i], [role="navigation"], [class*="sidebar" i], [class*="side-bar" i]')
    ];
    const semanticHost = semanticCandidates.find((element) => isSidebarShape(element) && hasSidebarLandmarks(element));
    if (semanticHost) return semanticHost;

    const landmarkControls = [...document.querySelectorAll('a, button, [role="button"], [role="link"]')]
      .filter((element) => /^(new chat|search chats)$/i.test((element.innerText || element.textContent || '').trim()));
    let landmarkHost = null;
    for (const control of landmarkControls) {
      let ancestor = control.parentElement;
      while (ancestor && ancestor !== document.body) {
        if (isSidebarShape(ancestor) && hasSidebarLandmarks(ancestor)) landmarkHost = ancestor;
        ancestor = ancestor.parentElement;
      }
    }
    if (landmarkHost) return landmarkHost;

    // Last-resort host for layouts that do not expose a semantic sidebar
    // container. This still finds the tallest narrow ancestor of New chat.
    const firstLandmark = landmarkControls[0];
    let visualHost = null;
    let tallest = 0;
    for (let ancestor = firstLandmark?.parentElement; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
      const rect = ancestor.getBoundingClientRect();
      if (rect.left < window.innerWidth * 0.35 && rect.width >= 140 && rect.width < 500 && rect.height > tallest) {
        visualHost = ancestor;
        tallest = rect.height;
      }
    }
    return visualHost;
  }

  function isInSidebar(element) {
    const host = sidebarHost || getSidebarHost();
    if (host?.contains(element)) return true;

    // ChatGPT's markup can be completely rebuilt without a stable parent
    // element. Its left navigation is nevertheless a narrow, fixed panel.
    // This geometry fallback deliberately cannot reach the main chat area.
    const rect = element.getBoundingClientRect();
    const maxRight = Math.min(430, window.innerWidth * 0.32);
    return rect.width > 0 && rect.height > 0 && rect.left >= -2 && rect.right <= maxRight;
  }

  function itemLooksProtected(element) {
    if (!element || !isInSidebar(element)) return false;
    if (element.matches('[data-cpl-badge], [data-cpl-modal], [data-cpl-modal] *')) return false;

    const text = (element.getAttribute('aria-label') || element.textContent || '').trim();
    const href = element.getAttribute('href') || '';
    const testId = element.getAttribute('data-testid') || '';

    // Keep sidebar utilities such as New chat and Settings immediately usable.
    if (/new chat|settings|explore gpts/i.test(text)) return false;

    if (PROTECTED_PATH.test(href) || PROTECTED_TEST_ID.test(testId)) return true;
    if (PROTECTED_TEXT.test(text)) return true;

    // Conversation rows in ChatGPT are usually anchor links. Restrict this to
    // sidebar links and keep known utility links such as "New chat" usable.
    if (element.tagName === 'A' && href) {
      return !/^\/(auth|share|settings|gpts?)(\/|$)/i.test(new URL(href, location.origin).pathname);
    }
    return false;
  }

  function protectedItemFrom(target) {
    if (!(target instanceof Element)) return null;
    const clickable = target.closest('a, button, [role="button"], [role="link"]');
    return clickable && itemLooksProtected(clickable) ? clickable : null;
  }

  function setBadge(host) {
    if (badge && badge.parentElement !== document.body) badge.remove();
    if (!isLocked()) {
      badge?.remove();
      badge = null;
      return;
    }

    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'cpl-sidebar-badge';
      badge.dataset.cplBadge = 'true';
      badge.textContent = '🔒 History locked';
      document.body.append(badge);
    }

    if (host) {
      const rect = host.getBoundingClientRect();
      badge.style.left = `${Math.max(8, rect.left + 10)}px`;
      badge.style.top = `${Math.max(8, rect.top + 10)}px`;
    } else {
      // A visible badge also makes a failed DOM match obvious instead of
      // silently making the extension appear inactive.
      badge.style.left = '10px';
      badge.style.top = '10px';
    }
  }

  function setSidebarCurtain(host) {
    if (!isLocked() || !host) {
      sidebarCurtain?.remove();
      sidebarCurtain = null;
      return;
    }

    if (!sidebarCurtain) {
      sidebarCurtain = document.createElement('div');
      sidebarCurtain.className = 'cpl-sidebar-curtain';
      sidebarCurtain.dataset.cplCurtain = 'true';
      sidebarCurtain.innerHTML = '<span>🔒 Sidebar history locked</span>';
      sidebarCurtain.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        showPinModal();
      });
      document.body.append(sidebarCurtain);
    }

    const hostRect = host.getBoundingClientRect();
    const searchControl = [...host.querySelectorAll('a, button, [role="button"], [role="link"]')]
      .find((element) => /search chats/i.test((element.innerText || element.textContent || '').trim()));
    const searchRect = searchControl?.getBoundingClientRect();
    // Begin at Search chats so New chat remains usable. Everything below is
    // navigation that can disclose history, pinned names, or project names.
    const top = Math.max(hostRect.top, searchRect?.top ?? hostRect.top + 76);
    const bottom = hostRect.bottom;
    sidebarCurtain.style.left = `${hostRect.left}px`;
    sidebarCurtain.style.top = `${top}px`;
    sidebarCurtain.style.width = `${hostRect.width}px`;
    sidebarCurtain.style.height = `${Math.max(0, bottom - top)}px`;
  }

  function refreshProtection() {
    sidebarHost = getSidebarHost();
    document.querySelectorAll('.cpl-protected-item').forEach((item) => {
      item.classList.remove('cpl-protected-item');
      item.removeAttribute('data-cpl-protected');
    });

    if (settings.enabled) {
      const clickableItems = sidebarHost
        ? sidebarHost.querySelectorAll('a, button, [role="button"], [role="link"]')
        : document.querySelectorAll('a, button, [role="button"], [role="link"]');
      clickableItems.forEach((item) => {
        if (itemLooksProtected(item)) {
          item.classList.add('cpl-protected-item');
          item.dataset.cplProtected = 'true';
        }
      });
    }

    document.documentElement.classList.toggle('cpl-history-is-locked', isLocked());
    setBadge(sidebarHost);
    setSidebarCurtain(sidebarHost);
    scheduleLockTimer();
  }

  function scheduleLockTimer() {
    clearTimeout(unlockTimer);
    if (!settings.enabled || settings.unlockUntil <= Date.now()) return;
    unlockTimer = setTimeout(async () => {
      settings.unlockUntil = 0;
      await chrome.storage.local.set({ unlockUntil: 0 });
      refreshProtection();
    }, settings.unlockUntil - Date.now() + 50);
  }

  function closeModal() {
    modal?.remove();
    modal = null;
  }

  async function hashPin(pin) {
    const bytes = new TextEncoder().encode(pin);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  function showPinModal() {
    if (modal) {
      modal.querySelector('input')?.focus();
      return;
    }

    modal = document.createElement('div');
    modal.className = 'cpl-modal-backdrop';
    modal.dataset.cplModal = 'true';
    modal.innerHTML = `
      <section class="cpl-pin-modal" role="dialog" aria-modal="true" aria-labelledby="cpl-pin-title">
        <button class="cpl-modal-close" type="button" aria-label="Close">×</button>
        <div class="cpl-modal-icon">🔒</div>
        <h2 id="cpl-pin-title">History locked</h2>
        <p>Enter your PIN to unlock sidebar history for 5 minutes.</p>
        <form>
          <label for="cpl-pin-input">PIN</label>
          <input id="cpl-pin-input" type="password" inputmode="numeric" autocomplete="off" maxlength="32" required />
          <div class="cpl-pin-error" aria-live="polite"></div>
          <button class="cpl-unlock-button" type="submit">Unlock for 5 minutes</button>
        </form>
      </section>`;
    document.body.append(modal);

    const input = modal.querySelector('input');
    const error = modal.querySelector('.cpl-pin-error');
    modal.querySelector('.cpl-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
    modal.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const enteredHash = await hashPin(input.value);
      if (!settings.pinHash || enteredHash !== settings.pinHash) {
        error.textContent = 'Incorrect PIN';
        input.select();
        return;
      }
      settings.unlockUntil = Date.now() + UNLOCK_DURATION_MS;
      await chrome.storage.local.set({ unlockUntil: settings.unlockUntil });
      closeModal();
      refreshProtection();
    });
    input.focus();
  }

  function blockProtectedInteraction(event) {
    if (!isLocked()) return;
    const item = protectedItemFrom(event.target);
    if (!item) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showPinModal();
  }

  document.addEventListener('click', blockProtectedInteraction, true);
  document.addEventListener('auxclick', blockProtectedInteraction, true);
  document.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && isLocked()) blockProtectedInteraction(event);
    if (event.key === 'Escape' && modal) closeModal();
  }, true);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.enabled) settings.enabled = Boolean(changes.enabled.newValue);
    if (changes.pinHash) settings.pinHash = changes.pinHash.newValue || '';
    if (changes.pin) settings.pinHash = changes.pin.newValue || settings.pinHash;
    if (changes.unlockUntil) settings.unlockUntil = Number(changes.unlockUntil.newValue) || 0;
    if (!settings.enabled || !isLocked()) closeModal();
    queueRefresh();
  });

  new MutationObserver(queueRefresh).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', queueRefresh);
  window.addEventListener('scroll', queueRefresh, true);

  readSettings().then(refreshProtection);
})();
