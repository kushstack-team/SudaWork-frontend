import { useNavigate } from 'react-router-dom';
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
          تواصل مع افضل المستقلين <br />
          <span className="accent-text">في السودان</span>
        </h1>
        
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
