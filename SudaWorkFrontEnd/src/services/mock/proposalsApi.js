import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultProposals } from './seedData.js';
import { PROPOSAL_STATUS, NOTIFICATION_TYPES } from '../../constants/index.js';

export const proposalsApi = {
  async getByProject(projectId) {
    await delay();
    const proposals = getStorageItem('proposals', defaultProposals);
    return proposals.filter((p) => p.projectId === projectId);
  },

  async getByFreelancer(freelancerId) {
    await delay();
    const proposals = getStorageItem('proposals', defaultProposals);
    return proposals.filter((p) => p.freelancerId === freelancerId);
  },

  async create(proposalData) {
    await delay();
    const list = getStorageItem('proposals', defaultProposals);
    const newProposal = {
      id: `prop_${Date.now()}`,
      status: PROPOSAL_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      ...proposalData,
    };
    list.unshift(newProposal);
    setStorageItem('proposals', list);

    // Notify project client
    const projects = getStorageItem('projects', []);
    const proj = projects.find((p) => p.id === proposalData.projectId);
    if (proj?.clientId) {
      const notifs = getStorageItem('notifications', []);
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: proj.clientId,
        type: NOTIFICATION_TYPES.PROPOSAL_RECEIVED,
        message: `تلقيت عرضاً جديداً بقيمة ${Number(proposalData.bidAmount).toLocaleString()} ج.س على مشروعك "${proj.title}".`,
        link: `/projects/${proj.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    }

    return newProposal;
  },

  async updateStatus(id, status) {
    await delay();
    const list = getStorageItem('proposals', defaultProposals);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('العرض غير موجود');
    list[index].status = status;
    setStorageItem('proposals', list);
    return list[index];
  },

  async delete(id) {
    await delay();
    const list = getStorageItem('proposals', defaultProposals);
    setStorageItem('proposals', list.filter((p) => p.id !== id));
    return true;
  },
};
