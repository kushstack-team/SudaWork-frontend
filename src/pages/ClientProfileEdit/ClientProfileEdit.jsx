import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientProfileEdit.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import ErrorState from '../../components/common/ErrorState/ErrorState';
import AccountSettings from '../../components/AccountSettings/AccountSettings';
import defaultLogo from '../../assets/default-avatar.svg';
import { 
  FiCamera, 
  FiCheck, 
  FiBriefcase, 
  FiMapPin, 
  FiPhone, 
  FiEye,
  FiFileText
} from 'react-icons/fi';
import useLoader from '../../hooks/useLoader';

const ClientProfileEdit = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [logo, setLogo] = useState(defaultLogo);

  const loadProfile = async () => {
    try {
      const { user: account, profile } = await api.profiles.getClient(user.id);
      setFullName(account.fullName || '');
      setLogo(account.avatar || defaultLogo);
      if (profile) {
        setCompanyName(profile.companyName);
        setDescription(profile.description);
        setPhone(profile.phone);
        setLocation(profile.location);
      }
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadProfile, [user?.id], Boolean(user?.id));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingLogo(true);
    setErrorMessage('');
    try {
      const updatedUser = await api.profiles.uploadAvatar(file);
      setLogo(updatedUser.avatar || defaultLogo);
      setUser((prev) => (prev ? { ...prev, avatar: updatedUser.avatar } : prev));
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Every client profile field is optional; clients can post projects without them.
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await api.profiles.updateClient({
        companyName: companyName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        location: location.trim(),
      });
      setSuccessMessage('تم حفظ بيانات الملف التجاري للعميل بنجاح!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'تعذر حفظ التعديلات، يرجى المحاولة ثانية.');
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <div className="client-profile-edit-page" dir="rtl">
        <DashboardNavbar />
        <main className="client-profile-edit-main">
          <div className="client-profile-edit-container">
            <ErrorState title="تعذر تحميل ملفك" error={loadError} onRetry={() => { setLoading(true); loadProfile(); }} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="client-edit-loading" dir="rtl">
        <div className="profile-spinner" />
        <p>جارٍ تحميل بيانات الملف التجاري...</p>
      </div>
    );
  }

  return (
    <div className="client-profile-edit-page" dir="rtl">
      <DashboardNavbar />

      <main className="client-profile-edit-main">
        <div className="client-profile-edit-container">

          {/* Header */}
          <div className="client-edit-header-row">
            <div>
              <h1 className="client-edit-title">تعديل الملف التجاري للعميل</h1>
              <p className="client-edit-subtitle">
                تساعدك إضافة تفاصيل شركتك أو أعمالك في جذب المستقلين الأكفاء وتسهيل التواصل.
              </p>
            </div>
            <button
              type="button"
              className="view-public-client-btn"
              onClick={() => navigate(`/clients/${user?.id}`)}
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

          <form onSubmit={handleSave} className="client-edit-form">
            <section className="client-form-section">
              <h2 className="section-title">
                <FiBriefcase className="section-title-icon" />
                <span>معلومات الحساب والشركة</span>
              </h2>

              {/* Logo Row */}
              <div className="client-logo-row">
                <div className="logo-preview-wrapper">
                  <img src={logo} alt={companyName || fullName} className="logo-preview-img" />
                  <label htmlFor="logo-upload" className="logo-upload-badge" title="تغيير الشعار">
                    <FiCamera />
                    <input
                      type="file"
                      id="logo-upload"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <div className="logo-helper-text">
                  <span className="logo-main-label">شعار الشركة أو الصورة الشخصية</span>
                  <p className="logo-sub-label">
                    {uploadingLogo ? 'جارٍ رفع الصورة...' : 'أضف شعار علامتك التجارية لتظهر بمظهر احترافي عند نشر المشاريع والتعامل مع المستقلين.'}
                  </p>
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">الاسم الكامل لمدير الحساب</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fullName}
                    disabled
                    title="الاسم مرتبط بالحساب الأساسي"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">اسم الشركة أو المؤسسة (اختياري)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: شركة النيل للتقنية والابتكار"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label className="form-label">
                    <FiPhone className="field-inline-icon" />
                    <span>رقم الهاتف للتواصل (اختياري)</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="مثال: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiMapPin className="field-inline-icon" />
                    <span>مقر العمل / الدولة (اختياري)</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="مثال: الخرطوم، السودان"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FiFileText className="field-inline-icon" />
                  <span>نبذة عن نشاط الشركة أو مجال أعمالك (اختياري)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="صف نوع المشاريع التي تقوم بإدارتها، وأهدافك، والخدمات التي تبحث عنها عادةً..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

            </section>

            <div className="client-submit-row">
              <button
                type="submit"
                className="save-client-btn"
                disabled={saving}
              >
                {saving ? 'جارٍ حفظ التعديلات...' : 'حفظ التعديلات'}
              </button>
            </div>
          </form>

          <AccountSettings
            sectionClassName="client-form-section"
            titleClassName="section-title"
            iconClassName="section-title-icon"
          />

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ClientProfileEdit;
