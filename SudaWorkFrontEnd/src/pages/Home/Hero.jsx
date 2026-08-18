import React from 'react';
import './Hero.css';
import SearchBar from '../../components/SearchBar';
import Button from '../../components/Button';

const Hero = () => {
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
          <Button variant="outline" className="hero-tag-btn">
            تعديل الفيديوهات
            <span className="arrow-icon">←</span>
          </Button>
          <Button variant="outline" className="hero-tag-btn">
            تصميم
            <span className="arrow-icon">←</span>
          </Button>
          <Button variant="outline" className="hero-tag-btn">
            تسويق
            <span className="arrow-icon">←</span>
          </Button>
          <Button variant="outline" className="hero-tag-btn">
            تطوير المواقع الاكترونية
            <span className="arrow-icon">←</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
