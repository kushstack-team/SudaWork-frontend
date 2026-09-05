import React from 'react';
import DashboardNavbar from '../components/DashboardNavbar/DashboardNavbar';
import Footer from '../components/Footer';
import './DashboardLayout.css';

export default function DashboardLayout({ children, onSearch }) {
  return (
    <div className="dashboard-layout-container">
      <DashboardNavbar onSearch={onSearch} />
      <main className="dashboard-layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
