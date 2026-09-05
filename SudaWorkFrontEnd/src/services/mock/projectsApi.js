import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultProjects, defaultClientProfiles } from './seedData.js';
import { PROJECT_STATUS } from '../../constants/index.js';

export const projectsApi = {
  async getAll(filters = {}) {
    await delay();
    let list = getStorageItem('projects', defaultProjects);

    if (filters.status) {
      list = list.filter((p) => p.status === filters.status);
    }
    if (filters.clientId) {
      list = list.filter((p) => p.clientId === filters.clientId);
    }
    if (filters.categoryId) {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return list;
  },

  async getById(id) {
    await delay();
    const list = getStorageItem('projects', defaultProjects);
    return list.find((p) => p.id === id) || null;
  },

  async create(projectData) {
    await delay();
    const list = getStorageItem('projects', defaultProjects);
    const newProject = {
      id: `proj_${Date.now()}`,
      status: PROJECT_STATUS.OPEN,
      createdAt: new Date().toISOString(),
      ...projectData,
    };
    list.unshift(newProject);
    setStorageItem('projects', list);

    // Increment client project count
    const clientProfiles = getStorageItem('clientProfiles', defaultClientProfiles);
    const cpIndex = clientProfiles.findIndex((c) => c.userId === projectData.clientId);
    if (cpIndex !== -1) {
      clientProfiles[cpIndex].postedProjectsCount =
        (clientProfiles[cpIndex].postedProjectsCount || 0) + 1;
      setStorageItem('clientProfiles', clientProfiles);
    }

    return newProject;
  },

  async update(id, updates) {
    await delay();
    const list = getStorageItem('projects', defaultProjects);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('المشروع غير موجود');
    list[index] = { ...list[index], ...updates };
    setStorageItem('projects', list);
    return list[index];
  },

  async delete(id) {
    await delay();
    const list = getStorageItem('projects', defaultProjects);
    setStorageItem('projects', list.filter((p) => p.id !== id));
    return true;
  },
};
