import React from 'react';
import './HeroBanner.css';

const HeroBanner = ({ userName = 'أحمد' }) => {
  return (
    <section className="dashboard-hero-banner" dir="rtl">
      <div className="hero-banner-card">
        <div className="hero-banner-content">
          <h1 className="hero-banner-title">
            مرحباً بك في سوداوورك، {userName}
          </h1>
          <p className="hero-banner-subtitle">
            ابحث عن أفضل الخدمات والمهارات المهنية لإنجاز مشاريعك بكل سهولة وسرعة في السودان.
          </p>
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
