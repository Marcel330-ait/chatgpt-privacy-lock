/*
 * PROPRIETARY AND CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait).
 * All rights reserved. Private, personal, non-commercial use only.
 * See CONFIDENTIAL_NOTICE.txt.
 */
const PIN_ITERATIONS = 150000;

const form = document.querySelector("#privacy-form");
const enabled = document.querySelector("#enabled");
const pin = document.querySelector("#pin");
const pinLabel = document.querySelector("#pin-label");
const pinHelp = document.querySelector("#pin-help");
const statusText = document.querySelector("#status-text");
const error = document.querySelector("#popup-error");
const lockNow = document.querySelector("#lock-now");

let hasPin = false;
let statusTimer;

const msg = (name, substitutions, fallback) => {
  try {
    return chrome.i18n.getMessage(name, substitutions) || fallback || name;
  } catch {
    return fallback || name;
  }
};

function localizeStaticText() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = msg(element.dataset.i18n, undefined, element.textContent);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute(
      "placeholder",
      msg(element.dataset.i18nPlaceholder, undefined, element.getAttribute("placeholder") || "")
    );
  });
  document.title = msg("extensionName", undefined, "ChatGPT Privacy Lock");
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
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(value),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: base64ToBytes(saltBase64),
      iterations,
      hash: "SHA-256"
    },
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
  if (!isEnabled) return msg("statusOff", undefined, "Off");
  if (!hasPin) return msg("statusPinRequired", undefined, "PIN required");
  if (unlockUntil > Date.now()) {
    return msg("statusUnlockedFor", [formatRemaining(unlockUntil - Date.now())], `Unlocked — ${formatRemaining(unlockUntil - Date.now())}`);
  }
  return msg("statusLocked", undefined, "Locked");
}

function updateCopy(stored = {}) {
  statusText.textContent = statusLabel({
    isEnabled: enabled.checked,
    unlockUntil: Number(stored.unlockUntil) || 0
  });
  pinLabel.textContent = hasPin
    ? msg("changePinOptional", undefined, "Change PIN (optional)")
    : msg("setPin", undefined, "Set a PIN");
  pinHelp.textContent = hasPin
    ? msg("pinHelpExisting", undefined, "Leave blank to keep your existing PIN.")
    : msg("pinHelpRequired", undefined, "Required before you can enable protection.");
}

async function loadState() {
  const stored = await chrome.storage.local.get(["enabled", "pinHash", "unlockUntil"]);
  hasPin = Boolean(stored.pinHash);
  enabled.checked = Boolean(stored.enabled);
  updateCopy(stored);

  clearInterval(statusTimer);
  statusTimer = setInterval(async () => {
    const latest = await chrome.storage.local.get(["unlockUntil"]);
    updateCopy(latest);
  }, 1000);
}

localizeStaticText();
loadState();

enabled.addEventListener("change", () => updateCopy());

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  error.textContent = "";
  const newPin = pin.value.trim();

  if (enabled.checked && !hasPin && newPin.length < 4) {
    error.textContent = msg("errorChoosePin", undefined, "Choose a PIN with at least 4 characters.");
    pin.focus();
    return;
  }
  if (newPin && newPin.length < 4) {
    error.textContent = msg("errorPinLength", undefined, "PIN must have at least 4 characters.");
    pin.focus();
    return;
  }

  const updates = { enabled: enabled.checked };
  if (newPin) {
    Object.assign(updates, await createPinRecord(newPin));
    hasPin = true;
    pin.value = "";
  }

  if (!enabled.checked) updates.unlockUntil = 0;

  await chrome.storage.local.set(updates);
  updateCopy(updates);
  statusText.textContent = enabled.checked
    ? msg("statusSavedOn", undefined, "On — saved")
    : msg("statusSavedOff", undefined, "Off — saved");
});

lockNow.addEventListener("click", async () => {
  error.textContent = "";
  if (!hasPin) {
    error.textContent = msg("errorSetPinBeforeLocking", undefined, "Set a PIN and save settings before locking.");
    pin.focus();
    return;
  }
  if (!enabled.checked) {
    error.textContent = msg("errorTurnOnBeforeLocking", undefined, "Turn on sidebar protection before locking.");
    return;
  }

  await chrome.storage.local.set({ enabled: true, unlockUntil: 0 });
  statusText.textContent = msg("statusLockedNow", undefined, "Locked now");
});
