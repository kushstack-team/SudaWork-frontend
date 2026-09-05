import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import HeroBanner from './components/HeroBanner';
import ActionCards from './components/ActionCards';
import ClientProjectsFeed from './components/ClientProjectsFeed';
import ClientTalentDiscovery from './components/ClientTalentDiscovery';
import Footer from '../../components/Footer';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || 'طارق';

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [proposalsMap, setProposalsMap] = useState({});
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);

  useEffect(() => {
    loadClientData();
  }, [user]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const clientId = user?.id || 'usr_client_1';

      // Load client's projects, contracts, payment requests, and freelancers in parallel
      const [allProjects, userContracts, clientPayments, allFreelancers] = await Promise.all([
        mockApi.projects.getAll({ clientId }),
        mockApi.contracts.getByUser(clientId),
        mockApi.paymentRequests.getByClient ? mockApi.paymentRequests.getByClient(clientId) : [],
        mockApi.profiles.getAllFreelancers ? mockApi.profiles.getAllFreelancers() : []
      ]);

      // If this specific user has no projects yet (e.g. new test account), also fetch open projects as reference or fallback
      let clientProjects = allProjects || [];
      if (clientProjects.length === 0) {
        const anyProjects = await mockApi.projects.getAll();
        clientProjects = (anyProjects || []).slice(0, 4);
      }

      setProjects(clientProjects);
      setContracts(userContracts || []);
      setPaymentRequests(clientPayments || []);
      setFreelancers(allFreelancers || []);

      // Fetch proposal counts for each project
      const propCounts = {};
      await Promise.all(
        clientProjects.map(async (proj) => {
          try {
            const props = await mockApi.proposals.getByProject(proj.id);
            propCounts[proj.id] = props.length;
          } catch (e) {
            propCounts[proj.id] = 0;
          }
        })
      );
      setProposalsMap(propCounts);
    } catch (err) {
      console.error('Error loading client dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics calculations
  const openProjects = projects.filter(
    (p) => p.status === 'Open' || p.status === 'open'
  );
  const totalProposalsCount = Object.values(proposalsMap).reduce((sum, count) => sum + count, 0);

  const activeContracts = contracts.filter(
    (c) => c.status === 'Active' || c.status === 'Submitted' || c.status === 'Revision Requested'
  );
  
  const escrowLockedAmount = activeContracts.reduce(
    (sum, c) => sum + Number(c.agreedPrice || 0),
    0
  );

  const completedContracts = contracts.filter((c) => c.status === 'Completed');
  const totalPaid = completedContracts.reduce(
    (sum, c) => sum + Number(c.agreedPrice || 0),
    0
  );

  return (
    <div className="dashboard-page-wrapper" dir="rtl">
      {/* Top Navigation Bar with Search & User Controls */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="dashboard-main-content">
        <div className="dashboard-content-container">
          {/* 1. Hero Welcome Banner with Post Project CTA & Talent Search */}
          <HeroBanner userName={firstName} />

          {/* 2. Client Key Metrics & Actions (Projects, Escrow, Payments) */}
          <ActionCards
            activeProjectsCount={openProjects.length}
            totalProposalsReceived={totalProposalsCount}
            activeContractsCount={activeContracts.length}
            escrowAmount={escrowLockedAmount}
            totalPaid={totalPaid}
          />

          {/* 3. My Live Projects & Proposals Received Stream */}
          <ClientProjectsFeed
            projects={projects}
            proposalsMap={proposalsMap}
            loading={loading}
          />

          {/* 4. Discover & Filter Top Sudanese Freelancers (Talent Filtering) */}
          <ClientTalentDiscovery
            freelancers={freelancers}
            loading={loading}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ClientDashboard;
