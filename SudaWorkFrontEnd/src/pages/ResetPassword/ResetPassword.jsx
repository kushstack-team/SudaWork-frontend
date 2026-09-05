import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './ResetPassword.css';
import logo from '../../assets/logo.svg';
import { validatePassword } from '../../utils/validators';
import { FiLock, FiCheckCircle } from 'react-icons/fi';

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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const pwdError = validatePassword(password, 6);
    if (pwdError) {
      newErrors.password = pwdError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'يرجى تأكيد كلمة المرور';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate password reset API call
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
    }, 600);
  };

  return (
    <div className="reset-pwd-page" dir="rtl">
      {/* Header */}
      <header className="reset-pwd-header">
        <div className="reset-pwd-header__container">
          <Link to="/" className="reset-pwd-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="reset-pwd-logo__img" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="reset-pwd-main">
        <div className="reset-pwd-card">
          {!isSuccess ? (
            <>
              <div className="reset-pwd-icon-circle">
                <FiLock className="reset-icon" />
              </div>

              <h1 className="reset-pwd-title">تعيين كلمة المرور الجديدة</h1>
              <p className="reset-pwd-subtitle">
                أدخل كلمة المرور الجديدة لحسابك واحرص على اختيار كلمة مرور قوية وسهلة التذكر.
              </p>

              <form className="reset-pwd-form" onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="new-password" className="form-label">
                    كلمة المرور الجديدة
                  </label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="new-password"
                      name="password"
                      className={`form-input form-input--password ${errors.password ? 'has-error' : ''}`}
                      placeholder="6 أحرف على الأقل"
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

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirm-password" className="form-label">
                    تأكيد كلمة المرور
                  </label>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirm-password"
                      name="confirmPassword"
                      className={`form-input form-input--password ${errors.confirmPassword ? 'has-error' : ''}`}
                      placeholder="أعد إدخال كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: null }));
                        }
                      }}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <span className="form-field-error">{errors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="reset-pwd-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور الجديدة'}
                </button>
              </form>
            </>
          ) : (
            <div className="reset-pwd-success-state">
              <div className="success-icon-circle">
                <FiCheckCircle className="success-icon" />
              </div>

              <h2 className="success-title">تم تغيير كلمة المرور بنجاح!</h2>
              <p className="success-desc">
                يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول إلى حسابك ومتابعة أعمالك.
              </p>

              <button
                type="button"
                className="reset-pwd-submit-btn"
                onClick={() => navigate('/login')}
              >
                تسجيل الدخول الآن
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
