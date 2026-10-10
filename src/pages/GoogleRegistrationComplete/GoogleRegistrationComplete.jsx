import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import '../RoleSelection/RoleSelection.css';
import './GoogleRegistrationComplete.css';
import RoleCard from '../../components/RoleCard/RoleCard';
import { FreelancerIcon, ClientIcon } from '../../components/Icons/RoleIcons';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';
import { GOOGLE_REGISTRATION_KEY } from '../../hooks/useGoogleAuthFlow';
import logo from '../../assets/logo.svg';

const MAX_AGE_MS = 30 * 60 * 1000;

const readPending = (state) => {
  if (state?.registrationToken) return state;
  try {
    const saved = JSON.parse(sessionStorage.getItem(GOOGLE_REGISTRATION_KEY) || 'null');
    if (saved && Date.now() - saved.savedAt < MAX_AGE_MS) return saved;
  } catch { /* ignore */ }
  return null;
};

/**
 * Final step of a first-time Google sign-up. Google already supplied the name,
 * email and photo; this page asks only for what is still missing (usually the
 * account type) and then creates the account.
 */
const GoogleRegistrationComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeGoogleRegistration, isAuthenticated, role: currentRole } = useAuth();
  const [pending] = useState(() => readPending(location.state));

  const needsRole = pending?.missingFields?.includes('role');
  const needsName = pending?.missingFields?.includes('fullName');
  const [role, setRole] = useState(pending?.suggestedRole || '');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={homeForRole(currentRole)} replace />;
  if (!pending) return <Navigate to="/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      setError('يرجى اختيار نوع الحساب للمتابعة.');
      return;
    }
    if (needsName && fullName.trim().length < 2) {
      setError('يرجى إدخال اسمك الكامل.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await completeGoogleRegistration({
        registrationToken: pending.registrationToken,
        role,
        fullName: needsName ? fullName.trim() : undefined,
      });
      try { sessionStorage.removeItem(GOOGLE_REGISTRATION_KEY); } catch { /* ignore */ }
      navigate(homeForRole(result.user.role), { replace: true });
    } catch (err) {
      if (err.code === 'REGISTRATION_EXPIRED') {
        try { sessionStorage.removeItem(GOOGLE_REGISTRATION_KEY); } catch { /* ignore */ }
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const { profile } = pending;

  return (
    <div className="role-selection-page" dir="rtl">
      <header className="role-selection-header">
        <div className="role-selection-header__container">
          <Link to="/" className="role-selection-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="role-selection-logo__img" />
          </Link>
        </div>
      </header>

      <main className="role-selection-main">
        <section className="role-selection-hero">
          <h1 className="role-selection-hero__title">خطوة أخيرة لإكمال حسابك</h1>
          <p className="role-selection-hero__subtitle">
            {needsRole ? 'ايهما يوصفك اكثر؟' : 'أكمل البيانات المتبقية لإنشاء حسابك'}
          </p>
        </section>

        <div className="google-complete-identity">
          {profile?.avatarUrl && (
            <img src={profile.avatarUrl} alt="" className="google-complete-avatar" referrerPolicy="no-referrer" />
          )}
          <div>
            {profile?.fullName && <strong className="google-complete-name">{profile.fullName}</strong>}
            <span className="google-complete-email">{profile?.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="google-complete-form" noValidate>
          {needsRole && (
            <section className="role-selection-cards" role="radiogroup" aria-label="اختر نوع الحساب">
              <RoleCard
                id="role-freelancer"
                roleValue="freelancer"
                titleLine1="انا مستقل ابحث"
                titleLine2="عن عمل"
                icon={<FreelancerIcon size={58} />}
                selected={role === 'freelancer'}
                onClick={() => setRole('freelancer')}
              />
              <RoleCard
                id="role-client"
                roleValue="client"
                titleLine1="انا عميل ابحث"
                titleLine2="عن مشروع"
                icon={<ClientIcon size={58} />}
                selected={role === 'client'}
                onClick={() => setRole('client')}
              />
            </section>
          )}

          {needsName && (
            <div className="google-complete-field">
              <label htmlFor="google-full-name">الاسم الكامل</label>
              <input
                id="google-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          {error && <div className="google-complete-error" role="alert">{error}</div>}

          <section className="role-selection-actions">
            <button type="submit" className="role-selection-btn" disabled={submitting || !role}>
              {submitting ? 'جارٍ إنشاء الحساب...' : 'انشاء حساب'}
            </button>
            <p className="role-selection-footer-text">
              <span>ليس هذا حسابك؟ </span>
              <Link to="/login" className="role-selection-login-link">العودة لتسجيل الدخول</Link>
            </p>
          </section>
        </form>
      </main>
    </div>
  );
};

export default GoogleRegistrationComplete;
