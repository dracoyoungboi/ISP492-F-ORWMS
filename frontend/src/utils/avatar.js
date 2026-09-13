// Avatar helpers: deterministic default pick (stable across refresh),
// saved per-user choice in localStorage, initials fallback, and a
// CustomEvent so every mounted avatar stays in sync without a global store.

const STORAGE_PREFIX = "fcentrics_avatar_";
export const AVATAR_EVENT = "fcentrics:avatar-updated";
export const AVATAR_CHOICES = ["default-1", "default-2"];

// djb2 — deterministic, no Math.random
export function hashUserId(userId) {
  const str = String(userId ?? "");
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash * 33) ^ str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getDefaultAvatarPath(userId) {
  const index = (hashUserId(userId) % 2) + 1;
  return `/images/avatars/default-${index}.jpg`;
}

// 1 word → first 2 chars; ≥2 words → first + last initial; empty → "U"
export function getInitials(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return `${first}${last}`.toUpperCase() || "U";
}

const storageKey = (userId) => `${STORAGE_PREFIX}${userId}`;

export function getSavedAvatarChoice(userId) {
  if (userId == null) return null;
  try {
    const value = localStorage.getItem(storageKey(userId));
    return AVATAR_CHOICES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

function notifyAvatarChange(userId) {
  window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: { userId } }));
}

export function saveAvatarChoice(userId, choice) {
  if (userId == null || !AVATAR_CHOICES.includes(choice)) return;
  try {
    localStorage.setItem(storageKey(userId), choice);
  } catch {
    /* localStorage unavailable (private mode) */
  }
  notifyAvatarChange(userId);
}

export function clearSavedAvatar(userId) {
  if (userId == null) return;
  try {
    localStorage.removeItem(storageKey(userId));
  } catch {
    /* localStorage unavailable (private mode) */
  }
  notifyAvatarChange(userId);
}

// Resolution order: saved explicit choice → deterministic default.
export function resolveAvatarSrc(userId) {
  const saved = getSavedAvatarChoice(userId);
  return saved ? `/images/avatars/${saved}.jpg` : getDefaultAvatarPath(userId);
}
