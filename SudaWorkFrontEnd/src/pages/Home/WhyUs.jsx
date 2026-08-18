import React from 'react';
import './WhyUs.css';

const features = [
  {
    title: 'الوصول الي مجموعة من افضل و انقاء المناسب لك',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v-2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: 'استمتع بتجربة مطابقة و موثوقة و سهلة الاستخدام',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    )
  },
  {
    title: 'قم باعنجاز عمل عالي الجودة بسرعة وفي حدود الميزانية',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  }
];

const WhyUs = () => {
  return (
    <section className="why-us">
      <div className="why-us-container">
        <h2 className="why-us-heading">حقق اهدافك بمساعدة المستقلين</h2>
        <div className="divider"></div>
        <div className="features-row">
          {features.map((feat, index) => (
            <div key={index} className="feature-column">
              <div className="feature-icon">{feat.icon}</div>
              <p className="feature-text">{feat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
