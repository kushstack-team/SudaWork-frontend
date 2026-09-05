import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultUsers, defaultFreelancerProfiles, defaultClientProfiles } from './seedData.js';

export const profilesApi = {
  async getFreelancerProfile(userId) {
    await delay();
    const list = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);
    return list.find((p) => p.userId === userId) || null;
  },

  async updateFreelancerProfile(userId, data) {
    await delay();
    const list = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);
    const index = list.findIndex((p) => p.userId === userId);
    if (index === -1) {
      const newProfile = { userId, ...data };
      list.push(newProfile);
      setStorageItem('freelancerProfiles', list);
      return newProfile;
    }
    list[index] = { ...list[index], ...data };
    setStorageItem('freelancerProfiles', list);
    return list[index];
  },

  async getClientProfile(userId) {
    await delay();
    const list = getStorageItem('clientProfiles', defaultClientProfiles);
    return list.find((p) => p.userId === userId) || null;
  },

  async updateClientProfile(userId, data) {
    await delay();
    const list = getStorageItem('clientProfiles', defaultClientProfiles);
    const index = list.findIndex((p) => p.userId === userId);
    if (index === -1) {
      const newProfile = { userId, ...data };
      list.push(newProfile);
      setStorageItem('clientProfiles', list);
      return newProfile;
    }
    list[index] = { ...list[index], ...data };
    setStorageItem('clientProfiles', list);
    return list[index];
  },

  async getAllFreelancers(filters = {}) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const profiles = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);

    return profiles
      .map((prof) => {
        const user = users.find((u) => u.id === prof.userId);
        return {
          ...prof,
          fullName: user?.fullName || 'مستقل',
          email: user?.email,
          status: user?.status,
        };
      })
      .filter((f) => {
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            (f.fullName && f.fullName.toLowerCase().includes(q)) ||
            (f.title && f.title.toLowerCase().includes(q)) ||
            (f.skills && f.skills.some((s) => s.toLowerCase().includes(q)))
          );
        }
        return true;
      });
  },
};
