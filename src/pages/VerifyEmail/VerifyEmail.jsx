import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import '../ForgotPassword/ForgotPassword.css';
import Logo from '../../components/Logo/Logo';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { api } from '../../services/api';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';

/**
 * Email verification step after email/password sign-up. The 6-digit code is
 * checked on the server; this page only collects it.
 */
const VerifyEmail = () => {
  const { user, isAuthenticated, loading, refreshUser, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  // Only claim the email was sent when the server confirmed it at sign-up.
  const [notice, setNotice] = useState(
    location.state?.emailSent === true ? 'أرسلنا رمز تأكيد مكوناً من 6 أرقام إلى بريدك الإلكتروني.' : ''
  );
  const [sendFailed, setSendFailed] = useState(location.state?.emailSent === false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(location.state?.emailSent === false ? 0 : 60);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const redirectParam = new URLSearchParams(location.search).get('redirect') || location.state?.redirect;
  const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : null;

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.emailVerified) return <Navigate to={safeRedirect || homeForRole(user.role)} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError('أدخل الرمز المكون من 6 أرقام.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const verified = await api.auth.verifyEmail(code.trim());
      setUser(verified);
      navigate(safeRedirect || homeForRole(verified.role), { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.code === 'VERIFICATION_CODE_EXPIRED' || err.code === 'VERIFICATION_TOO_MANY_ATTEMPTS') setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setNotice('');
    try {
      const result = await api.auth.resendVerification();
      if (result.alreadyVerified) {
        await refreshUser();
        return;
      }
      setSendFailed(false);
      setNotice('أرسلنا رمزاً جديداً. الرموز السابقة لم تعد صالحة.');
      setCooldown(60);
    } catch (err) {
      setError(err.message);
      if (err.code === 'RESEND_TOO_SOON') setCooldown(err.details?.retryAfterSeconds || 60);
      else setSendFailed(true);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="forgot-pwd-page" dir="rtl">
      <header className="forgot-pwd-header">
        <div className="forgot-pwd-header__container">
          <Logo to="/" size="auth" ariaLabel="Sudawork Home" />
        </div>
      </header>

      <main className="forgot-pwd-main">
        <div className="forgot-pwd-card">
          <div className="forgot-pwd-icon-circle">
            <FiMail className="forgot-icon" />
          </div>

          <h1 className="forgot-pwd-title">تأكيد البريد الإلكتروني</h1>
          <p className="forgot-pwd-subtitle">
            أدخل الرمز المرسل إلى <strong dir="ltr">{user.email}</strong> لتفعيل حسابك. الرمز صالح لمدة 15 دقيقة.
          </p>

          {notice && (
            <div className="form-success-notice" role="status">
              <FiCheckCircle /> {notice}
            </div>
          )}
          {sendFailed && (
            <div className="form-general-error" role="alert">
              تعذر إرسال رسالة التأكيد. اضغط «إعادة إرسال الرمز» للمحاولة مرة أخرى.
            </div>
          )}

          <form className="forgot-pwd-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="verification-code" className="form-label">رمز التأكيد</label>
              <input
                id="verification-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                className={`form-input ${error ? 'has-error' : ''}`}
                style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.4rem' }}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  if (error) setError('');
                }}
              />
              {error && <span className="form-field-error">{error}</span>}
            </div>

            <button type="submit" className="forgot-pwd-submit-btn" disabled={submitting || code.length !== 6}>
              {submitting ? 'جارٍ التحقق...' : 'تأكيد البريد'}
            </button>
          </form>

          <div className="forgot-pwd-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button type="button" className="back-to-login-link" onClick={handleResend} disabled={resending || cooldown > 0}
              style={{ background: 'none', border: 'none', cursor: cooldown > 0 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {resending ? 'جارٍ الإرسال...' : cooldown > 0 ? `إعادة إرسال الرمز بعد ${cooldown} ثانية` : 'إعادة إرسال الرمز'}
            </button>
            <button type="button" className="back-to-login-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>
              تسجيل الدخول بحساب آخر
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
