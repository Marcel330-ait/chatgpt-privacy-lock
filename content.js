/*
 * PROPRIETARY AND CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait).
 * All rights reserved. Private, personal, non-commercial use only.
 * See CONFIDENTIAL_NOTICE.txt.
 */
(() => {
  const UNLOCK_DURATION_MS = 5 * 60 * 1000;
  const PIN_ITERATIONS = 150000;
  const MAX_FAILED_ATTEMPTS = 5;
  const COOLDOWN_MS = 30 * 1000;

  const DEFAULT_AREAS = {
    search: true,
    library: true,
    pinned: true,
    projects: true,
    chats: true
  };

  const TEXT = {
    en: {
      historyLockedBadge: "🔒 History locked",
      sidebarItemLocked: "Locked",
      pinModalTitle: "History locked",
      pinModalDescription: "Enter your PIN to unlock sidebar history for 5 minutes.",
      pinLabelShort: "PIN",
      unlockForFiveMinutes: "Unlock for 5 minutes",
      incorrectPin: "Incorrect PIN",
      tooManyAttempts: "Too many attempts. Try again in $1 seconds.",
      tryAgainInSeconds: "Try again in $1s.",
      setPinFirst: "Set a PIN in the extension popup first.",
      close: "Close"
    },
    zh_CN: {
      historyLockedBadge: "🔒 历史已锁定",
      sidebarItemLocked: "已锁定",
      pinModalTitle: "历史已锁定",
      pinModalDescription: "输入 PIN 后，侧边栏历史将解锁 5 分钟。",
      pinLabelShort: "PIN",
      unlockForFiveMinutes: "解锁 5 分钟",
      incorrectPin: "PIN 错误",
      tooManyAttempts: "尝试次数过多，请 $1 秒后再试。",
      tryAgainInSeconds: "请 $1 秒后再试。",
      setPinFirst: "请先在扩展弹窗里设置 PIN。",
      close: "关闭"
    }
  };

  const PROTECTED_TEST_ID = /(conversation|history|project|library|search|pinned)/i;

  let settings = {
    enabled: false,
    language: "auto",
    protectedAreas: { ...DEFAULT_AREAS },
    pinHash: "",
    pinSalt: "",
    pinIterations: PIN_ITERATIONS,
    pinVersion: 1,
    unlockUntil: 0,
    failedPinAttempts: 0,
    pinCooldownUntil: 0
  };

  let unlockTimer;
  let refreshQueued = false;
  let modal;
  let badge;
  let sidebarHost;

  function currentLanguage() {
    if (settings.language === "en" || settings.language === "zh_CN") return settings.language;
    return chrome.i18n.getUILanguage?.().toLowerCase().startsWith("zh") ? "zh_CN" : "en";
  }

  function msg(name, substitutions = [], fallback = "") {
    const language = currentLanguage();
    const value = TEXT[language]?.[name] || TEXT.en[name] || fallback || name;
    return substitutions.reduce((copy, item, index) => copy.replaceAll(`$${index + 1}`, item), value);
  }

  const readSettings = () => new Promise((resolve) => {
    chrome.storage.local.get([
      "enabled",
      "language",
      "protectedAreas",
      "pinHash",
      "pinSalt",
      "pinIterations",
      "pinVersion",
      "unlockUntil",
      "failedPinAttempts",
      "pinCooldownUntil"
    ], (stored) => {
      settings = {
        enabled: Boolean(stored.enabled),
        language: stored.language || "auto",
        protectedAreas: { ...DEFAULT_AREAS, ...(stored.protectedAreas || {}) },
        pinHash: stored.pinHash || "",
        pinSalt: stored.pinSalt || "",
        pinIterations: Number(stored.pinIterations) || PIN_ITERATIONS,
        pinVersion: Number(stored.pinVersion) || (stored.pinSalt ? 2 : 1),
        unlockUntil: Number(stored.unlockUntil) || 0,
        failedPinAttempts: Number(stored.failedPinAttempts) || 0,
        pinCooldownUntil: Number(stored.pinCooldownUntil) || 0
      };
      resolve();
    });
  });

  const hasPin = () => Boolean(settings.pinHash);
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

  function getText(element) {
    return (element?.getAttribute?.("aria-label") || element?.innerText || element?.textContent || "").trim();
  }

  function getSidebarHost() {
    const isSidebarShape = (element) => {
      if (element.closest('[role="dialog"]')) return false;
      const rect = element.getBoundingClientRect();
      return rect.width >= 140 &&
        rect.width < 500 &&
        rect.height >= Math.min(300, window.innerHeight * 0.45) &&
        rect.left < window.innerWidth * 0.45;
    };

    const hasSidebarLandmarks = (element) => {
      const text = getText(element).toLowerCase();
      return ["new chat", "search chats", "pinned", "projects"]
        .filter((landmark) => text.includes(landmark)).length >= 2;
    };

    const semanticCandidates = [
      ...document.querySelectorAll('aside, nav, [data-testid*="sidebar" i], [role="navigation"], [class*="sidebar" i], [class*="side-bar" i]')
    ];
    const semanticHost = semanticCandidates.find((element) => isSidebarShape(element) && hasSidebarLandmarks(element));
    if (semanticHost) return semanticHost;

    const landmarkControls = [...document.querySelectorAll('a, button, [role="button"], [role="link"]')]
      .filter((element) => /^(new chat|search chats)$/i.test(getText(element)));
    let landmarkHost = null;
    for (const control of landmarkControls) {
      let ancestor = control.parentElement;
      while (ancestor && ancestor !== document.body) {
        if (isSidebarShape(ancestor) && hasSidebarLandmarks(ancestor)) landmarkHost = ancestor;
        ancestor = ancestor.parentElement;
      }
    }
    if (landmarkHost) return landmarkHost;

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

    const rect = element.getBoundingClientRect();
    const maxRight = Math.min(430, window.innerWidth * 0.32);
    return rect.width > 0 && rect.height > 0 && rect.left >= -2 && rect.right <= maxRight;
  }

  function safePath(href) {
    try {
      return new URL(href || "", location.origin).pathname;
    } catch {
      return "";
    }
  }

  function sectionCategoryFromPosition(element) {
    const host = sidebarHost || getSidebarHost();
    if (!host) return "";

    const rowTop = element.getBoundingClientRect().top;
    const headings = [...host.querySelectorAll("h1,h2,h3,h4,h5,h6,div,span,p")]
      .map((candidate) => ({ element: candidate, text: getText(candidate), rect: candidate.getBoundingClientRect() }))
      .filter(({ text, rect }) => /^(pinned|projects?|chats?|置顶|项目|聊天)$/i.test(text) && rect.height > 0 && rect.top <= rowTop + 2)
      .sort((a, b) => b.rect.top - a.rect.top);

    const heading = headings[0]?.text.toLowerCase() || "";
    if (/pinned|置顶/.test(heading)) return "pinned";
    if (/projects?|项目/.test(heading)) return "projects";
    if (/chats?|聊天/.test(heading)) return "chats";
    return "";
  }

  function protectedCategory(element) {
    if (!element || !isInSidebar(element)) return "";
    if (element.matches('[data-cpl-badge], [data-cpl-modal], [data-cpl-modal] *')) return "";

    const text = getText(element);
    const lowerText = text.toLowerCase();
    const href = element.getAttribute("href") || "";
    const path = safePath(href);
    const testId = element.getAttribute("data-testid") || "";

    if (/new chat|settings|explore gpts/i.test(text)) return "";
    if (/search chats|搜索/.test(lowerText) || /^\/search(\/|$)/i.test(path) || /search/i.test(testId)) return "search";
    if (/library|资料库|库/.test(lowerText) || /^\/library(\/|$)/i.test(path) || /library/i.test(testId)) return "library";
    if (/^more$|更多/.test(lowerText)) return "";
    if (/pinned|置顶/.test(lowerText) || /pinned/i.test(testId)) return "pinned";
    if (/projects?|项目/.test(lowerText) || /^\/projects?(\/|$)/i.test(path) || /project/i.test(testId)) return "projects";
    if (/history|chats?|聊天|历史/.test(lowerText) || /^\/c(\/|$)/i.test(path) || /(conversation|history)/i.test(testId)) return "chats";

    const sectionCategory = sectionCategoryFromPosition(element);
    if (sectionCategory) return sectionCategory;

    if (element.tagName === "A" && href && !/^\/(auth|share|settings|gpts?)(\/|$)/i.test(path)) return "chats";
    if (PROTECTED_TEST_ID.test(testId)) return "chats";
    return "";
  }

  function itemLooksProtected(element) {
    const category = protectedCategory(element);
    return Boolean(category && settings.protectedAreas[category]);
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
      badge = document.createElement("div");
      badge.className = "cpl-sidebar-badge";
      badge.dataset.cplBadge = "true";
      document.body.append(badge);
    }
    badge.textContent = msg("historyLockedBadge");

    if (host) {
      const rect = host.getBoundingClientRect();
      badge.style.left = `${Math.max(8, rect.left + 10)}px`;
      badge.style.top = `${Math.max(8, rect.top + 10)}px`;
    } else {
      badge.style.left = "10px";
      badge.style.top = "10px";
    }
  }

  function refreshProtection() {
    sidebarHost = getSidebarHost();
    document.querySelectorAll(".cpl-protected-item").forEach((item) => {
      item.classList.remove("cpl-protected-item");
      item.removeAttribute("data-cpl-protected");
      item.removeAttribute("data-cpl-category");
      item.removeAttribute("data-cpl-mask-label");
    });

    if (settings.enabled) {
      const clickableItems = sidebarHost
        ? sidebarHost.querySelectorAll('a, button, [role="button"], [role="link"]')
        : document.querySelectorAll('a, button, [role="button"], [role="link"]');
      clickableItems.forEach((item) => {
        const category = protectedCategory(item);
        if (category && settings.protectedAreas[category]) {
          item.classList.add("cpl-protected-item");
          item.dataset.cplProtected = "true";
          item.dataset.cplCategory = category;
          item.dataset.cplMaskLabel = msg("sidebarItemLocked");
        }
      });
    }

    document.documentElement.classList.toggle("cpl-history-is-locked", isLocked());
    setBadge(sidebarHost);
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

  async function lockNow() {
    if (settings.unlockUntil <= Date.now()) return;
    settings.unlockUntil = 0;
    await chrome.storage.local.set({ unlockUntil: 0 });
    refreshProtection();
  }

  function closeModal() {
    modal?.remove();
    modal = null;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function bytesToBase64(bytes) {
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }

  function base64ToBytes(base64) {
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  }

  async function legacySha256(pin) {
    const bytes = new TextEncoder().encode(pin);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function pbkdf2Hash(pin, saltBase64, iterations) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(pin),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const derivedBits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: base64ToBytes(saltBase64), iterations, hash: "SHA-256" },
      keyMaterial,
      256
    );
    return bytesToBase64(new Uint8Array(derivedBits));
  }

  async function createPinRecord(pin) {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);
    const pinSalt = bytesToBase64(salt);
    return {
      pinHash: await pbkdf2Hash(pin, pinSalt, PIN_ITERATIONS),
      pinSalt,
      pinIterations: PIN_ITERATIONS,
      pinVersion: 2
    };
  }

  async function verifyPin(pin) {
    if (!settings.pinHash) return false;

    if (settings.pinVersion >= 2 && settings.pinSalt) {
      const enteredHash = await pbkdf2Hash(pin, settings.pinSalt, settings.pinIterations);
      return enteredHash === settings.pinHash;
    }

    const enteredLegacyHash = await legacySha256(pin);
    const isLegacyMatch = enteredLegacyHash === settings.pinHash;
    if (isLegacyMatch) {
      const migratedRecord = await createPinRecord(pin);
      settings = { ...settings, ...migratedRecord };
      await chrome.storage.local.set(migratedRecord);
    }
    return isLegacyMatch;
  }

  function cooldownSecondsLeft() {
    return Math.max(0, Math.ceil((settings.pinCooldownUntil - Date.now()) / 1000));
  }

  async function registerWrongPin(error, input) {
    settings.failedPinAttempts += 1;
    const updates = { failedPinAttempts: settings.failedPinAttempts };

    if (settings.failedPinAttempts >= MAX_FAILED_ATTEMPTS) {
      settings.pinCooldownUntil = Date.now() + COOLDOWN_MS;
      settings.failedPinAttempts = 0;
      updates.failedPinAttempts = 0;
      updates.pinCooldownUntil = settings.pinCooldownUntil;
      error.textContent = msg("tooManyAttempts", [String(cooldownSecondsLeft())]);
    } else {
      error.textContent = msg("incorrectPin");
    }

    await chrome.storage.local.set(updates);
    input.select();
  }

  function renderCooldown(error, submitButton) {
    const seconds = cooldownSecondsLeft();
    if (seconds <= 0) {
      submitButton.disabled = false;
      error.textContent = "";
      return false;
    }

    submitButton.disabled = true;
    error.textContent = msg("tryAgainInSeconds", [String(seconds)]);
    return true;
  }

  function showPinModal() {
    if (modal) {
      modal.querySelector("input")?.focus();
      return;
    }

    modal = document.createElement("div");
    modal.className = "cpl-modal-backdrop";
    modal.dataset.cplModal = "true";
    modal.innerHTML = `
      <section class="cpl-pin-modal" role="dialog" aria-modal="true" aria-labelledby="cpl-pin-title">
        <button class="cpl-modal-close" type="button" aria-label="${escapeHtml(msg("close"))}">×</button>
        <div class="cpl-modal-icon" aria-hidden="true">🔒</div>
        <h2 id="cpl-pin-title">${escapeHtml(msg("pinModalTitle"))}</h2>
        <p>${escapeHtml(msg("pinModalDescription"))}</p>
        <form>
          <label for="cpl-pin-input">${escapeHtml(msg("pinLabelShort"))}</label>
          <input id="cpl-pin-input" type="password" inputmode="numeric" autocomplete="off" maxlength="32" required />
          <div class="cpl-pin-error" aria-live="polite"></div>
          <button class="cpl-unlock-button" type="submit">${escapeHtml(msg("unlockForFiveMinutes"))}</button>
        </form>
      </section>`;
    document.body.append(modal);

    const input = modal.querySelector("input");
    const error = modal.querySelector(".cpl-pin-error");
    const submitButton = modal.querySelector(".cpl-unlock-button");
    let cooldownTimer;

    const stopCooldownTimer = () => {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    };

    if (!hasPin()) {
      error.textContent = msg("setPinFirst");
      submitButton.disabled = true;
    } else if (renderCooldown(error, submitButton)) {
      cooldownTimer = setInterval(() => {
        if (!renderCooldown(error, submitButton)) stopCooldownTimer();
      }, 500);
    }

    modal.querySelector(".cpl-modal-close").addEventListener("click", () => {
      stopCooldownTimer();
      closeModal();
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        stopCooldownTimer();
        closeModal();
      }
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [...modal.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.disabled);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    modal.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      if (renderCooldown(error, submitButton)) return;

      submitButton.disabled = true;
      const isCorrect = await verifyPin(input.value);
      if (!isCorrect) {
        await registerWrongPin(error, input);
        if (!renderCooldown(error, submitButton)) submitButton.disabled = false;
        return;
      }

      settings.failedPinAttempts = 0;
      settings.pinCooldownUntil = 0;
      settings.unlockUntil = Date.now() + UNLOCK_DURATION_MS;
      await chrome.storage.local.set({
        failedPinAttempts: 0,
        pinCooldownUntil: 0,
        unlockUntil: settings.unlockUntil
      });
      stopCooldownTimer();
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

  document.addEventListener("click", blockProtectedInteraction, true);
  document.addEventListener("auxclick", blockProtectedInteraction, true);
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && isLocked()) blockProtectedInteraction(event);
    if (event.key === "Escape" && modal) closeModal();
  }, true);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") lockNow();
  });
  window.addEventListener("blur", () => lockNow());

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.enabled) settings.enabled = Boolean(changes.enabled.newValue);
    if (changes.language) settings.language = changes.language.newValue || "auto";
    if (changes.protectedAreas) settings.protectedAreas = { ...DEFAULT_AREAS, ...(changes.protectedAreas.newValue || {}) };
    if (changes.pinHash) settings.pinHash = changes.pinHash.newValue || "";
    if (changes.pinSalt) settings.pinSalt = changes.pinSalt.newValue || "";
    if (changes.pinIterations) settings.pinIterations = Number(changes.pinIterations.newValue) || PIN_ITERATIONS;
    if (changes.pinVersion) settings.pinVersion = Number(changes.pinVersion.newValue) || (settings.pinSalt ? 2 : 1);
    if (changes.unlockUntil) settings.unlockUntil = Number(changes.unlockUntil.newValue) || 0;
    if (changes.failedPinAttempts) settings.failedPinAttempts = Number(changes.failedPinAttempts.newValue) || 0;
    if (changes.pinCooldownUntil) settings.pinCooldownUntil = Number(changes.pinCooldownUntil.newValue) || 0;
    if (!settings.enabled || !isLocked()) closeModal();
    queueRefresh();
  });

  new MutationObserver(queueRefresh).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", queueRefresh);
  window.addEventListener("scroll", queueRefresh, true);

  readSettings().then(refreshProtection);
})();
