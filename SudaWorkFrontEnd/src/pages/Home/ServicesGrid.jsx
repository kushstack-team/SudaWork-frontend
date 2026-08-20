import React from 'react';
import './ServicesGrid.css';
import Button from '../../components/Button';
import programmingIcon from '../../assets/services_section/programming.svg';
import digitalMarketingIcon from '../../assets/services_section/digital_marketing.svg';
import graphicDesignIcon from '../../assets/services_section/graphical_design.svg';
import aiIcon from '../../assets/services_section/ai.svg';
import videoAnimationIcon from '../../assets/services_section/video_editing.svg';


const services = [
  {
    title: 'البرمجة و التكنولوجيا',
    icon: (
      <img src={programmingIcon} alt="programming" />
    )
  },
  {
    title: 'التسويق الرقمي',
    icon: (
      <img src={digitalMarketingIcon} alt="digital marketing" />
    )
  },
  {
    title: 'التصميم الاجرافيكي',
    icon: (
       <img src={graphicDesignIcon} alt="graphic design" />
    )
  },
  {
    title: 'خدمات الذكاء الاصطناعي',
    icon: (
      <img src={aiIcon} alt="ai" />
    )
  },
  {
    title: 'الفيديو & الرسوم المتحركة',
    icon: (
      <img src={videoAnimationIcon} alt="video animation" />
    )
  }
];

const ServicesGrid = () => {
  return (
    <section className="services-section">
      <div className="services-container">
        <h2 className="services-heading">كل ما تحتاجة من خدمات في مكان واحد</h2>
        

        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <div className="service-title">{service.title}</div>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <h2 className="why-us-heading">حقق اهدافك بمساعدة المستقلين</h2>
          <div className="services-cta-wrapper">
            <Button variant="primary" className="btn-services-join">انضم الان</Button>
          </div>
        </div>
        <hr />
      </div>
    </section>
  );
};

export default ServicesGrid;
