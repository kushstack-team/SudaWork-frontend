/**
 * Domain API for the SudaWork frontend. Every method calls the real backend
 * (see backend-endpoints.md) and returns UI-shaped data via the mappers.
 */
import { get, post, put, patch, del, uploadFile, openProtectedFile, tokens } from './client.js';
import * as m from './mappers.js';

const session = (data) => {
  if (data?.accessToken) tokens.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return { ...data, user: data?.user ? m.mapUser(data.user) : null };
};

export const authApi = {
  login: async (email, password) => session(await post('/auth/login', { email, password }, { auth: false })),
  register: async ({ fullName, email, password, role }) =>
    session(await post('/auth/register', { fullName, email, password, role }, { auth: false })),
  me: async () => m.mapUser((await get('/auth/me')).user),
  logout: async () => {
    try {
      if (tokens.access) await post('/auth/logout');
    } finally {
      tokens.clear();
    }
  },
  verifyEmail: async (code) => m.mapUser((await post('/auth/verify-email', { code })).user),
  resendVerification: () => post('/auth/resend-verification'),
  forgotPassword: (email) => post('/auth/forgot-password', { email }, { auth: false }),
  resetPassword: (token, password) => post('/auth/reset-password', { token, password }, { auth: false }),
  changePassword: async (oldPassword, newPassword) => session(await post('/auth/change-password', { oldPassword, newPassword })),
  // Returns { status: 'AUTHENTICATED', user, ... } or { status: 'NEEDS_PROFILE', registrationToken, missingFields, profile }
  google: async ({ credential, role }) => {
    const data = await post('/auth/google', { credential, role: role || undefined }, { auth: false });
    return data.status === 'AUTHENTICATED' ? session(data) : data;
  },
  googleComplete: async ({ registrationToken, role, fullName }) =>
    session(await post('/auth/google/complete', { registrationToken, role, fullName: fullName || undefined }, { auth: false })),
  googleLink: async (credential) => m.mapUser((await post('/auth/google/link', { credential })).user),
};

export const settingsApi = {
  getPublic: () => get('/settings/public', undefined, { auth: false }),
};

export const taxonomyApi = {
  categories: async () => (await get('/categories', undefined, { auth: false })).map(m.mapCategory),
  skills: async (search) => get('/skills', { search }, { auth: false }),
};

export const profilesApi = {
  getPublic: async (userId) => m.mapPublicProfile(await get(`/users/${userId}`)),
  getFreelancer: async (userId) => m.mapPublicProfile(await get(`/freelancers/${userId}`)),
  getClient: async (userId) => m.mapPublicProfile(await get(`/clients/${userId}`)),
  updateFreelancer: async (data) => m.mapPublicProfile(await put('/freelancers/me/profile', data)),
  updateClient: async (data) => m.mapPublicProfile(await put('/clients/me/profile', data)),
  updateName: async (fullName) => patch('/users/me', { fullName }),
  uploadAvatar: async (file, onProgress) => {
    const data = await uploadFile(file, { path: '/users/me/avatar', onProgress });
    return m.mapUser(data.user);
  },
  removeAvatar: async () => m.mapUser((await del('/users/me/avatar')).user),
  // Soft-deactivates the account and ends every session.
  deactivate: () => del('/users/me'),
  searchFreelancers: async (params, opts) => m.mapPage(await get('/freelancers', params, opts), (r) => m.mapFreelancer(r)),
};

export const portfolioApi = {
  list: async () => (await get('/freelancers/me/portfolio')).map(m.mapPortfolioItem),
  add: async ({ title, description, link, imageId }) =>
    (await post('/freelancers/me/portfolio', { title, description, projectUrl: link || '', imageId: imageId || null })).map(m.mapPortfolioItem),
  remove: async (id) => (await del(`/freelancers/me/portfolio/${id}`)).map(m.mapPortfolioItem),
};

export const projectsApi = {
  // params: { search, category, minBudget, maxBudget, duration, sort, page, limit }
  browse: async (params, opts) => m.mapPage(await get('/projects', params, opts), m.mapProject),
  get: async (id) => m.mapProject(await get(`/projects/${id}`)),
  create: async (data) => m.mapProject(await post('/projects', data)),
  update: async (id, data) => m.mapProject(await patch(`/projects/${id}`, data)),
  remove: (id) => del(`/projects/${id}`),
  close: async (id) => m.mapProject(await post(`/projects/${id}/close`)),
  mine: async () => (await get('/clients/me/projects')).map(m.mapProject),
  proposals: async (id) => (await get(`/projects/${id}/proposals`)).map(m.mapProposal),
};

export const proposalsApi = {
  submit: async (projectId, { coverLetter, bidAmount, deliveryDays }) =>
    m.mapProposal(await post(`/projects/${projectId}/proposals`, { coverLetter, bidAmount, deliveryDays })),
  mine: async () => (await get('/freelancers/me/proposals')).map(m.mapProposal),
  get: async (id) => m.mapProposal(await get(`/proposals/${id}`)),
  update: async (id, data) => m.mapProposal(await patch(`/proposals/${id}`, data)),
  withdraw: (id) => del(`/proposals/${id}`),
  reject: (id) => post(`/proposals/${id}/reject`),
  // Returns { contract, conversationId }
  accept: async (id) => {
    const data = await post(`/proposals/${id}/accept`);
    return { contract: m.mapContract(data.contract), conversationId: data.conversationId };
  },
};

export const contractsApi = {
  list: async (params) => (await get('/contracts', params)).map(m.mapContract),
  get: async (id) => m.mapContract(await get(`/contracts/${id}`)),
  deliverables: async (id) => (await get(`/contracts/${id}/deliverables`)).map(m.mapDeliverable),
  submitWork: (id, { message, attachmentIds = [] }) => post(`/contracts/${id}/submit`, { message, attachmentIds }),
  requestRevision: (id, message) => post(`/contracts/${id}/revision`, { message }),
  complete: (id) => post(`/contracts/${id}/complete`),
  cancel: (id, reason = '') => post(`/contracts/${id}/cancel`, { reason }),
  reviews: async (id) => (await get(`/contracts/${id}/reviews`)).map(m.mapReview),
  reports: async (id) => (await get(`/contracts/${id}/reports`)).map(m.mapReport),
  payments: async (id) => (await get(`/contracts/${id}/payment-requests`)).map(m.mapPayment),
  submitPayment: async (id, { amount, paymentMethod, transactionReference, proofFileId }) =>
    m.mapPayment(await post(`/contracts/${id}/payment-requests`, { amount, paymentMethod, transactionReference, proofFileId: proofFileId || null })),
  submitReview: async (id, { rating, comment }) => m.mapReview(await post(`/contracts/${id}/reviews`, { rating, comment })),
};

export const paymentsApi = {
  mine: async () => (await get('/payments/me')).map(m.mapPayment),
  get: async (id) => m.mapPayment(await get(`/payments/${id}`)),
  resubmit: async (id, { amount, paymentMethod, transactionReference, proofFileId }) =>
    m.mapPayment(await post(`/payments/${id}/resubmit`, { amount, paymentMethod, transactionReference, proofFileId: proofFileId || null })),
};

export const withdrawalsApi = {
  mine: async () => (await get('/withdrawals/me')).map(m.mapWithdrawal),
  balance: () => get('/withdrawals/balance'),
  create: async ({ amount, paymentMethod, accountName, accountNumber }) =>
    m.mapWithdrawal(await post('/withdrawals', { amount, paymentMethod, accountName, accountNumber })),
};

export const reviewsApi = {
  forUser: async (userId) => {
    const data = await get(`/users/${userId}/reviews`, undefined, { auth: false });
    return { items: data.data.map(m.mapReview), total: data.total, average: data.average };
  },
};

export const reportsApi = {
  mine: async () => (await get('/reports/me')).map(m.mapReport),
  // { targetType: 'contract'|'user'|'project'|'message', targetId, reason, description, desiredResolution }
  create: async (data) => m.mapReport(await post('/reports', data)),
};

export const notificationsApi = {
  list: async (params, opts) => {
    const data = await get('/notifications', params, opts);
    return { ...m.mapPage(data, m.mapNotification), unreadCount: data.unreadCount };
  },
  unreadCount: async (opts) => (await get('/notifications/unread-count', undefined, opts)).count,
  markRead: (id) => post(`/notifications/${id}/read`),
  markAllRead: () => post('/notifications/read-all'),
  remove: (id) => del(`/notifications/${id}`),
  clear: () => del('/notifications'),
};

export const messagesApi = {
  conversations: async () => (await get('/conversations')).map(m.mapConversation),
  unreadCount: async (opts) => (await get('/conversations/unread-count', undefined, opts)).count,
  start: (data) => post('/conversations', data),
  messages: async (conversationId, { before, limit } = {}) => {
    const data = await get(`/conversations/${conversationId}/messages`, { before, limit });
    return { messages: data.messages.map(m.mapMessage), hasMore: data.hasMore };
  },
  send: async (conversationId, { message, attachmentIds = [] }) =>
    m.mapMessage(await post(`/conversations/${conversationId}/messages`, { message, attachmentIds })),
  markRead: (conversationId) => post(`/conversations/${conversationId}/read`),
};

export const uploadsApi = {
  // Resolves with the mapped file ({ id, name, url, ... }).
  upload: async (file, { purpose = 'other', onProgress, signal } = {}) => m.mapFile(await uploadFile(file, { purpose, onProgress, signal })),
  // Public files open directly; private ones are fetched with the session token.
  open: async (file) => {
    if (file.isPublic) {
      window.open(file.url, '_blank', 'noopener');
      return;
    }
    await openProtectedFile(file.rawUrl || file.url, file.name);
  },
};

export const adminApi = {
  dashboard: () => get('/admin/dashboard'),
  users: async (params) => m.mapPage(await get('/admin/users', params), m.mapUser),
  suspendUser: (id) => post(`/admin/users/${id}/suspend`),
  activateUser: (id) => post(`/admin/users/${id}/activate`),
  deleteUser: (id) => del(`/admin/users/${id}`),
  projects: async (params) => m.mapPage(await get('/admin/projects', params), m.mapProject),
  moderateProject: (id, data) => patch(`/admin/projects/${id}`, data),
  deleteProject: (id) => del(`/admin/projects/${id}`),
  contracts: async (params) => m.mapPage(await get('/admin/contracts', params), m.mapContract),
  payments: async (params) => m.mapPage(await get('/admin/payments', params), m.mapPayment),
  approvePayment: (id) => post(`/admin/payments/${id}/approve`),
  rejectPayment: (id, reason) => post(`/admin/payments/${id}/reject`, { reason }),
  withdrawals: async (params) => m.mapPage(await get('/admin/withdrawals', params), m.mapWithdrawal),
  approveWithdrawal: (id) => post(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id, reason) => post(`/admin/withdrawals/${id}/reject`, { reason }),
  markWithdrawalPaid: (id, { transactionReference, paymentMethod, note }) =>
    post(`/admin/withdrawals/${id}/mark-paid`, { transactionReference, paymentMethod: paymentMethod || undefined, note }),
  reports: async (params) => m.mapPage(await get('/admin/reports', params), m.mapReport),
  reviewReport: (id) => post(`/admin/reports/${id}/review`),
  resolveReport: (id, { resolution, action }) => post(`/admin/reports/${id}/resolve`, { resolution, action }),
  deleteReport: (id) => del(`/admin/reports/${id}`),
  categories: async () => (await get('/admin/categories')).map(m.mapCategory),
  skills: async () => (await get('/admin/skills')).map((sk) => ({
    id: sk.id, name: sk.name, categoryId: sk.category_id, categoryName: sk.category_name || '', isActive: sk.is_active !== false,
  })),
  createSkill: (data) => post('/admin/skills', data),
  updateSkill: (id, data) => patch(`/admin/skills/${id}`, data),
  cancelContract: (id, reason) => post(`/admin/contracts/${id}/cancel`, { reason }),
  createCategory: (data) => post('/admin/categories', data),
  updateCategory: (id, data) => patch(`/admin/categories/${id}`, data),
  deleteCategory: (id) => del(`/admin/categories/${id}`),
  settings: () => get('/admin/settings'),
  saveSettings: (settings) => patch('/admin/settings', { settings }),
  features: () => get('/admin/features'),
  updateFeature: (id, changes) => patch(`/admin/features/${id}`, changes),
  auditLogs: (params) => get('/admin/audit-logs', params),
};

export const api = {
  auth: authApi,
  settings: settingsApi,
  taxonomy: taxonomyApi,
  profiles: profilesApi,
  portfolio: portfolioApi,
  projects: projectsApi,
  proposals: proposalsApi,
  contracts: contractsApi,
  payments: paymentsApi,
  withdrawals: withdrawalsApi,
  reviews: reviewsApi,
  reports: reportsApi,
  notifications: notificationsApi,
  messages: messagesApi,
  uploads: uploadsApi,
  admin: adminApi,
};

export { ApiError, resolveFileUrl } from './client.js';
export default api;
