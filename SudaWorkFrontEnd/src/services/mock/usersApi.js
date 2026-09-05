import { delay, getStorageItem, setStorageItem, sanitizeUser } from './storage.js';
import { defaultUsers } from './seedData.js';

export const usersApi = {
  async getAll() {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    return users.map(sanitizeUser);
  },

  async getById(id) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const user = users.find((u) => u.id === id);
    return user ? sanitizeUser(user) : null;
  },

  async updateStatus(id, status) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('المستخدم غير موجود');
    users[index].status = status;
    setStorageItem('users', users);
    return sanitizeUser(users[index]);
  },

  async delete(id) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const filtered = users.filter((u) => u.id !== id);
    setStorageItem('users', filtered);
    return true;
  },
};
