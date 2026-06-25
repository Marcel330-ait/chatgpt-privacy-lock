/*
 * PROPRIETARY AND CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait).
 * All rights reserved. Private, personal, non-commercial use only.
 * See CONFIDENTIAL_NOTICE.txt.
 */
const PIN_ITERATIONS = 150000;
const DEFAULT_AREAS = {
  search: true,
  library: true,
  pinned: true,
  projects: true,
  chats: true
};

const TEXT = {
  en: {
    extensionName: "ChatGPT Privacy Lock",
    popupTitle: "Privacy Lock",
    popupSubtitle: "Protect ChatGPT sidebar history.",
    sidebarProtection: "Sidebar protection",
    languageLabel: "Language",
    languageAuto: "Auto",
    languageChinese: "中文",
    languageEnglish: "English",
    languageHelp: "Auto follows Chrome's language.",
    protectWhat: "Hide these sidebar areas",
    areaSearch: "Search chats",
    areaLibrary: "Library",
    areaPinned: "Pinned chats",
    areaProjects: "Projects",
    areaChats: "Previous chats",
    protectWhatHelp: "New chat and the current conversation stay usable.",
    setPin: "Set a PIN",
    changePinOptional: "Change PIN (optional)",
    pinPlaceholder: "At least 4 characters",
    pinHelpRequired: "Required before you can enable protection.",
    pinHelpExisting: "Leave blank to keep your existing PIN.",
    saveSettings: "Save settings",
    lockNow: "Lock Now",
    securityNote: "A privacy layer for shoulder-surfing and casual access—not account-level security.",
    statusOff: "Off",
    statusLocked: "Locked",
    statusLockedNow: "Locked now",
    statusPinRequired: "PIN required",
    statusUnlockedFor: "Unlocked — $1",
    statusSavedOn: "On — saved",
    statusSavedOff: "Off — saved",
    errorChoosePin: "Choose a PIN with at least 4 characters.",
    errorPinLength: "PIN must have at least 4 characters.",
    errorSetPinBeforeLocking: "Set a PIN and save settings before locking.",
    errorTurnOnBeforeLocking: "Turn on sidebar protection before locking.",
    errorChooseArea: "Choose at least one sidebar area to hide."
  },
  zh_CN: {
    extensionName: "ChatGPT Privacy Lock",
    popupTitle: "隐私锁",
    popupSubtitle: "保护 ChatGPT 侧边栏历史。",
    sidebarProtection: "侧边栏保护",
    languageLabel: "语言",
    languageAuto: "自动",
    languageChinese: "中文",
    languageEnglish: "English",
    languageHelp: "自动模式会跟随 Chrome 语言。",
    protectWhat: "隐藏这些侧边栏区域",
    areaSearch: "搜索聊天",
    areaLibrary: "资料库",
    areaPinned: "置顶聊天",
    areaProjects: "项目",
    areaChats: "历史聊天",
    protectWhatHelp: "新建聊天和当前对话会保持可用。",
    setPin: "设置 PIN",
    changePinOptional: "修改 PIN（可选）",
    pinPlaceholder: "至少 4 位字符",
    pinHelpRequired: "开启保护前必须先设置 PIN。",
    pinHelpExisting: "留空则保留当前 PIN。",
    saveSettings: "保存设置",
    lockNow: "立即锁定",
    securityNote: "这是防肩窥和临时借用电脑的隐私 UX 层，不是账号级安全措施。",
    statusOff: "关闭",
    statusLocked: "已锁定",
    statusLockedNow: "已立即锁定",
    statusPinRequired: "需要设置 PIN",
    statusUnlockedFor: "已解锁 — $1",
    statusSavedOn: "已开启 — 已保存",
    statusSavedOff: "已关闭 — 已保存",
    errorChoosePin: "请选择至少 4 位字符的 PIN。",
    errorPinLength: "PIN 至少需要 4 位字符。",
    errorSetPinBeforeLocking: "请先设置 PIN 并保存，再锁定。",
    errorTurnOnBeforeLocking: "请先开启侧边栏保护。",
    errorChooseArea: "请至少选择一个要隐藏的侧边栏区域。"
  }
};

const form = document.querySelector("#privacy-form");
const enabled = document.querySelector("#enabled");
const language = document.querySelector("#language");
const pin = document.querySelector("#pin");
const pinLabel = document.querySelector("#pin-label");
const pinHelp = document.querySelector("#pin-help");
const statusText = document.querySelector("#status-text");
const error = document.querySelector("#popup-error");
const lockNow = document.querySelector("#lock-now");
const areaInputs = [...document.querySelectorAll("[data-area]")];

let hasPin = false;
let statusTimer;

function currentLanguage() {
  if (language.value === "en" || language.value === "zh_CN") return language.value;
  return chrome.i18n.getUILanguage?.().toLowerCase().startsWith("zh") ? "zh_CN" : "en";
}

function msg(name, substitutions = [], fallback = "") {
  const value = TEXT[currentLanguage()]?.[name] || TEXT.en[name] || fallback || name;
  return substitutions.reduce((copy, item, index) => copy.replaceAll(`$${index + 1}`, item), value);
}

function localizeStaticText() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = msg(element.dataset.i18n, [], element.textContent);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", msg(element.dataset.i18nPlaceholder, [], element.getAttribute("placeholder") || ""));
  });
  document.title = msg("extensionName", [], "ChatGPT Privacy Lock");
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function pbkdf2Hash(value, saltBase64, iterations) {
  const keyMaterial = await crypto.subtle.importKey("raw", new TextEncoder().encode(value), "PBKDF2", false, ["deriveBits"]);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: base64ToBytes(saltBase64), iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bytesToBase64(new Uint8Array(derivedBits));
}

async function createPinRecord(value) {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const pinSalt = bytesToBase64(salt);
  return {
    pinHash: await pbkdf2Hash(value, pinSalt, PIN_ITERATIONS),
    pinSalt,
    pinIterations: PIN_ITERATIONS,
    pinVersion: 2,
    failedPinAttempts: 0,
    pinCooldownUntil: 0
  };
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function statusLabel({ isEnabled, unlockUntil }) {
  if (!isEnabled) return msg("statusOff");
  if (!hasPin) return msg("statusPinRequired");
  if (unlockUntil > Date.now()) return msg("statusUnlockedFor", [formatRemaining(unlockUntil - Date.now())]);
  return msg("statusLocked");
}

function selectedAreas() {
  return Object.fromEntries(areaInputs.map((input) => [input.dataset.area, input.checked]));
}

function hasSelectedArea() {
  return Object.values(selectedAreas()).some(Boolean);
}

function updateCopy(stored = {}) {
  localizeStaticText();
  statusText.textContent = statusLabel({
    isEnabled: enabled.checked,
    unlockUntil: Number(stored.unlockUntil) || 0
  });
  pinLabel.textContent = hasPin ? msg("changePinOptional") : msg("setPin");
  pinHelp.textContent = hasPin ? msg("pinHelpExisting") : msg("pinHelpRequired");
}

async function loadState() {
  const stored = await chrome.storage.local.get(["enabled", "language", "protectedAreas", "pinHash", "unlockUntil"]);
  hasPin = Boolean(stored.pinHash);
  enabled.checked = Boolean(stored.enabled);
  language.value = stored.language || "auto";
  const areas = { ...DEFAULT_AREAS, ...(stored.protectedAreas || {}) };
  areaInputs.forEach((input) => { input.checked = Boolean(areas[input.dataset.area]); });
  updateCopy(stored);

  clearInterval(statusTimer);
  statusTimer = setInterval(async () => {
    const latest = await chrome.storage.local.get(["unlockUntil"]);
    updateCopy(latest);
  }, 1000);
}

language.addEventListener("change", () => updateCopy());
enabled.addEventListener("change", () => updateCopy());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  const newPin = pin.value.trim();

  if (!hasSelectedArea()) {
    error.textContent = msg("errorChooseArea");
    return;
  }
  if (enabled.checked && !hasPin && newPin.length < 4) {
    error.textContent = msg("errorChoosePin");
    pin.focus();
    return;
  }
  if (newPin && newPin.length < 4) {
    error.textContent = msg("errorPinLength");
    pin.focus();
    return;
  }

  const updates = {
    enabled: enabled.checked,
    language: language.value,
    protectedAreas: selectedAreas()
  };
  if (newPin) {
    Object.assign(updates, await createPinRecord(newPin));
    hasPin = true;
    pin.value = "";
  }

  if (!enabled.checked) updates.unlockUntil = 0;

  await chrome.storage.local.set(updates);
  updateCopy(updates);
  statusText.textContent = enabled.checked ? msg("statusSavedOn") : msg("statusSavedOff");
});

lockNow.addEventListener("click", async () => {
  error.textContent = "";
  if (!hasPin) {
    error.textContent = msg("errorSetPinBeforeLocking");
    pin.focus();
    return;
  }
  if (!enabled.checked) {
    error.textContent = msg("errorTurnOnBeforeLocking");
    return;
  }

  await chrome.storage.local.set({ enabled: true, unlockUntil: 0 });
  statusText.textContent = msg("statusLockedNow");
});

loadState();
