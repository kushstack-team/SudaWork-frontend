import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';
import logo from '../../assets/logo.svg';
import { validateEmail } from '../../utils/validators';
import { FiMail, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setError('');
    setLoading(true);

    // Simulate sending recovery link via email
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="forgot-pwd-page" dir="rtl">
      {/* Header */}
      <header className="forgot-pwd-header">
        <div className="forgot-pwd-header__container">
          <Link to="/" className="forgot-pwd-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="forgot-pwd-logo__img" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="forgot-pwd-main">
        <div className="forgot-pwd-card">
          {!isSubmitted ? (
            <>
              <div className="forgot-pwd-icon-circle">
                <FiMail className="forgot-icon" />
              </div>

              <h1 className="forgot-pwd-title">استعادة كلمة المرور</h1>
              <p className="forgot-pwd-subtitle">
                أدخل عنوان بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور الخاصة بك.
              </p>

              <form className="forgot-pwd-form" onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="recovery-email" className="form-label">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="recovery-email"
                    name="email"
                    className={`form-input ${error ? 'has-error' : ''}`}
                    placeholder="example@sudawork.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                  />
                  {error && <span className="form-field-error">{error}</span>}
                </div>

                <button
                  type="submit"
                  className="forgot-pwd-submit-btn"
                  disabled={loading}
                >
                  {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
                </button>
              </form>

              <div className="forgot-pwd-footer">
                <Link to="/login" className="back-to-login-link">
                  <FiArrowRight className="arrow-icon" />
                  <span>العودة إلى تسجيل الدخول</span>
                </Link>
              </div>
            </>
          ) : (
            <div className="forgot-pwd-success-state">
              <div className="success-icon-circle">
                <FiCheckCircle className="success-icon" />
              </div>

              <h2 className="success-title">تم إرسال الرابط بنجاح!</h2>
              <p className="success-desc">
                لقد أرسلنا تعليمات استعادة كلمة المرور إلى البريد الإلكتروني:
                <br />
                <strong className="target-email">{email}</strong>
              </p>

              <div className="mock-token-preview">
                <span className="token-label">رابط تجريبي للمعاينة:</span>
                <Link
                  to="/reset-password/sample-demo-token-123"
                  className="demo-reset-link"
                >
                  انقر هنا لفتح صفحة تعيين كلمة المرور الجديدة مباشرة
                </Link>
              </div>

              <Link to="/login" className="forgot-pwd-submit-btn back-btn-link">
                العودة لتسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
