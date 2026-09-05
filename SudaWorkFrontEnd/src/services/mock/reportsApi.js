import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultReports } from './seedData.js';
import { NOTIFICATION_TYPES } from '../../constants/index.js';

export const reportsApi = {
  async getAll() {
    await delay();
    return getStorageItem('reports', defaultReports);
  },

  async getByUser(userId) {
    await delay();
    const reports = getStorageItem('reports', defaultReports);
    return reports.filter((r) => r.reporterId === userId || r.reportedUserId === userId);
  },

  async getByContract(contractId) {
    await delay();
    const reports = getStorageItem('reports', defaultReports);
    return reports.filter((r) => r.contractId === contractId);
  },

  async create(reportData) {
    await delay();
    const list = getStorageItem('reports', defaultReports);
    const newReport = {
      id: `rep_${Date.now()}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      ...reportData,
    };
    list.unshift(newReport);
    setStorageItem('reports', list);

    // Notify reported party
    if (reportData.reportedUserId) {
      const notifs = getStorageItem('notifications', []);
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: reportData.reportedUserId,
        type: NOTIFICATION_TYPES.DISPUTE_OPENED,
        message: 'تم فتح نزاع بخصوص أحد العقود المشتركة، وجارٍ مراجعته من قبل إدارة الوساطة.',
        link: '/disputes',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    }

    return newReport;
  },

  async updateStatus(id, status, resolutionNotes) {
    await delay();
    const list = getStorageItem('reports', defaultReports);
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('البلاغ غير موجود');
    list[index].status = status;
    if (resolutionNotes) {
      list[index].resolutionNotes = resolutionNotes;
      list[index].adminDecision = resolutionNotes;
    }
    list[index].resolvedAt = new Date().toISOString();
    setStorageItem('reports', list);

    const report = list[index];
    const notifs = getStorageItem('notifications', []);
    if (report.reporterId) {
      notifs.unshift({
        id: `notif_${Date.now()}`,
        userId: report.reporterId,
        type: 'dispute_resolved',
        message: `تم تحديث قرار التحكيم في نزاعك: "${resolutionNotes || status}"`,
        link: '/disputes',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setStorageItem('notifications', notifs);
    }

    return list[index];
  },

  async resolve(id, decision) {
    return this.updateStatus(id, 'Resolved', decision);
  },
};
