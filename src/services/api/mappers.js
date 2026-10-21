/**
 * Converts API records (snake_case, UPPER_CASE statuses) into the camelCase
 * shapes and display status strings the UI components already use.
 * Mappers only rename and format — they never invent values. Missing data
 * stays null/empty so the UI can show an honest empty state.
 */
import { resolveFileUrl } from './client.js';
import {
  PROJECT_STATUS,
  CONTRACT_STATUS,
  PROPOSAL_STATUS,
  PAYMENT_STATUS,
  WITHDRAWAL_STATUS,
  REPORT_STATUS,
} from '../../constants/index.js';

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const label = (map, value) => (value && map[value]) || value || '';

const dateOnly = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const daysUntil = (iso) => {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
};

const durationLabel = (iso) => {
  const days = daysUntil(iso);
  if (days === null) return '';
  if (days < 0) return 'انتهى الموعد';
  if (days <= 1) return 'يوم واحد';
  if (days < 7) return `${days} أيام`;
  if (days < 14) return 'أسبوع';
  if (days <= 30) return `${Math.round(days / 7)} أسابيع`;
  return `${Math.round(days / 30)} شهر`;
};

export const mapFile = (f) => f && ({
  id: f.id,
  name: f.file_name,
  url: resolveFileUrl(f.file_url),
  rawUrl: f.file_url,
  type: f.file_type,
  sizeBytes: num(f.file_size),
  size: f.file_size ? `${(Number(f.file_size) / (1024 * 1024)).toFixed(2)} MB` : '',
  isPublic: f.visibility === 'public',
});

export const mapUser = (u) => u && ({
  id: u.id,
  fullName: u.full_name,
  email: u.email,
  role: u.role,
  avatar: resolveFileUrl(u.avatar_url),
  status: u.is_active === false ? 'suspended' : 'active',
  isActive: u.is_active !== false,
  createdAt: u.created_at,
  lastLoginAt: u.last_login_at,
  hasPassword: u.has_password,
  // Accounts from list endpoints (admin) don't carry the flag; treat as verified.
  emailVerified: u.email_verified !== false,
  googleLinked: u.google_linked,
  profileComplete: u.profile_complete,
  missingProfileFields: u.missing_profile_fields || [],
});

export const mapPortfolioItem = (p) => ({
  id: p.id,
  title: p.title,
  description: p.description || '',
  link: p.project_url || '',
  image: resolveFileUrl(p.image_url),
  imageId: p.image_id,
  createdAt: p.created_at,
});

const skillNames = (skills) => (skills || []).map((s) => (typeof s === 'string' ? s : s.name));

// Freelancer card/profile shape (merges user + profile).
export const mapFreelancer = (row, extra = {}) => {
  if (!row) return null;
  return {
    id: row.user_id || row.id,
    userId: row.user_id || row.id,
    fullName: row.full_name,
    photo: resolveFileUrl(row.avatar_url),
    title: row.title || '',
    bio: row.bio || '',
    location: row.location || '',
    availability: row.availability || 'available',
    hourlyRate: num(row.hourly_rate),
    languages: row.languages || [],
    experience: row.experience || '',
    skills: skillNames(row.skills || extra.skills),
    avgRating: num(row.rating) || 0,
    totalReviews: Number(row.review_count || 0),
    completedProjects: Number(row.completed_contracts ?? extra.completedProjects ?? 0),
    portfolio: (extra.portfolio || []).map(mapPortfolioItem),
    joinedAt: row.joined_at || extra.joinedAt,
  };
};

// GET /users/:id, /freelancers/:id, /clients/:id → { user, profile, ... }
export const mapPublicProfile = (data) => {
  if (!data) return null;
  const user = mapUser(data.user);
  if (data.user.role === 'freelancer') {
    return {
      user,
      profile: mapFreelancer(
        { ...(data.profile || {}), user_id: data.user.id, full_name: data.user.full_name, avatar_url: data.user.avatar_url },
        { skills: data.skills, portfolio: data.portfolio, completedProjects: data.stats?.completed_contracts, joinedAt: data.user.created_at }
      ),
    };
  }
  if (data.user.role === 'client') {
    const p = data.profile || {};
    return {
      user,
      profile: {
        userId: data.user.id,
        companyName: p.company_name || '',
        industry: p.industry || '',
        description: p.description || '',
        location: p.location || '',
        phone: p.phone || '',
        logo: resolveFileUrl(data.user.avatar_url),
        companyLogo: resolveFileUrl(data.user.avatar_url),
        contactInfo: { phone: p.phone || '', location: p.location || '' },
        avgRating: num(p.rating) || 0,
        totalReviews: Number(p.review_count || 0),
        completedProjects: Number(data.stats?.completed_contracts || 0),
        postedProjectsCount: Number(data.stats?.projects_posted || 0),
      },
    };
  }
  return { user, profile: null };
};

export const mapProject = (p) => p && ({
  id: p.id,
  title: p.title,
  description: p.description,
  categoryId: p.category_id,
  category: p.category_name || '',
  categoryName: p.category_name || '',
  budget: num(p.budget),
  deadline: dateOnly(p.deadline),
  deadlineAt: p.deadline,
  duration: durationLabel(p.deadline),
  daysLeft: daysUntil(p.deadline),
  status: label(PROJECT_STATUS, p.status),
  rawStatus: p.status,
  skills: skillNames(p.skills),
  attachments: (p.attachments || []).map(mapFile),
  clientId: p.client_id,
  clientName: p.client_name || '',
  clientAvatar: resolveFileUrl(p.client_avatar_url),
  proposalsCount: Number(p.proposals_count || 0),
  contractId: p.contract_id || null,
  contractStatus: label(CONTRACT_STATUS, p.contract_status),
  reviewNote: p.review_note || '',
  submittedAt: p.submitted_at || null,
  reviewedAt: p.reviewed_at || null,
  createdAt: p.created_at,
});

export const mapProposal = (p) => p && ({
  id: p.id,
  projectId: p.project_id,
  freelancerId: p.freelancer_id,
  bidAmount: num(p.bid_amount),
  deliveryTime: Number(p.delivery_days),
  coverLetter: p.cover_letter || '',
  status: label(PROPOSAL_STATUS, p.status),
  rawStatus: p.status,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  freelancerName: p.freelancer_name || '',
  freelancerPhoto: resolveFileUrl(p.freelancer_avatar_url),
  freelancerTitle: p.freelancer_title || '',
  freelancerRating: num(p.freelancer_rating) || 0,
  freelancerReviews: Number(p.freelancer_review_count || 0),
  projectTitle: p.project_title || '',
  projectStatus: label(PROJECT_STATUS, p.project_status),
  projectBudget: num(p.project_budget),
  projectDeadline: dateOnly(p.project_deadline),
  categoryName: p.category_name || '',
  clientId: p.client_id,
  contractId: p.contract_id || null,
  contractStatus: label(CONTRACT_STATUS, p.contract_status),
});

export const mapContract = (c) => {
  if (!c) return null;
  const start = c.started_at || c.created_at;
  let deliveryDate = '';
  if (c.delivery_days && start) {
    const d = new Date(start);
    d.setDate(d.getDate() + Number(c.delivery_days));
    deliveryDate = dateOnly(d.toISOString());
  }
  return {
    id: c.id,
    projectId: c.project_id,
    projectTitle: c.project_title || '',
    projectStatus: label(PROJECT_STATUS, c.project_status),
    clientId: c.client_id,
    freelancerId: c.freelancer_id,
    proposalId: c.proposal_id,
    agreedPrice: num(c.amount),
    deliveryDays: num(c.delivery_days),
    deliveryDate: c.started_at ? deliveryDate : '',
    status: label(CONTRACT_STATUS, c.status),
    rawStatus: c.status,
    createdAt: c.created_at,
    startedAt: c.started_at,
    completedAt: c.completed_at,
    cancelledAt: c.cancelled_at,
    platformFee: num(c.platform_fee),
    freelancerNet: num(c.freelancer_net),
    commissionPercent: num(c.commission_percent),
    clientName: c.client_name || '',
    clientAvatar: resolveFileUrl(c.client_avatar_url),
    clientCompany: c.client_company || '',
    freelancerName: c.freelancer_name || '',
    freelancerAvatar: resolveFileUrl(c.freelancer_avatar_url),
    freelancerTitle: c.freelancer_title || '',
    paymentStatus: label(PAYMENT_STATUS, c.payment_status),
    paymentRejectionReason: c.payment_rejection_reason || '',
    conversationId: c.conversation_id || null,
    deliverablesCount: Number(c.deliverables_count || 0),
  };
};

const DELIVERABLE_STATUS = { PENDING_REVIEW: 'Pending Review', REVISION_REQUESTED: 'Revision Requested', ACCEPTED: 'Accepted' };

export const mapDeliverable = (d) => ({
  id: d.id,
  contractId: d.contract_id,
  notes: d.message,
  status: label(DELIVERABLE_STATUS, d.status),
  revisionNotes: d.revision_message || '',
  files: (d.attachments || []).map(mapFile),
  submittedAt: d.created_at,
  reviewedAt: d.reviewed_at,
});

export const mapPayment = (p) => p && ({
  id: p.id,
  contractId: p.contract_id,
  clientId: p.client_id,
  amount: num(p.amount),
  contractAmount: num(p.contract_amount),
  method: p.payment_method,
  paymentMethod: p.payment_method,
  transactionId: p.transaction_reference,
  status: label(PAYMENT_STATUS, p.status),
  rawStatus: p.status,
  rejectionReason: p.admin_reason || '',
  createdAt: p.created_at,
  reviewedAt: p.reviewed_at,
  projectId: p.project_id,
  projectTitle: p.project_title || '',
  clientName: p.client_name || '',
  contractStatus: label(CONTRACT_STATUS, p.contract_status),
  proof: p.proof_file_id ? { id: p.proof_file_id, name: p.proof_file_name, url: resolveFileUrl(p.proof_file_url), rawUrl: p.proof_file_url } : null,
});

export const mapWithdrawal = (w) => w && ({
  id: w.id,
  freelancerId: w.freelancer_id,
  freelancerName: w.freelancer_name || '',
  amount: num(w.amount),
  method: w.payment_method,
  accountName: w.account_name,
  accountNumber: w.account_number,
  accountDetails: `${w.account_number} - ${w.account_name}`,
  status: label(WITHDRAWAL_STATUS, w.status),
  rawStatus: w.status,
  adminReason: w.admin_reason || '',
  paidAmount: num(w.paid_amount),
  transactionReference: w.transaction_reference || '',
  paidAt: w.paid_at,
  note: w.admin_note || '',
  createdAt: w.created_at,
});

export const mapReview = (r) => ({
  id: r.id,
  contractId: r.contract_id,
  fromUserId: r.reviewer_id,
  toUserId: r.reviewee_id,
  rating: Number(r.rating),
  comment: r.comment || '',
  createdAt: r.created_at,
  reviewerName: r.reviewer_name || '',
  reviewerAvatar: resolveFileUrl(r.reviewer_avatar_url),
  reviewerRole: r.reviewer_role,
  projectTitle: r.project_title || '',
});

export const mapReport = (r) => ({
  id: r.id,
  targetType: r.target_type,
  targetId: r.target_id,
  targetTitle: r.target_title || '',
  contractId: r.target_type === 'contract' ? r.target_id : null,
  reporterId: r.reporter_id,
  reporterName: r.reporter_name || '',
  reportedUserId: r.reported_user_id,
  reportedUserName: r.reported_user_name || '',
  reportedUserRole: r.reported_user_role || '',
  reason: r.reason,
  description: r.description || '',
  desiredResolution: r.desired_resolution || '',
  status: label(REPORT_STATUS, r.status),
  rawStatus: r.status,
  resolutionNotes: r.resolution || '',
  action: r.action || '',
  createdAt: r.created_at,
  resolvedAt: r.resolved_at,
});

export const mapNotification = (n) => ({
  id: n.id,
  type: n.type || 'general',
  title: n.title,
  message: n.message,
  link: n.link || '',
  isRead: Boolean(n.is_read),
  createdAt: n.created_at,
});

export const mapMessage = (m) => ({
  id: m.id,
  conversationId: m.conversation_id,
  senderId: m.sender_id,
  body: m.message || '',
  text: m.message || '',
  isRead: Boolean(m.is_read),
  sentAt: m.created_at,
  createdAt: m.created_at,
  attachments: (m.attachments || []).map(mapFile),
});

export const mapConversation = (c) => ({
  id: c.id,
  projectId: c.project_id,
  contractId: c.contract_id,
  projectTitle: c.project_title || '',
  contractStatus: label(CONTRACT_STATUS, c.contract_status),
  counterpartyId: c.other_id,
  counterpartyName: c.other_name || '',
  counterpartyAvatar: resolveFileUrl(c.other_avatar_url),
  counterpartyRole: c.other_role,
  counterpartySubtitle: c.other_role === 'freelancer' ? c.other_title || '' : c.other_company || '',
  lastMessage: c.last_message
    ? { id: c.last_message.id, body: c.last_message.message || '', senderId: c.last_message.sender_id, sentAt: c.last_message.created_at }
    : null,
  unreadCount: Number(c.unread_count || 0),
  updatedAt: c.last_activity_at || c.updated_at,
});

export const mapCategory = (c) => ({
  id: c.id,
  name: c.name,
  description: c.description || '',
  isActive: c.is_active !== false,
  skillsCount: c.skills_count !== undefined ? Number(c.skills_count) : undefined,
  projectsCount: c.projects_count !== undefined ? Number(c.projects_count) : undefined,
});

export const mapPage = (page, mapper) => ({
  items: (page?.data || []).map(mapper),
  total: Number(page?.total || 0),
  page: Number(page?.page || 1),
  limit: Number(page?.limit || 10),
  totalPages: Number(page?.totalPages || 1),
});
