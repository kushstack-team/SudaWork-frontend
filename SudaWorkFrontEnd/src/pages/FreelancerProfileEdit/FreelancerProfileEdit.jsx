import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FreelancerProfileEdit.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import defaultAvatar from '../../assets/dashboard/avatar_tasneem.jpg';
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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('available');
  const [photo, setPhoto] = useState(defaultAvatar);

  // Skills
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Portfolio
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const profile = await mockApi.profiles.getFreelancerProfile(user.id);
        const userData = await mockApi.users.getById(user.id);

        if (userData) {
          setFullName(userData.fullName || '');
        }

        if (profile) {
          setTitle(profile.title || '');
          setBio(profile.bio || '');
          setLocation(profile.location || 'الخرطوم، السودان');
          setAvailability(profile.availability || 'available');
          setPhoto(profile.photo || defaultAvatar);
          setSkills(profile.skills || []);
          setPortfolio(profile.portfolio || []);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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

  const handleAddPortfolioItem = (e) => {
    e.preventDefault();
    if (!portfolioTitle.trim()) return;

    const newItem = {
      id: `p_${Date.now()}`,
      title: portfolioTitle.trim(),
      link: portfolioLink.trim() || '#',
      image: defaultAvatar, // mock image
    };

    setPortfolio([...portfolio, newItem]);
    setPortfolioTitle('');
    setPortfolioLink('');
  };

  const handleRemovePortfolioItem = (id) => {
    setPortfolio(portfolio.filter((item) => item.id !== id));
  };

  const handlePhotoUploadMock = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local blob preview
      const objectUrl = URL.createObjectURL(file);
      setPhoto(objectUrl);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMessage('');

    try {
      await mockApi.profiles.updateFreelancerProfile(user.id, {
        title,
        bio,
        location,
        availability,
        photo,
        skills,
        portfolio,
      });

      setSuccessMessage('تم حفظ التعديلات على ملفك الشخصي بنجاح!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

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
                      accept="image/*"
                      onChange={handlePhotoUploadMock}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="photo-helper-text">
                  <span className="photo-main-label">صورتك الشخصية</span>
                  <p className="photo-sub-label">
                    يفضل استخدام صورة واضحة ومبتسمة بخلفية غير مشتتة (JPEG أو PNG).
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
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
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
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
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
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(e);
                    }
                  }}
                />
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
                <button
                  type="button"
                  className="add-portfolio-btn"
                  onClick={handleAddPortfolioItem}
                >
                  <FiPlus />
                  <span>إضافة عمل جديد للمعرض</span>
                </button>
              </div>

              <div className="portfolio-grid-preview">
                {portfolio.length === 0 && (
                  <span className="no-items-hint">لا توجد أعمال في معرضك حتى الآن.</span>
                )}
                {portfolio.map((item) => (
                  <div key={item.id} className="portfolio-preview-card">
                    <div className="portfolio-card-info">
                      <h4 className="portfolio-item-title">{item.title}</h4>
                      {item.link && item.link !== '#' && (
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

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreelancerProfileEdit;
