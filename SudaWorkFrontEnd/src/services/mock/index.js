import { authApi } from './authApi.js';
import { usersApi } from './usersApi.js';
import { profilesApi } from './profilesApi.js';
import { categoriesApi } from './categoriesApi.js';
import { projectsApi } from './projectsApi.js';
import { proposalsApi } from './proposalsApi.js';
import { contractsApi } from './contractsApi.js';
import { deliverablesApi } from './deliverablesApi.js';
import { paymentsApi } from './paymentsApi.js';
import { withdrawalsApi } from './withdrawalsApi.js';
import { reviewsApi } from './reviewsApi.js';
import { reportsApi } from './reportsApi.js';
import { messagesApi } from './messagesApi.js';
import { notificationsApi } from './notificationsApi.js';
import { settingsApi } from './settingsApi.js';

export const mockApi = {
  auth: authApi,
  users: usersApi,
  profiles: profilesApi,
  categories: categoriesApi,
  projects: projectsApi,
  proposals: proposalsApi,
  contracts: contractsApi,
  deliverables: deliverablesApi,
  paymentRequests: paymentsApi,
  withdrawalRequests: withdrawalsApi,
  reviews: reviewsApi,
  reports: reportsApi,
  messages: messagesApi,
  notifications: notificationsApi,
  settings: settingsApi,
};

export {
  authApi,
  usersApi,
  profilesApi,
  categoriesApi,
  projectsApi,
  proposalsApi,
  contractsApi,
  deliverablesApi,
  paymentsApi,
  withdrawalsApi,
  reviewsApi,
  reportsApi,
  messagesApi,
  notificationsApi,
  settingsApi,
};

export default mockApi;
