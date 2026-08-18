import React from 'react';
import './Home.css';
import Hero from './Hero';
import ServicesGrid from './ServicesGrid';
import WhyUs from './WhyUs';
import CTABanner from './CTABanner';

const Home = () => {
  return (
    <div className="home-page">
      <Hero />
      <ServicesGrid />
      <WhyUs />
      <CTABanner />
    </div>
  );
};

export default Home;
