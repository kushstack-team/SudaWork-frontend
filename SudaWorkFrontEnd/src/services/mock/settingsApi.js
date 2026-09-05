import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultSettings } from './seedData.js';

export const settingsApi = {
  async get() {
    await delay(100);
    return getStorageItem('settings', defaultSettings);
  },

  async update(updates) {
    await delay();
    const current = getStorageItem('settings', defaultSettings);
    const updated = { ...current, ...updates };
    setStorageItem('settings', updated);
    return updated;
  },
};
