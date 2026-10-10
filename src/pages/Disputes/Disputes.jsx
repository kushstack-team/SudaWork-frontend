import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Disputes.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import {
  FiAlertTriangle,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiFileText,
  FiUser,
  FiPlus,
  FiX,
  FiExternalLink,
  FiMessageSquare,
  FiFlag
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const Disputes = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all | active | resolved
  const [successMessage, setSuccessMessage] = useState('');

  // New Report Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('نزاع تعاقدي أو مخالفة شروط');
  const [relatedContractId, setRelatedContractId] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [desiredResolution, setDesiredResolution] = useState('');
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReports = async () => {
    try {
      const [myReports, myContracts] = await Promise.all([api.reports.mine(), api.contracts.list()]);
      setReports(myReports);
      setContracts(myContracts.filter((c) => c.status !== 'Cancelled'));
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadReports, [user?.id], Boolean(user));

  const openModal = () => {
    setRelatedContractId(contracts[0]?.id || '');
    setModalError('');
    setIsModalOpen(true);
  };

  // Disputes are filed against one of the user's contracts.
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!relatedContractId) {
      setModalError('يرجى اختيار العقد المتعلق بالمشكلة.');
      return;
    }
    if (reportDescription.trim().length < 10) {
      setModalError('يرجى كتابة تفاصيل المشكلة (10 أحرف على الأقل).');
      return;
    }

    setSubmitting(true);
    setModalError('');
    try {
      await api.reports.create({
        targetType: 'contract',
        targetId: relatedContractId,
        reason: reportReason,
        description: reportDescription.trim(),
        desiredResolution: desiredResolution.trim(),
      });

      setIsModalOpen(false);
      setReportDescription('');
      setDesiredResolution('');
      setSuccessMessage('تم تسجيل بلاغك بنجاح. سيقوم فريق الوساطة والتحكيم بمراجعته والتواصل معك.');
      setTimeout(() => setSuccessMessage(''), 6000);
      await loadReports();
    } catch (err) {
      setModalError(err.message || 'فشل إرسال البلاغ، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return r.status === 'Open' || r.status === 'In Review';
    if (activeTab === 'resolved') return r.status === 'Resolved';
    return true;
  });

  // Calculate statistics
  const totalCount = reports.length;
  const activeCount = reports.filter((r) => r.status === 'Open' || r.status === 'In Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ar-SD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="disputes-page" dir="rtl">
      <DashboardNavbar />

      <main className="disputes-main">
        <div className="disputes-container">
          
          {/* Breadcrumb */}
          <div className="disputes-breadcrumb">
            <Link to="/" className="breadcrumb-link">الرئيسية</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">مركز النزاعات والتحكيم</span>
          </div>

          {/* Alert Notifications */}
          {successMessage && (
            <div className="disputes-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Hero Header */}
          <div className="disputes-hero-card">
            <div className="disputes-hero-header">
              <div className="hero-text-wrap">
                <div className="hero-badge">
                  <FiShield />
                  <span>منظومة الحماية والوساطة العادلة</span>
                </div>
                <h1 className="hero-title">مركز النزاعات، الشكاوى والتحكيم</h1>
                <p className="hero-subtitle">
                  نوفر بيئة وساطة موثوقة ونزيهة للفصل في الخلافات التعاقدية وحماية أموال الضمان لكافة أطراف العمل الحر بسوداوورك.
                </p>
              </div>

              <button
                type="button"
                className="open-report-modal-btn"
                onClick={openModal}
                disabled={contracts.length === 0}
                title={contracts.length === 0 ? 'تُفتح النزاعات على عقود العمل فقط' : undefined}
              >
                <FiPlus className="btn-icon" />
                <span>تقديم بلاغ أو شكوى جديدة</span>
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="disputes-stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrap neutral">
                  <FiFileText />
                </div>
                <div className="stat-info">
                  <span className="stat-num">{totalCount}</span>
                  <span className="stat-label">إجمالي البلاغات والنزاعات</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap warning">
                  <FiClock />
                </div>
                <div className="stat-info">
                  <span className="stat-num">{activeCount}</span>
                  <span className="stat-label">قيد المعالجة والتحكيم</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap success">
                  <FiCheckCircle />
                </div>
                <div className="stat-info">
                  <span className="stat-num">{resolvedCount}</span>
                  <span className="stat-label">نزاعات تمت تسويتها</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon-wrap primary">
                  <FiShield />
                </div>
                <div className="stat-info">
                  <span className="stat-num">100%</span>
                  <span className="stat-label">ضمان استرداد الحقوق</span>
                </div>
              </div>
            </div>
          </div>

          {/* Arbitration Guarantee Banner */}
          <div className="arbitration-guarantee-box">
            <div className="guarantee-icon-wrap">
              <FiShield />
            </div>
            <div className="guarantee-content">
              <h3>كيف تعمل لجنة التحكيم والوساطة في منصة سوداوورك؟</h3>
              <p>
                عند فتح أي نزاع، يتم تجميد رصيد الضمان المعلق بالعقد وتكليف محكّم مستقل من فريق سوداوورك. يقوم المحكّم بفحص متطلبات المشروع، سجل المراسلات الموثقة، والتسليمات المقدمة، ويصدر قراراً ملزماً خلال 48 إلى 72 ساعة لضمان حقوق الجميع بالعدل التام.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="disputes-tabs-bar">
            <div className="tabs-list">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                جميع الحالات ({reports.length})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                قيد التحكيم والمعالجة ({activeCount})
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'resolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('resolved')}
              >
                تمت التسوية ({resolvedCount})
              </button>
            </div>
          </div>

          {/* Disputes Content List */}
          {loading ? (
            <div className="disputes-loading">
              <div className="profile-spinner" />
              <p>جارٍ تحميل سجل البلاغات والنزاعات...</p>
            </div>
          ) : loadError ? (
            <ErrorState title="تعذر تحميل سجل البلاغات" error={loadError} onRetry={() => { setLoading(true); loadReports(); }} />
          ) : filteredReports.length === 0 ? (
            <div className="disputes-empty-card">
              <div className="empty-icon-wrap">
                <FiCheckCircle />
              </div>
              <h3>{reports.length === 0 ? 'لا توجد نزاعات أو بلاغات' : 'لا توجد بلاغات في هذا القسم'}</h3>
              <p>
                {contracts.length > 0
                  ? 'إذا واجهت مشكلة في أحد عقودك يمكنك فتح نزاع وستتولى الإدارة مراجعته.'
                  : 'تُفتح النزاعات على عقود العمل. عند وجود عقد نشط يمكنك تقديم بلاغ من هنا أو من صفحة العقد.'}
              </p>
              {contracts.length > 0 && (
                <button type="button" className="empty-action-btn" onClick={openModal}>
                  <FiPlus />
                  <span>تقديم شكوى أو بلاغ جديد</span>
                </button>
              )}
            </div>
          ) : (
            <div className="disputes-cards-list">
              {filteredReports.map((report) => {
                const isReporter = report.reporterId === user?.id;
                return (
                  <article key={report.id} className="dispute-card">
                    {/* Card Header */}
                    <div className="dispute-card-header">
                      <div className="card-id-meta">
                        <span className="dispute-id-badge">#{report.id.slice(0, 8)}</span>
                        <span className="dispute-date">{formatDate(report.createdAt)}</span>
                        {report.contractId && (
                          <Link to={`/contracts/${report.contractId}`} className="dispute-contract-tag" title="عرض العقد">
                            <FiFileText />
                            <span>مرتبط بعقد: {report.targetTitle || report.contractId.slice(0, 8)}</span>
                            <FiExternalLink className="ext-icon" />
                          </Link>
                        )}
                        {!report.contractId && (
                          <span className="dispute-contract-tag">
                            {report.targetType === 'project' ? `بلاغ عن مشروع: ${report.targetTitle}` : `بلاغ عن مستخدم: ${report.reportedUserName}`}
                          </span>
                        )}
                      </div>

                      {/* Status Pill */}
                      <div className="card-status-box">
                        <span className={`dispute-status-pill status-${report.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {report.status === 'Open' && (
                            <>
                              <FiClock />
                              <span>مفتوح - بانتظار المراجعة</span>
                            </>
                          )}
                          {report.status === 'In Review' && (
                            <>
                              <FiAlertTriangle />
                              <span>قيد التحكيم والوساطة</span>
                            </>
                          )}
                          {report.status === 'Resolved' && (
                            <>
                              <FiCheckCircle />
                              <span>تمت التسوية والحل</span>
                            </>
                          )}
                          {report.status === 'Dismissed' && (
                            <>
                              <FiXCircle />
                              <span>مرفوض أو مغلق</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="dispute-card-body">
                      <div className="dispute-reason-badge">
                        <FiFlag />
                        <span>سبب البلاغ: <strong>{report.reason}</strong></span>
                      </div>

                      <div className="dispute-description-text">
                        <p>{report.description}</p>
                      </div>

                      {/* Desired Resolution if any */}
                      {report.desiredResolution && (
                        <div className="dispute-desired-resolution">
                          <span className="resolution-label">الحل أو التسوية المقترحة:</span>
                          <span className="resolution-text">{report.desiredResolution}</span>
                        </div>
                      )}

                      {/* Official Mediation Resolution Notes */}
                      {report.resolutionNotes && (
                        <div className="dispute-mediation-notes-box">
                          <div className="mediation-notes-header">
                            <FiShield className="mediation-icon" />
                            <h4>توجيهات وقرار لجنة التحكيم والوساطة</h4>
                          </div>
                          <p className="mediation-notes-body">{report.resolutionNotes}</p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="dispute-card-footer">
                      <div className="dispute-parties">
                        <span className="party-badge">
                          <FiUser />
                          <span>الصفة: {isReporter ? 'مقدّم البلاغ' : 'الطرف المشكو في حقه'}</span>
                        </span>
                      </div>

                      <div className="dispute-card-actions">
                        {report.contractId && (
                          <Link to={`/contracts/${report.contractId}`} className="dispute-action-link">
                            <FiFileText />
                            <span>مراجعة العقد</span>
                          </Link>
                        )}
                        {report.contractId && (
                          <Link to={`/messages?contractId=${report.contractId}`} className="dispute-action-link secondary">
                            <FiMessageSquare />
                            <span>سجل المحادثة</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* New General Report Modal */}
      {isModalOpen && (
        <div className="disputes-modal-backdrop" onClick={() => !submitting && setIsModalOpen(false)}>
          <div className="disputes-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <FiFlag className="modal-flag-icon" />
                <h3>تقديم بلاغ رسمي أو طلب وساطة</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                <FiX />
              </button>
            </div>

            <div className="modal-notice">
              <FiShield className="notice-icon" />
              <p>
                نأخذ جميع البلاغات والشكاوى بأعلى درجات الجدية والسرية. يرجى توضيح التفاصيل بدقة مع تقديم أي معلومات تدعم موقفك.
              </p>
            </div>

            <form onSubmit={handleCreateReport} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="general-report-reason">
                  نوع أو تصنيف البلاغ <span className="required">*</span>
                </label>
                <select
                  id="general-report-reason"
                  className="modal-select"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="نزاع تعاقدي أو مخالفة شروط">نزاع تعاقدي أو مخالفة شروط العقد</option>
                  <option value="تأخير غير مبرر في التسليم">تأخير غير مبرر ومماطلة في تسليم العمل</option>
                  <option value="نزاع مالي أو مشكلة في الضمان">نزاع مالي أو مشكلة في دفعات الضمان (Escrow)</option>
                  <option value="محاولة دفع أو تواصل خارج المنصة">محاولة دفع أو تواصل خارج منصة سوداوورك</option>
                  <option value="احتيال أو تضليل أو انتحال صفة">احتيال أو تضليل أو انتحال صفة</option>
                  <option value="سلوك مسيء أو مضايقة">سلوك مسيء أو مضايقة غير مقبولة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="related-contract">
                  العقد المتعلق بالمشكلة <span className="required">*</span>
                </label>
                <select
                  id="related-contract"
                  className="modal-input"
                  value={relatedContractId}
                  onChange={(e) => setRelatedContractId(e.target.value)}
                  required
                >
                  <option value="">-- اختر العقد --</option>
                  {contracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.projectTitle} — {user?.role === 'client' ? c.freelancerName : c.clientName}
                    </option>
                  ))}
                </select>
              </div>

              {modalError && (
                <div className="disputes-alert error" role="alert">
                  <FiAlertTriangle className="alert-icon" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="report-desc">
                  تفاصيل الشكوى والوقائع <span className="required">*</span>
                </label>
                <textarea
                  id="report-desc"
                  rows="4"
                  className="modal-textarea"
                  placeholder="اشرح ما حدث بدقة، والتواريخ، وبنود الاتفاق التي تم الإخلال بها..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="desired-resolution">
                  التسوية أو الحل المقترح من طرفك (اختياري)
                </label>
                <input
                  id="desired-resolution"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: استرداد مبلغ الضمان، أو إنهاء العقد ودياً..."
                  value={desiredResolution}
                  onChange={(e) => setDesiredResolution(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submitting || !reportDescription.trim()}
                >
                  <FiAlertTriangle />
                  <span>{submitting ? 'جارٍ تسجيل البلاغ...' : 'تأكيد وإرسال البلاغ للتحكيم'}</span>
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Disputes;
