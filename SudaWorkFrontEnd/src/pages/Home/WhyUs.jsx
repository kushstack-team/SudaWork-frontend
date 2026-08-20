import React from 'react';
import './WhyUs.css';
import bag from '../../assets/why_us_section/bag.svg';
import speed from '../../assets/why_us_section/speed.svg';
import workers from '../../assets/why_us_section/workers.svg';

const features = [
  {
    title: 'الوصول الي مجموعة من افضل و انقاء المناسب لك',
    icon: (
      <img src={workers} alt="workers" />
    )
  },
  {
    title: 'استمتع بتجربة مطابقة و موثوقة و سهلة الاستخدام',
    icon: (
      <img src={bag} alt="bag" />
    )
  },
  {
    title: 'قم بانجاز عمل عالي الجودة بسرعة وفي حدود الميزانية',
    icon: (
      <img src={speed} alt="speed" />
    )
  }
];

const WhyUs = () => {
  return (
    <section className="why-us">
      <div className="why-us-container">
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
