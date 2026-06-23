/*
 * CONFIDENTIAL — Copyright (c) 2026 Marcel (@Marcel330-ait). All rights reserved.
 * Private, personal, non-commercial use only. See CONFIDENTIAL_NOTICE.txt.
 */
const form = document.querySelector('#privacy-form');
const enabled = document.querySelector('#enabled');
const pin = document.querySelector('#pin');
const pinLabel = document.querySelector('#pin-label');
const pinHelp = document.querySelector('#pin-help');
const statusText = document.querySelector('#status-text');
const error = document.querySelector('#popup-error');
const lockNow = document.querySelector('#lock-now');

let hasPin = false;

async function hashPin(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function updateCopy() {
  statusText.textContent = enabled.checked ? 'On' : 'Off';
  pinLabel.textContent = hasPin ? 'Change PIN (optional)' : 'Set a PIN';
  pinHelp.textContent = hasPin
    ? 'Leave blank to keep your existing PIN.'
    : 'Required before you can enable protection.';
}

chrome.storage.local.get(['enabled', 'pinHash'], ({ enabled: isEnabled, pinHash }) => {
  hasPin = Boolean(pinHash);
  enabled.checked = Boolean(isEnabled);
  updateCopy();
});

enabled.addEventListener('change', updateCopy);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  error.textContent = '';
  const newPin = pin.value.trim();

  if (enabled.checked && !hasPin && newPin.length < 4) {
    error.textContent = 'Choose a PIN with at least 4 characters.';
    pin.focus();
    return;
  }
  if (newPin && newPin.length < 4) {
    error.textContent = 'PIN must have at least 4 characters.';
    pin.focus();
    return;
  }

  const updates = { enabled: enabled.checked };
  if (newPin) {
    updates.pinHash = await hashPin(newPin);
    hasPin = true;
    pin.value = '';
  }
  await chrome.storage.local.set(updates);
  updateCopy();
  statusText.textContent = enabled.checked ? 'On — saved' : 'Off — saved';
});

lockNow.addEventListener('click', async () => {
  error.textContent = '';
  if (!hasPin) {
    error.textContent = 'Set a PIN and save settings before locking.';
    pin.focus();
    return;
  }
  if (!enabled.checked) {
    error.textContent = 'Turn on sidebar protection before locking.';
    return;
  }
  // Persist the current toggle as well, so Lock Now cannot misleadingly
  // report a lock while the popup only has an unsaved checked state.
  await chrome.storage.local.set({ enabled: true });
  await chrome.storage.local.set({ unlockUntil: 0 });
  statusText.textContent = enabled.checked ? 'Locked now' : 'Off';
});
