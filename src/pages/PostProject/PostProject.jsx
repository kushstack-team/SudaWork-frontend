import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PostProject.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import useLoader from '../../hooks/useLoader';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import {
  FiCheck,
  FiArrowLeft,
  FiArrowRight,
  FiPaperclip,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiPlus,
  FiX
} from 'react-icons/fi';

const PostProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: editProjectId } = useParams();
  const isEditing = Boolean(editProjectId);

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [catsError, setCatsError] = useState(null);
  const [loadingProject, setLoadingProject] = useState(isEditing);
  const [projectError, setProjectError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachments, setAttachments] = useState([]);

  const [errors, setErrors] = useState({});

  const fetchCats = async () => {
    try {
      const list = await api.taxonomy.categories();
      setCategories(list);
      if (!isEditing) {
        setCategoryId((current) => current || list[0]?.id || '');
      }
      setCatsError(null);
    } catch (err) {
      setCatsError(err);
    } finally {
      setLoadingCats(false);
    }
  };

  useLoader(fetchCats, []);

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

  // Earliest allowed deadline is tomorrow (the API rejects past dates).
  const [minDeadline] = useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10));

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

  // Files upload as soon as they are picked; publishing sends their ids.
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

  const handlePublish = async () => {
    if (!user?.id || attachments.some((a) => a.status === 'uploading')) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        budget: Number(budget),
        // End of the chosen day, so "today + N" is never already in the past.
        deadline: deadline.includes('T') ? deadline : new Date(`${deadline}T23:59:59`).toISOString(),
        skills,
        attachmentIds: attachments.filter((a) => a.upload).map((a) => a.upload.id),
      };

      const result = isEditing
        ? await api.projects.update(editProjectId, payload)
        : await api.projects.create(payload);

      navigate(`/projects/${result.id}`);
    } catch (err) {
      // Keep every entered value; point the user at the step with the problem.
      const fieldErrors = err.fieldErrors || {};
      if (fieldErrors.title || fieldErrors.categoryId) setStep(1);
      else if (fieldErrors.description || fieldErrors.budget || fieldErrors.deadline) setStep(2);
      setSubmitError(err.message || (isEditing ? 'تعذر حفظ تعديلات المشروع، يرجى المحاولة ثانية.' : 'تعذر نشر المشروع، يرجى المحاولة ثانية.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id === categoryId);

  if (loadingProject) {
    return (
      <div className="post-project-page" dir="rtl">
        <DashboardNavbar />
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
        <DashboardNavbar />
        <main className="post-project-main" style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
          <ErrorState title="تعذر تحميل المشروع" error={projectError} onRetry={() => navigate('/client/projects')} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="post-project-page" dir="rtl">
      <DashboardNavbar />

      <main className="post-project-main">
        <div className="post-project-container">

          {/* Stepper Header */}
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

            {/* STEP 3: Review & Publish */}
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
                    onClick={handlePublish}
                    disabled={submitting || attachments.some((a) => a.status === 'uploading')}
                  >
                    {submitting
                      ? (isEditing ? 'جارٍ حفظ التعديلات...' : 'جارٍ إرسال المشروع...')
                      : (isEditing ? 'حفظ تعديلات المشروع' : 'إرسال المشروع للمراجعة')}
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
