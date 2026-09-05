/*
 * PROPRIETARY AND CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait).
 * All rights reserved. Private, personal, non-commercial use only.
 * See CONFIDENTIAL_NOTICE.txt.
 */
const PIN_ITERATIONS = 150000;
const DEFAULT_AREAS = {
  search: true,
  library: true,
  general: true,
  pinned: true,
  projects: true,
  chats: true,
  workspace: true
};

const TEXT = {
  en: {
    extensionName: "ChatGPT Privacy Lock",
    popupTitle: "Privacy Lock",
    popupSubtitle: "Keep sidebar details out of sight.",
    privateByDesign: "Private by design",
    protectionStatus: "Protection status",
    sidebarProtection: "Sidebar protection",
    languageLabel: "Language",
    languageAuto: "Auto",
    languageChinese: "中文",
    languageEnglish: "English",
    languageHelp: "Auto follows Chrome's language.",
    accentColor: "Mask glass tint",
    colorIndigo: "Indigo",
    colorEmerald: "Emerald",
    colorRose: "Rose",
    unlockDuration: "Unlock time",
    unlockDurationHelp: "1–120 minutes.",
    unlockScope: "Unlock scope",
    unlockScopeItem: "Clicked items (cumulative)",
    unlockScopeAll: "Entire sidebar",
    unlockScopeHelp: "Opened items stay visible together until the timer ends.",
    protectWhat: "Hide these sidebar areas",
    areaSearch: "Search chats",
    areaLibrary: "Library",
    areaGeneral: "New chat, More & general links",
    areaPinned: "Pinned chats",
    areaProjects: "Projects",
    areaChats: "Previous chats",
    areaWorkspace: "Chat / Work & Work history",
    protectWhatHelp: "The currently open conversation stays usable.",
    setPin: "Set a PIN",
    changePinOptional: "Change PIN (optional)",
    pinPlaceholder: "At least 4 characters",
    pinHelpRequired: "Required before you can enable protection.",
    pinHelpExisting: "Leave blank to keep your existing PIN.",
    saveSettings: "Save settings",
    lockNow: "Lock Now",
    sendFeedback: "Send feedback",
    rateHonestly: "Leave a review",
    localOnly: "Settings and PIN protection stay on this device.",
    securityNote: "A privacy layer for shoulder-surfing and casual access—not account-level security.",
    statusOff: "Off",
    statusLocked: "Locked",
    statusLockedNow: "Locked now",
    statusPinRequired: "PIN required",
    statusUnlockedItemFor: "Selected items open — $1",
    statusUnlockedAllFor: "All unlocked — $1",
    statusSavedOn: "On — saved",
    statusSavedOff: "Off — saved",
    errorChoosePin: "Choose a PIN with at least 4 characters.",
    errorPinLength: "PIN must have at least 4 characters.",
    errorSetPinBeforeLocking: "Enter a PIN with at least 4 characters first.",
    errorTurnOnBeforeLocking: "Turn on sidebar protection before locking.",
    errorChooseArea: "Choose at least one sidebar area to hide."
  },
  zh_CN: {
    extensionName: "ChatGPT Privacy Lock",
    popupTitle: "隐私锁",
    popupSubtitle: "让侧边栏隐私信息远离旁人视线。",
    privateByDesign: "隐私优先设计",
    protectionStatus: "保护状态",
    sidebarProtection: "侧边栏保护",
    languageLabel: "语言",
    languageAuto: "自动",
    languageChinese: "中文",
    languageEnglish: "English",
    languageHelp: "自动模式会跟随 Chrome 语言。",
    accentColor: "遮挡玻璃颜色",
    colorIndigo: "蓝紫",
    colorEmerald: "翡翠",
    colorRose: "玫瑰",
    unlockDuration: "解锁时间",
    unlockDurationHelp: "可设置 1–120 分钟。",
    unlockScope: "解锁范围",
    unlockScopeItem: "已点击项（可累计）",
    unlockScopeAll: "打开全部侧边栏",
    unlockScopeHelp: "打开过的内容会一起保持显示，直到倒计时结束。",
    protectWhat: "隐藏这些侧边栏区域",
    areaSearch: "搜索聊天",
    areaLibrary: "资料库",
    areaGeneral: "新建聊天、更多与常用入口",
    areaPinned: "置顶聊天",
    areaProjects: "项目",
    areaChats: "历史聊天",
    areaWorkspace: "Chat / Work 与工作历史",
    protectWhatHelp: "当前已经打开的对话会保持可用。",
    setPin: "设置 PIN",
    changePinOptional: "修改 PIN（可选）",
    pinPlaceholder: "至少 4 位字符",
    pinHelpRequired: "开启保护前必须先设置 PIN。",
    pinHelpExisting: "留空则保留当前 PIN。",
    saveSettings: "保存设置",
    lockNow: "立即锁定",
    sendFeedback: "提交反馈",
    rateHonestly: "留下评价",
    localOnly: "设置和 PIN 保护数据仅保存在此设备。",
    securityNote: "这是防肩窥和临时借用电脑的隐私 UX 层，不是账号级安全措施。",
    statusOff: "关闭",
    statusLocked: "已锁定",
    statusLockedNow: "已立即锁定",
    statusPinRequired: "需要设置 PIN",
    statusUnlockedItemFor: "已选内容保持打开 — $1",
    statusUnlockedAllFor: "全部已开 — $1",
    statusSavedOn: "已开启 — 已保存",
    statusSavedOff: "已关闭 — 已保存",
    errorChoosePin: "请选择至少 4 位字符的 PIN。",
    errorPinLength: "PIN 至少需要 4 位字符。",
    errorSetPinBeforeLocking: "请先输入至少 4 位字符的 PIN。",
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
const statusCard = document.querySelector("#status-card");
const areaCount = document.querySelector("#area-count");
const versionText = document.querySelector("#version-text");
const error = document.querySelector("#popup-error");
const lockNow = document.querySelector("#lock-now");
const unlockDuration = document.querySelector("#unlock-duration");
const unlockScope = document.querySelector("#unlock-scope");
const areaInputs = [...document.querySelectorAll("[data-area]")];
const accentInputs = [...document.querySelectorAll('[name="accent-theme"]')];

let hasPin = false;
let statusTimer;
let currentUnlockUntil = 0;
let currentActiveUnlockScope = "";

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

function statusLabel({ isEnabled, unlockUntil, activeUnlockScope }) {
  if (!isEnabled) return msg("statusOff");
  if (!hasPin) return msg("statusPinRequired");
  if (unlockUntil > Date.now()) {
    const key = ["item", "project"].includes(activeUnlockScope) ? "statusUnlockedItemFor" : "statusUnlockedAllFor";
    return msg(key, [formatRemaining(unlockUntil - Date.now())]);
  }
  return msg("statusLocked");
}

function selectedAreas() {
  return Object.fromEntries(areaInputs.map((input) => [input.dataset.area, input.checked]));
}

function hasSelectedArea() {
  return Object.values(selectedAreas()).some(Boolean);
}

function selectedAccent() {
  return accentInputs.find((input) => input.checked)?.value || "indigo";
}

function selectedDurationMinutes() {
  const value = Math.round(Number(unlockDuration.value) || 5);
  const clamped = Math.min(120, Math.max(1, value));
  unlockDuration.value = String(clamped);
  return clamped;
}

async function notifyActiveChatGPT() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.tabs.sendMessage(tab.id, {
      source: "chatgpt-privacy-lock-popup",
      action: "refresh-protection"
    });
  } catch {
    // The active page may not be ChatGPT, or the tab may still have an older
    // content-script instance after an extension reload. Storage remains the
    // source of truth and the next ChatGPT page load will apply the settings.
  }
}

function updateAreaCount() {
  const selected = areaInputs.filter((input) => input.checked).length;
  areaCount.textContent = `${selected}/${areaInputs.length}`;
}

function statusState({ isEnabled, unlockUntil }) {
  if (!isEnabled) return "off";
  if (!hasPin) return "pin";
  if (unlockUntil > Date.now()) return "unlocked";
  return "locked";
}

function updateCopy(stored = {}) {
  localizeStaticText();
  if (Object.prototype.hasOwnProperty.call(stored, "unlockUntil")) {
    currentUnlockUntil = Number(stored.unlockUntil) || 0;
  }
  if (Object.prototype.hasOwnProperty.call(stored, "activeUnlockScope")) {
    currentActiveUnlockScope = ["item", "project", "all"].includes(stored.activeUnlockScope) ? stored.activeUnlockScope : "";
  }
  const unlockUntil = currentUnlockUntil;
  statusText.textContent = statusLabel({
    isEnabled: enabled.checked,
    unlockUntil,
    activeUnlockScope: currentActiveUnlockScope
  });
  statusCard.dataset.state = statusState({ isEnabled: enabled.checked, unlockUntil });
  pinLabel.textContent = hasPin ? msg("changePinOptional") : msg("setPin");
  pinHelp.textContent = hasPin ? msg("pinHelpExisting") : msg("pinHelpRequired");
  lockNow.disabled = !enabled.checked || !hasPin;
  updateAreaCount();
}

async function loadState() {
  const stored = await chrome.storage.local.get(["enabled", "language", "accentTheme", "protectedAreas", "pinHash", "unlockDurationMinutes", "unlockScope", "unlockUntil", "activeUnlockScope"]);
  hasPin = Boolean(stored.pinHash);
  currentUnlockUntil = Number(stored.unlockUntil) || 0;
  currentActiveUnlockScope = ["item", "project", "all"].includes(stored.activeUnlockScope) ? stored.activeUnlockScope : "";
  enabled.checked = Boolean(stored.enabled);
  language.value = stored.language || "auto";
  const areas = { ...DEFAULT_AREAS, ...(stored.protectedAreas || {}) };
  areaInputs.forEach((input) => { input.checked = Boolean(areas[input.dataset.area]); });
  unlockDuration.value = String(Math.min(120, Math.max(1, Number(stored.unlockDurationMinutes) || 5)));
  unlockScope.value = ["item", "all"].includes(stored.unlockScope) ? stored.unlockScope : "item";
  const storedAccent = ["indigo", "emerald", "rose"].includes(stored.accentTheme) ? stored.accentTheme : "indigo";
  accentInputs.forEach((input) => { input.checked = input.value === storedAccent; });
  versionText.textContent = `v${chrome.runtime.getManifest().version}`;
  updateCopy(stored);

  clearInterval(statusTimer);
  statusTimer = setInterval(async () => {
    const latest = await chrome.storage.local.get(["unlockUntil", "activeUnlockScope"]);
    updateCopy(latest);
  }, 1000);
}

language.addEventListener("change", () => updateCopy());
enabled.addEventListener("change", async () => {
  error.textContent = "";
  if (enabled.checked && !hasSelectedArea()) {
    enabled.checked = false;
    error.textContent = msg("errorChooseArea");
    updateCopy({ unlockUntil: 0 });
    return;
  }

  if (enabled.checked && !hasPin) {
    const newPin = pin.value.trim();
    if (newPin.length < 4) {
      enabled.checked = false;
      error.textContent = msg("errorSetPinBeforeLocking");
      pin.focus();
      updateCopy({ unlockUntil: 0 });
      return;
    }

    const pinRecord = await createPinRecord(newPin);
    hasPin = true;
    pin.value = "";
    currentUnlockUntil = 0;
    currentActiveUnlockScope = "";
    await chrome.storage.local.set({
      ...pinRecord,
      enabled: true,
      language: language.value,
      accentTheme: selectedAccent(),
      protectedAreas: selectedAreas(),
      unlockDurationMinutes: selectedDurationMinutes(),
      unlockScope: unlockScope.value,
      unlockUntil: 0,
      activeUnlockScope: "",
      unlockedItemKey: "",
      unlockedProjectIdentity: "",
      unlockedItemKeys: [],
      unlockedProjectIdentities: []
    });
    updateCopy({ unlockUntil: 0 });
    await notifyActiveChatGPT();
    return;
  }

  currentUnlockUntil = 0;
  currentActiveUnlockScope = "";
  await chrome.storage.local.set({
    enabled: enabled.checked,
    unlockUntil: 0,
    activeUnlockScope: "",
    unlockedItemKey: "",
    unlockedProjectIdentity: "",
    unlockedItemKeys: [],
    unlockedProjectIdentities: []
  });
  updateCopy({ unlockUntil: 0 });
  await notifyActiveChatGPT();
});
areaInputs.forEach((input) => input.addEventListener("change", updateAreaCount));
unlockDuration.addEventListener("change", selectedDurationMinutes);
accentInputs.forEach((input) => input.addEventListener("change", async () => {
  if (!input.checked) return;
  await chrome.storage.local.set({ accentTheme: input.value });
  await notifyActiveChatGPT();
}));

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
    accentTheme: selectedAccent(),
    protectedAreas: selectedAreas(),
    unlockDurationMinutes: selectedDurationMinutes(),
    unlockScope: ["item", "all"].includes(unlockScope.value) ? unlockScope.value : "item"
  };
  if (newPin) {
    Object.assign(updates, await createPinRecord(newPin));
    hasPin = true;
    pin.value = "";
  }

  if (!enabled.checked) {
    updates.unlockUntil = 0;
    updates.activeUnlockScope = "";
    updates.unlockedItemKey = "";
    updates.unlockedProjectIdentity = "";
    updates.unlockedItemKeys = [];
    updates.unlockedProjectIdentities = [];
  }

  await chrome.storage.local.set(updates);
  updateCopy(updates);
  statusText.textContent = enabled.checked ? msg("statusSavedOn") : msg("statusSavedOff");
  await notifyActiveChatGPT();
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

  await chrome.storage.local.set({
    enabled: true,
    unlockUntil: 0,
    activeUnlockScope: "",
    unlockedItemKey: "",
    unlockedProjectIdentity: "",
    unlockedItemKeys: [],
    unlockedProjectIdentities: []
  });
  currentUnlockUntil = 0;
  currentActiveUnlockScope = "";
  statusCard.dataset.state = "locked";
  statusText.textContent = msg("statusLockedNow");
  await notifyActiveChatGPT();
});

loadState();
