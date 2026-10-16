import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FreelancerProfileEdit.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import useLoader from '../../hooks/useLoader';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import FilePicker from '../../components/FilePicker/FilePicker';
import AccountSettings from '../../components/AccountSettings/AccountSettings';
import defaultAvatar from '../../assets/default-avatar.svg';
import { 
  FiCamera, 
  FiPlus, 
  FiX, 
  FiCheck, 
  FiExternalLink, 
  FiUser,
  FiBriefcase,
  FiMapPin,
  FiEye
} from 'react-icons/fi';

const FreelancerProfileEdit = () => {
  const { user, refreshUser, setUser } = useAuth();
  const { isFeatureAvailable } = usePlatform();
  const portfolioEnabled = isFeatureAvailable(FEATURES.PORTFOLIO);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('available');
  const [languages, setLanguages] = useState('');
  const [experience, setExperience] = useState('');
  const [photo, setPhoto] = useState(defaultAvatar);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState([]);

  // Portfolio (saved immediately, independent of the main form)
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [portfolioImage, setPortfolioImage] = useState([]);
  const [portfolioBusy, setPortfolioBusy] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');

  const loadProfile = async () => {
    try {
      const { user: account, profile } = await api.profiles.getFreelancer(user.id);
      setFullName(account.fullName || '');
      setPhoto(account.avatar || defaultAvatar);
      if (profile) {
        setTitle(profile.title);
        setBio(profile.bio);
        setLocation(profile.location);
        setAvailability(profile.availability || 'available');
        setLanguages((profile.languages || []).join('، '));
        setExperience(profile.experience);
        setSkills(profile.skills);
        setPortfolio(profile.portfolio);
      }
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadProfile, [user?.id], Boolean(user?.id));
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

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddPortfolioItem = async (e) => {
    e.preventDefault();
    if (!portfolioTitle.trim() || portfolioImage.some((i) => i.status === 'uploading')) return;
    setPortfolioBusy(true);
    setPortfolioError('');
    try {
      const updated = await api.portfolio.add({
        title: portfolioTitle.trim(),
        link: portfolioLink.trim(),
        imageId: portfolioImage.find((i) => i.upload)?.upload.id,
      });
      setPortfolio(updated);
      setPortfolioTitle('');
      setPortfolioLink('');
      setPortfolioImage([]);
    } catch (err) {
      setPortfolioError(err.fieldErrors?.projectUrl ? 'يرجى إدخال رابط صحيح يبدأ بـ http أو https.' : err.message);
    } finally {
      setPortfolioBusy(false);
    }
  };

  const handleRemovePortfolioItem = async (id) => {
    setPortfolioError('');
    try {
      setPortfolio(await api.portfolio.remove(id));
    } catch (err) {
      setPortfolioError(err.message);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const MAX_AVATAR_BYTES = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage('صيغة الصورة غير مدعومة. يرجى اختيار ملف PNG أو JPG أو WEBP.');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setErrorMessage('حجم الصورة يتجاوز الحد المسموح (10 ميجابايت).');
      return;
    }
    setUploadingPhoto(true);
    setErrorMessage('');
    try {
      const updatedUser = await api.profiles.uploadAvatar(file);
      setPhoto(updatedUser.avatar || defaultAvatar);
      setUser((prev) => (prev ? { ...prev, avatar: updatedUser.avatar } : prev));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    const errs = {};
    if (!title.trim()) errs.title = 'المسمى المهني مطلوب';
    if (!bio.trim()) errs.bio = 'النبذة التعريفية مطلوبة';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await api.profiles.updateFreelancer({
        title: title.trim(),
        bio: bio.trim(),
        location: location.trim(),
        availability,
        experience: experience.trim(),
        languages: languages.split(/[،,]/).map((l) => l.trim()).filter(Boolean),
        skills,
      });
      await refreshUser();
      setSuccessMessage('تم حفظ التعديلات على ملفك الشخصي بنجاح!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'تعذر حفظ التعديلات، يرجى المحاولة ثانية.');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="profile-edit-page" dir="rtl">
        <DashboardNavbar />
        <main className="profile-edit-main">
          <div className="profile-edit-container">
            <ErrorState title="تعذر تحميل ملفك الشخصي" error={loadError} onRetry={() => { setLoading(true); loadProfile(); }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-edit-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <div className="profile-edit-page" dir="rtl">
      <DashboardNavbar />

      <main className="profile-edit-main">
        <div className="profile-edit-container">
          
          {/* Top Bar Header with View Public Profile CTA */}
          <div className="profile-edit-header-row">
            <div>
              <h1 className="profile-edit-title">تعديل الملف الشخصي</h1>
              <p className="profile-edit-subtitle">
                حدّث نبذتك التعريفية، مهاراتك، ونماذج أعمالك لزيادة فرص قبول عروضك.
              </p>
            </div>
            <button
              type="button"
              className="view-public-profile-btn"
              onClick={() => navigate(`/freelancers/${user?.id}`)}
            >
              <FiEye className="btn-icon" />
              <span>معاينة الملف العام</span>
            </button>
          </div>

          {successMessage && (
            <div className="profile-success-banner" role="alert">
              <FiCheck className="banner-icon" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="profile-success-banner error" role="alert">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="profile-edit-form">
            
            {/* Section 1: Basic Info & Photo */}
            <section className="profile-form-section">
              <h2 className="section-title">
                <FiUser className="section-title-icon" />
                <span>المعلومات الأساسية</span>
              </h2>

              <div className="profile-photo-row">
                <div className="photo-preview-wrapper">
                  <img src={photo} alt={fullName} className="photo-preview-img" />
                  <label htmlFor="photo-upload" className="photo-upload-badge" title="تغيير الصورة الشخصية">
                    <FiCamera />
                    <input
                      type="file"
                      id="photo-upload"
                      accept=".png,.jpg,.jpeg"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="photo-helper-text">
                  <span className="photo-main-label">صورتك الشخصية</span>
                  <p className="photo-sub-label">
                    {uploadingPhoto ? 'جارٍ رفع الصورة...' : 'يفضل استخدام صورة واضحة ومبتسمة بخلفية غير مشتتة (JPEG أو PNG).'}
                  </p>
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">الاسم الكامل</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    disabled
                    title="الاسم مرتبط بالحساب الأساسي"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">المسمى المهني / التخصص *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: مطور تطبيقات React Native / مصممة هوية بصرية"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: null }));
                    }}
                  />
                  {fieldErrors.title && <span className="form-field-error">{fieldErrors.title}</span>}
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">
                    <FiMapPin className="field-inline-icon" />
                    <span>المدينة والدولة</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: الخرطوم، السودان"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">حالة التفرغ للعمل</label>
                  <div className="availability-toggle-group">
                    <button
                      type="button"
                      className={`avail-btn ${availability === 'available' ? 'active-avail' : ''}`}
                      onClick={() => setAvailability('available')}
                    >
                      <span className="dot dot-green" />
                      <span>متاح للعمل فوراً</span>
                    </button>
                    <button
                      type="button"
                      className={`avail-btn ${availability === 'busy' ? 'active-busy' : ''}`}
                      onClick={() => setAvailability('busy')}
                    >
                      <span className="dot dot-yellow" />
                      <span>مشغول حالياً</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">النبذة التعريفية (Bio) *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="اكتب نبذة مختصرة تلخص خبراتك العملية، أهم التقنيات التي تتقنها، ولماذا يفضل العملاء العمل معك..."
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    if (fieldErrors.bio) setFieldErrors((p) => ({ ...p, bio: null }));
                  }}
                />
                {fieldErrors.bio && <span className="form-field-error">{fieldErrors.bio}</span>}
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">اللغات (اختياري)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: العربية، الإنجليزية"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">الخبرات السابقة (اختياري)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: 4 سنوات في إنتاج الفيديو الإعلاني"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Skills */}
            <section className="profile-form-section">
              <h2 className="section-title">
                <FiBriefcase className="section-title-icon" />
                <span>المهارات والخبرات التقنية</span>
              </h2>
              <p className="section-desc">
                أضف المهارات التي تتقنها لتساعد خوارزميات المنصة في ترشيح المشاريع الأنسب لك.
              </p>

              <div className="skill-input-row">
                <input
                  type="text"
                  className="form-input skill-text-input"
                  placeholder="اكتب مهارة (مثال: Figma, React, مونتاج فيديو) واضغط إضافة"
                  list="freelancer-skill-suggestions"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
                <datalist id="freelancer-skill-suggestions">
                  {skillSuggestions.map((name) => <option key={name} value={name} />)}
                </datalist>
                <button
                  type="button"
                  className="add-skill-btn"
                  onClick={handleAddSkill}
                >
                  <FiPlus />
                  <span>إضافة</span>
                </button>
              </div>

              <div className="skills-chips-wrapper">
                {skills.length === 0 && (
                  <span className="no-items-hint">لم تتم إضافة مهارات بعد.</span>
                )}
                {skills.map((skill) => (
                  <span key={skill} className="skill-chip">
                    <span>{skill}</span>
                    <button
                      type="button"
                      className="remove-chip-btn"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label="حذف المهارة"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            </section>

            {/* Section 3: Portfolio */}
            <section className="profile-form-section">
              <h2 className="section-title">
                <FiExternalLink className="section-title-icon" />
                <span>معرض الأعمال (Portfolio)</span>
              </h2>
              <p className="section-desc">
                أضف نماذج من مشاريعك السابقة لتعزيز ثقة أصحاب الأعمال بقدراتك.
              </p>

              {!portfolioEnabled ? (
                <p className="section-desc">إضافة الأعمال إلى المعرض متوقفة مؤقتاً من قبل إدارة المنصة.</p>
              ) : (
              <div className="portfolio-add-box">
                <div className="form-grid-two">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="عنوان العمل / المشروع"
                    value={portfolioTitle}
                    onChange={(e) => setPortfolioTitle(e.target.value)}
                  />
                  <input
                    type="url"
                    className="form-input"
                    placeholder="رابط العمل (Behance, GitHub, رابط مباشر)"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                  />
                </div>
                <FilePicker
                  id="portfolio-image"
                  purpose="portfolio"
                  accept=".png,.jpg,.jpeg"
                  files={portfolioImage}
                  onChange={setPortfolioImage}
                  disabled={portfolioBusy}
                />
                {portfolioError && <span className="form-field-error">{portfolioError}</span>}
                <button
                  type="button"
                  className="add-portfolio-btn"
                  onClick={handleAddPortfolioItem}
                  disabled={portfolioBusy || !portfolioTitle.trim() || portfolioImage.some((i) => i.status === 'uploading')}
                >
                  <FiPlus />
                  <span>{portfolioBusy ? 'جارٍ الإضافة...' : 'إضافة عمل جديد للمعرض'}</span>
                </button>
              </div>
              )}

              <div className="portfolio-grid-preview">
                {portfolio.length === 0 && (
                  <span className="no-items-hint">لا توجد أعمال في معرضك حتى الآن. إضافة نماذج من أعمالك السابقة تعزز ثقة العملاء وتزيد فرص قبول عروضك.</span>
                )}
                {portfolio.map((item) => (
                  <div key={item.id} className="portfolio-preview-card">
                    <div className="portfolio-card-info">
                      <h4 className="portfolio-item-title">{item.title}</h4>
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="portfolio-item-link"
                        >
                          <FiExternalLink />
                          <span>معاينة الرابط</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      className="remove-portfolio-btn"
                      onClick={() => handleRemovePortfolioItem(item.id)}
                      title="حذف هذا العمل"
                      disabled={!portfolioEnabled}
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Form Actions */}
            <div className="profile-submit-row">
              <button
                type="submit"
                className="save-profile-btn"
                disabled={saving}
              >
                {saving ? 'جارٍ حفظ التعديلات...' : 'حفظ التعديلات'}
              </button>
            </div>

          </form>

          <AccountSettings
            sectionClassName="profile-form-section"
            titleClassName="section-title"
            iconClassName="section-title-icon"
          />

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerProfileEdit;
