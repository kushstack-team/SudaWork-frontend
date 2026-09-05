import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultWithdrawalRequests } from './seedData.js';
import { WITHDRAWAL_STATUS } from '../../constants/index.js';

export const withdrawalsApi = {
  async getAll() {
    await delay();
    return getStorageItem('withdrawalRequests', defaultWithdrawalRequests);
  },

  async getByFreelancer(freelancerId) {
    await delay();
    const list = getStorageItem('withdrawalRequests', defaultWithdrawalRequests);
    return list.filter((w) => w.freelancerId === freelancerId);
  },

  async create(data) {
    await delay();
    const list = getStorageItem('withdrawalRequests', defaultWithdrawalRequests);
    const newReq = {
      id: `with_${Date.now()}`,
      status: WITHDRAWAL_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newReq);
    setStorageItem('withdrawalRequests', list);
    return newReq;
  },

  async updateStatus(id, status) {
    await delay();
    const list = getStorageItem('withdrawalRequests', defaultWithdrawalRequests);
    const index = list.findIndex((w) => w.id === id);
    if (index === -1) throw new Error('طلب السحب غير موجود');
    list[index].status = status;
    setStorageItem('withdrawalRequests', list);
    return list[index];
  },
};
