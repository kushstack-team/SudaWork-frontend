import { useNavigate, Link } from 'react-router-dom';
import './Hero.css';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';
import { FiArrowLeft } from 'react-icons/fi';

const Hero = () => {
  const navigate = useNavigate();

  const handleTagClick = (keyword) => {
    navigate(`/projects?search=${encodeURIComponent(keyword)}`);
  };

  return (
    <section className="hero">
      <div className="hero-container">
        <h1 className="hero-headline">
          تواصل مع أفضل المستقلين <br />
          <span className="accent-text">في السودان</span>
        </h1>
        
        <p className="hero-description">
          انشر مشروعك الآن واستقبل عروضاً مخصصة من نخبة الكفاءات والمحترفين، مع ضمان مالي كامل وحماية لجميع مراحل العمل.
        </p>

        {/* Primary Neon CTA Button for Project Owners */}
        <div className="hero-cta-wrapper">
          <span className="sw-cta-wrap">
            <Link to="/post-project" className="sw-cta hero-cta-neon" id="hero-main-cta">
              <span className="cta-text">ابدأ مشروعك الآن</span>
              <FiArrowLeft className="cta-arrow" />
            </Link>
          </span>
        </div>

        {/* Secondary Search & Categories */}
        <div className="hero-search-wrapper">
          <SearchBar placeholder="ابحث عن اي خدمة...." className="hero-search" />
        </div>

        <div className="hero-tags">
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('فيديو')}
          >
            تعديل الفيديوهات
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تصميم')}
          >
            تصميم
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تسويق')}
          >
            تسويق
            <FiArrowLeft className="arrow-icon" />
          </Button>
          <Button
            variant="outline"
            className="hero-tag-btn"
            onClick={() => handleTagClick('تطوير مواقع')}
          >
            تطوير المواقع الاكترونية
            <FiArrowLeft className="arrow-icon" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
