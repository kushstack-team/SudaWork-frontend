/**
 * Project Draft Storage Utility
 * Allows guest visitors to compose a project proposal before signing up or logging in.
 * Draft persists across refreshes and authentication flows for 7 days.
 */

const DRAFT_KEY = 'sudawork_guest_project_draft';
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const saveProjectDraft = (data) => {
  try {
    if (!data || typeof data !== 'object') return;
    const payload = {
      ...data,
      savedAt: Date.now(),
      expiresAt: Date.now() + DRAFT_EXPIRY_MS,
    };
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Failed to save project draft to localStorage', err);
  }
};

export const getProjectDraft = () => {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.expiresAt) {
      clearProjectDraft();
      return null;
    }
    if (Date.now() > parsed.expiresAt) {
      clearProjectDraft();
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse project draft', err);
    return null;
  }
};

export const clearProjectDraft = () => {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.warn('Failed to clear project draft', err);
  }
};

export const hasProjectDraft = () => {
  return Boolean(getProjectDraft());
};
