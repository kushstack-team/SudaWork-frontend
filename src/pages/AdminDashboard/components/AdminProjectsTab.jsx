import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiSearch, FiXCircle, FiCheck, FiX } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminProjectsTab({
  categoriesList,
  projectsList,
  onOpenCategoryModal,
  onDeleteCategory,
  onDeleteProject,
  onCloseProject,
  pendingProjects = [],
  onApproveProject,
  onRejectProject,
  reviewingId,
  skillsList = [],
  onOpenSkillModal,
  onToggleSkill
}) {
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all');

  const filteredProjects = projectsList.filter((p) => {
    const term = projectSearch.trim().toLowerCase();
    const matchSearch =
      !term ||
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.clientName && p.clientName.toLowerCase().includes(term)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(term));
    const matchStatus = projectStatusFilter === 'all' || p.status === projectStatusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_TEXT = {
    'Pending Review': 'بانتظار المراجعة',
    Rejected: 'مرفوض',
    Open: 'مفتوح للعروض',
    'Awaiting Payment': 'بانتظار الدفع',
    'In Progress': 'قيد التنفيذ',
    Submitted: 'تم التسليم',
    Completed: 'مكتمل',
    Cancelled: 'ملغي / مغلق',
  };
  return (
    <div className="admin-tab-content">
      {/* Review queue: nothing is published until it is approved here (oldest first). */}
      <div className="admin-card-section mb-32">
        <div className="section-header">
          <div>
            <h3 className="section-title">مشاريع بانتظار المراجعة ({pendingProjects.length})</h3>
            <p className="section-desc">لا يظهر أي مشروع في سوق المشاريع قبل موافقتك. عند الرفض يصل السبب للعميل ويمكنه التعديل وإعادة الإرسال.</p>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>عنوان المشروع</th>
                <th>التصنيف</th>
                <th>الميزانية</th>
                <th>تاريخ الإرسال</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pendingProjects.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">لا توجد مشاريع بانتظار المراجعة</td>
                </tr>
              )}
              {pendingProjects.map((proj) => (
                <tr key={proj.id}>
                  <td className="font-mono">{proj.clientName}</td>
                  <td className="font-bold">{proj.title}</td>
                  <td>{proj.categoryName || '—'}</td>
                  <td>{Number(proj.budget || 0).toLocaleString()} ج.س</td>
                  <td>{formatDate(proj.submittedAt || proj.createdAt)}</td>
                  <td>
                    <div className="table-action-btns">
                      <Link to={`/projects/${proj.id}`} className="view-project-link" title="معاينة تفاصيل المشروع">
                        <FiEye />
                        <span>عرض</span>
                      </Link>
                      <button
                        type="button"
                        className="btn-approve"
                        disabled={reviewingId === proj.id}
                        onClick={() => onApproveProject(proj)}
                      >
                        <FiCheck />
                        <span>موافقة ونشر</span>
                      </button>
                      <button
                        type="button"
                        className="btn-reject"
                        disabled={reviewingId === proj.id}
                        onClick={() => onRejectProject(proj)}
                      >
                        <FiX />
                        <span>رفض</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Management Box */}
      <div className="admin-card-section mb-32">
        <div className="section-header">
          <div>
            <h3 className="section-title">تصنيفات ومجالات المنصة</h3>
            <p className="section-desc">إضافة وحذف المجالات المهنية المتاحة للمشاريع والمستقلين.</p>
          </div>
          <button
            type="button"
            className="add-category-btn"
            onClick={onOpenCategoryModal}
          >
            <FiPlus />
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>

        <div className="categories-chips-wrap">
          {categoriesList.map((cat) => (
            <div key={cat.id} className="category-admin-chip">
              <span>{cat.name}{!cat.isActive && ' (مخفي)'}{cat.projectsCount ? ` · ${cat.projectsCount} مشروع` : ''}</span>
              <button
                type="button"
                className="cat-delete-btn"
                title="حذف التصنيف"
                onClick={() => onDeleteCategory(cat.id)}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Management Box */}
      <div className="admin-card-section mb-32">
        <div className="section-header">
          <div>
            <h3 className="section-title">المهارات ({skillsList.length})</h3>
            <p className="section-desc">المهارات التي يختارها المستقلون والعملاء. المهارات الجديدة التي يكتبها المستخدمون تظهر هنا بدون تصنيف لتراجعها.</p>
          </div>
          <button type="button" className="add-category-btn" onClick={onOpenSkillModal}>
            <FiPlus />
            <span>إضافة مهارة</span>
          </button>
        </div>
        <div className="categories-chips-wrap">
          {skillsList.length === 0 && <span className="action-completed-text">لا توجد مهارات بعد</span>}
          {skillsList.map((skill) => (
            <div key={skill.id} className="category-admin-chip" style={skill.isActive ? undefined : { opacity: 0.55 }}>
              <span>{skill.name}{skill.categoryName ? ` · ${skill.categoryName}` : ' · بدون تصنيف'}</span>
              <button
                type="button"
                className="cat-delete-btn"
                title={skill.isActive ? 'إخفاء المهارة' : 'إعادة تفعيل المهارة'}
                onClick={() => onToggleSkill(skill)}
              >
                {skill.isActive ? <FiTrash2 /> : <FiPlus />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Overview Box */}
      <div className="admin-card-section">
        <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 className="section-title">جميع المشاريع ({projectsList.length})</h3>
            <p className="section-desc">سجل مشاريع منصة سوداوورك وحالة مراجعتها وحالتها التعاقدية وإدارتها.</p>
          </div>

          <div className="users-filter-controls">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="بحث بعنوان المشروع أو العميل..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
              />
            </div>

            <select
              className="role-filter-select"
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="Pending Review">بانتظار المراجعة</option>
              <option value="Rejected">مرفوض</option>
              <option value="Open">مفتوح للعروض</option>
              <option value="In Progress">قيد التنفيذ</option>
              <option value="Submitted">تم التسليم</option>
              <option value="Completed">مكتمل</option>
              <option value="Cancelled">ملغي / مغلق</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>عنوان المشروع</th>
                <th>الميزانية</th>
                <th>تاريخ النشر</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">لا توجد مشاريع مطابقة للبحث</td>
                </tr>
              )}
              {filteredProjects.map((proj) => (
                <tr key={proj.id}>
                  <td className="font-mono">{proj.clientName}</td>
                  <td className="font-bold">{proj.title}</td>
                  <td>{Number(proj.budget || 0).toLocaleString()} ج.س</td>
                  <td>{formatDate(proj.createdAt)}</td>
                  <td>
                    <span className={`project-status-tag ${proj.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {STATUS_TEXT[proj.status] || proj.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Link to={`/projects/${proj.id}`} className="view-project-link" title="معاينة تفاصيل المشروع">
                        <FiEye />
                        <span>عرض</span>
                      </Link>
                      {proj.status === 'Open' && onCloseProject && (
                        <button
                          type="button"
                          className="cat-delete-btn"
                          title="إغلاق المشروع"
                          style={{ color: '#d97706', borderColor: '#fde68a' }}
                          onClick={() => onCloseProject(proj)}
                        >
                          <FiXCircle />
                          <span>إغلاق</span>
                        </button>
                      )}
                      {onDeleteProject && (
                        <button
                          type="button"
                          className="cat-delete-btn"
                          title="حذف المشروع نهائياً"
                          onClick={() => onDeleteProject(proj)}
                        >
                          <FiTrash2 />
                          <span>حذف</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
