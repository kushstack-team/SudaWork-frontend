import { delay, getStorageItem, setStorageItem } from './storage.js';
import { defaultReviews, defaultFreelancerProfiles, defaultClientProfiles } from './seedData.js';
import { NOTIFICATION_TYPES } from '../../constants/index.js';

export const reviewsApi = {
  async getByUser(userId) {
    await delay();
    const list = getStorageItem('reviews', defaultReviews);
    return list.filter((r) => r.toUserId === userId);
  },

  async getByContract(contractId) {
    await delay();
    const list = getStorageItem('reviews', defaultReviews);
    return list.filter((r) => r.contractId === contractId);
  },

  async create(reviewData) {
    await delay();
    const list = getStorageItem('reviews', defaultReviews);
    const newReview = {
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...reviewData,
    };
    list.unshift(newReview);
    setStorageItem('reviews', list);

    // Recalculate average rating for recipient
    const userReviews = list.filter((r) => r.toUserId === reviewData.toUserId);
    const avg =
      userReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / userReviews.length;

    // Check if freelancer
    const freelancerProfiles = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);
    const fpIndex = freelancerProfiles.findIndex(
      (p) => p.userId === reviewData.toUserId
    );
    if (fpIndex !== -1) {
      freelancerProfiles[fpIndex].avgRating = Number(avg.toFixed(1));
      freelancerProfiles[fpIndex].totalReviews = userReviews.length;
      setStorageItem('freelancerProfiles', freelancerProfiles);
    }

    // Check if client
    const clientProfiles = getStorageItem('clientProfiles', defaultClientProfiles);
    const cpIndex = clientProfiles.findIndex(
      (c) => c.userId === reviewData.toUserId
    );
    if (cpIndex !== -1) {
      clientProfiles[cpIndex].avgRating = Number(avg.toFixed(1));
      clientProfiles[cpIndex].totalReviews = userReviews.length;
      setStorageItem('clientProfiles', clientProfiles);
    }

    // Standardized notification to recipient
    const notifs = getStorageItem('notifications', []);
    notifs.unshift({
      id: `notif_${Date.now()}`,
      userId: reviewData.toUserId,
      type: NOTIFICATION_TYPES.REVIEW_RECEIVED,
      message: `تلقيت تقييماً ومراجعة جديدة (${Number(reviewData.rating)} نجوم) من شريك العمل!`,
      link: reviewData.contractId ? `/contracts/${reviewData.contractId}` : '/notifications',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setStorageItem('notifications', notifs);

    return newReview;
  },
};
