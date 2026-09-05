import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Pages
import Home from '../pages/Home/Home';
import RoleSelection from '../pages/RoleSelection/RoleSelection';
import ClientRegister from '../pages/ClientRegister/ClientRegister';
import FreelancerRegister from '../pages/FreelancerRegister/FreelancerRegister';
import ClientDashboard from '../pages/Dashboard/ClientDashboard';
import FreelancerDashboard from '../pages/FreelancerDashboard/FreelancerDashboard';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import ResetPassword from '../pages/ResetPassword/ResetPassword';
import FreelancerProfileEdit from '../pages/FreelancerProfileEdit/FreelancerProfileEdit';
import FreelancerProfile from '../pages/FreelancerProfile/FreelancerProfile';
import ClientProfileEdit from '../pages/ClientProfileEdit/ClientProfileEdit';
import ClientProfile from '../pages/ClientProfile/ClientProfile';
import ProjectsBrowse from '../pages/ProjectsBrowse/ProjectsBrowse';
import FreelancersBrowse from '../pages/FreelancersBrowse/FreelancersBrowse';
import ExploreCategories from '../pages/Dashboard/components/ExploreCategories';
import PostProject from '../pages/PostProject/PostProject';
import ClientProjects from '../pages/ClientProjects/ClientProjects';
import ProjectDetails from '../pages/ProjectDetails/ProjectDetails';
import FreelancerProposals from '../pages/FreelancerProposals/FreelancerProposals';
import ContractsList from '../pages/ContractsList/ContractsList';
import ContractDetails from '../pages/ContractDetails/ContractDetails';
import Messages from '../pages/Messages/Messages';
import ClientPayments from '../pages/ClientPayments/ClientPayments';
import FreelancerWallet from '../pages/FreelancerWallet/FreelancerWallet';
import Disputes from '../pages/Disputes/Disputes';
import Notifications from '../pages/Notifications/Notifications';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import NotFound from '../pages/NotFound/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      {/* Canonical Redirects */}
      <Route path="/landing" element={<Navigate replace to="/" />} />
      <Route path="/client-register" element={<Navigate replace to="/register/client" />} />
      <Route path="/freelancer-register" element={<Navigate replace to="/register/freelancer" />} />
      <Route path="/admin-dashboard" element={<Navigate replace to="/admin" />} />

      {/* Role Selection Page */}
      <Route path="/role-selection" element={<RoleSelection />} />

      {/* Registration Pages */}
      <Route path="/register/client" element={<ClientRegister />} />
      <Route path="/register/freelancer" element={<FreelancerRegister />} />

      {/* Authentication & Recovery Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Dashboards */}
      <Route
        path="/client-dashboard"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer-dashboard"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <FreelancerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Profiles */}
      <Route
        path="/freelancer/profile/edit"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <FreelancerProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route path="/freelancers/:id" element={<FreelancerProfile />} />
      <Route
        path="/client/profile/edit"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientProfileEdit />
          </ProtectedRoute>
        }
      />
      <Route path="/clients/:id" element={<ClientProfile />} />

      {/* Discovery & Browse */}
      <Route path="/projects" element={<ProjectsBrowse />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/freelancers" element={<FreelancersBrowse />} />
      <Route
        path="/categories"
        element={
          <MainLayout>
            <div style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 20px' }}>
              <ExploreCategories />
            </div>
          </MainLayout>
        }
      />

      {/* Project Management */}
      <Route
        path="/post-project"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <PostProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/projects"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientProjects />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/proposals"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <FreelancerProposals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <ContractsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <ContractDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/payments"
        element={
          <ProtectedRoute allowedRoles={['client', 'admin']}>
            <ClientPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancer/wallet"
        element={
          <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
            <FreelancerWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/disputes"
        element={
          <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <Disputes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
}
