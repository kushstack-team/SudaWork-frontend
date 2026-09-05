import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './ProjectDetails.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { calculateFreelancerNet, calculatePlatformFee } from '../../utils/finance';
import ConfirmModal from '../../components/common/ConfirmModal/ConfirmModal';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
import { 
  FiClock, 
  FiDollarSign, 
  FiTag, 
  FiCheckCircle, 
  FiXCircle, 
  FiUser, 
  FiStar, 
  FiFileText, 
  FiArrowRight, 
  FiPaperclip,
  FiBriefcase,
  FiAlertCircle,
  FiX,
  FiSend,
  FiTrash2,
  FiInfo
} from 'react-icons/fi';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [proposals, setProposals] = useState([]);
  const [freelancerProfilesMap, setFreelancerProfilesMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Proposal modal state
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('7');
  const [coverLetter, setCoverLetter] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalError, setProposalError] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'تأكيد',
    cancelText: 'إلغاء',
    type: 'warning',
    onConfirm: null
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const proj = await mockApi.projects.getById(id);
      if (!proj) {
        setProject(null);
        return;
      }
      setProject(proj);

      const [cUser, cProf, cats, props] = await Promise.all([
        mockApi.users.getById(proj.clientId),
        mockApi.profiles.getClientProfile(proj.clientId),
        mockApi.categories.getAll(),
        mockApi.proposals.getByProject(proj.id),
      ]);

      setClientUser(cUser);
      setClientProfile(cProf);
      const catObj = cats.find((c) => c.id === proj.categoryId);
      setCategoryName(catObj ? catObj.name : 'عام');
      setProposals(props);

      // Load freelancer profiles for each proposal
      const flMap = {};
      for (const p of props) {
        const [flUser, flProf] = await Promise.all([
          mockApi.users.getById(p.freelancerId),
          mockApi.profiles.getFreelancerProfile(p.freelancerId),
        ]);
        flMap[p.freelancerId] = {
          name: flUser?.fullName || 'مستقل',
          photo: flProf?.photo || defaultAvatar,
          rating: flProf?.avgRating || 5.0,
          title: flProf?.title || 'مستقل متخصص',
        };
      }
      setFreelancerProfilesMap(flMap);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const isClientOwner = user?.id === project?.clientId;

  // Accept a proposal
  const handleAcceptProposal = (proposal) => {
    setConfirmModal({
      isOpen: true,
      title: 'قبول عرض العمل',
      message: `هل أنت متأكد من قبول عرض المستقل بقيمة ${Number(proposal.bidAmount).toLocaleString()} ج.س وإنشاء عقد العمل؟`,
      confirmText: 'نعم، اقبل العرض',
      cancelText: 'إلغاء',
      type: 'success',
      onConfirm: () => performAcceptProposal(proposal)
    });
  };

  const performAcceptProposal = async (proposal) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setProcessingId(proposal.id);
    try {
      // 1. Mark this proposal accepted
      await mockApi.proposals.updateStatus(proposal.id, 'Accepted');

      // 2. Auto-reject other proposals
      for (const other of proposals) {
        if (other.id !== proposal.id && other.status === 'Pending') {
          await mockApi.proposals.updateStatus(other.id, 'Rejected');
        }
      }

      // 3. Update project status to In Progress
      await mockApi.projects.update(project.id, { status: 'In Progress' });

      // 4. Create contract
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + Number(proposal.deliveryTime || 14));

      const newContract = await mockApi.contracts.create({
        projectId: project.id,
        clientId: user.id,
        freelancerId: proposal.freelancerId,
        agreedPrice: proposal.bidAmount,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
      });

      setActionSuccess('تم قبول العرض وإنشاء عقد العمل بنجاح! جاري التوجيه إلى صفحة العقد...');
      setTimeout(() => {
        navigate(`/contracts/${newContract.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to accept proposal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Reject a proposal
  const handleRejectProposal = (proposalId) => {
    setConfirmModal({
      isOpen: true,
      title: 'استبعاد العرض',
      message: 'هل تريد استبعاد هذا العرض؟',
      confirmText: 'استبعاد',
      cancelText: 'إلغاء',
      type: 'warning',
      onConfirm: () => performRejectProposal(proposalId)
    });
  };

  const performRejectProposal = async (proposalId) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setProcessingId(proposalId);
    try {
      await mockApi.proposals.updateStatus(proposalId, 'Rejected');
      setActionSuccess('تم رفض العرض.');
      setTimeout(() => setActionSuccess(''), 3000);
      loadData();
    } catch (err) {
      console.error('Failed to reject proposal:', err);
    } finally {
      setProcessingId(null);
    }
  };

  // Open Proposal Modal
  const handleOpenProposalModal = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/projects/${project?.id || id}`);
      return;
    }
    setBidAmount(project?.budget || '');
    setDeliveryTime(7);
    setCoverLetter('');
    setProposalError('');
    setIsProposalModalOpen(true);
  };

  // Submit Proposal
  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setProposalError('');

    const numBid = Number(bidAmount);
    const numDays = Number(deliveryTime);

    if (!numBid || numBid <= 0) {
      setProposalError('يرجى إدخال قيمة عرض صالحة بالجنيه السوداني');
      return;
    }
    if (!numDays || numDays < 1) {
      setProposalError('يرجى تحديد مدة تسليم صالحة (يوم واحد على الأقل)');
      return;
    }
    if (!coverLetter.trim() || coverLetter.trim().length < 20) {
      setProposalError('يرجى كتابة رسالة عرض واضحة ومفصلة لا تقل عن 20 حرفاً');
      return;
    }

    setSubmittingProposal(true);
    try {
      await mockApi.proposals.create({
        projectId: project.id,
        freelancerId: user.id,
        bidAmount: numBid,
        deliveryTime: numDays,
        coverLetter: coverLetter.trim(),
      });
      setIsProposalModalOpen(false);
      setActionSuccess('تم إرسال عرضك بنجاح إلى صاحب المشروع!');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to submit proposal:', err);
      setProposalError(err.message || 'حدث خطأ أثناء إرسال العرض، يرجى المحاولة ثانية');
    } finally {
      setSubmittingProposal(false);
    }
  };

  // Withdraw Proposal
  const handleWithdrawProposal = (proposalId) => {
    setConfirmModal({
      isOpen: true,
      title: 'سحب العرض',
      message: 'هل أنت متأكد من رغبتك في سحب هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.',
      confirmText: 'سحب العرض',
      cancelText: 'إلغاء',
      type: 'danger',
      onConfirm: () => performWithdrawProposal(proposalId)
    });
  };

  const performWithdrawProposal = async (proposalId) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    setWithdrawingId(proposalId);
    try {
      await mockApi.proposals.delete(proposalId);
      setActionSuccess('تم سحب عرضك بنجاح.');
      setTimeout(() => setActionSuccess(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to withdraw proposal:', err);
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) {
    return (
      <div className="project-details-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل تفاصيل المشروع...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-not-found" dir="rtl">
        {isAuthenticated ? <DashboardNavbar /> : <Navbar />}
        <main className="not-found-main">
          <h2>المشروع غير موجود</h2>
          <p>عذراً، لم يتم العثور على المشروع المطلوب أو تم حذفه.</p>
          <Link to="/projects" className="back-btn">العودة لتصفح المشاريع</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const existingFreelancerProposal = proposals.find((p) => p.freelancerId === user?.id);

  return (
    <div className="project-details-page" dir="rtl">
      {isAuthenticated ? <DashboardNavbar /> : <Navbar />}

      <main className="project-details-main">
        <div className="project-details-container">

          {/* Breadcrumb Navigation */}
          <div className="project-breadcrumb">
            <Link to="/projects" className="breadcrumb-link">المشاريع</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{project.title}</span>
          </div>

          {actionSuccess && (
            <div className="action-success-banner" role="alert">
              <FiCheckCircle className="banner-icon" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Main Hero Card */}
          <div className="project-main-card">
            <div className="project-card-header">
              <div>
                <span className="project-cat-pill">
                  <FiTag className="pill-icon" />
                  <span>{categoryName}</span>
                </span>
                <h1 className="project-title">{project.title}</h1>
              </div>

              <div className="budget-box">
                <span className="budget-label">الميزانية المقدرة</span>
                <span className="budget-amount">{Number(project.budget).toLocaleString()} ج.س</span>
              </div>
            </div>

            {/* Quick Meta */}
            <div className="project-meta-strip">
              <span className="meta-strip-item">
                <FiClock className="meta-icon" />
                <span>موعد التسليم: {project.deadline}</span>
              </span>
              <span className="meta-strip-item">
                <FiFileText className="meta-icon" />
                <span>تاريخ النشر: {new Date(project.createdAt).toLocaleDateString('ar-EG')}</span>
              </span>
              <span className="meta-strip-item">
                <FiBriefcase className="meta-icon" />
                <span>الحالة: {project.status === 'Open' ? 'مفتوح لتلقي العروض' : project.status === 'In Progress' ? 'قيد التنفيذ' : project.status}</span>
              </span>
            </div>

            {/* Description Body */}
            <div className="project-body-section">
              <h3 className="section-title">تفاصيل المشروع</h3>
              <p className="project-desc-content">{project.description}</p>
            </div>

            {/* Skills */}
            {project.skills && project.skills.length > 0 && (
              <div className="project-skills-section">
                <h3 className="section-title">المهارات والخبرات المطلوبة</h3>
                <div className="skills-tags-list">
                  {project.skills.map((s) => (
                    <span key={s} className="skill-chip">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {project.attachments && project.attachments.length > 0 && (
              <div className="project-attachments-section">
                <h3 className="section-title">المرفقات</h3>
                <div className="attachments-grid">
                  {project.attachments.map((att) => (
                    <div key={att.name} className="attachment-chip">
                      <FiPaperclip className="paperclip-icon" />
                      <span>{att.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Freelancer Action Area */}
            {!isClientOwner && (
              <div className="freelancer-proposal-cta-box">
                {!isAuthenticated ? (
                  <div className="submit-prompt">
                    <h4>هل أنت مستقل ومستعد لتنفيذ هذا المشروع؟</h4>
                    <p>سجل دخولك أو أنشئ حسابك كمستقل لتقديم عرض مالي وفني على هذا المشروع والتواصل مع صاحب العمل.</p>
                    <Link to={`/login?redirect=/projects/${project.id}`} className="open-proposal-modal-btn link-as-btn">
                      تسجيل الدخول لتقديم عرض
                    </Link>
                  </div>
                ) : user?.role === 'freelancer' ? (
                  existingFreelancerProposal ? (
                    <div className="already-applied-card">
                      <div className="already-applied-header">
                        <div className="notice-title-row">
                          <FiCheckCircle className="notice-icon" />
                          <div>
                            <h4>لقد قدمت عرضاً على هذا المشروع</h4>
                            <span className="applied-date">
                              تاريخ التقديم: {new Date(existingFreelancerProposal.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        </div>
                        <span className={`prop-badge badge-${existingFreelancerProposal.status.toLowerCase()}`}>
                          {existingFreelancerProposal.status === 'Pending' ? 'معلق - قيد المراجعة' : existingFreelancerProposal.status === 'Accepted' ? 'تم قبول عرضك بنجاح' : 'مستبعد'}
                        </span>
                      </div>

                      <div className="applied-details-grid">
                        <div className="applied-detail-item">
                          <span className="detail-label">قيمة عرضك:</span>
                          <strong className="detail-val price">{Number(existingFreelancerProposal.bidAmount).toLocaleString()} ج.س</strong>
                        </div>
                        <div className="applied-detail-item">
                          <span className="detail-label">صافي أرباحك المقدرة (90%):</span>
                          <strong className="detail-val net">{Number(calculateFreelancerNet(existingFreelancerProposal.bidAmount)).toLocaleString()} ج.س</strong>
                        </div>
                        <div className="applied-detail-item">
                          <span className="detail-label">مدة التسليم:</span>
                          <strong className="detail-val">{existingFreelancerProposal.deliveryTime} يوم</strong>
                        </div>
                      </div>

                      <div className="applied-letter-box">
                        <h5>خطاب التقديم الخاص بك:</h5>
                        <p>{existingFreelancerProposal.coverLetter}</p>
                      </div>

                      {existingFreelancerProposal.status === 'Pending' && project.status === 'Open' && (
                        <div className="proposal-withdraw-strip">
                          <button
                            type="button"
                            className="withdraw-proposal-btn"
                            disabled={withdrawingId === existingFreelancerProposal.id}
                            onClick={() => handleWithdrawProposal(existingFreelancerProposal.id)}
                          >
                            <FiTrash2 />
                            <span>{withdrawingId === existingFreelancerProposal.id ? 'جارٍ سحب العرض...' : 'سحب العرض وإلغاؤه'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : project.status === 'Open' ? (
                    <div className="submit-prompt">
                      <h4>هل أنت جاهز لتنفيذ هذا المشروع؟</h4>
                      <p>قدم عرضك المالي وحدد مدة التنفيذ ووضح مهاراتك لبدء العمل فور موافقة العميل.</p>
                      <button
                        type="button"
                        className="open-proposal-modal-btn"
                        onClick={handleOpenProposalModal}
                      >
                        تقديم عرض الآن
                      </button>
                    </div>
                  ) : (
                    <div className="project-closed-notice">
                      <FiInfo className="notice-info-icon" />
                      <span>هذا المشروع مغلق لتلقي العروض حالياً ({project.status === 'In Progress' ? 'قيد التنفيذ' : project.status}).</span>
                    </div>
                  )
                ) : null}
              </div>
            )}
          </div>

          {/* Proposals Section (for Client Owner) */}
          {isClientOwner && (
            <div className="proposals-management-section">
              <div className="proposals-section-header">
                <h2>العروض المقدمة على هذا المشروع ({proposals.length})</h2>
                <p>قارن بين خبرات المستقلين وقيم العروض، واختر الأنسب لبدء العمل فوراً.</p>
              </div>

              {proposals.length === 0 ? (
                <div className="no-proposals-card">
                  <FiAlertCircle className="empty-icon" />
                  <h3>لم يتم تقديم عروض بعد</h3>
                  <p>تم نشر مشروعك بنجاح وسيبدأ المستقلون المؤهلون في إرسال عروضهم قريباً.</p>
                </div>
              ) : (
                <div className="proposals-cards-list">
                  {proposals.map((prop) => {
                    const fl = freelancerProfilesMap[prop.freelancerId] || {
                      name: 'مستقل',
                      photo: defaultAvatar,
                      rating: 5.0,
                      title: 'مستقل',
                    };

                    return (
                      <div key={prop.id} className={`proposal-item-card status-${prop.status.toLowerCase()}`}>
                        
                        {/* Freelancer Header */}
                        <div className="proposal-fl-header">
                          <div className="fl-user-info">
                            <img src={fl.photo} alt={fl.name} className="fl-avatar" />
                            <div>
                              <Link to={`/freelancers/${prop.freelancerId}`} className="fl-name-link">
                                {fl.name}
                              </Link>
                              <p className="fl-title-text">{fl.title}</p>
                              <div className="fl-rating-row">
                                <FiStar className="star-icon" />
                                <span>{Number(fl.rating).toFixed(1)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="proposal-terms-box">
                            <div className="term-item">
                              <span className="term-label">قيمة العرض:</span>
                              <strong className="term-value price">{Number(prop.bidAmount).toLocaleString()} ج.س</strong>
                            </div>
                            <div className="term-item">
                              <span className="term-label">مدة التسليم:</span>
                              <strong className="term-value">{prop.deliveryTime} يوم</strong>
                            </div>
                            <div className="term-item">
                              <span className="term-label">الحالة:</span>
                              <span className={`prop-badge badge-${prop.status.toLowerCase()}`}>
                                {prop.status === 'Pending' ? 'معلق' : prop.status === 'Accepted' ? 'تم القبول' : 'مرفوض'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cover Letter */}
                        <div className="proposal-letter-body">
                          <h4 className="letter-heading">رسالة العرض:</h4>
                          <p className="letter-text">{prop.coverLetter}</p>
                        </div>

                        {/* Client Actions */}
                        {prop.status === 'Pending' && project.status === 'Open' && (
                          <div className="proposal-actions-strip">
                            <button
                              type="button"
                              className="accept-proposal-btn"
                              disabled={processingId === prop.id}
                              onClick={() => handleAcceptProposal(prop)}
                            >
                              <FiCheckCircle />
                              <span>قبول العرض وبدء العقد</span>
                            </button>

                            <button
                              type="button"
                              className="reject-proposal-btn"
                              disabled={processingId === prop.id}
                              onClick={() => handleRejectProposal(prop.id)}
                            >
                              <FiXCircle />
                              <span>استبعاد</span>
                            </button>
                          </div>
                        )}

                        {prop.status === 'Accepted' && (
                          <div className="accepted-contract-notice">
                            <FiCheckCircle className="notice-icon" />
                            <span>تم قبول هذا العرض وتحويله إلى عقد عمل رسمي.</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Proposal Submission Modal */}
      {isProposalModalOpen && (
        <div className="proposal-modal-backdrop" onClick={() => !submittingProposal && setIsProposalModalOpen(false)}>
          <div className="proposal-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">تقديم عرض على المشروع</h3>
                <p className="modal-subtitle">{project.title}</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsProposalModalOpen(false)}
                disabled={submittingProposal}
                aria-label="إغلاق"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="proposal-modal-form">
              <div className="modal-project-meta-box">
                <span className="meta-item">
                  الميزانية المقدرة: <strong>{Number(project.budget).toLocaleString()} ج.س</strong>
                </span>
                <span className="meta-item">
                  موعد التسليم المطلوب: <strong>{project.deadline}</strong>
                </span>
              </div>

              {proposalError && (
                <div className="modal-error-alert" role="alert">
                  <FiAlertCircle />
                  <span>{proposalError}</span>
                </div>
              )}

              <div className="form-group-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="proposal-bid">
                    قيمة عرضك (بالجنيه السوداني) <span className="required">*</span>
                  </label>
                  <div className="input-with-affix">
                    <input
                      id="proposal-bid"
                      type="number"
                      min="1000"
                      step="1000"
                      className="modal-input"
                      placeholder="مثال: 150000"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                    />
                    <span className="affix">ج.س</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="proposal-delivery">
                    مدة التسليم (بالأيام) <span className="required">*</span>
                  </label>
                  <div className="input-with-affix">
                    <input
                      id="proposal-delivery"
                      type="number"
                      min="1"
                      max="365"
                      className="modal-input"
                      placeholder="مثال: 7"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      required
                    />
                    <span className="affix">أيام</span>
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Calculator */}
              {Number(bidAmount) > 0 && (
                <div className="fee-calculator-box">
                  <div className="calc-row">
                    <span className="calc-label">قيمة العرض الإجمالية:</span>
                    <span className="calc-value">{Number(bidAmount).toLocaleString()} ج.س</span>
                  </div>
                  <div className="calc-row fee">
                    <span className="calc-label">رسوم خدمة المنصة (10%):</span>
                    <span className="calc-value">-{Number(calculatePlatformFee(bidAmount)).toLocaleString()} ج.س</span>
                  </div>
                  <div className="calc-row net">
                    <span className="calc-label">المبلغ الصافي المستلم (90%):</span>
                    <span className="calc-value highlight">{Number(calculateFreelancerNet(bidAmount)).toLocaleString()} ج.س</span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <div className="label-with-hint">
                  <label className="form-label" htmlFor="proposal-letter">
                    رسالة العرض وخطاب التقديم <span className="required">*</span>
                  </label>
                  <span className="char-count-hint">
                    {coverLetter.trim().length} حرف (الأدنى 20)
                  </span>
                </div>
                <textarea
                  id="proposal-letter"
                  rows="6"
                  className="modal-textarea"
                  placeholder="اشرح للعميل لماذا أنت المستقل الأنسب لإنجاز هذا المشروع، خطتك العملية، وأي نماذج أعمال ذات صلة قمت بتنفيذها..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-footer">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submittingProposal}
                >
                  <FiSend />
                  <span>{submittingProposal ? 'جارٍ إرسال العرض...' : 'تأكيد وإرسال العرض'}</span>
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  disabled={submittingProposal}
                  onClick={() => setIsProposalModalOpen(false)}
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

export default ProjectDetails;
