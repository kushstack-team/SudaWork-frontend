import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultPaymentRequests, defaultContracts } from './seedData.js';
import { PAYMENT_STATUS, CONTRACT_STATUS, NOTIFICATION_TYPES } from '../../constants/index.js';

export const paymentsApi = {
  async getAll() {
    await delay();
    return getStorageItem('paymentRequests', defaultPaymentRequests);
  },

  async getByContract(contractId) {
    await delay();
    const requests = getStorageItem('paymentRequests', defaultPaymentRequests);
    return requests.filter((r) => r.contractId === contractId);
  },

  async getByClient(clientId) {
    await delay();
    const requests = getStorageItem('paymentRequests', defaultPaymentRequests);
    return requests.filter((r) => r.clientId === clientId);
  },

  async create(data) {
    await delay();
    const list = getStorageItem('paymentRequests', defaultPaymentRequests);
    const newReq = {
      id: `pay_${Date.now()}`,
      status: PAYMENT_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      ...data,
    };
    list.unshift(newReq);
    setStorageItem('paymentRequests', list);
    return newReq;
  },

  async updateStatus(id, status, rejectionReason = '') {
    await delay();
    const list = getStorageItem('paymentRequests', defaultPaymentRequests);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('طلب الدفع غير موجود');

    list[index].status = status;
    if (rejectionReason) list[index].rejectionReason = rejectionReason;
    setStorageItem('paymentRequests', list);

    // If approved by admin, activate the associated contract
    if (status === PAYMENT_STATUS.APPROVED) {
      const contracts = getStorageItem('contracts', defaultContracts);
      const cIndex = contracts.findIndex((c) => c.id === list[index].contractId);
      if (cIndex !== -1) {
        contracts[cIndex].status = CONTRACT_STATUS.ACTIVE;
        setStorageItem('contracts', contracts);

        // Notify freelancer that payment was verified and work can begin
        const notifs = getStorageItem('notifications', []);
        notifs.unshift({
          id: `notif_${Date.now()}`,
          userId: contracts[cIndex].freelancerId,
          type: NOTIFICATION_TYPES.ESCROW_FUNDED,
          message: 'تم اعتماد وتوثيق إيداع الضمان من الإدارة! يمكنك الآن البدء في تنفيذ متطلبات العقد.',
          link: `/contracts/${contracts[cIndex].id}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        setStorageItem('notifications', notifs);
      }
    }

    return list[index];
  },
};
