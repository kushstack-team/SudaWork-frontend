import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultNotifications } from './seedData.js';

export const notificationsApi = {
  async getByUser(userId) {
    await delay();
    const list = getStorageItem('notifications', defaultNotifications);
    return list.filter((n) => n.userId === userId);
  },

  async getUnreadCount(userId) {
    await delay(30);
    const list = getStorageItem('notifications', defaultNotifications);
    return list.filter((n) => n.userId === userId && !n.isRead).length;
  },

  async createNotification(userId, type, message, link = '') {
    await delay(50);
    const list = getStorageItem('notifications', defaultNotifications);
    const newNotif = {
      id: `notif_${Date.now()}`,
      userId,
      type,
      message,
      link,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newNotif);
    setStorageItem('notifications', list);
    return newNotif;
  },

  async markAsRead(id) {
    const list = getStorageItem('notifications', defaultNotifications);
    const index = list.findIndex((n) => n.id === id);
    if (index !== -1) {
      list[index].isRead = true;
      setStorageItem('notifications', list);
      return list[index];
    }
    return null;
  },

  async markAllAsRead(userId) {
    await delay(60);
    const list = getStorageItem('notifications', defaultNotifications);
    let changed = false;
    list.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      setStorageItem('notifications', list);
    }
    return true;
  },

  async clearAll(userId) {
    await delay(60);
    const list = getStorageItem('notifications', defaultNotifications);
    const remaining = list.filter((n) => n.userId !== userId);
    setStorageItem('notifications', remaining);
    return true;
  },

  async delete(id) {
    await delay(60);
    const list = getStorageItem('notifications', defaultNotifications);
    setStorageItem('notifications', list.filter((n) => n.id !== id));
    return true;
  },
};
