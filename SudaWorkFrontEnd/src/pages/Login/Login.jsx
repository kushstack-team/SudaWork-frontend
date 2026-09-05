import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../context/AuthContext';
import { validateLoginForm } from '../../utils/validators';

const GoogleIcon = () => (
  <span className="social-icon-wrapper social-icon-wrapper--google">
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  </span>
);

const AppleIcon = () => (
  <span className="social-icon-wrapper social-icon-wrapper--apple">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-1.99.6-2.63 1.35-.57.65-.96 1.72-.83 2.74 1 .08 2.02-.5 2.54-1.25z" />
    </svg>
  </span>
);

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
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname;

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
      const user = await login(email, password);

      // If user was redirected from a protected page, send them back there
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // Role-based destination
      if (user.role === 'client') {
        navigate('/client-dashboard', { replace: true });
      } else if (user.role === 'freelancer') {
        navigate('/freelancer-dashboard', { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
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
          <Link to="/" className="login-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="login-logo__img" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="login-main">
        <h1 className="login-title">تسجيل الدخول إلى سوداوورك</h1>

        {/* Social Auth Buttons */}
        <div className="login-socials">
          <button
            type="button"
            className="social-btn social-btn--google"
            onClick={() => console.log('Google Auth clicked')}
          >
            <GoogleIcon />
            <span>الدخول مع قوقل</span>
          </button>

          <button
            type="button"
            className="social-btn social-btn--apple"
            onClick={() => console.log('Apple Auth clicked')}
          >
            <AppleIcon />
            <span>الدخول مع ابل</span>
          </button>
        </div>

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
              <Link to="/role-selection" className="login-signup-link">
                انضم الآن
              </Link>
            </p>
          </div>
        </form>

        {/* Quick Demo Helper Box */}
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
      </main>
    </div>
  );
};

export default Login;
