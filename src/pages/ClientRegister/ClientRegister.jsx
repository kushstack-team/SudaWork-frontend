import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ClientRegister.css';
import Logo from '../../components/Logo/Logo';
import { useAuth } from '../../context/auth';
import { validateRegisterForm } from '../../utils/validators';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import useGoogleAuthFlow from '../../hooks/useGoogleAuthFlow';

/**
 * EyeIcon - Password visibility toggle icon
 */
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

const ClientRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const google = useGoogleAuthFlow({ role: 'client' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeTerms: true,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateRegisterForm(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setSubmitError('');
    setIsSubmitting(true);
    try {
      const created = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
        role: 'client',
      });
      navigate('/verify-email', { replace: true, state: { emailSent: created.verificationEmailSent } });
    } catch (err) {
      if (err.code === 'EMAIL_IN_USE') {
        setErrors((prev) => ({ ...prev, email: err.message }));
      } else if (err.code === 'VALIDATION_ERROR' && err.fieldErrors?.email) {
        setErrors((prev) => ({ ...prev, email: 'يرجى إدخال بريد إلكتروني صحيح' }));
      } else {
        setSubmitError(err.message || 'حدث خطأ أثناء التسجيل، يرجى المحاولة لاحقاً');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="client-register-page" dir="rtl">
      {/* Header */}
      <header className="client-register-header">
        <div className="client-register-header__container">
          <Logo to="/" size="auth" ariaLabel="Sudawork Home" />
        </div>
      </header>

      {/* Main Container */}
      <main className="client-register-main">
        {/* Main Heading */}
        <h1 className="client-register-title">سجل الدخول لتوظيف المواهب</h1>

        {/* Social Auth Buttons */}
        <div className="client-register-socials">
          <GoogleAuthButton text="continue_with" onCredential={google.handleCredential} busy={google.busy} />
        </div>

        {google.error && (
          <div className="form-general-error" role="alert">
            {google.error}{' '}
            {google.linkCredential && <Link to="/login">تسجيل الدخول</Link>}
          </div>
        )}

        {/* Divider */}
        <div className="client-register-divider">
          <span className="client-register-divider__text">او</span>
        </div>

        {/* Registration Form */}
        <form className="client-register-form" onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="form-general-error" role="alert">
              {submitError}
            </div>
          )}

          {/* Row 1: First Name & Last Name */}
          <div className="form-row form-row--two-col">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                الاسم الاول
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-input ${errors.firstName ? 'has-error' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <span className="form-field-error">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                الاسم الاخير
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-input ${errors.lastName ? 'has-error' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <span className="form-field-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Row 2: Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              الايميل
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="form-field-error">{errors.email}</span>
            )}
          </div>

          {/* Row 3: Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              الباسورد
            </label>
            <div className="input-with-icon">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className={`form-input form-input--password ${errors.password ? 'has-error' : ''}`}
                value={formData.password}
                onChange={handleChange}
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
            {errors.password && (
              <span className="form-field-error">{errors.password}</span>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div className="form-checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
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
              <span className="checkbox-label">
                نعم , اتفهم و اوافق علي احكام و خدمات سوداوورك.
              </span>
            </label>
            {errors.agreeTerms && (
              <span className="form-field-error checkbox-error">{errors.agreeTerms}</span>
            )}
          </div>

          {/* Submit Action Area */}
          <div className="form-actions">
            <button
              type="submit"
              id="submit-client-register"
              className="client-register-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جارٍ إنشاء الحساب...' : 'انشاء حساب'}
            </button>

            <p className="client-register-footer-text">
              <span>لديك حساب بالفعل؟ </span>
              <Link to="/login" className="client-register-login-link">
                سجل الدخول
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ClientRegister;
