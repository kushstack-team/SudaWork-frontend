import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import FeatureRoute from '../components/FeatureRoute/FeatureRoute';
import GuestRoute from '../components/GuestRoute/GuestRoute';
import { useAuth } from '../context/auth';
import { FEATURES } from '../constants/features';
import { PageLoader } from '../components/common';

// Lazy-loaded Pages for optimal bundle size and initial load performance
const Home = lazy(() => import('../pages/Home/Home'));
const RoleSelection = lazy(() => import('../pages/RoleSelection/RoleSelection'));
const ClientRegister = lazy(() => import('../pages/ClientRegister/ClientRegister'));
const FreelancerRegister = lazy(() => import('../pages/FreelancerRegister/FreelancerRegister'));
const ClientDashboard = lazy(() => import('../pages/Dashboard/ClientDashboard'));
const FreelancerDashboard = lazy(() => import('../pages/FreelancerDashboard/FreelancerDashboard'));
const Login = lazy(() => import('../pages/Login/Login'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword/ResetPassword'));
const FreelancerProfileEdit = lazy(() => import('../pages/FreelancerProfileEdit/FreelancerProfileEdit'));
const FreelancerProfile = lazy(() => import('../pages/FreelancerProfile/FreelancerProfile'));
const ClientProfileEdit = lazy(() => import('../pages/ClientProfileEdit/ClientProfileEdit'));
const ClientProfile = lazy(() => import('../pages/ClientProfile/ClientProfile'));
const ProjectsBrowse = lazy(() => import('../pages/ProjectsBrowse/ProjectsBrowse'));
const FreelancersBrowse = lazy(() => import('../pages/FreelancersBrowse/FreelancersBrowse'));
const ExploreCategories = lazy(() => import('../pages/Dashboard/components/ExploreCategories'));
const PostProject = lazy(() => import('../pages/PostProject/PostProject'));
const ClientProjects = lazy(() => import('../pages/ClientProjects/ClientProjects'));
const ProjectDetails = lazy(() => import('../pages/ProjectDetails/ProjectDetails'));
const FreelancerProposals = lazy(() => import('../pages/FreelancerProposals/FreelancerProposals'));
const ContractsList = lazy(() => import('../pages/ContractsList/ContractsList'));
const ContractDetails = lazy(() => import('../pages/ContractDetails/ContractDetails'));
const Messages = lazy(() => import('../pages/Messages/Messages'));
const ClientPayments = lazy(() => import('../pages/ClientPayments/ClientPayments'));
const FreelancerWallet = lazy(() => import('../pages/FreelancerWallet/FreelancerWallet'));
const Disputes = lazy(() => import('../pages/Disputes/Disputes'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard/AdminDashboard'));
const NotFound = lazy(() => import('../pages/NotFound/NotFound'));
const GoogleRegistrationComplete = lazy(() => import('../pages/GoogleRegistrationComplete/GoogleRegistrationComplete'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail/VerifyEmail'));

// New SRS informational & legal pages
const Terms = lazy(() => import('../pages/Legal/Terms'));
const Privacy = lazy(() => import('../pages/Legal/Privacy'));
const HowItWorks = lazy(() => import('../pages/Help/HowItWorks'));
const HelpCenter = lazy(() => import('../pages/Help/HelpCenter'));
const Careers = lazy(() => import('../pages/Careers/Careers'));

// Clients manage their own projects instead of browsing the marketplace.
const ProjectsBrowseRoute = () => {
  const { role } = useAuth();
  if (role === 'client') return <Navigate replace to="/client/projects" />;
  return (
    <FeatureRoute feature={FEATURES.PROJECT_BROWSING}>
      <ProjectsBrowse />
    </FeatureRoute>
  );
};

// <Navigate> does not substitute route params, so legacy edit links need this.
const LegacyProjectEditRedirect = () => {
  const { id } = useParams();
  return <Navigate replace to={`/projects/${id}/edit`} />;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/role-selection" element={<GuestRoute><RoleSelection /></GuestRoute>} />

        {/* Registration Pages */}
        <Route path="/register/client" element={<GuestRoute><ClientRegister /></GuestRoute>} />
        <Route path="/register/freelancer" element={<GuestRoute><FreelancerRegister /></GuestRoute>} />
        <Route path="/register/complete" element={<GoogleRegistrationComplete />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Authentication & Recovery Pages */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Public Informational & Legal Pages */}
        <Route
          path="/terms"
          element={
            <MainLayout>
              <Terms />
            </MainLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <MainLayout>
              <Privacy />
            </MainLayout>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <MainLayout>
              <HowItWorks />
            </MainLayout>
          }
        />
        <Route
          path="/help"
          element={
            <MainLayout>
              <HelpCenter />
            </MainLayout>
          }
        />
        <Route
          path="/careers"
          element={
            <MainLayout>
              <Careers />
            </MainLayout>
          }
        />

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
        <Route path="/projects" element={<ProjectsBrowseRoute />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route
          path="/freelancers"
          element={
            <FeatureRoute feature={FEATURES.FREELANCER_DIRECTORY}>
              <FreelancersBrowse />
            </FeatureRoute>
          }
        />
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
            <FeatureRoute feature={FEATURES.PROJECT_POSTING}>
              <PostProject />
            </FeatureRoute>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <FeatureRoute feature={FEATURES.PROJECT_POSTING}>
                <PostProject />
              </FeatureRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/client/projects/:id/edit" element={<LegacyProjectEditRedirect />} />
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
              <FeatureRoute feature={FEATURES.MESSAGING}>
                <Messages />
              </FeatureRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/payments"
          element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <FeatureRoute feature={FEATURES.PAYMENT_REQUESTS}>
                <ClientPayments />
              </FeatureRoute>
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
              <FeatureRoute feature={FEATURES.DISPUTES}>
                <Disputes />
              </FeatureRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['client', 'freelancer', 'admin']}>
              <FeatureRoute feature={FEATURES.NOTIFICATIONS}>
                <Notifications />
              </FeatureRoute>
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
    </Suspense>
  );
}
