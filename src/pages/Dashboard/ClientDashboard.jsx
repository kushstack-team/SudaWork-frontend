import { useState } from 'react';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import HeroBanner from './components/HeroBanner';
import ActionCards from './components/ActionCards';
import ClientProjectsFeed from './components/ClientProjectsFeed';
import ClientTalentDiscovery from './components/ClientTalentDiscovery';
import Footer from '../../components/Footer';
import './ClientDashboard.css';
import useLoader from '../../hooks/useLoader';

const ClientDashboard = () => {
  const { user } = useAuth();
  const { isFeatureAvailable } = usePlatform();
  const canBrowseTalent = isFeatureAvailable(FEATURES.FREELANCER_DIRECTORY);
  const firstName = user?.fullName?.split(' ')[0] || '';

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  const loadClientData = async () => {
    try {
      // Only this client's own data — never other clients' projects as filler.
      const [myProjects, myContracts, talent] = await Promise.all([
        api.projects.mine(),
        api.contracts.list(),
        canBrowseTalent ? api.profiles.searchFreelancers({ limit: 8 }) : Promise.resolve({ items: [] }),
      ]);
      setProjects(myProjects);
      setContracts(myContracts);
      setFreelancers(talent.items);
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadClientData, [user?.id, canBrowseTalent], Boolean(user));

  const proposalsMap = Object.fromEntries(projects.map((p) => [p.id, p.proposalsCount]));

  // Metrics calculations
  const openProjects = projects.filter(
    (p) => p.status === 'Open' || p.status === 'open'
  );
  const totalProposalsCount = openProjects.reduce((sum, p) => sum + p.proposalsCount, 0);

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

          {loadError ? (
            <ErrorState title="تعذر تحميل بيانات لوحة التحكم" error={loadError} onRetry={() => { setLoading(true); loadClientData(); }} />
          ) : (
            <>
              {/* 3. My Live Projects & Proposals Received Stream */}
              <ClientProjectsFeed
                projects={projects}
                proposalsMap={proposalsMap}
                loading={loading}
              />

              {/* 4. Discover & Filter Top Sudanese Freelancers (Talent Filtering) */}
              {canBrowseTalent && (
                <ClientTalentDiscovery
                  freelancers={freelancers}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ClientDashboard;
