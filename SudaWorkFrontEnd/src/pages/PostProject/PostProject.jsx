import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostProject.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { 
  FiCheck, 
  FiArrowLeft, 
  FiArrowRight, 
  FiPaperclip, 
  FiDollarSign, 
  FiCalendar, 
  FiTag, 
  FiFileText,
  FiPlus,
  FiX
} from 'react-icons/fi';

const PostProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await mockApi.categories.getAll();
        setCategories(list);
        if (list.length > 0) setCategoryId(list[0].id);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
    }));
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleRemoveAttachment = (name) => {
    setAttachments(attachments.filter((a) => a.name !== name));
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
    if (!user?.id) return;
    setSubmitting(true);

    try {
      const created = await mockApi.projects.create({
        clientId: user.id,
        title: title.trim(),
        description: description.trim(),
        categoryId,
        budget: Number(budget),
        deadline,
        skills,
        attachments,
      });

      navigate(`/projects/${created.id}`);
    } catch (err) {
      console.error('Failed to publish project:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCatObj = categories.find((c) => c.id === categoryId);

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
              <span className="step-label">مراجعة ونشر</span>
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
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                    />
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
                        <li key={att.name} className="attachment-item">
                          <span>{att.name} ({att.size})</span>
                          <button type="button" onClick={() => handleRemoveAttachment(att.name)}><FiX /></button>
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
                  راجع التفاصيل أدناه، وفور نشر المشروع سيبدأ المستقلون في تقديم عروضهم فوراً.
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
                      <span className="review-val">{attachments.map((a) => a.name).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="guarantee-notice-box">
                  <h4>حماية وضمان سوداوورك للأموال:</h4>
                  <p>
                    نشر المشروع مجاني بالكامل. لن تدفع أي مبالغ إلا عند قبول عرض المستقل، وتبقى أموالك محفوظة في الضمان ولا يتم تسليمها للمستقل إلا بعد فحصك للعمل وقبوله.
                  </p>
                </div>

                <div className="wizard-actions-between">
                  <button type="button" className="wizard-back-btn" onClick={() => setStep(2)}>
                    <FiArrowRight />
                    <span>تعديل التفاصيل</span>
                  </button>
                  <button
                    type="button"
                    className="wizard-publish-btn"
                    onClick={handlePublish}
                    disabled={submitting}
                  >
                    {submitting ? 'جارٍ نشر المشروع...' : 'نشر المشروع الآن'}
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
