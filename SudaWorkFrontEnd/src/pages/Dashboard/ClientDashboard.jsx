import React from 'react';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import HeroBanner from './components/HeroBanner';
import ActionCards from './components/ActionCards';
import ExploreCategories from './components/ExploreCategories';
import Footer from '../../components/Footer';
import './ClientDashboard.css';

const ClientDashboard = () => {
  return (
    <div className="dashboard-page-wrapper" dir="rtl">
      {/* Top Navigation Bar with Search & User Controls */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="dashboard-content-container">
          {/* Hero Welcome Banner */}
          <HeroBanner userName="أحمد" />

          {/* 3 Action / Progress Cards */}
          <ActionCards />

          {/* Explore Categories & Service Grid */}
          <ExploreCategories />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ClientDashboard;
