import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultDeliverables } from './seedData.js';
import { NOTIFICATION_TYPES } from '../../constants/index.js';

export const deliverablesApi = {
  async getByContract(contractId) {
    await delay();
    const deliverables = getStorageItem('deliverables', defaultDeliverables);
    return deliverables.filter((d) => d.contractId === contractId);
  },

  async submit(data) {
    await delay();
    const list = getStorageItem('deliverables', defaultDeliverables);
    const newDeliverable = {
      id: `deliv_${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newDeliverable);
    setStorageItem('deliverables', list);

    // Notify client
    const contracts = getStorageItem('contracts', []);
    const contract = contracts.find((c) => c.id === data.contractId);
    if (contract?.clientId) {
      const notifs = getStorageItem('notifications', []);
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: contract.clientId,
        type: NOTIFICATION_TYPES.WORK_SUBMITTED,
        message: 'قام المستقل بتسليم مخرجات عمل جديدة بانتظار مراجعتك واعتمادك.',
        link: `/contracts/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    }

    return newDeliverable;
  },

  async updateStatus(id, status, extraData = {}) {
    await delay();
    const list = getStorageItem('deliverables', defaultDeliverables);
    const index = list.findIndex((d) => d.id === id);
    if (index === -1) throw new Error('التسليم غير موجود');
    list[index] = { ...list[index], status, ...extraData };
    setStorageItem('deliverables', list);
    return list[index];
  },
};
