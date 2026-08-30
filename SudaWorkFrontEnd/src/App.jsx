import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/variables.css';
import Navbar from './components/Navbar';
import Home from './pages/Home/Home';
import Footer from './components/Footer';
import RoleSelection from './pages/RoleSelection/RoleSelection';
import ClientRegister from './pages/ClientRegister/ClientRegister';
import FreelancerRegister from './pages/FreelancerRegister/FreelancerRegister';

import ClientDashboard from './pages/Dashboard/ClientDashboard';

// Layout wrapper for pages with standard Navbar & Footer
const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Landing Page Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/landing"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      {/* Dashboard Routes (RTL Freelance Marketplace Dashboard) */}
      <Route
        path="/client-dashboard"
        element={<ClientDashboard />}
      />

      {/* Role Selection Page */}
      <Route
        path="/role-selection"
        element={<RoleSelection />}
      />

      {/* Client Registration Page */}
      <Route
        path="/register/client"
        element={<ClientRegister />}
      />
      <Route
        path="/client-register"
        element={<ClientRegister />}
      />

      {/* Freelancer Registration Page */}
      <Route
        path="/register/freelancer"
        element={<FreelancerRegister />}
      />
      <Route
        path="/freelancer-register"
        element={<FreelancerRegister />}
      />

      {/* Fallback to Landing Page */}
      <Route
        path="*"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
    </Routes>
  );
}

export default App;
