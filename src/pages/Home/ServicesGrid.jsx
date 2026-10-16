import { useNavigate } from 'react-router-dom';
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
    query: 'برمجة',
    icon: (
      <img src={programmingIcon} alt="programming" />
    )
  },
  {
    title: 'التسويق الرقمي',
    query: 'تسويق',
    icon: (
      <img src={digitalMarketingIcon} alt="digital marketing" />
    )
  },
  {
    title: 'التصميم الجرافيكي',
    query: 'تصميم',
    icon: (
       <img src={graphicDesignIcon} alt="graphic design" />
    )
  },
  {
    title: 'خدمات الذكاء الاصطناعي',
    query: 'ذكاء اصطناعي',
    icon: (
      <img src={aiIcon} alt="ai" />
    )
  },
  {
    title: 'الفيديو & الرسوم المتحركة',
    query: 'فيديو',
    icon: (
      <img src={videoAnimationIcon} alt="video animation" />
    )
  }
];

const ServicesGrid = () => {
  const navigate = useNavigate();

  const handleServiceClick = (query) => {
    navigate(`/projects?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className="services-section">
      <div className="services-container">
        <h2 className="services-heading">كل ما تحتاجة من خدمات في مكان واحد</h2>
        

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card"
              role="button"
              tabIndex={0}
              onClick={() => handleServiceClick(service.query)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleServiceClick(service.query);
                }
              }}
              title={`تصفح مشاريع ${service.title}`}
            >
              <div className="service-icon">{service.icon}</div>
              <div className="service-title">{service.title}</div>
            </div>
          ))}
        </div>

        <div className="services-cta">
          <h2 className="why-us-heading">حقق اهدافك بمساعدة المستقلين</h2>
          <div className="services-cta-wrapper">
            <Button
              variant="primary"
              className="btn-services-join"
              onClick={() => navigate('/role-selection')}
            >
              انضم الان
            </Button>
          </div>
        </div>
        <hr />
      </div>
    </section>
  );
};

export default ServicesGrid;
