import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './PostProject.css';
import Navbar from '../../components/Navbar';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import useLoader from '../../hooks/useLoader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import {
  saveProjectDraft,
  getProjectDraft,
  clearProjectDraft,
  hasProjectDraft,
} from '../../utils/projectDraft';
import {
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiPaperclip,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiPlus,
  FiX,
  FiLogIn,
  FiUserPlus,
  FiBriefcase,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';

const PostProject = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editProjectId } = useParams();
  const isEditing = Boolean(editProjectId);

  const initialDraft = !isEditing ? getProjectDraft() : null;

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState(null);
  const [loadingProject, setLoadingProject] = useState(isEditing);
  const [projectError, setProjectError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const submittingRef = useRef(false);

  // Form State (initialized from draft if available)
  const [title, setTitle] = useState(() => initialDraft?.title || '');
  const [categoryId, setCategoryId] = useState(() => initialDraft?.categoryId || '');
  const [skills, setSkills] = useState(() => initialDraft?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  const [description, setDescription] = useState(() => initialDraft?.description || '');
  const [budget, setBudget] = useState(() => (initialDraft?.budget != null ? String(initialDraft.budget) : ''));
  const [deadline, setDeadline] = useState(() => initialDraft?.deadline || '');
  const [attachments, setAttachments] = useState([]);

  const [errors, setErrors] = useState({});

  // Auto-save draft on changes for guests
  useEffect(() => {
    if (isEditing) return;
    if (!user || user.role === 'client') {
      if (title || description || categoryId || budget || deadline || skills.length > 0) {
        saveProjectDraft({
          title,
          categoryId,
          skills,
          description,
          budget,
          deadline,
        });
      }
    }
  }, [title, categoryId, skills, description, budget, deadline, isEditing, user]);

  const fetchCats = async () => {
    try {
      const list = await api.taxonomy.categories();
      setCategories(list);
      if (!isEditing) {
        const draft = getProjectDraft();
        setCategoryId((current) => current || draft?.categoryId || list[0]?.id || '');
      }
      setCatsError(null);
    } catch (err) {
      setCatsError(err);
    } finally {
      setLoadingCats(false);
    }
  };

  useLoader(fetchCats, []);

  // Earliest allowed deadline is tomorrow
  const [minDeadline] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  // Auto-submit flow for client returning after login/registration
  useEffect(() => {
    if (isEditing) return;
    const searchParams = new URLSearchParams(location.search);
    const isAutoSubmit = searchParams.get('autoSubmit') === 'true';

    if (user && user.role === 'client' && isAutoSubmit && !submittingRef.current) {
      const draft = getProjectDraft();
      const projectTitle = draft?.title || title;
      const projectDesc = draft?.description || description;
      const projectCat = draft?.categoryId || categoryId;
      const projectBudget = draft?.budget || budget;
      const projectDeadline = draft?.deadline || deadline;
      const projectSkills = draft?.skills || skills;

      if (projectTitle && projectDesc && projectCat && projectBudget && projectDeadline) {
        submittingRef.current = true;
        setAutoSubmitting(true);
        setSubmitError('');

        const payload = {
          title: projectTitle.trim(),
          description: projectDesc.trim(),
          categoryId: projectCat,
          budget: Number(projectBudget),
          deadline: projectDeadline.includes('T') ? projectDeadline : new Date(`${projectDeadline}T23:59:59`).toISOString(),
          skills: projectSkills,
          attachmentIds: [],
        };

        api.projects.create(payload)
          .then(() => {
            clearProjectDraft();
            navigate('/client/projects', {
              replace: true,
              state: { projectSuccessMessage: 'تم استلام مشروعك بنجاح ونشره على منصة سوداوورك!' }
            });
          })
          .catch((err) => {
            submittingRef.current = false;
            setAutoSubmitting(false);
            setSubmitError(err.message || 'تعذر إرسال المشروع تلقائياً، يرجى المراجعة والضغط على نشر.');
            setStep(3);
          });
      }
    }
  }, [user, location.search, isEditing, title, description, categoryId, budget, deadline, skills, navigate]);

  // Fetch existing project if in edit mode
  useEffect(() => {
    if (!editProjectId) return;
    let active = true;
    api.projects.get(editProjectId)
      .then((proj) => {
        if (!active) return;
        if (user && proj.clientId && proj.clientId !== user.id && user.role !== 'admin') {
          setProjectError(new Error('ليس لديك صلاحية لتعديل هذا المشروع.'));
          return;
        }
        setTitle(proj.title || '');
        setCategoryId(proj.categoryId || '');
        setSkills(proj.skills || []);
        setDescription(proj.description || '');
        setBudget(proj.budget != null ? String(proj.budget) : '');
        setDeadline(proj.deadline ? proj.deadline.slice(0, 10) : '');
        if (proj.attachments && proj.attachments.length > 0) {
          setAttachments(
            proj.attachments.map((att) => ({
              key: String(att.id),
              name: att.name,
              size: att.size || '',
              status: 'done',
              upload: att,
            }))
          );
        }
      })
      .catch((err) => {
        if (active) setProjectError(err);
      })
      .finally(() => {
        if (active) setLoadingProject(false);
      });

    return () => { active = false; };
  }, [editProjectId, user]);

  useEffect(() => {
    api.taxonomy.skills().then((list) => setSkillSuggestions(list.map((s) => s.name)), () => {});
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Files upload as soon as they are picked (authenticated clients only)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, Math.max(0, 10 - attachments.length));
    e.target.value = '';
    files.forEach((file) => {
      const key = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      const item = { key, name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`, status: 'uploading', progress: 0 };
      if (file.size > 50 * 1024 * 1024) {
        setAttachments((prev) => [...prev, { ...item, status: 'error', error: 'حجم الملف يتجاوز 50 ميجابايت' }]);
        return;
      }
      setAttachments((prev) => [...prev, item]);
      api.uploads
        .upload(file, {
          purpose: 'project',
          onProgress: (progress) => setAttachments((prev) => prev.map((a) => (a.key === key ? { ...a, progress } : a))),
        })
        .then(
          (upload) => setAttachments((prev) => prev.map((a) => (a.key === key ? { ...a, status: 'done', upload } : a))),
          (err) => setAttachments((prev) => prev.map((a) => (a.key === key ? { ...a, status: 'error', error: err.message } : a)))
        );
    });
  };

  const handleRemoveAttachment = (key) => {
    setAttachments(attachments.filter((a) => a.key !== key));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!title.trim() || title.trim().length < 8) {
      errs.title = 'يرجى إدخال عنوان واضح للمشروع (8 أحرف على الأقل)';
    }
    if (!categoryId) {
      errs.categoryId = 'يرجى اختيار التخصص الأنسب للمشروع';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!description.trim() || description.trim().length < 30) {
      errs.description = 'يرجى كتابة تفاصيل وافية لمتطلبات مشروعك (30 حرف على الأقل)';
    }
    if (!budget || Number(budget) <= 0) {
      errs.budget = 'يرجى تحديد ميزانية تقديرية مناسبة للمشروع';
    }
    if (!deadline) {
      errs.deadline = 'يرجى تحديد موعد أقصى لتسليم المشروع';
    } else if (deadline < minDeadline) {
      errs.deadline = 'يجب أن يكون موعد التسليم في المستقبل';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  // If user is guest, step 3 button saves draft and advances to step 4 (Auth screen)
  const handleProceedFromStep3 = () => {
    if (!validateStep1() || !validateStep2()) {
      return;
    }

    if (!user) {
      saveProjectDraft({
        title: title.trim(),
        categoryId,
        skills,
        description: description.trim(),
        budget: Number(budget),
        deadline,
      });
      setStep(4);
    } else {
      handlePublish();
    }
  };

  const handlePublish = async () => {
    if (!user?.id || attachments.some((a) => a.status === 'uploading') || submitting || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        budget: Number(budget),
        deadline: deadline.includes('T') ? deadline : new Date(`${deadline}T23:59:59`).toISOString(),
        skills,
        attachmentIds: attachments.filter((a) => a.upload).map((a) => a.upload.id),
      };

      const result = isEditing
        ? await api.projects.update(editProjectId, payload)
        : await api.projects.create(payload);

      clearProjectDraft();

      navigate('/client/projects', {
        replace: true,
        state: {
          projectSuccessMessage: isEditing
            ? 'تم حفظ تعديلات المشروع بنجاح!'
            : 'تم استلام مشروعك بنجاح ونشره على منصة سوداوورك!'
        }
      });
    } catch (err) {
      submittingRef.current = false;
      const fieldErrors = err.fieldErrors || {};
      if (fieldErrors.title || fieldErrors.categoryId) setStep(1);
      else if (fieldErrors.description || fieldErrors.budget || fieldErrors.deadline) setStep(2);
      setSubmitError(err.message || (isEditing ? 'تعذر حفظ تعديلات المشروع، يرجى المحاولة ثانية.' : 'تعذر نشر المشروع، يرجى المحاولة ثانية.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id === categoryId);

  // Freelancer guard: show clear explanation with account switch option
  if (user && user.role === 'freelancer') {
    return (
      <div className="post-project-page" dir="rtl">
        <DashboardNavbar />
        <main className="post-project-main" style={{ maxWidth: '640px', margin: '48px auto', padding: '0 20px' }}>
          <div className="freelancer-warning-card">
            <div className="warning-icon-badge">
              <FiBriefcase />
            </div>
            <h2 className="warning-title">نشر المشاريع مخصص لأصحاب الأعمال</h2>
            <p className="warning-desc">
              أنت مسجل حالياً بحساب مستقل (Freelancer). نشر المشاريع واستقبال العروض ميزة مخصصة لحسابات أصحاب الأعمال (العملاء) فقط.
            </p>
            <div className="warning-actions">
              <button
                type="button"
                className="switch-account-btn"
                onClick={async () => {
                  await logout();
                  navigate('/login?role=client&redirect=/post-project?autoSubmit=true');
                }}
              >
                تسجيل الخروج والتبديل لحساب صاحب عمل
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/freelancer-dashboard')}
              >
                العودة للوحة تحكم المستقل
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Auto-submitting state screen
  if (autoSubmitting) {
    return (
      <div className="post-project-page" dir="rtl">
        <DashboardNavbar />
        <main className="post-project-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', gap: '20px', textAlign: 'center', padding: '40px 20px' }}>
          <div className="profile-spinner" />
          <h2 style={{ color: '#004D34', fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>جارٍ نشر مشروعك تلقائياً...</h2>
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0 }}>لحظات وسننقلك إلى لوحة إدارة مشاريعك.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loadingProject) {
    return (
      <div className="post-project-page" dir="rtl">
        {user ? <DashboardNavbar /> : <Navbar />}
        <main className="post-project-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', gap: '16px' }}>
          <div className="profile-spinner" />
          <p style={{ color: '#64748b', fontSize: '1rem' }}>جارٍ تحميل بيانات المشروع للتعديل...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="post-project-page" dir="rtl">
        {user ? <DashboardNavbar /> : <Navbar />}
        <main className="post-project-main" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          <ErrorState title="تعذر تحميل المشروع" error={projectError} onRetry={() => navigate('/client/projects')} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="post-project-page" dir="rtl">
      {user ? <DashboardNavbar /> : <Navbar />}

      <main className="post-project-main">
        <div className="post-project-container">

          {/* Top High-level Guest Flow Progress Bar */}
          {!user && (
            <div className="guest-flow-banner" role="navigation" aria-label="خطوات نشر المشروع">
              <div className={`flow-bar-step ${step <= 3 ? 'active' : 'completed'}`}>
                <span className="flow-bar-circle">{step > 3 ? <FiCheck /> : '1'}</span>
                <span className="flow-bar-label">الخطوة 1 من 2: تفاصيل المشروع</span>
              </div>
              <div className={`flow-bar-divider ${step === 4 ? 'active' : ''}`} />
              <div className={`flow-bar-step ${step === 4 ? 'active' : ''}`}>
                <span className="flow-bar-circle">2</span>
                <span className="flow-bar-label">الخطوة 2 من 2: الحساب</span>
              </div>
            </div>
          )}

          {/* Stepper Header (Sub-steps 1-3) */}
          {step <= 3 && (
            <div className="wizard-stepper">
              <div className={`step-node ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
                <div className="step-circle">{step > 1 ? <FiCheck /> : '1'}</div>
                <span className="step-label">العنوان والتصنيف</span>
              </div>
              <div className={`step-connector ${step >= 2 ? 'active' : ''}`} />
              <div className={`step-node ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
                <div className="step-circle">{step > 2 ? <FiCheck /> : '2'}</div>
                <span className="step-label">التفاصيل والميزانية</span>
              </div>
              <div className={`step-connector ${step >= 3 ? 'active' : ''}`} />
              <div className={`step-node ${step === 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <span className="step-label">{isEditing ? 'مراجعة وتعديل' : 'مراجعة ونشر'}</span>
              </div>
            </div>
          )}

          <div className="wizard-card">
            
            {/* STEP 1: Title & Category */}
            {step === 1 && (
              <div className="wizard-step-content">
                <h2 className="wizard-heading">اختر عنواناً مناسباً وتصنيفاً لمشروعك</h2>
                <p className="wizard-subheading">
                  العنوان الواضح والدقيق يجذب أفضل المستقلين ذوي الخبرة التخصصية.
                </p>

                <div className="form-group">
                  <label className="form-label">عنوان المشروع *</label>
                  <input
                    type="text"
                    className={`form-input ${errors.title ? 'has-error' : ''}`}
                    placeholder="مثال: تصميم تطبيق جوال لحجز رحلات باللغتين العربية والإنجليزية"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
                    }}
                  />
                  {errors.title && <span className="form-field-error">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">تصنيف المشروع *</label>
                  {loadingCats ? (
                    <p>جارٍ تحميل التصنيفات...</p>
                  ) : catsError ? (
                    <ErrorState title="تعذر تحميل التصنيفات" error={catsError} onRetry={() => { setLoadingCats(true); fetchCats(); }} />
                  ) : categories.length === 0 ? (
                    <p>لا توجد تصنيفات متاحة حالياً. يرجى التواصل مع إدارة المنصة.</p>
                  ) : (
                    <div className="categories-selection-grid">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={`category-select-pill ${categoryId === cat.id ? 'selected' : ''}`}
                          onClick={() => {
                            setCategoryId(cat.id);
                            if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: null }));
                          }}
                        >
                          <FiTag className="cat-icon" />
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.categoryId && <span className="form-field-error">{errors.categoryId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">المهارات المطلوبة (اختياري)</label>
                  <div className="skill-input-row">
                    <input
                      type="text"
                      className="form-input"
                      placeholder="أدخل مهارة، مثلاً: Flutter, UI Design, Photoshop"
                      list="project-skill-suggestions"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                    />
                    <datalist id="project-skill-suggestions">
                      {skillSuggestions.map((name) => <option key={name} value={name} />)}
                    </datalist>
                    <button type="button" className="add-btn" onClick={handleAddSkill}>
                      <FiPlus /> إضافة
                    </button>
                  </div>
                  <div className="skills-tags-wrap">
                    {skills.map((s) => (
                      <span key={s} className="skill-tag">
                        <span>{s}</span>
                        <button type="button" onClick={() => handleRemoveSkill(s)}><FiX /></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="wizard-actions">
                  <button type="button" className="wizard-next-btn" onClick={handleNext}>
                    <span>المتابعة للتفاصيل</span>
                    <FiArrowLeft />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Description, Budget & Deadline */}
            {step === 2 && (
              <div className="wizard-step-content">
                <h2 className="wizard-heading">اشرح متطلبات المشروع والميزانية المقدرة</h2>
                <p className="wizard-subheading">
                  وضّح كافة المواصفات والمهام المطلوبة لتستلم عروض أسعار دقيقة من المستقلين.
                </p>

                <div className="form-group">
                  <label className="form-label">تفاصيل ومتطلبات المشروع *</label>
                  <textarea
                    rows="6"
                    className={`form-textarea ${errors.description ? 'has-error' : ''}`}
                    placeholder="اشرح بوضوح: أهداف المشروع، المخرجات المتوقعة، الشاشات أو الصفحات، وأي اشتراطات خاصة..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
                    }}
                  />
                  {errors.description && <span className="form-field-error">{errors.description}</span>}
                </div>

                <div className="form-grid-two">
                  <div className="form-group">
                    <label className="form-label">
                      <FiDollarSign className="field-icon" />
                      <span>الميزانية المقدرة (بالجنيه السوداني ج.س) *</span>
                    </label>
                    <input
                      type="number"
                      className={`form-input ${errors.budget ? 'has-error' : ''}`}
                      placeholder="مثال: 350000"
                      value={budget}
                      onChange={(e) => {
                        setBudget(e.target.value);
                        if (errors.budget) setErrors((prev) => ({ ...prev, budget: null }));
                      }}
                    />
                    {errors.budget && <span className="form-field-error">{errors.budget}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <FiCalendar className="field-icon" />
                      <span>الموعد النهائي المتوقع للتسليم *</span>
                    </label>
                    <input
                      type="date"
                      min={minDeadline}
                      className={`form-input ${errors.deadline ? 'has-error' : ''}`}
                      value={deadline}
                      onChange={(e) => {
                        setDeadline(e.target.value);
                        if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: null }));
                      }}
                    />
                    {errors.deadline && <span className="form-field-error">{errors.deadline}</span>}
                  </div>
                </div>

                {/* Attachments */}
                <div className="form-group">
                  <label className="form-label">
                    <FiPaperclip className="field-icon" />
                    <span>مرفقات توضيحية (نماذج، ملفات PDF، ملفات مضغوطة)</span>
                  </label>

                  {user ? (
                    <>
                      <div className="file-upload-box">
                        <input
                          type="file"
                          id="project-files"
                          multiple
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="project-files" className="file-upload-label">
                          <FiPaperclip className="upload-icon" />
                          <span>انقر لرفع ملفات أو سحبها إلى هنا</span>
                        </label>
                      </div>
                      {attachments.length > 0 && (
                        <ul className="attachments-list">
                          {attachments.map((att) => (
                            <li key={att.key} className="attachment-item">
                              <span>
                                {att.name} ({att.size})
                                {att.status === 'uploading' && ` — جارٍ الرفع ${att.progress}%`}
                                {att.status === 'error' && ` — ${att.error}`}
                              </span>
                              {att.status !== 'uploading' && (
                                <button type="button" onClick={() => handleRemoveAttachment(att.key)} aria-label="إزالة"><FiX /></button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <div className="guest-attachment-notice">
                      <FiInfo className="notice-icon" />
                      <div className="notice-content">
                        <strong>إرفاق الملفات والمستندات</strong>
                        <p>
                          لحماية أمان بياناتك، يمكنك إرفاق الملفات والمستندات التوضيحية فور تسجيل الدخول أو إضافتها لاحقاً في أي وقت بعد النشر من صفحة إدارة المشروع.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="wizard-actions-between">
                  <button type="button" className="wizard-back-btn" onClick={() => setStep(1)}>
                    <FiArrowRight />
                    <span>رجوع</span>
                  </button>
                  <button type="button" className="wizard-next-btn" onClick={handleNext}>
                    <span>مراجعة المشروع</span>
                    <FiArrowLeft />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <div className="wizard-step-content">
                <h2 className="wizard-heading">مراجعة تفاصيل المشروع قبل النشر</h2>
                <p className="wizard-subheading">
                  {isEditing
                    ? 'راجع التفاصيل أدناه. تعديل العنوان أو الوصف أو التصنيف أو المهارات أو المرفقات يعيد المشروع لمراجعة الإدارة قبل ظهوره مجدداً، أما الميزانية والموعد فلا.'
                    : 'راجع التفاصيل أدناه. يُرسل المشروع لمراجعة الإدارة، وفور الموافقة عليه سيظهر للمستقلين ليبدأوا في تقديم عروضهم.'}
                </p>

                <div className="review-summary-card">
                  <div className="review-row">
                    <span className="review-lbl">عنوان المشروع:</span>
                    <strong className="review-val title-val">{title}</strong>
                  </div>

                  <div className="review-row">
                    <span className="review-lbl">التصنيف:</span>
                    <span className="review-pill">{selectedCatObj?.name || 'عام'}</span>
                  </div>

                  {skills.length > 0 && (
                    <div className="review-row">
                      <span className="review-lbl">المهارات:</span>
                      <div className="review-skills-wrap">
                        {skills.map((s) => (
                          <span key={s} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="review-row">
                    <span className="review-lbl">الميزانية المقدرة:</span>
                    <strong className="review-val budget-highlight">
                      {Number(budget).toLocaleString()} ج.س
                    </strong>
                  </div>

                  <div className="review-row">
                    <span className="review-lbl">الموعد النهائي:</span>
                    <span className="review-val">{deadline}</span>
                  </div>

                  <div className="review-row description-row">
                    <span className="review-lbl">الوصف:</span>
                    <p className="review-desc-text">{description}</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="review-row">
                      <span className="review-lbl">المرفقات ({attachments.length}):</span>
                      <span className="review-val">{attachments.filter((a) => a.upload).map((a) => a.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="guarantee-notice-box">
                  <h4>حماية وضمان سوداوورك للأموال:</h4>
                  <p>
                    نشر المشروع مجاني بالكامل. لن تدفع أي مبالغ إلا عند قبول عرض المستقل، وتبقى أموالك محفوظة في الضمان ولا يتم تسليمها للمستقل إلا بعد فحصك للعمل وقبوله.
                  </p>
                </div>

                {submitError && (
                  <div className="form-field-error" role="alert" style={{ display: 'block', marginBottom: 16 }}>
                    {submitError}
                  </div>
                )}
                <div className="wizard-actions-between">
                  <button type="button" className="wizard-back-btn" onClick={() => setStep(2)}>
                    <FiArrowRight />
                    <span>تعديل التفاصيل</span>
                  </button>
                  <button
                    type="button"
                    className="wizard-publish-btn"
                    onClick={handleProceedFromStep3}
                    disabled={submitting || attachments.some((a) => a.status === 'uploading')}
                  >
                    {!user ? (
                      <>
                        <span>المتابعة لتأكيد الحساب ونشر المشروع</span>
                        <FiArrowLeft />
                      </>
                    ) : submitting ? (
                      isEditing ? 'جارٍ حفظ التعديلات...' : 'جارٍ إرسال المشروع...'
                    ) : (
                      isEditing ? 'حفظ تعديلات المشروع' : 'إرسال المشروع للمراجعة'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Auth Screen for Guests */}
            {step === 4 && !user && (
              <div className="wizard-step-content auth-step-container">
                <div className="auth-step-header">
                  <div className="auth-step-badge-icon">
                    <FiCheckCircle />
                  </div>
                  <h2 className="wizard-heading">سجّل دخولك لنشر مشروعك</h2>
                  <p className="wizard-subheading">
                    مشروعك جاهز ومحفوظ كمسودة آمنة! سجّل دخولك بحسابك أو أنشئ حساب صاحب عمل جديد لنشره فوراً.
                  </p>
                </div>

                <div className="auth-choice-grid">
                  {/* Card 1: Existing account */}
                  <div className="auth-choice-card">
                    <div className="choice-icon-wrap login-icon-wrap">
                      <FiLogIn />
                    </div>
                    <h3 className="choice-title">لدي حساب بالفعل</h3>
                    <p className="choice-description">
                      سجّل دخولك بحساب صاحب العمل ليتم ربط مسودة المشروع بحسابك ونشرها للمراجعة مباشرة.
                    </p>
                    <button
                      type="button"
                      className="auth-action-btn login-choice-btn"
                      onClick={() => {
                        saveProjectDraft({
                          title: title.trim(),
                          categoryId,
                          skills,
                          description: description.trim(),
                          budget: Number(budget),
                          deadline,
                        });
                        navigate('/login?role=client&redirect=/post-project?autoSubmit=true');
                      }}
                    >
                      <span>تسجيل الدخول ومتابعة النشر</span>
                      <FiArrowLeft />
                    </button>
                  </div>

                  {/* Card 2: New account (client) */}
                  <div className="auth-choice-card featured">
                    <div className="choice-badge">موصى به للمستخدمين الجدد</div>
                    <div className="choice-icon-wrap register-icon-wrap">
                      <FiUserPlus />
                    </div>
                    <h3 className="choice-title">إنشاء حساب صاحب عمل</h3>
                    <p className="choice-description">
                      أنشئ حساباً جديداً كصاحب عمل في ثوانٍ، وسيتم نشر مشروعك تلقائياً وبدء استقبال عروض المستقلين.
                    </p>
                    <button
                      type="button"
                      className="auth-action-btn register-choice-btn"
                      onClick={() => {
                        saveProjectDraft({
                          title: title.trim(),
                          categoryId,
                          skills,
                          description: description.trim(),
                          budget: Number(budget),
                          deadline,
                        });
                        navigate('/register/client?redirect=/post-project?autoSubmit=true');
                      }}
                    >
                      <span>إنشاء الحساب ونشر المشروع</span>
                      <FiArrowLeft />
                    </button>
                  </div>
                </div>

                <div className="wizard-actions-between" style={{ marginTop: '32px' }}>
                  <button type="button" className="wizard-back-btn" onClick={() => setStep(3)}>
                    <FiArrowRight />
                    <span>رجوع لمراجعة المشروع</span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostProject;
