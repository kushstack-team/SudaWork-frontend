import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ContractDetails.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import FilePicker from '../../components/FilePicker/FilePicker';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import defaultAvatar from '../../assets/default-avatar.svg';
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiUploadCloud,
  FiPaperclip,
  FiX,
  FiSend,
  FiRefreshCw,
  FiMessageSquare,
  FiShield,
  FiInfo,
  FiCheck,
  FiStar,
  FiAlertTriangle
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ContractDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { isFeatureAvailable, settings } = usePlatform();
  const canMessage = isFeatureAvailable(FEATURES.MESSAGING);
  const canReview = isFeatureAvailable(FEATURES.REVIEWS);
  const canDispute = isFeatureAvailable(FEATURES.DISPUTES);
  const canPay = isFeatureAvailable(FEATURES.PAYMENT_REQUESTS);

  const [contract, setContract] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [contractReviews, setContractReviews] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
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
  const [deliverFiles, setDeliverFiles] = useState([]);
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false);

  // Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);

  // Escrow Deposit Modal State (for Client)
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [escrowMethod, setEscrowMethod] = useState('Bankak');
  const [escrowTxId, setEscrowTxId] = useState('');
  const [escrowProof, setEscrowProof] = useState([]);
  const [escrowError, setEscrowError] = useState('');
  const [submittingEscrow, setSubmittingEscrow] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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
    try {
      const c = await api.contracts.get(id);
      setContract(c);
      setLoadError(null);

      const isOwnerClient = user?.id === c.clientId || user?.role === 'admin';
      const [delivs, revs, disputes, pays] = await Promise.all([
        api.contracts.deliverables(c.id),
        c.status === 'Completed' ? api.contracts.reviews(c.id) : Promise.resolve([]),
        api.contracts.reports(c.id),
        isOwnerClient ? api.contracts.payments(c.id) : Promise.resolve([]),
      ]);
      setDeliverables(delivs);
      setContractReviews(revs);
      setContractDisputes(disputes);
      setPayments(pays);
    } catch (err) {
      if (err.isNotFound) setContract(null);
      else setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadData, [id, user?.id], Boolean(id));

  const isClient = user?.id === contract?.clientId;
  const isFreelancer = user?.id === contract?.freelancerId;

  // Lifecycle stage calculations
  const getStepStatus = () => {
    if (!contract) return { step1: false, step2: false, step3: false, step4: false };
    const status = contract.status;
    if (status === 'Awaiting Payment') {
      return { step1: 'done', step2: 'current', step3: 'pending', step4: 'pending' };
    }
    if (status === 'Active' || status === 'Revision Requested') {
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
    if (deliverFiles.some((f) => f.status === 'uploading')) return;

    setSubmittingDeliverable(true);
    setActionError('');
    try {
      await api.contracts.submitWork(contract.id, {
        message: deliverNotes.trim(),
        attachmentIds: deliverFiles.filter((f) => f.upload).map((f) => f.upload.id),
      });

      setIsDeliverModalOpen(false);
      setDeliverNotes('');
      setDeliverFiles([]);
      setActionSuccess('تم تسليم مخرجات العمل بنجاح! تم إخطار العميل لمراجعتها.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      setActionError(err.message || 'حدث خطأ أثناء تسليم العمل');
    } finally {
      setSubmittingDeliverable(false);
    }
  };

  // Accept Deliverable & Complete Contract (Client)
  const handleAcceptDeliverable = () => {
    setConfirmModal({
      isOpen: true,
      title: 'قبول مخرجات العمل وإكمال العقد',
      message: 'هل أنت متأكد من قبول مخرجات العمل؟ سيتم إكمال العقد وتحرير مستحقات المستقل.',
      confirmText: 'قبول العمل وتحرير المستحقات',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setActionError('');
        try {
          await api.contracts.complete(contract.id);
          setActionSuccess('تم قبول العمل وإغلاق العقد بنجاح! شكراً لتعاملك مع سوداوورك.');
          setTimeout(() => setActionSuccess(''), 4000);
          loadData();
        } catch (err) {
          setActionError(err.message || 'فشل قبول العمل، يرجى المحاولة ثانية.');
        }
      }
    });
  };

  // Request Revision Modal Open
  const handleOpenRevisionModal = () => {
    setRevisionNotes('');
    setIsRevisionModalOpen(true);
  };

  // Submit Revision Request (Client)
  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionNotes.trim()) return;

    setSubmittingRevision(true);
    setActionError('');
    try {
      await api.contracts.requestRevision(contract.id, revisionNotes.trim());
      setIsRevisionModalOpen(false);
      setActionSuccess('تم إرسال طلب التعديلات إلى المستقل.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      setIsRevisionModalOpen(false);
      setActionError(err.message);
    } finally {
      setSubmittingRevision(false);
    }
  };

  // Submit Escrow Payment Proof (Client) — goes to admin verification.
  const lastPayment = payments[0] || null;
  const handleSubmitEscrow = async (e) => {
    e.preventDefault();
    if (escrowTxId.trim().length < 3) {
      setEscrowError('يرجى إدخال رقم العملية أو الإشعار كما يظهر في تطبيق البنك.');
      return;
    }
    if (escrowProof.some((f) => f.status === 'uploading')) return;
    setSubmittingEscrow(true);
    setEscrowError('');
    try {
      const body = {
        amount: contract.agreedPrice,
        paymentMethod: escrowMethod,
        transactionReference: escrowTxId.trim(),
        proofFileId: escrowProof.find((f) => f.upload)?.upload.id,
      };
      if (lastPayment?.rawStatus === 'REJECTED') {
        await api.payments.resubmit(lastPayment.id, body);
      } else {
        await api.contracts.submitPayment(contract.id, body);
      }

      setIsEscrowModalOpen(false);
      setEscrowTxId('');
      setEscrowProof([]);
      setActionSuccess('تم إرسال إثبات الدفع بنجاح! سيبدأ العقد فور تحقق الإدارة من التحويل، وستصلك رسالة إشعار.');
      setTimeout(() => setActionSuccess(''), 6000);
      loadData();
    } catch (err) {
      setEscrowError(err.message);
    } finally {
      setSubmittingEscrow(false);
    }
  };

  const handleCancelContract = () => {
    setConfirmModal({
      isOpen: true,
      title: 'إلغاء العقد',
      message: 'هل أنت متأكد من إلغاء هذا العقد قبل بدء العمل؟ سيتم إغلاق المشروع ولا يمكن التراجع.',
      confirmText: 'إلغاء العقد',
      cancelText: 'تراجع',
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setIsCancelling(true);
        setActionError('');
        try {
          await api.contracts.cancel(contract.id);
          setActionSuccess('تم إلغاء العقد.');
          loadData();
        } catch (err) {
          setActionError(err.message);
        } finally {
          setIsCancelling(false);
        }
      }
    });
  };

  const openFile = async (file) => {
    setActionError('');
    try {
      await api.uploads.open(file);
    } catch (err) {
      setActionError(err.message);
    }
  };

  // Submit Review & Rating
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setActionError('');
    try {
      await api.contracts.submitReview(contract.id, { rating: reviewRating, comment: reviewComment.trim() });

      setIsReviewModalOpen(false);
      setReviewComment('');
      setActionSuccess('تم نشر تقييمك ومراجعتك بنجاح! شكراً لمساهمتك في دعم مجتمع العمل الحر.');
      setTimeout(() => setActionSuccess(''), 5000);
      loadData();
    } catch (err) {
      setIsReviewModalOpen(false);
      setActionError(err.message || 'فشل إرسال التقييم، يرجى المحاولة ثانية.');
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
      await api.reports.create({
        targetType: 'contract',
        targetId: contract.id,
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
      setIsDisputeModalOpen(false);
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

  if (loadError) {
    return (
      <div className="contract-not-found" dir="rtl">
        <DashboardNavbar />
        <main className="contract-not-found-main">
          <ErrorState
            title="تعذر تحميل العقد"
            error={loadError}
            onRetry={() => {
              setLoading(true);
              loadData();
            }}
          />
        </main>
        <Footer />
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
            <span className="breadcrumb-current">عقد رقم: {contract.id.slice(0, 8)}</span>
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
                  <h4 className="dispute-alert-title">العقد يخضع حالياً لإجراءات التحكيم والوساطة (#{activeDispute.id.slice(0, 8)})</h4>
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
                <span className="contract-id-tag">عقد عمل موثق #{contract.id.slice(0, 8)}</span>
                <h1 className="contract-project-title">
                  <Link to={`/projects/${contract.projectId}`}>{contract.projectTitle}</Link>
                </h1>
              </div>

              <div className="contract-header-actions-box">
                {canMessage && user?.role !== 'admin' && (
                  <Link to={`/messages?contractId=${contract.id}`} className="contract-chat-btn">
                    <FiMessageSquare />
                    <span>محادثة العقد</span>
                  </Link>
                )}

                {(isClient || isFreelancer) && contract.status === 'Awaiting Payment' && (
                  <button
                    type="button"
                    className="contract-dispute-btn"
                    onClick={handleCancelContract}
                    disabled={isCancelling}
                  >
                    <FiX />
                    <span>{isCancelling ? 'جارٍ الإلغاء...' : 'إلغاء العقد'}</span>
                  </button>
                )}

                {activeDispute ? (
                  <Link to="/disputes" className="contract-dispute-btn active" title="نزاع مفتوح يخضع للوساطة">
                    <FiAlertTriangle />
                    <span>نزاع معلق #{activeDispute.id.slice(0, 8)}</span>
                  </Link>
                ) : !canDispute || !(isClient || isFreelancer) || contract.status === 'Cancelled' ? null : (
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
                  {contract.status === 'Revision Requested' && 'مطلوب تعديلات'}
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
                <strong className="term-val">{contract.deliveryDate || `${contract.deliveryDays} يوم من بدء العقد`}</strong>
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
                    src={contract.clientAvatar || defaultAvatar}
                    alt={contract.clientName}
                    className="party-avatar"
                  />
                  <div>
                    <Link to={`/clients/${contract.clientId}`} className="party-name-link">
                      {contract.clientName}
                    </Link>
                    <p className="party-sub">{contract.clientCompany || 'صاحب عمل'}</p>
                  </div>
                </div>
              </div>

              {/* Freelancer Box */}
              <div className="party-card">
                <span className="party-role-tag">المستقل المنفذ</span>
                <div className="party-profile">
                  <img
                    src={contract.freelancerAvatar || defaultAvatar}
                    alt={contract.freelancerName}
                    className="party-avatar"
                  />
                  <div>
                    <Link to={`/freelancers/${contract.freelancerId}`} className="party-name-link">
                      {contract.freelancerName}
                    </Link>
                    <p className="party-sub">{contract.freelancerTitle || 'مستقل'}</p>
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
                    {contract.paymentStatus === 'Pending Verification' ? (
                      <>
                        <h4>إثبات الدفع قيد مراجعة الإدارة</h4>
                        <p>
                          {isClient
                            ? 'استلمنا إثبات التحويل الخاص بك وتقوم الإدارة بالتحقق منه الآن. سيبدأ العقد تلقائياً فور الاعتماد.'
                            : 'أرسل العميل إثبات الدفع وهو قيد مراجعة الإدارة. سيتم إشعارك فور تفعيل العقد لتبدأ العمل.'}
                        </p>
                      </>
                    ) : contract.paymentStatus === 'Rejected' && isClient ? (
                      <>
                        <h4>تم رفض إثبات الدفع</h4>
                        <p>
                          سبب الرفض: {contract.paymentRejectionReason || lastPayment?.rejectionReason || 'غير محدد'}. يرجى تصحيح البيانات وإعادة الإرسال.
                        </p>
                      </>
                    ) : (
                      <>
                        <h4>العقد بانتظار إيداع الضمان المالي</h4>
                        <p>
                          {isClient
                            ? 'حوّل قيمة العقد إلى حساب المنصة ثم أرسل رقم العملية وإشعار التحويل. سيبدأ العقد بعد تحقق الإدارة.'
                            : 'تم إنشاء العقد وبانتظار قيام العميل بسداد الضمان المالي. سيتم إشعارك فور تفعيل العقد لتبدأ العمل مباشرة.'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {isClient && canPay && contract.paymentStatus !== 'Pending Verification' && (
                  <button
                    type="button"
                    className="fund-escrow-btn"
                    onClick={() => {
                      setEscrowError('');
                      setIsEscrowModalOpen(true);
                    }}
                  >
                    <FiDollarSign />
                    <span>{contract.paymentStatus === 'Rejected' ? 'إعادة إرسال إثبات الدفع' : 'إرسال إثبات الدفع'}</span>
                  </button>
                )}
              </div>
            )}

            {contract.status === 'Cancelled' && (
              <div className="escrow-action-banner">
                <div className="escrow-banner-text">
                  <FiInfo className="escrow-big-icon" />
                  <div>
                    <h4>تم إلغاء هذا العقد</h4>
                    <p>لم يعد هذا العقد نشطاً. يمكنك مراجعة السجل أدناه.</p>
                  </div>
                </div>
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
              {isFreelancer && (contract.status === 'Active' || contract.status === 'Revision Requested') && (
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
                          {deliv.files.map((f) => (
                            <button key={f.id} type="button" className="file-chip" onClick={() => openFile(f)} title="فتح الملف">
                              <FiPaperclip className="chip-icon" />
                              <span className="file-name">{f.name}</span>
                              {f.size && <span className="file-size">({f.size})</span>}
                            </button>
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
                    {isClient && deliv.status === 'Pending Review' && contract.status === 'Submitted' && (
                      <div className="deliv-client-actions">
                        <button
                          type="button"
                          className="accept-deliv-btn"
                          onClick={() => handleAcceptDeliverable()}
                        >
                          <FiCheckCircle />
                          <span>قبول العمل وإكمال العقد</span>
                        </button>
                        <button
                          type="button"
                          className="request-revision-btn"
                          onClick={() => handleOpenRevisionModal()}
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

                {!myReview && canReview && (isClient || isFreelancer) && (
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

              {!myReview && canReview && (isClient || isFreelancer) && (
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
                    const reviewerName = rev.reviewerName;
                    const reviewerPhoto = rev.reviewerAvatar || defaultAvatar;
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

                        {rev.comment && <p className="rev-comment-text">{rev.comment}</p>}
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
                  ملفات التسليم (اختياري، حتى 10 ملفات)
                </label>
                <FilePicker
                  id="deliver-file"
                  purpose="deliverable"
                  multiple
                  maxFiles={10}
                  files={deliverFiles}
                  onChange={setDeliverFiles}
                  disabled={submittingDeliverable}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingDeliverable || deliverFiles.some((x) => x.status === 'uploading')}
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
              <h3>إرسال إثبات الدفع</h3>
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
                <span className="summary-label">المبلغ المطلوب تحويله:</span>
                <strong className="summary-val">{Number(contract.agreedPrice).toLocaleString()} ج.س</strong>
              </div>

              {(settings?.payment_instructions?.accountNumber || settings?.payment_instructions?.notes) ? (
                <div className="dispute-modal-notice">
                  <FiInfo className="dispute-notice-icon" />
                  <p>
                    {settings.payment_instructions.bankName && <>البنك: <strong>{settings.payment_instructions.bankName}</strong><br /></>}
                    {settings.payment_instructions.accountName && <>اسم الحساب: <strong>{settings.payment_instructions.accountName}</strong><br /></>}
                    {settings.payment_instructions.accountNumber && <>رقم الحساب: <strong>{settings.payment_instructions.accountNumber}</strong><br /></>}
                    {settings.payment_instructions.phone && <>رقم الهاتف: <strong>{settings.payment_instructions.phone}</strong><br /></>}
                    {settings.payment_instructions.notes}
                  </p>
                </div>
              ) : (
                <div className="dispute-modal-notice">
                  <FiInfo className="dispute-notice-icon" />
                  <p>لم تُنشر بيانات حساب التحويل بعد. يرجى التواصل مع إدارة المنصة للحصول على بيانات الدفع قبل التحويل.</p>
                </div>
              )}

              {escrowError && (
                <div className="contract-alert error" role="alert">
                  <FiAlertCircle className="alert-icon" />
                  <span>{escrowError}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">طريقة السداد</label>
                <div className="payment-methods-options">
                  {[
                    ['Bankak', 'بنكك (بنك الخرطوم)'],
                    ['Bank Transfer', 'تحويل بنكي مباشر'],
                    ['Zain Cash', 'زين كاش'],
                  ].map(([value, text]) => (
                    <label key={value} className={`method-pill ${escrowMethod === value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="escrowMethod"
                        value={value}
                        checked={escrowMethod === value}
                        onChange={(e) => setEscrowMethod(e.target.value)}
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="escrow-txid">
                  رقم العملية أو الإشعار (Transaction ID) <span className="required">*</span>
                </label>
                <input
                  id="escrow-txid"
                  type="text"
                  className="modal-input"
                  placeholder="مثال: BNK-83742918"
                  value={escrowTxId}
                  onChange={(e) => setEscrowTxId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="escrow-proof">
                  صورة إشعار التحويل (يُسرّع التحقق)
                </label>
                <FilePicker
                  id="escrow-proof"
                  purpose="payment_proof"
                  accept=".png,.jpg,.jpeg,.pdf"
                  files={escrowProof}
                  onChange={setEscrowProof}
                  disabled={submittingEscrow}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingEscrow || escrowProof.some((x) => x.status === 'uploading')}
                >
                  <FiShield />
                  <span>{submittingEscrow ? 'جارٍ الإرسال...' : 'إرسال إثبات الدفع للمراجعة'}</span>
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
                  ملاحظاتك ومراجعتك المكتوبة
                </label>
                <textarea
                  id="review-comment"
                  rows="4"
                  className="modal-textarea"
                  placeholder="صف تجربتك باحترافية، جودة العمل، التزام المواعيد، والتواصل..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="submit"
                  className="modal-primary-btn"
                  disabled={submittingReview}
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
