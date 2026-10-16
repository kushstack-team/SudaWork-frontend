import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers } from 'react-icons/fi';
import './Help.css';

export default function HowItWorks() {
  return (
    <div className="help-page" dir="rtl">
      <div className="help-container">
        <div className="help-header">
          <span className="help-badge">دليل المنصة</span>
          <h1 className="help-title">كيف يعمل سوداوورك؟</h1>
          <p className="help-subtitle">
            دليلك الكامل لإنجاز المشاريع وتوظيف الكفاءات وتحقيق الأرباح بأمان عبر منصة العمل الحر الأولى في السودان.
          </p>
        </div>

        {/* Section: For Clients */}
        <div className="workflow-section">
          <h2 className="section-heading">
            <FiBriefcase className="section-icon" />
            <span>خطوات أصحاب الأعمال (العملاء)</span>
          </h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>انشر مشروعك مجاناً وبكل سهولة</h3>
              <p>حدد عنوان المشروع، والمتطلبات بالتفصيل، والمهارات المطلوبة، والميزانية المتوقعة، وموعد التسليم المحدد.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>استقبل عروض المستقلين المحترفين</h3>
              <p>قارن العروض المقدمة، واطلع على معرض أعمال المستقلين وتقييماتهم السابقة، وتحدث معهم مباشرة لاختيار الأنسب.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>أمّن ميزانيتك عبر الضمان المالي</h3>
              <p>قم بإيداع قيمة المشروع عبر التحويل البنكي أو المحافظ الرقمية المعتمدة (بنكك، زين كاش، MTN) بأمان تام.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>استلم عملك المكتمل واعتمد الدفعة</h3>
              <p>راجع مخرجات العمل وطلب التعديلات اللازمة، وبمجرد رضاك التام يتم تحرير الدفعة للمستقل تلقائياً.</p>
            </div>
          </div>

          <div className="workflow-cta-row">
            <Link to="/post-project" className="workflow-cta-btn primary">
              انشر مشروعك الآن مجاناً &larr;
            </Link>
          </div>
        </div>

        {/* Section: For Freelancers */}
        <div className="workflow-section">
          <h2 className="section-heading">
            <FiUsers className="section-icon" />
            <span>خطوات المستقلين ومقدمي الخدمات</span>
          </h2>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>أنشئ ملفاً مهنياً متكاملاً</h3>
              <p>سجل حساب مستقل، وأبرز مهاراتك، وخبراتك، ونماذج من أفضل أعمالك السابقة لجذب أصحاب الأعمال.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>قدّم عروضك على المشاريع المناسبة</h3>
              <p>تصفح مئات المشاريع اليومية في مختلف المجالات، وقدّم عرضاً مقنعاً يشمل خطتك وسعرك وفترة التسليم.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>نفذ العمل بضمان مالي مؤكد</h3>
              <p>ابدأ العمل فور إيداع صاحب العمل للضمان. تواصل وشارك التحديثات عبر نظام المحادثات والملفات المباشر.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>اسحب أرباحك لمحفظتك مباشرة</h3>
              <p>بمجرد قبول العميل للعمل، يُضاف رصيدك إلى محفظتك لسحبه مباشرة إلى حسابك في بنكك أو زين كاش.</p>
            </div>
          </div>

          <div className="workflow-cta-row">
            <Link to="/projects" className="workflow-cta-btn secondary">
              تصفح المشاريع المفتوحة &larr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
