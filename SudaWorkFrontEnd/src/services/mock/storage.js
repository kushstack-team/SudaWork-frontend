/**
 * Centralized Storage & Sanitization Utility for Mock API Layer
 */

const STORAGE_PREFIX = 'sudawork_';

export const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Deep clones an object/array to prevent accidental in-memory reference mutation of seed data.
 */
export const clone = (data) => {
  if (data === undefined || data === null) return data;
  return JSON.parse(JSON.stringify(data));
};

/**
 * Strips sensitive credentials from user objects before returning to UI components.
 */
export const sanitizeUser = (user) => {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  delete safe.passwordHash;
  return safe;
};

/**
 * Retrieve data from localStorage with auto-migration support.
 */
export const getStorageItem = (key, defaultVal) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) {
      const cloned = clone(defaultVal);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(cloned));
      return cloned;
    }
    const data = JSON.parse(raw);

    // Automatic migration if users array has outdated seed emails in existing localStorage
    if (key === 'users' && Array.isArray(data)) {
      let migrated = false;
      data.forEach((u) => {
        if (u.id === 'user_client_1' && u.email !== 'tarig@alnilam.sd') {
          u.email = 'tarig@alnilam.sd';
          u.fullName = 'طارق عبد المحمود';
          migrated = true;
        }
        if (u.id === 'user_freelancer_1' && u.email !== 'tasneem@dev.sd') {
          u.email = 'tasneem@dev.sd';
          migrated = true;
        }
      });
      if (migrated) {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      }
    }

    return data;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return clone(defaultVal);
  }
};

/**
 * Save data to localStorage safely.
 */
export const setStorageItem = (key, val) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};
