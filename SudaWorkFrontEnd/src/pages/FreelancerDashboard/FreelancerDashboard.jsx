import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiDollarSign,
  FiBriefcase,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiArrowLeft,
  FiSearch,
  FiUserCheck,
  FiAward,
  FiTag,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { calculateFreelancerNet } from '../../utils/finance';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import './FreelancerDashboard.css';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [matchingProjects, setMatchingProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [
        freelancerProfile,
        userProposals,
        userContracts,
        userWithdrawals,
        allProjects
      ] = await Promise.all([
        mockApi.profiles.getFreelancerProfile(user.id),
        mockApi.proposals.getByFreelancer(user.id),
        mockApi.contracts.getByUser(user.id),
        mockApi.withdrawalRequests.getByFreelancer(user.id),
        mockApi.projects.getAll()
      ]);

      setProfile(freelancerProfile || null);
      setProposals(userProposals || []);
      setContracts(userContracts || []);
      setWithdrawals(userWithdrawals || []);

      // Calculate matching projects based on freelancer skills
      const freelancerSkills = freelancerProfile?.skills || [];
      const normalizedSkills = freelancerSkills.map((s) => s.toLowerCase().trim());

      const openProjects = (allProjects || []).filter(
        (p) => p.status === 'Open' || p.status === 'open'
      );

      // Score projects by skill match
      const scored = openProjects.map((proj) => {
        const projSkills = proj.skills || [];
        const matchCount = projSkills.filter((ps) =>
          normalizedSkills.some((ns) => ns.includes(ps.toLowerCase()) || ps.toLowerCase().includes(ns))
        ).length;

        const titleMatch = normalizedSkills.some((ns) =>
          proj.title?.toLowerCase().includes(ns) || proj.description?.toLowerCase().includes(ns)
        );

        return {
          ...proj,
          matchScore: matchCount + (titleMatch ? 1 : 0),
          isSkillMatch: matchCount > 0 || titleMatch,
        };
      });

      // Sort by match score descending, then by date
      scored.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setMatchingProjects(scored.slice(0, 6));
    } catch (err) {
      console.error('Error loading freelancer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Financial calculations matching FreelancerWallet.jsx
  const completedContracts = contracts.filter((c) => c.status === 'Completed');
  const activeContracts = contracts.filter(
    (c) => c.status === 'Active' || c.status === 'Submitted' || c.status === 'Revision Requested'
  );

  const totalNetEarnings = completedContracts.reduce(
    (sum, c) => sum + calculateFreelancerNet(c.agreedPrice || 0),
    0
  );

  const inEscrowLocked = activeContracts.reduce(
    (sum, c) => sum + calculateFreelancerNet(c.agreedPrice || 0),
    0
  );

  const totalWithdrawn = withdrawals
    .filter((w) => w.status !== 'Rejected')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  const availableBalance = Math.max(0, totalNetEarnings - totalWithdrawn);

  const activeProposalsCount = proposals.filter(
    (p) => p.status === 'Pending' || p.status === 'Under Review'
  ).length;

  return (
    <div className="freelancer-dashboard-page" dir="rtl">
      {/* Top Navbar */}
      <DashboardNavbar />

      <main className="dashboard-main-content">
        <div className="dashboard-content-container">

          {/* Hero Welcome Banner */}
          <section className="freelancer-hero-banner">
            <div className="freelancer-hero-card">
              <div className="freelancer-hero-content">
                <div className="hero-badge">
                  <FiUserCheck className="hero-badge-icon" />
                  <span>مستقل معتمد في سوداوورك</span>
                </div>
                <h1 className="freelancer-hero-title">
                  مرحباً بك مجدداً، {user?.fullName || 'تسنيم'}
                </h1>
                <p className="freelancer-hero-desc">
                  تابع مستجدات عروضك، رصيدك المالي المتاح في بنكك، وأحدث المشاريع المطابقة لخبراتك المهنية.
                </p>

                <div className="freelancer-hero-actions">
                  <Link to="/projects" className="btn-hero-primary">
                    <FiSearch className="btn-icon" />
                    <span>تصفح المشاريع المفتوحة</span>
                  </Link>
                  <Link to="/freelancer/profile/edit" className="btn-hero-secondary">
                    <FiAward className="btn-icon" />
                    <span>تحديث مهاراتك وملفك المهني</span>
                  </Link>
                </div>
              </div>

              <div className="freelancer-hero-decorations">
                <div className="hero-circle circle-1" />
                <div className="hero-circle circle-2" />
              </div>
            </div>
          </section>

          {/* 3 Summary & Action Cards */}
          <section className="freelancer-action-cards">
            <div className="freelancer-cards-grid">

              {/* Card 1: Earnings & Wallet */}
              <div className="action-metric-card">
                <div className="metric-card-header">
                  <div className="metric-icon-box wallet">
                    <FiDollarSign />
                  </div>
                  <span className="metric-tag success">محفظة الأرباح</span>
                </div>

                <div className="metric-card-body">
                  <h3 className="metric-title">الأرباح والرصيد المتاح</h3>
                  
                  <div className="metric-figures">
                    <div className="figure-item">
                      <span className="figure-label">المتاح للسحب:</span>
                      <strong className="figure-val text-accent">
                        {availableBalance.toLocaleString()} ج.س
                      </strong>
                    </div>
                    <div className="figure-item">
                      <span className="figure-label">في الضمان (Escrow):</span>
                      <span className="figure-val">
                        {inEscrowLocked.toLocaleString()} ج.س
                      </span>
                    </div>
                  </div>

                  <Link to="/freelancer/wallet" className="metric-action-link">
                    <span>عرض تفاصيل المحفظة وسحب الأرباح</span>
                    <FiArrowLeft className="link-arrow" />
                  </Link>
                </div>
              </div>

              {/* Card 2: Active Contracts */}
              <div className="action-metric-card">
                <div className="metric-card-header">
                  <div className="metric-icon-box contracts">
                    <FiBriefcase />
                  </div>
                  <span className="metric-tag info">العقود والتسليمات</span>
                </div>

                <div className="metric-card-body">
                  <h3 className="metric-title">مشاريعك قيد التنفيذ</h3>
                  
                  <div className="metric-figures">
                    <div className="figure-item">
                      <span className="figure-label">عقود جارية:</span>
                      <strong className="figure-val">
                        {activeContracts.length} عقد
                      </strong>
                    </div>
                    <div className="figure-item">
                      <span className="figure-label">عقود مكتملة ومغلقة:</span>
                      <span className="figure-val">
                        {completedContracts.length} مشروع
                      </span>
                    </div>
                  </div>

                  <Link to="/contracts" className="metric-action-link">
                    <span>إدارة العقود وتسليم المراحل</span>
                    <FiArrowLeft className="link-arrow" />
                  </Link>
                </div>
              </div>

              {/* Card 3: Proposals */}
              <div className="action-metric-card">
                <div className="metric-card-header">
                  <div className="metric-icon-box proposals">
                    <FiSend />
                  </div>
                  <span className="metric-tag warning">العروض المقدمة</span>
                </div>

                <div className="metric-card-body">
                  <h3 className="metric-title">حالة عروضك المرسلة</h3>
                  
                  <div className="metric-figures">
                    <div className="figure-item">
                      <span className="figure-label">عروض قيد المراجعة:</span>
                      <strong className="figure-val">
                        {activeProposalsCount} عرض
                      </strong>
                    </div>
                    <div className="figure-item">
                      <span className="figure-label">إجمالي العروض:</span>
                      <span className="figure-val">
                        {proposals.length} عرض
                      </span>
                    </div>
                  </div>

                  <Link to="/freelancer/proposals" className="metric-action-link">
                    <span>متابعة العروض والتواصل</span>
                    <FiArrowLeft className="link-arrow" />
                  </Link>
                </div>
              </div>

            </div>
          </section>

          {/* Matched Projects Feed */}
          <section className="matched-projects-section">
            <div className="section-header-flex">
              <div>
                <h2 className="section-title">
                  فرص ومشاريع مقترحة تناسب مهاراتك
                </h2>
                <p className="section-subtitle">
                  مشاريع مفتوحة تم اختيارها استناداً إلى تخصصك ومهاراتك المسجلة في ملفك الشخصي.
                </p>
              </div>

              <Link to="/projects" className="btn-view-all-projects">
                <span>عرض جميع المشاريع</span>
                <FiArrowLeft />
              </Link>
            </div>

            {loading ? (
              <div className="feed-loading-state">
                <div className="spinner-dots" />
                <p>جارٍ تحميل أفضل المشاريع المطابقة لمهاراتك...</p>
              </div>
            ) : matchingProjects.length === 0 ? (
              <div className="feed-empty-state">
                <FiBriefcase className="empty-icon" />
                <h3>لا توجد مشاريع مفتوحة مطابقة لمهاراتك حالياً</h3>
                <p>قم بتحديث مهاراتك في ملفك الشخصي أو تصفح كافة المشاريع المتاحة للتقديم الفوري.</p>
                <Link to="/projects" className="btn-browse-empty">
                  تصفح كافة المشاريع
                </Link>
              </div>
            ) : (
              <div className="matched-projects-grid">
                {matchingProjects.map((project) => {
                  const budgetFormatted = Number(
                    project.budgetMax || project.budget || 50000
                  ).toLocaleString();

                  return (
                    <div key={project.id} className="project-feed-card">
                      <div className="project-card-top">
                        <div className="project-badge-row">
                          {project.isSkillMatch && (
                            <span className="skill-match-badge">
                              <FiCheckCircle className="badge-icon" />
                              مطابق لمهاراتك
                            </span>
                          )}
                          <span className="category-pill">
                            {project.category || 'تطوير وبرمجة'}
                          </span>
                        </div>

                        <span className="project-date">
                          {project.createdAt
                            ? new Date(project.createdAt).toLocaleDateString('ar-EG')
                            : 'حديث'}
                        </span>
                      </div>

                      <h3 className="project-title">
                        <Link to={`/projects/${project.id}`}>{project.title}</Link>
                      </h3>

                      <p className="project-description">
                        {project.description?.length > 130
                          ? project.description.substring(0, 130) + '...'
                          : project.description}
                      </p>

                      {/* Required Skills */}
                      {project.skills && project.skills.length > 0 && (
                        <div className="project-skills-list">
                          {project.skills.slice(0, 4).map((skill, idx) => {
                            const isMatch = (profile?.skills || []).some(
                              (s) => s.toLowerCase() === skill.toLowerCase()
                            );
                            return (
                              <span
                                key={idx}
                                className={`skill-tag ${isMatch ? 'matched-tag' : ''}`}
                              >
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="project-card-bottom">
                        <div className="project-budget">
                          <span className="budget-label">الميزانية المقدرة:</span>
                          <strong className="budget-val">{budgetFormatted} ج.س</strong>
                        </div>

                        <Link
                          to={`/projects/${project.id}`}
                          className="btn-apply-project"
                        >
                          <span>تقديم عرض</span>
                          <FiArrowLeft />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Quick Freelancer Shortcuts Strip */}
          <section className="freelancer-shortcuts-strip">
            <div className="shortcuts-container">
              <div className="shortcut-item" onClick={() => navigate('/freelancer/profile/edit')}>
                <div className="shortcut-icon-box">
                  <FiAward />
                </div>
                <div className="shortcut-text">
                  <h4>تطوير الملف المهني</h4>
                  <p>أضف نماذج أعمالك ومشاريعك المنفذة</p>
                </div>
              </div>

              <div className="shortcut-item" onClick={() => navigate('/freelancers')}>
                <div className="shortcut-icon-box">
                  <FiSearch />
                </div>
                <div className="shortcut-text">
                  <h4>دليل المستقلين</h4>
                  <p>اطلع على خبراء ومحترفي المنصة</p>
                </div>
              </div>

              <div className="shortcut-item" onClick={() => navigate('/disputes')}>
                <div className="shortcut-icon-box">
                  <FiClock />
                </div>
                <div className="shortcut-text">
                  <h4>مركز الوساطة والدعم</h4>
                  <p>حماية حقوقك المالية عبر الضمان المعتمد</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FreelancerDashboard;
