import { useState } from 'react';
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
  FiAward
} from 'react-icons/fi';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import './FreelancerDashboard.css';
import useLoader from '../../hooks/useLoader';

const FreelancerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { isFeatureAvailable } = usePlatform();
  const canBrowse = isFeatureAvailable(FEATURES.PROJECT_BROWSING);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matchingProjects, setMatchingProjects] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [balance, setBalance] = useState(null);

  const loadDashboardData = async () => {
    try {
      const [publicProfile, myProposals, myContracts, myBalance, openProjects] = await Promise.all([
        api.profiles.getFreelancer(user.id),
        api.proposals.mine(),
        api.contracts.list(),
        api.withdrawals.balance(),
        canBrowse ? api.projects.browse({ limit: 30 }) : Promise.resolve({ items: [] }),
      ]);

      const freelancerProfile = publicProfile.profile;
      setProfile(freelancerProfile);
      setProposals(myProposals);
      setContracts(myContracts);
      setBalance(myBalance);

      // Rank open projects by overlap with the freelancer's skills.
      const normalizedSkills = (freelancerProfile?.skills || []).map((s) => s.toLowerCase().trim());
      const appliedTo = new Set(myProposals.map((p) => p.projectId));
      const scored = openProjects.items
        .filter((proj) => !appliedTo.has(proj.id))
        .map((proj) => {
          const matchCount = proj.skills.filter((ps) =>
            normalizedSkills.some((ns) => ns.includes(ps.toLowerCase()) || ps.toLowerCase().includes(ns))
          ).length;
          const titleMatch = normalizedSkills.some((ns) =>
            proj.title?.toLowerCase().includes(ns) || proj.description?.toLowerCase().includes(ns)
          );
          return { ...proj, matchScore: matchCount + (titleMatch ? 1 : 0), isSkillMatch: matchCount > 0 || titleMatch };
        })
        .sort((a, b) => (b.matchScore - a.matchScore) || (new Date(b.createdAt) - new Date(a.createdAt)));

      setMatchingProjects(scored.slice(0, 6));
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadDashboardData, [user?.id, canBrowse], Boolean(user));

  const completedContracts = contracts.filter((c) => c.status === 'Completed');
  const activeContracts = contracts.filter(
    (c) => c.status === 'Active' || c.status === 'Submitted' || c.status === 'Revision Requested'
  );
  const availableBalance = balance?.available ?? 0;
  const inEscrowLocked = balance?.pendingEarnings ?? 0;
  const activeProposalsCount = proposals.filter((p) => p.status === 'Pending').length;

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
                  مرحباً بك مجدداً، {user?.fullName}
                </h1>
                <p className="freelancer-hero-desc">
                  تابع مستجدات عروضك، رصيدك المالي المتاح في بنكك، وأحدث المشاريع المطابقة لخبراتك المهنية.
                </p>

                {user && !user.profileComplete && (
                  <p className="freelancer-hero-desc">
                    <strong>أكمل ملفك المهني:</strong> أضف مسمّاك المهني ونبذة عنك ومهاراتك لزيادة فرص قبول عروضك.
                  </p>
                )}

                <div className="freelancer-hero-actions">
                  {canBrowse && (
                    <Link to="/projects" className="btn-hero-primary">
                      <FiSearch className="btn-icon" />
                      <span>تصفح المشاريع المفتوحة</span>
                    </Link>
                  )}
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
            ) : loadError ? (
              <ErrorState title="تعذر تحميل لوحة التحكم" error={loadError} onRetry={() => { setLoading(true); loadDashboardData(); }} />
            ) : !canBrowse ? (
              <div className="feed-empty-state">
                <FiBriefcase className="empty-icon" />
                <h3>تصفح المشاريع غير متاح حالياً</h3>
                <p>أوقفت إدارة المنصة تصفح المشاريع مؤقتاً. يمكنك متابعة عقودك وعروضك الحالية.</p>
              </div>
            ) : matchingProjects.length === 0 ? (
              <div className="feed-empty-state">
                <FiBriefcase className="empty-icon" />
                <h3>لا توجد مشاريع مفتوحة جديدة حالياً</h3>
                <p>عد لاحقاً لمشاهدة المشاريع الجديدة، وحدّث مهاراتك في ملفك الشخصي لتحسين الترشيحات.</p>
                <Link to="/freelancer/profile/edit" className="btn-browse-empty">
                  تحديث مهاراتي
                </Link>
              </div>
            ) : (
              <div className="matched-projects-grid">
                {matchingProjects.map((project) => {
                  const budgetFormatted = Number(project.budget || 0).toLocaleString();

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
                            {project.categoryName || 'عام'}
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
