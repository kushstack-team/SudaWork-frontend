import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ContractDetails.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
import receiptPlaceholder from '../../assets/dashboard/marketing_ads.jpg';
import { 
  FiFileText, 
  FiClock, 
  FiDollarSign, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiUser, 
  FiUploadCloud, 
  FiPaperclip, 
  FiX, 
  FiSend, 
  FiRefreshCw, 
  FiMessageSquare,
  FiShield,
  FiInfo,
  FiArrowRight,
  FiCheck,
  FiStar,
  FiAlertTriangle
} from 'react-icons/fi';

const ContractDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [project, setProject] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [freelancerUser, setFreelancerUser] = useState(null);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [contractReviews, setContractReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });

  // Deliverable Submission Modal State
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [deliverNotes, setDeliverNotes] = useState('');
  const [deliverFileName, setDeliverFileName] = useState('');
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [activeDeliverableId, setActiveDeliverableId] = useState(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Escrow Deposit Modal State (for Client)
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [escrowMethod, setEscrowMethod] = useState('Bankak');
  const [escrowTxId, setEscrowTxId] = useState('');
  const [submittingEscrow, setSubmittingEscrow] = useState(false);

  // Review & Rating Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute & Grievance Modal State
  const [contractDisputes, setContractDisputes] = useState([]);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState('عدم الالتزام بمتطلبات العمل');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeDesiredResolution, setDisputeDesiredResolution] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await mockApi.contracts.getById(id);
      if (!c) {
        setContract(null);
        return;
      }
      setContract(c);

      const [proj, cUser, cProf, flUser, flProf, delivs, revs, disputes] = await Promise.all([
        mockApi.projects.getById(c.projectId),
        mockApi.users.getById(c.clientId),
        mockApi.profiles.getClientProfile(c.clientId),
        mockApi.users.getById(c.freelancerId),
        mockApi.profiles.getFreelancerProfile(c.freelancerId),
        mockApi.deliverables.getByContract(c.id),
        mockApi.reviews.getByContract(c.id),
        mockApi.reports.getByContract(c.id),
      ]);

      setProject(proj);
      setClientUser(cUser);
      setClientProfile(cProf);
      setFreelancerUser(flUser);
      setFreelancerProfile(flProf);
      setDeliverables(delivs);
      setContractReviews(revs);
      setContractDisputes(disputes || []);
    } catch (err) {
      console.error('Failed to load contract details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const isClient = user?.id === contract?.clientId;
  const isFreelancer = user?.id === contract?.freelancerId;

  // Lifecycle stage calculations
  const getStepStatus = () => {
    if (!contract) return { step1: false, step2: false, step3: false, step4: false };
    const status = contract.status;
    if (status === 'Awaiting Payment') {
      return { step1: 'done', step2: 'current', step3: 'pending', step4: 'pending' };
    }
    if (status === 'Active') {
      return { step1: 'done', step2: 'done', step3: 'current', step4: 'pending' };
    }
    if (status === 'Submitted') {
      return { step1: 'done', step2: 'done', step3: 'done', step4: 'current' };
    }
    if (status === 'Completed') {
      return { step1: 'done', step2: 'done', step3: 'done', step4: 'done' };
    }
    return { step1: 'done', step2: 'pending', step3: 'pending', step4: 'pending' };
  };

  // Submit Deliverable (Freelancer)
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverNotes.trim()) return;

    setSubmittingDeliverable(true);
    setActionError('');
    try {
      const files = deliverFileName.trim() 
        ? [{ name: deliverFileName.trim(), size: '2.4 MB', url: '#' }] 
        : [{ name: 'Final_Deliverable_Package.zip', size: '5.1 MB', url: '#' }];

      await mockApi.deliverables.submit({
        contractId: contract.id,
        notes: deliverNotes.trim(),
        files,
      });

      // Update contract status to 'Submitted'
      await mockApi.contracts.updateStatus(contract.id, 'Submitted');

      setIsDeliverModalOpen(false);
      setDeliverNotes('');
      setDeliverFileName('');
      setActionSuccess('تم تسليم مخرجات العمل بنجاح! تم إخطار العميل لمراجعتها.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to submit deliverable:', err);
      setActionError(err.message || 'حدث خطأ أثناء تسليم العمل');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  // Accept Deliverable & Complete Contract (Client)
  const handleAcceptDeliverable = (delivId) => {
    setConfirmModal({
      isOpen: true,
      title: 'قبول مخرجات العمل وإكمال العقد',
      message: 'هل أنت متأكد من قبول مخرجات العمل؟ سيتم إكمال العقد وتحرير مستحقات المستقل.',
      confirmText: 'قبول العمل وتحرير المستحقات',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        try {
          await mockApi.deliverables.updateStatus(delivId, 'Accepted');
          await mockApi.contracts.updateStatus(contract.id, 'Completed');

          setActionSuccess('تم قبول العمل وإغلاق العقد بنجاح! شكراً لتعاملك مع سوداوورك.');
          setTimeout(() => setActionSuccess(''), 4000);
          loadData();
        } catch (err) {
          console.error('Failed to accept deliverable:', err);
          setActionError('فشل قبول العمل، يرجى المحاولة ثانية.');
        }
      }
    });
  };

  // Request Revision Modal Open
  const handleOpenRevisionModal = (delivId) => {
    setActiveDeliverableId(delivId);
    setRevisionNotes('');
    setIsRevisionModalOpen(true);
  };

  // Submit Revision Request (Client)
  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    setSubmittingRevision(true);
    try {
      await mockApi.deliverables.updateStatus(activeDeliverableId, 'Revision Requested', {
        revisionNotes: revisionNotes.trim(),
      });
      await mockApi.contracts.updateStatus(contract.id, 'Active');

      setIsRevisionModalOpen(false);
      setActionSuccess('تم إرسال طلب التعديلات إلى المستقل.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to request revision:', err);
    } finally {
      setSubmittingRevision(false);
    }
  };

  // Submit Escrow Payment Proof (Client)
  const handleSubmitEscrow = async (e) => {
    e.preventDefault();
    setSubmittingEscrow(true);
    try {
      await mockApi.paymentRequests.create({
        contractId: contract.id,
        amount: contract.agreedPrice,
        method: escrowMethod,
        transactionId: escrowTxId.trim() || `TX-${Date.now().toString().slice(-6)}`,
        screenshot: receiptPlaceholder,
      });

      // Activate contract directly for smooth demo flow
      await mockApi.contracts.updateStatus(contract.id, 'Active');

      setIsEscrowModalOpen(false);
      setActionSuccess('تم تأكيد إيداع الضمان بنجاح! أصبح العقد سارياً ويمكن للمستقل بدء العمل الآن.');
      setTimeout(() => setActionSuccess(''), 5000);
      loadData();
    } catch (err) {
      console.error('Failed to fund escrow:', err);
    } finally {
      setSubmittingEscrow(false);
    }
  };

  // Submit Review & Rating
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const otherPartyId = user?.id === contract.clientId ? contract.freelancerId : contract.clientId;
      await mockApi.reviews.create({
        contractId: contract.id,
        fromUserId: user?.id,
        toUserId: otherPartyId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      setIsReviewModalOpen(false);
      setReviewComment('');
      setActionSuccess('تم نشر تقييمك ومراجعتك بنجاح! شكراً لمساهمتك في دعم مجتمع العمل الحر.');
      setTimeout(() => setActionSuccess(''), 5000);
      loadData();
    } catch (err) {
      console.error('Failed to submit review:', err);
      setActionError('فشل إرسال التقييم، يرجى المحاولة ثانية.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit Dispute Handler
  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeDescription.trim()) return;

    setSubmittingDispute(true);
    setActionError('');
    try {
      const counterpartyId = user?.id === contract.clientId ? contract.freelancerId : contract.clientId;
      await mockApi.reports.create({
        contractId: contract.id,
        reporterId: user?.id,
        reportedUserId: counterpartyId,
        reason: disputeCategory,
        description: disputeDescription.trim(),
        desiredResolution: disputeDesiredResolution.trim(),
      });

      setIsDisputeModalOpen(false);
      setDisputeDescription('');
      setDisputeDesiredResolution('');
      setActionSuccess('تم رفع طلب النزاع والوساطة بنجاح إلى إدارة المنصة. سنقوم بمتابعة الحالة وحلها بشكل عادل.');
      setTimeout(() => setActionSuccess(''), 6000);
      loadData();
    } catch (err) {
      console.error('Failed to submit dispute:', err);
      setActionError(err.message || 'فشل رفع طلب النزاع، يرجى المحاولة لاحقاً.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) {
    return (
      <div className="contract-loading-container" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل بيانات عقد العمل والتسليمات...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="contract-not-found" dir="rtl">
        <DashboardNavbar />
        <main className="contract-not-found-main">
          <h2>عقد العمل غير موجود</h2>
          <p>عذراً، لم يتم العثور على العقد المطلوب.</p>
          <Link to="/contracts" className="back-link-btn">العودة إلى قائمة العقود</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const steps = getStepStatus();
  const myReview = contractReviews.find((r) => r.fromUserId === user?.id);
  const activeDispute = contractDisputes.find((d) => d.status === 'Open' || d.status === 'In Review');

  return (
    <div className="contract-details-page" dir="rtl">
      <DashboardNavbar />

      <main className="contract-details-main">
        <div className="contract-details-container">

          {/* Breadcrumb Navigation */}
          <div className="contract-breadcrumb">
            <Link to="/contracts" className="breadcrumb-link">العقود</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">عقد رقم: {contract.id}</span>
          </div>

          {/* Alert Success / Error */}
          {actionSuccess && (
            <div className="contract-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="contract-alert error" role="alert">
              <FiAlertCircle className="alert-icon" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Active Dispute Warning Banner */}
          {activeDispute && (
            <div className="contract-dispute-alert-banner">
              <div className="dispute-alert-icon-wrap">
                <FiAlertTriangle className="dispute-alert-icon" />
              </div>
              <div className="dispute-alert-content">
                <div className="dispute-alert-header">
                  <h4 className="dispute-alert-title">العقد يخضع حالياً لإجراءات التحكيم والوساطة (#{activeDispute.id})</h4>
                  <span className="dispute-alert-badge">
                    {activeDispute.status === 'Open' ? 'بانتظار مراجعة الإدارة' : 'قيد التدخل والوساطة'}
                  </span>
                </div>
                <p className="dispute-alert-desc">
                  تم تسجيل نزاع رسمي من قِبل {activeDispute.reporterId === user?.id ? 'طرفك' : 'الطرف الآخر'} بخصوص "<strong>{activeDispute.reason}</strong>". 
                  يقوم فريق الدعم والوساطة في منصة سوداوورك بفحص سجل المراسلات والتسليمات للوصول إلى تسوية ودية عادلة.
                </p>
                {activeDispute.resolutionNotes && (
                  <div className="dispute-alert-notes">
                    <strong>توجيهات لجنة الوساطة:</strong> {activeDispute.resolutionNotes}
                  </div>
                )}
                <div className="dispute-alert-footer">
                  <Link to="/disputes" className="dispute-alert-btn">
                    الانتقال إلى مركز النزاعات والبلاغات &larr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Main Contract Hero Card */}
          <div className="contract-hero-card">
            <div className="contract-hero-header">
              <div>
                <span className="contract-id-tag">عقد عمل موثق #{contract.id}</span>
                <h1 className="contract-project-title">
                  {project ? (
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  ) : (
                    'مشروع سوداوورك'
                  )}
                </h1>
              </div>

              <div className="contract-header-actions-box">
                <Link to={`/messages?contractId=${contract.id}`} className="contract-chat-btn">
                  <FiMessageSquare />
                  <span>محادثة العقد</span>
                </Link>

                {activeDispute ? (
                  <Link to="/disputes" className="contract-dispute-btn active" title="نزاع مفتوح يخضع للوساطة">
                    <FiAlertTriangle />
                    <span>نزاع معلق #{activeDispute.id}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="contract-dispute-btn"
                    onClick={() => setIsDisputeModalOpen(true)}
                    title="فتح نزاع أو تقديم بلاغ للوساطة والتحكيم"
                  >
                    <FiAlertTriangle />
                    <span>رفع نزاع / بلاغ</span>
                  </button>
                )}

                <span className={`contract-status-pill status-${contract.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {contract.status === 'Awaiting Payment' && 'في انتظار إيداع الضمان'}
                  {contract.status === 'Active' && 'ساري - قيد العمل'}
                  {contract.status === 'Submitted' && 'تم التسليم - قيد المراجعة'}
                  {contract.status === 'Completed' && 'مكتمل بنجاح'}
                  {contract.status === 'Cancelled' && 'ملغي'}
                </span>
              </div>
            </div>

            {/* Lifecycle Steps Bar */}
            <div className="lifecycle-stepper-container">
              <div className="stepper-track">
                
                {/* Step 1 */}
                <div className={`step-item ${steps.step1}`}>
                  <div className="step-circle">
                    <FiCheck />
                  </div>
                  <span className="step-label">إنشاء العقد</span>
                </div>
                <div className={`step-line ${steps.step2 !== 'pending' ? 'filled' : ''}`} />

                {/* Step 2 */}
                <div className={`step-item ${steps.step2}`}>
                  <div className="step-circle">
                    {steps.step2 === 'done' ? <FiCheck /> : <FiShield />}
                  </div>
                  <span className="step-label">إيداع الضمان</span>
                </div>
                <div className={`step-line ${steps.step3 !== 'pending' ? 'filled' : ''}`} />

                {/* Step 3 */}
                <div className={`step-item ${steps.step3}`}>
                  <div className="step-circle">
                    {steps.step3 === 'done' ? <FiCheck /> : <FiUploadCloud />}
                  </div>
                  <span className="step-label">تسليم العمل</span>
                </div>
                <div className={`step-line ${steps.step4 === 'done' ? 'filled' : ''}`} />

                {/* Step 4 */}
                <div className={`step-item ${steps.step4}`}>
                  <div className="step-circle">
                    <FiCheckCircle />
                  </div>
                  <span className="step-label">الاعتماد والإنهاء</span>
                </div>

              </div>
            </div>

            {/* Contract Financial & Date Terms */}
            <div className="contract-terms-grid">
              <div className="term-card">
                <span className="term-label">القيمة المتفق عليها</span>
                <strong className="term-val price">{Number(contract.agreedPrice).toLocaleString()} ج.س</strong>
              </div>
              <div className="term-card">
                <span className="term-label">تاريخ التسليم النهائي</span>
                <strong className="term-val">{contract.deliveryDate}</strong>
              </div>
              <div className="term-card">
                <span className="term-label">تاريخ توثيق العقد</span>
                <strong className="term-val">{new Date(contract.createdAt).toLocaleDateString('ar-EG')}</strong>
              </div>
              <div className="term-card">
                <span className="term-label">حماية الضمان (Escrow)</span>
                <strong className="term-val escrow-safe">
                  <FiShield className="shield-icon" />
                  <span>محمي عبر سوداوورك</span>
                </strong>
              </div>
            </div>

            {/* Parties Info Box */}
            <div className="contract-parties-row">
              {/* Client Box */}
              <div className="party-card">
                <span className="party-role-tag">صاحب العمل</span>
                <div className="party-profile">
                  <img 
                    src={clientProfile?.companyLogo || defaultAvatar} 
                    alt={clientUser?.fullName || 'صاحب العمل'} 
                    className="party-avatar"
                  />
                  <div>
                    <Link to={`/clients/${contract.clientId}`} className="party-name-link">
                      {clientUser?.fullName || 'صاحب عمل'}
                    </Link>
                    <p className="party-sub">{clientProfile?.companyName || 'حساب موثق'}</p>
                  </div>
                </div>
              </div>

              {/* Freelancer Box */}
              <div className="party-card">
                <span className="party-role-tag">المستقل المنفذ</span>
                <div className="party-profile">
                  <img 
                    src={freelancerProfile?.photo || defaultAvatar} 
                    alt={freelancerUser?.fullName || 'المستقل'} 
                    className="party-avatar"
                  />
                  <div>
                    <Link to={`/freelancers/${contract.freelancerId}`} className="party-name-link">
                      {freelancerUser?.fullName || 'مستقل'}
                    </Link>
                    <p className="party-sub">{freelancerProfile?.title || 'مستقل متخصص'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Action Strip if Awaiting Payment */}
            {contract.status === 'Awaiting Payment' && (
              <div className="escrow-action-banner">
                <div className="escrow-banner-text">
                  <FiShield className="escrow-big-icon" />
                  <div>
                    <h4>العقد بانتظار إيداع الضمان المالي</h4>
                    <p>
                      {isClient 
                        ? 'يرجى إيداع قيمة العقد في حساب الضمان عبر تطبيق بنكك لبدء تنفيذ المشروع بأمان.' 
                        : 'تم إنشاء العقد وبانتظار قيام العميل بسداد الضمان المالي. سيتم إشعارك فور تفعيل العقد لتبدأ العمل مباشرة.'}
                    </p>
                  </div>
                </div>
                {isClient && (
                  <button
                    type="button"
                    className="fund-escrow-btn"
                    onClick={() => setIsEscrowModalOpen(true)}
                  >
                    <FiDollarSign />
                    <span>سداد الضمان وتفعيل العقد الآن</span>
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Deliverables Section */}
          <div className="deliverables-section-card">
            <div className="section-header-row">
              <div>
                <h2 className="section-title">مخرجات العمل والتسليمات</h2>
                <p className="section-subtitle">
                  سجل التسليمات والمخرجات المرفوعة من قِبل المستقل وملاحظات المراجعة.
                </p>
              </div>

              {/* Freelancer Deliver Button */}
              {isFreelancer && (contract.status === 'Active' || contract.status === 'Submitted') && (
                <button
                  type="button"
                  className="open-deliver-btn"
                  onClick={() => setIsDeliverModalOpen(true)}
                >
                  <FiUploadCloud />
                  <span>تسليم مخرجات جديدة</span>
                </button>
              )}
            </div>

            {deliverables.length === 0 ? (
              <div className="no-deliverables-box">
                <FiUploadCloud className="empty-cloud-icon" />
                <h3>لم يتم تسليم أي مخرجات بعد</h3>
                <p>
                  {contract.status === 'Awaiting Payment' 
                    ? 'سيبدأ المستقل في العمل ورفع المخرجات فور تفعيل الضمان المالي.' 
                    : 'يعمل المستقل حالياً على إنجاز متطلبات المشروع، وسيظهر التسليم هنا فور رفعه.'}
                </p>
              </div>
            ) : (
              <div className="deliverables-list">
                {deliverables.map((deliv, idx) => (
                  <div key={deliv.id} className={`deliverable-card status-${deliv.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    
                    <div className="deliverable-card-header">
                      <div className="deliv-meta">
                        <span className="deliv-number">تسليم رقم #{deliverables.length - idx}</span>
                        <span className="deliv-date">
                          {new Date(deliv.submittedAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <span className={`deliv-status-pill pill-${deliv.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {deliv.status === 'Pending Review' && 'قيد المراجعة من العميل'}
                        {deliv.status === 'Revision Requested' && 'مطلوب تعديلات'}
                        {deliv.status === 'Accepted' && 'تم القبول والاعتماد'}
                      </span>
                    </div>

                    {/* Deliverable Notes */}
                    <div className="deliv-notes-box">
                      <h4>ملاحظات المستقل:</h4>
                      <p>{deliv.notes}</p>
                    </div>

                    {/* Files List */}
                    {deliv.files && deliv.files.length > 0 && (
                      <div className="deliv-files-container">
                        <h4>الملفات والمرفقات:</h4>
                        <div className="files-grid">
                          {deliv.files.map((f, fIdx) => (
                            <div key={fIdx} className="file-chip">
                              <FiPaperclip className="chip-icon" />
                              <span className="file-name">{f.name}</span>
                              <span className="file-size">({f.size || '3.2 MB'})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Revision Feedback if any */}
                    {deliv.revisionNotes && (
                      <div className="revision-feedback-box">
                        <FiAlertCircle className="rev-icon" />
                        <div>
                          <h5>ملاحظات التعديل المطلوبة من صاحب العمل:</h5>
                          <p>{deliv.revisionNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Client Review Actions (for Pending Review deliverables) */}
                    {isClient && deliv.status === 'Pending Review' && contract.status !== 'Completed' && (
                      <div className="deliv-client-actions">
                        <button
                          type="button"
                          className="accept-deliv-btn"
                          onClick={() => handleAcceptDeliverable(deliv.id)}
                        >
                          <FiCheckCircle />
                          <span>قبول العمل وإكمال العقد</span>
                        </button>
                        <button
                          type="button"
                          className="request-revision-btn"
                          onClick={() => handleOpenRevisionModal(deliv.id)}
                        >
                          <FiRefreshCw />
                          <span>طلب تعديلات</span>
                        </button>
                      </div>
                    )}

                    {deliv.status === 'Accepted' && (
                      <div className="deliv-accepted-badge-strip">
                        <FiCheckCircle className="badge-icon" />
                        <span>تم اعتماد هذا التسليم رسمياً.</span>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Contract Reviews Section */}
          {contract.status === 'Completed' && (
            <div className="contract-reviews-section-card">
              <div className="section-header-row">
                <div>
                  <h2 className="section-title">تقييمات ومراجعات العقد</h2>
                  <p className="section-subtitle">
                    توثيق تجربة الطرفين بعد تسليم واعتماد متطلبات العمل.
                  </p>
                </div>

                {!myReview && (
                  <button
                    type="button"
                    className="open-review-btn"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    <FiStar />
                    <span>تقييم شريك العمل</span>
                  </button>
                )}
              </div>

              {!myReview && (
                <div className="leave-review-prompt-box">
                  <FiStar className="prompt-star-icon" />
                  <div className="prompt-text">
                    <h4>تهانينا على إكمال العقد! كيف كانت تجربة العمل؟</h4>
                    <p>
                      شارك تقييمك لمساعدة مجتمع سوداوورك وإبراز مصداقية واحترافية الطرف الآخر.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="add-review-cta"
                    onClick={() => setIsReviewModalOpen(true)}
                  >
                    أضف تقييمك الآن
                  </button>
                </div>
              )}

              {contractReviews.length === 0 ? (
                <div className="no-reviews-box">
                  <FiStar className="empty-star-icon" />
                  <h3>لم يتم تقديم تقييمات بعد</h3>
                  <p>كن أول من يشارك رأيه حول هذا التعاون الناجح.</p>
                </div>
              ) : (
                <div className="reviews-cards-list">
                  {contractReviews.map((rev) => {
                    const isClientReviewer = rev.fromUserId === contract.clientId;
                    const reviewerName = isClientReviewer ? clientUser?.fullName : freelancerUser?.fullName;
                    const reviewerPhoto = isClientReviewer
                      ? clientProfile?.companyLogo || defaultAvatar
                      : freelancerProfile?.photo || defaultAvatar;
                    const reviewerRole = isClientReviewer ? 'صاحب العمل' : 'المستقل المنفذ';

                    return (
                      <div key={rev.id} className="contract-review-card">
                        <div className="rev-card-header">
                          <div className="reviewer-info">
                            <img src={reviewerPhoto} alt={reviewerName} className="rev-avatar" />
                            <div>
                              <h4 className="rev-name">{reviewerName}</h4>
                              <span className="rev-role-badge">{reviewerRole}</span>
                            </div>
                          </div>

                          <div className="rev-rating-display">
                            <div className="stars-row">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                  key={star}
                                  className={`star-icon ${star <= rev.rating ? 'filled' : ''}`}
                                />
                              ))}
                            </div>
                            <span className="rev-date">
                              {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>

                        <p className="rev-comment-text">{rev.comment}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Deliverable Submission Modal (Freelancer) */}
      {isDeliverModalOpen && (
        <div className="contract-modal-backdrop" onClick={() => !submittingDeliverable && setIsDeliverModalOpen(false)}>
          <div className="contract-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>تسليم مخرجات العمل</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsDeliverModalOpen(false)}
                disabled={submittingDeliverable}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="modal-form">
              <p className="modal-lead">
                قدم وصفاً دقيقاً لما تم إنجازه، وأرفق ملفات العمل النهائية أو روابط النماذج.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="deliver-notes">
                  وصف المخرجات ورسالة التسليم <span className="required">*</span>
                </label>
                <textarea
                  id="deliver-notes"
                  rows="5"
                  className="modal-textarea"
                  placeholder="مرحباً، أرفق لكم مخرجات العمل المتفق عليها بالكامل، متضمنة كافة ملفات المصدر وتعديلاتكم الأخيرة..."
                  value={deliverNotes}
                  onChange={(e) => setDeliverNotes(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="deliver-file">
                  اسم ملف التسليم أو المرفق الرئيسي
                </label>
                <div className="input-with-icon">
                  <FiPaperclip className="input-icon" />
                  <input
                    id="deliver-file"
                    type="text"
                    className="modal-input"
                    placeholder="مثال: Final_Designs_Full_Package.zip"
                    value={deliverFileName}
                    onChange={(e) => setDeliverFileName(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingDeliverable}
                >
                  <FiSend />
                  <span>{submittingDeliverable ? 'جارٍ رفع التسليم...' : 'تأكيد التسليم للعميل'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingDeliverable}
                  onClick={() => setIsDeliverModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Request Modal (Client) */}
      {isRevisionModalOpen && (
        <div className="contract-modal-backdrop" onClick={() => !submittingRevision && setIsRevisionModalOpen(false)}>
          <div className="contract-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>طلب تعديلات على التسليم</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsRevisionModalOpen(false)}
                disabled={submittingRevision}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="modal-form">
              <p className="modal-lead">
                حدد التعديلات المطلوبة بوضوح ليقوم المستقل بتنفيذها وإعادة رفع العمل.
              </p>

              <div className="form-group">
                <label className="form-label" htmlFor="revision-notes">
                  الملاحظات والتعديلات المطلوبة <span className="required">*</span>
                </label>
                <textarea
                  id="revision-notes"
                  rows="5"
                  className="modal-textarea"
                  placeholder="يرجى تعديل ألوان الشعار لتطابق الدرجات المذكورة في الدليل، وتصدير الأيقونات بصيغة SVG..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-warning-btn"
                  disabled={submittingRevision}
                >
                  <FiRefreshCw />
                  <span>{submittingRevision ? 'جارٍ إرسال الطلب...' : 'إرسال طلب التعديلات'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingRevision}
                  onClick={() => setIsRevisionModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escrow Deposit Modal (Client) */}
      {isEscrowModalOpen && (
        <div className="contract-modal-backdrop" onClick={() => !submittingEscrow && setIsEscrowModalOpen(false)}>
          <div className="contract-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>سداد الضمان المالي (Escrow)</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsEscrowModalOpen(false)}
                disabled={submittingEscrow}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitEscrow} className="modal-form">
              <div className="escrow-modal-summary">
                <span className="summary-label">المبلغ المطلوب إيداعه في الضمان:</span>
                <strong className="summary-val">{Number(contract.agreedPrice).toLocaleString()} ج.س</strong>
              </div>

              <div className="form-group">
                <label className="form-label">طريقة السداد المعتمدة</label>
                <div className="payment-methods-options">
                  <label className={`method-pill ${escrowMethod === 'Bankak' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="escrowMethod" 
                      value="Bankak" 
                      checked={escrowMethod === 'Bankak'}
                      onChange={(e) => setEscrowMethod(e.target.value)}
                    />
                    <span>بنكك (بنك الخرطوم)</span>
                  </label>
                  <label className={`method-pill ${escrowMethod === 'Bank Transfer' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="escrowMethod" 
                      value="Bank Transfer" 
                      checked={escrowMethod === 'Bank Transfer'}
                      onChange={(e) => setEscrowMethod(e.target.value)}
                    />
                    <span>تحويل بنكي مباشر</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="escrow-txid">
                  رقم العملية أو الإشعار (Transaction ID)
                </label>
                <input
                  id="escrow-txid"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: BNK-83742918"
                  value={escrowTxId}
                  onChange={(e) => setEscrowTxId(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingEscrow}
                >
                  <FiShield />
                  <span>{submittingEscrow ? 'جارٍ توثيق الإيداع...' : 'تأكيد السداد وتفعيل العقد'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingEscrow}
                  onClick={() => setIsEscrowModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Rating Modal */}
      {isReviewModalOpen && (
        <div className="contract-modal-backdrop" onClick={() => !submittingReview && setIsReviewModalOpen(false)}>
          <div className="contract-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>تقييم شريك العمل والمراجعة</h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsReviewModalOpen(false)}
                disabled={submittingReview}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-form">
              <div className="stars-picker-container">
                <span className="picker-label">اختر التقييم العام (من 1 إلى 5 نجوم):</span>
                <div className="stars-interactive-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${(reviewHoverRating || reviewRating) >= star ? 'active' : ''}`}
                      onMouseEnter={() => setReviewHoverRating(star)}
                      onMouseLeave={() => setReviewHoverRating(0)}
                      onClick={() => setReviewRating(star)}
                      aria-label={`${star} نجوم`}
                    >
                      <FiStar />
                    </button>
                  ))}
                </div>
                <span className="rating-desc-text">
                  {reviewRating === 5 && 'ممتاز ورائع جداً (5/5)'}
                  {reviewRating === 4 && 'جيد جداً واحترافي (4/5)'}
                  {reviewRating === 3 && 'جيد (3/5)'}
                  {reviewRating === 2 && 'مقبول (2/5)'}
                  {reviewRating === 1 && 'يحتاج إلى تحسين كبير (1/5)'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="review-comment">
                  ملاحظاتك ومراجعتك المكتوبة <span className="required">*</span>
                </label>
                <textarea
                  id="review-comment"
                  rows="4"
                  className="modal-textarea"
                  placeholder="صف تجربتك باحترافية، جودة العمل، التزام المواعيد، والتواصل..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingReview || !reviewComment.trim()}
                >
                  <FiCheckCircle />
                  <span>{submittingReview ? 'جارٍ نشر التقييم...' : 'نشر التقييم والاعتماد'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingReview}
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute & Grievance Modal */}
      {isDisputeModalOpen && (
        <div className="contract-modal-backdrop" onClick={() => !submittingDispute && setIsDisputeModalOpen(false)}>
          <div className="contract-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <FiAlertTriangle className="modal-title-icon dispute-icon" />
                <h3>فتح نزاع رسمي أو بلاغ تحكيم</h3>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setIsDisputeModalOpen(false)}
                disabled={submittingDispute}
              >
                <FiX />
              </button>
            </div>

            <div className="dispute-modal-notice">
              <FiShield className="dispute-notice-icon" />
              <p>
                يتم تحويل النزاع إلى لجنة الوساطة والتحكيم في منصة سوداوورك. نلتزم بمراجعة سجل الرسائل والتسليمات لضمان حقوق الطرفين بكل شفافية وحيادية.
              </p>
            </div>

            <form onSubmit={handleSubmitDispute} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="dispute-category">
                  تصنيف المشكلة أو سبب النزاع <span className="required">*</span>
                </label>
                <select
                  id="dispute-category"
                  className="modal-select"
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  required
                >
                  <option value="عدم الالتزام بمتطلبات العمل">عدم الالتزام بمتطلبات العمل المتفق عليها</option>
                  <option value="تأخير غير مبرر في التسليم">تأخير غير مبرر ومخالفة للجدول الزمني</option>
                  <option value="نزاع مالي أو دفعات الضمان">نزاع مالي أو مشكلة في دفعات الضمان (Escrow)</option>
                  <option value="انقطاع الاتصال أو عدم التجاوب">انقطاع الاتصال أو عدم التجاوب من الطرف الآخر</option>
                  <option value="طلب تعديلات خارج نطاق العقد">طلب تعديلات متكررة خارج نطاق العقد المحدد</option>
                  <option value="سلوك غير لائق أو مضايقة">سلوك غير لائق أو انتهاك لسياسات المنصة</option>
                  <option value="أخرى">سبب آخر</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dispute-description">
                  شرح وتفاصيل المشكلة والوقائع <span className="required">*</span>
                </label>
                <textarea
                  id="dispute-description"
                  rows="4"
                  className="modal-textarea"
                  placeholder="يرجى ذكر الوقائع والتواريخ ونقاط الخلاف بدقة ووضوح لمساعدة فريق التحكيم..."
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dispute-resolution">
                  التسوية أو الحل المطلوب من جانبك (اختياري)
                </label>
                <input
                  id="dispute-resolution"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: استرداد كامل لمبلغ الضمان، أو تمديد المهلة 4 أيام، أو الإفراج عن الدفعة..."
                  value={disputeDesiredResolution}
                  onChange={(e) => setDisputeDesiredResolution(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn dispute-submit-btn"
                  disabled={submittingDispute || !disputeDescription.trim()}
                >
                  <FiAlertTriangle />
                  <span>{submittingDispute ? 'جارٍ رفع طلب النزاع...' : 'إرسال طلب التحكيم للجنة الوساطة'}</span>
                </button>
                <button
                  type="button"
                  className="modal-secondary-btn"
                  disabled={submittingDispute}
                  onClick={() => setIsDisputeModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <Footer />
    </div>
  );
};

export default ContractDetails;
