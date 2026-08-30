import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ClientRegister.css';
import logo from '../../assets/logo.svg';

/**
 * GoogleIcon - Google G logo with white circular background
 */
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

/**
 * AppleIcon - Apple logo in black
 */
const AppleIcon = () => (
  <span className="social-icon-wrapper social-icon-wrapper--apple">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 0.92-2.84-.9.04-1.99.6-2.63 1.35-.57.65-.96 1.72-.83 2.74 1 .08 2.02-.5 2.54-1.25z" />
    </svg>
  </span>
);

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

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Client registration submitted:', formData);
    navigate('/dashboard');
  };

  return (
    <div className="client-register-page" dir="rtl">
      {/* Header */}
      <header className="client-register-header">
        <div className="client-register-header__container">
          <Link to="/" className="client-register-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="client-register-logo__img" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="client-register-main">
        {/* Main Heading */}
        <h1 className="client-register-title">سجل الدخول لتوظيف المواهب</h1>

        {/* Social Auth Buttons */}
        <div className="client-register-socials">
          {/* Right Button: Google (first in RTL) */}
          <button
            type="button"
            className="social-btn social-btn--google"
            onClick={() => console.log('Google Auth clicked')}
          >
            <GoogleIcon />
            <span>سجل مع قوقل</span>
          </button>

          {/* Left Button: Apple (second in RTL) */}
          <button
            type="button"
            className="social-btn social-btn--apple"
            onClick={() => console.log('Apple Auth clicked')}
          >
            <AppleIcon />
            <span>سجل مع ابل</span>
          </button>
        </div>

        {/* Divider */}
        <div className="client-register-divider">
          <span className="client-register-divider__text">او</span>
        </div>

        {/* Registration Form */}
        <form className="client-register-form" onSubmit={handleSubmit}>
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
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                الاسم الاخير
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
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
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
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
                className="form-input form-input--password"
                value={formData.password}
                onChange={handleChange}
                required
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
          </div>

          {/* Agreement Checkbox */}
          <div className="form-checkbox-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
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
          </div>

          {/* Submit Action Area */}
          <div className="form-actions">
            <button
              type="submit"
              id="submit-client-register"
              className="client-register-submit-btn"
            >
              انشاء حساب
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
