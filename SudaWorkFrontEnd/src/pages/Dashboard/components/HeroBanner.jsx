import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiUsers, FiSearch, FiCheckCircle } from 'react-icons/fi';
import './HeroBanner.css';

const HeroBanner = ({ userName = 'طارق' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/freelancers?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/freelancers');
    }
  };

  return (
    <section className="dashboard-hero-banner" dir="rtl">
      <div className="hero-banner-card">
        <div className="hero-banner-content">
          <div className="hero-client-badge">
            <FiCheckCircle className="badge-check-icon" />
            <span>حساب صاحب عمل معتمد</span>
          </div>

          <h1 className="hero-banner-title">
            مرحباً بك مجدداً، {userName}
          </h1>

          <p className="hero-banner-subtitle">
            انشر مشاريعك، استقبل عروض أفضل الكفاءات السودانية، وقم بإدارة عقودك وضمانك المالي بكل موثوقية.
          </p>

          {/* Quick Talent Search */}
          <form className="hero-talent-search" onSubmit={handleSearch}>
            <div className="search-input-field">
              <FiSearch className="search-field-icon" />
              <input
                type="text"
                placeholder="ابحث عن مهارة أو تخصص (مثال: مصمم شعارات، مطور React، مونتير...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="hero-search-submit">
              بحث عن مستقل
            </button>
          </form>

          {/* Action CTAs */}
          <div className="hero-banner-actions">
            <Link to="/post-project" className="btn-hero-primary">
              <FiPlusCircle className="btn-icon" />
              <span>انشر مشروعاً جديداً</span>
            </Link>

            <Link to="/freelancers" className="btn-hero-secondary">
              <FiUsers className="btn-icon" />
              <span>تصفح دليل المستقلين</span>
            </Link>
          </div>
        </div>

        <div className="hero-banner-decorations">
          <div className="decor-circle decor-circle-1" />
          <div className="decor-circle decor-circle-2" />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
