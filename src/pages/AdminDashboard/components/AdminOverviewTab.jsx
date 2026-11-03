import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiBriefcase,
  FiCheckCircle,
  FiChevronLeft,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiLock,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
  FiUserX,
} from 'react-icons/fi';

const money = (n) => `${Number(n || 0).toLocaleString('en-US')} ج.س`;

/**
 * Overview: KPI cards (each opens the matching section with its filter
 * applied) and the queue of items waiting for an admin.
 *
 * `linkTo(tab, params)` builds the dashboard URL for a section.
 */
export default function AdminOverviewTab({ metrics, linkTo }) {
  const users = metrics?.users || {};
  const projects = metrics?.projects || {};
  const contracts = metrics?.contracts || {};
  const pendingPayments = metrics?.payments?.pending ?? 0;
  const pendingWithdrawals = (metrics?.withdrawals?.pending ?? 0) + (metrics?.withdrawals?.approved ?? 0);
  const openReports = metrics?.reports?.open ?? 0;
  const pendingProjects = projects.pendingReview ?? 0;

  const groups = [
    {
      title: 'المستخدمون',
      cards: [
        { label: 'إجمالي المستخدمين', value: users.total, icon: FiUsers, tone: 'blue', to: linkTo('users') },
        { label: 'المستقلون', value: users.freelancers, icon: FiUserCheck, tone: 'green', to: linkTo('users', { role: 'freelancer' }) },
        { label: 'أصحاب المشاريع', value: users.clients, icon: FiBriefcase, tone: 'indigo', to: linkTo('users', { role: 'client' }) },
        { label: 'حسابات غير نشطة', value: users.suspended, icon: FiUserX, tone: 'red', to: linkTo('users', { status: 'suspended' }) },
      ],
    },
    {
      title: 'المشاريع والعقود',
      cards: [
        { label: 'إجمالي المشاريع', value: projects.total, icon: FiBriefcase, tone: 'indigo', to: linkTo('projects') },
        { label: 'بانتظار المراجعة', value: pendingProjects, icon: FiClock, tone: 'amber', attention: pendingProjects > 0, to: linkTo('projects', { status: 'Pending Review' }) },
        { label: 'مشاريع مفتوحة', value: projects.open, icon: FiTrendingUp, tone: 'green', to: linkTo('projects', { status: 'Open' }) },
        { label: 'عقود سارية', value: contracts.active, icon: FiFileText, tone: 'blue', to: linkTo('contracts', { status: 'ACTIVE' }) },
        { label: 'عقود مكتملة', value: contracts.completed, icon: FiCheckCircle, tone: 'green', to: linkTo('contracts', { status: 'COMPLETED' }) },
      ],
    },
    {
      title: 'المالية والإشراف',
      cards: [
        { label: 'مدفوعات بانتظار التدقيق', value: pendingPayments, icon: FiClock, tone: 'amber', attention: pendingPayments > 0, to: linkTo('escrow') },
        { label: 'طلبات سحب معلقة', value: pendingWithdrawals, icon: FiDollarSign, tone: 'amber', attention: pendingWithdrawals > 0, to: linkTo('withdrawals') },
        { label: 'بلاغات ونزاعات مفتوحة', value: openReports, icon: FiAlertTriangle, tone: 'red', attention: openReports > 0, to: linkTo('disputes') },
        { label: 'أموال الضمان المحتجزة', value: money(contracts.escrowHeld), icon: FiLock, tone: 'blue', to: linkTo('contracts', { status: 'ACTIVE' }) },
        { label: 'عمولة المنصة المحققة', value: money(metrics?.revenue?.platformFees), icon: FiTrendingUp, tone: 'green', to: linkTo('contracts', { status: 'COMPLETED' }) },
      ],
    },
  ];

  const queue = [
    { count: pendingProjects, icon: FiBriefcase, title: 'مشاريع بانتظار الموافقة على النشر', text: 'لا يظهر المشروع في السوق قبل مراجعته.', action: 'مراجعة المشاريع', to: linkTo('projects', { status: 'Pending Review' }) },
    { count: pendingPayments, icon: FiClock, title: 'إيداعات بانتظار التدقيق', text: 'طابق إشعار التحويل ثم اعتمد الدفعة لتفعيل العقد.', action: 'مراجعة الإيداعات', to: linkTo('escrow') },
    { count: pendingWithdrawals, icon: FiDollarSign, title: 'طلبات سحب أرباح', text: 'اعتمد الطلب ثم سجّل التحويل للمستقل.', action: 'معالجة الطلبات', to: linkTo('withdrawals') },
    { count: openReports, icon: FiAlertTriangle, title: 'بلاغات ونزاعات مفتوحة', text: 'راجع البلاغ وأصدر القرار المناسب.', action: 'إدارة البلاغات', to: linkTo('disputes') },
  ];
  const waiting = queue.filter((q) => q.count > 0);

  return (
    <div className="admin-tab-content admin-overview">
      {groups.map((group) => (
        <section key={group.title} className="kpi-group" aria-label={group.title}>
          <h2 className="kpi-group__title">{group.title}</h2>
          <div className="kpi-grid">
            {group.cards.map(({ label, value, icon: Icon, tone, attention, to }) => (
              <Link key={label} to={to} className={`kpi-card kpi-card--${tone} ${attention ? 'kpi-card--attention' : ''}`}>
                <span className="kpi-card__icon" aria-hidden="true"><Icon /></span>
                <span className="kpi-card__body">
                  <span className="kpi-card__value">{value ?? 0}</span>
                  <span className="kpi-card__label">{label}</span>
                </span>
                <FiChevronLeft className="kpi-card__arrow" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">بانتظار إجرائك</h3>
            <p className="section-desc">العناصر التي تحتاج إلى مراجعة أو قرار من الإدارة.</p>
          </div>
        </div>

        {waiting.length === 0 ? (
          <div className="overview-all-clear">
            <FiCheckCircle aria-hidden="true" />
            <span>لا توجد عناصر بانتظار المراجعة حالياً.</span>
          </div>
        ) : (
          <div className="urgent-tasks-stack">
            {waiting.map(({ count, icon: Icon, title, text, action, to }) => (
              <div key={title} className="urgent-task-item">
                <div className="task-icon-box warning"><Icon /></div>
                <div className="task-info">
                  <h4>{title} <span className="overview-count">{count}</span></h4>
                  <p>{text}</p>
                </div>
                <Link to={to} className="task-action-btn">{action} &larr;</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
