import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTABanner.css';
import Button from '../../components/Button';

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="cta-banner">
      <div className="cta-banner-container">
        <h2 className="cta-banner-heading">كل ما تحاجة من خدمات بين يديك</h2>
        <div className="cta-btn-wrapper">
          <Button
            variant="outline"
            className="btn-cta-join"
            onClick={() => navigate('/role-selection')}
          >
            انضم الي سوداورك
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
