import { delay, getStorageItem, setStorageItem, sanitizeUser } from './storage.js';
import { defaultUsers, defaultFreelancerProfiles, defaultClientProfiles } from './seedData.js';
import { NOTIFICATION_TYPES } from '../../constants/index.js';

export const authApi = {
  async login(email, password) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = users.find(
      (u) => (u.email || '').trim().toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw new Error('البريد الإلكتروني غير مسجل لدينا');
    }
    if (user.passwordHash !== password) {
      throw new Error('كلمة المرور غير صحيحة');
    }
    if (user.status === 'suspended') {
      throw new Error('تم تعليق هذا الحساب، يرجى التواصل مع الإدارة');
    }

    const safeUser = sanitizeUser(user);
    localStorage.setItem('sudawork_session', JSON.stringify(safeUser));
    return safeUser;
  },

  async register(data) {
    await delay();
    const users = getStorageItem('users', defaultUsers);
    const existing = users.find(
      (u) => (u.email || '').trim().toLowerCase() === (data.email || '').trim().toLowerCase()
    );
    if (existing) {
      throw new Error('هذا البريد الإلكتروني مسجل بالفعل');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'مستخدم جديد',
      email: data.email.trim().toLowerCase(),
      passwordHash: data.password || 'password123',
      role: data.role || 'client',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStorageItem('users', users);

    // Create initial profile
    if (newUser.role === 'freelancer') {
      const fpList = getStorageItem('freelancerProfiles', defaultFreelancerProfiles);
      fpList.push({
        userId: newUser.id,
        photo: '',
        title: data.title || 'مستقل محترف',
        bio: '',
        skills: data.skills || [],
        portfolio: [],
        location: 'السودان',
        availability: 'available',
        avgRating: 5.0,
        completedProjects: 0,
      });
      setStorageItem('freelancerProfiles', fpList);
    } else if (newUser.role === 'client') {
      const cpList = getStorageItem('clientProfiles', defaultClientProfiles);
      cpList.push({
        userId: newUser.id,
        companyName: '',
        logo: '',
        description: '',
        contactInfo: {},
        postedProjectsCount: 0,
      });
      setStorageItem('clientProfiles', cpList);
    }

    const safeUser = sanitizeUser(newUser);
    localStorage.setItem('sudawork_session', JSON.stringify(safeUser));
    return safeUser;
  },

  async getCurrentUser() {
    await delay(120);
    try {
      const raw = localStorage.getItem('sudawork_session');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.id === 'user_client_1' && parsed.email !== 'tarig@alnilam.sd') {
        parsed.email = 'tarig@alnilam.sd';
        parsed.fullName = 'طارق عبد المحمود';
        localStorage.setItem('sudawork_session', JSON.stringify(parsed));
      }
      if (parsed.id === 'user_freelancer_1' && parsed.email !== 'tasneem@dev.sd') {
        parsed.email = 'tasneem@dev.sd';
        localStorage.setItem('sudawork_session', JSON.stringify(parsed));
      }
      return sanitizeUser(parsed);
    } catch {
      return null;
    }
  },

  async logout() {
    await delay(120);
    localStorage.removeItem('sudawork_session');
    return true;
  },
};
