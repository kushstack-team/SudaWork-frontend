import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/auth';
import { homeForRole } from '../../utils/roles';
import { validateLoginForm } from '../../utils/validators';
import { tokens } from '../../services/api/client';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import useGoogleAuthFlow from '../../hooks/useGoogleAuthFlow';
import { FiBriefcase, FiCode } from 'react-icons/fi';


const EyeIcon = ({ visible }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {visible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, linkGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get('role'); // 'client' | 'freelancer'
  // Only same-site relative paths are accepted as redirect targets.
  const redirectParam = queryParams.get('redirect');
  const safeRedirect = redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//') ? redirectParam : null;
  const from = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : safeRedirect;

  const google = useGoogleAuthFlow({
    role: roleParam === 'client' || roleParam === 'freelancer' ? roleParam : undefined,
    redirectTo: from || undefined,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateLoginForm(email, password);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);

    try {
      tokens.setRemember(rememberMe);
      const user = await login(email, password);

      // Signed in with Google first and hit an existing account: link it now
      // that the password proved ownership.
      if (google.linkCredential) {
        try {
          await linkGoogle(google.linkCredential);
        } catch {
          // The account is signed in either way; linking can be retried later.
        }
        google.clearLinkCredential();
      }

      navigate(from || homeForRole(user.role), { replace: true });
    } catch (err) {
      setSubmitError(err.message || 'بيانات الدخول غير صحيحة، يرجى التحقق وإعادة المحاولة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({});
    setSubmitError('');
  };

  return (
    <div className="login-page" dir="rtl">
      {/* Header */}
      <header className="login-header">
        <div className="login-header__container">
          <Logo to="/" size="auth" ariaLabel="Sudawork Home" />
        </div>
      </header>

      {/* Main Container */}
      <main className="login-main">
        {roleParam === 'client' && (
          <div className="login-role-badge client">
            <FiBriefcase className="role-badge-icon" />
            <span>دخول أصحاب الأعمال (العملاء)</span>
          </div>
        )}
        {roleParam === 'freelancer' && (
          <div className="login-role-badge freelancer">
            <FiCode className="role-badge-icon" />
            <span>دخول المستقلين والمحترفين</span>
          </div>
        )}

        <h1 className="login-title">
          {roleParam === 'client'
            ? 'تسجيل الدخول كعميل'
            : roleParam === 'freelancer'
            ? 'تسجيل الدخول كمستقل'
            : 'تسجيل الدخول إلى سوداوورك'}
        </h1>

        {/* Social Auth Buttons */}
        <div className="login-socials">
          <GoogleAuthButton text="continue_with" onCredential={google.handleCredential} busy={google.busy} />
        </div>

        {google.error && (
          <div className="form-general-error" role="alert">
            {google.error}
            {google.linkCredential && ' أدخل كلمة المرور أدناه وسيتم ربط حساب قوقل تلقائياً.'}
          </div>
        )}

        {/* Divider */}
        <div className="login-divider">
          <span className="login-divider__text">او</span>
        </div>

        {/* General Error Banner */}
        {submitError && (
          <div className="form-general-error" role="alert">
            {submitError}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="example@sudawork.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
            />
            {errors.email && <span className="form-field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">
                كلمة المرور
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input form-input--password ${errors.password ? 'has-error' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {errors.password && <span className="form-field-error">{errors.password}</span>}
          </div>

          {/* Remember Me */}
          <div className="form-checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="custom-checkbox">
                <svg className="checkmark-icon" viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <span className="checkbox-label">تذكر بياناتي في هذا المتصفح</span>
            </label>
          </div>

          {/* Submit Action */}
          <div className="form-actions">
            <button
              type="submit"
              id="submit-login"
              className="login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>

            <p className="login-footer-text">
              <span>ليس لديك حساب بعد؟ </span>
              <Link 
                to={`${roleParam === 'client' ? '/register/client' : roleParam === 'freelancer' ? '/register/freelancer' : '/role-selection'}${safeRedirect ? `${roleParam ? '&' : '?'}redirect=${encodeURIComponent(safeRedirect)}` : ''}`} 
                className="login-signup-link"
              >
                {roleParam === 'client' ? 'أنشئ حساب عميل الآن' : roleParam === 'freelancer' ? 'أنشئ حساب مستقل الآن' : 'انضم الآن'}
              </Link>
            </p>
          </div>
        </form>

        {/* Demo accounts exist only in local development (npm run seed:demo). */}
        {import.meta.env.DEV && (
        <div className="login-demo-box">
          <span className="login-demo-title">حسابات تجريبية سريعة للمعاينة:</span>
          <div className="login-demo-buttons">
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => fillQuickDemo('tarig@alnilam.sd', 'password123')}
            >
              عميل (طارق)
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => fillQuickDemo('tasneem@dev.sd', 'password123')}
            >
              مستقلة (تسنيم)
            </button>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => fillQuickDemo('admin@sudawork.com', 'admin123')}
            >
              مدير النظام
            </button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
};

export default Login;
