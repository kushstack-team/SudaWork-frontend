import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RoleSelection.css';
import RoleCard from '../../components/RoleCard/RoleCard';
import { FreelancerIcon, ClientIcon } from '../../components/Icons/RoleIcons';
import logo from '../../assets/logo.svg';

/**
 * RoleSelectionPage - Arabic RTL Role Selection Page for Sudawork.
 */
const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState('freelancer');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole === 'client') {
      navigate('/register/client');
    } else {
      navigate('/register/freelancer');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="role-selection-page" dir="rtl">
      {/* Top Header with Sudawork Logo */}
      <header className="role-selection-header">
        <div className="role-selection-header__container">
          <Link to="/" className="role-selection-logo" aria-label="Sudawork Home">
            <img src={logo} alt="Sudawork" className="role-selection-logo__img" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="role-selection-main">
        {/* Hero Text */}
        <section className="role-selection-hero">
          <h1 className="role-selection-hero__title">انضم الي سوداوورك</h1>
          <p className="role-selection-hero__subtitle">ايهما يوصفك اكثر؟</p>
        </section>

        {/* Role Cards Container */}
        <section
          className="role-selection-cards"
          role="radiogroup"
          aria-label="اختر نوع الحساب"
        >
          {/* Right Card: Freelancer (First in RTL flow) */}
          <RoleCard
            id="role-freelancer"
            roleValue="freelancer"
            titleLine1="انا مستقل ابحث"
            titleLine2="عن عمل"
            icon={<FreelancerIcon size={58} />}
            selected={selectedRole === 'freelancer'}
            onClick={() => handleRoleChange('freelancer')}
          />

          {/* Left Card: Client (Second in RTL flow) */}
          <RoleCard
            id="role-client"
            roleValue="client"
            titleLine1="انا عميل ابحث"
            titleLine2="عن مشروع"
            icon={<ClientIcon size={58} />}
            selected={selectedRole === 'client'}
            onClick={() => handleRoleChange('client')}
          />
        </section>

        {/* Action Area */}
        <section className="role-selection-actions">
          <button
            type="button"
            id="create-account-btn"
            className="role-selection-btn"
            onClick={handleSubmit}
            disabled={!selectedRole}
          >
            انشاء حساب
          </button>

          <p className="role-selection-footer-text">
            <span>لديك حساب بالفعل؟ </span>
            <Link
              to="/login"
              id="login-link"
              className="role-selection-login-link"
              onClick={handleLogin}
            >
              سجل الدخول
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
};

export default RoleSelection;
