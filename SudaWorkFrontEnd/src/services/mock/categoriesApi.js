import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultCategories } from './seedData.js';

export const categoriesApi = {
  async getAll() {
    await delay(120);
    return getStorageItem('categories', defaultCategories);
  },
  async create(name) {
    await delay();
    const list = getStorageItem('categories', defaultCategories);
    const newCat = { id: `cat_${Date.now()}`, name };
    list.push(newCat);
    setStorageItem('categories', list);
    return newCat;
  },
  async update(id, name) {
    await delay();
    const list = getStorageItem('categories', defaultCategories);
    const index = list.findIndex((c) => c.id === id);
    if (index !== -1) {
      list[index].name = name;
      setStorageItem('categories', list);
    }
    return list[index];
  },
  async delete(id) {
    await delay();
    const list = getStorageItem('categories', defaultCategories);
    setStorageItem('categories', list.filter((c) => c.id !== id));
    return true;
  },
};
