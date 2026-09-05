import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultContracts } from './seedData.js';
import { CONTRACT_STATUS, NOTIFICATION_TYPES } from '../../constants/index.js';

export const contractsApi = {
  async getAll() {
    await delay();
    return getStorageItem('contracts', defaultContracts);
  },

  async getById(id) {
    await delay();
    const list = getStorageItem('contracts', defaultContracts);
    return list.find((c) => c.id === id) || null;
  },

  async getByUser(userId) {
    await delay();
    const list = getStorageItem('contracts', defaultContracts);
    return list.filter((c) => c.clientId === userId || c.freelancerId === userId);
  },

  async create(contractData) {
    await delay();
    const list = getStorageItem('contracts', defaultContracts);
    const newContract = {
      id: `cont_${Date.now()}`,
      status: CONTRACT_STATUS.AWAITING_PAYMENT,
      createdAt: new Date().toISOString(),
      ...contractData,
    };
    list.unshift(newContract);
    setStorageItem('contracts', list);

    // Notify freelancer
    const notifs = getStorageItem('notifications', []);
    notifs.unshift({
      id: `notif_${Date.now()}`,
      userId: contractData.freelancerId,
      type: NOTIFICATION_TYPES.PROPOSAL_ACCEPTED,
      message: 'تم قبول عرضك وإنشاء عقد عمل جديد! في انتظار إيداع الضمان للبدء.',
      link: `/contracts/${newContract.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorageItem('notifications', notifs);

    return newContract;
  },

  async updateStatus(id, status, extraData = {}) {
    await delay();
    const list = getStorageItem('contracts', defaultContracts);
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('العقد غير موجود');
    list[index] = { ...list[index], status, ...extraData };
    setStorageItem('contracts', list);

    const contract = list[index];
    const notifs = getStorageItem('notifications', []);

    if (status === CONTRACT_STATUS.ACTIVE) {
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: contract.freelancerId,
        type: NOTIFICATION_TYPES.ESCROW_FUNDED,
        message: 'تم توثيق إيداع الضمان بنجاح! يمكنك الآن بدء تنفيذ العمل.',
        link: `/contracts/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    } else if (status === CONTRACT_STATUS.COMPLETED) {
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: contract.freelancerId,
        type: NOTIFICATION_TYPES.ESCROW_RELEASED,
        message: `تم اعتماد إتمام العقد #${contract.id} بنجاح وتحويل صافي المستحقات إلى محفظتك!`,
        link: `/contracts/${contract.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    }

    return contract;
  },
};
