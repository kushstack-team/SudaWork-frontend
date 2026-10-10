import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye, FiSlash } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminProjectsTab({
  categoriesList,
  projectsList,
  onOpenCategoryModal,
  onDeleteCategory,
  onModerateProject,
  skillsList = [],
  onOpenSkillModal,
  onToggleSkill
}) {
  const STATUS_TEXT = {
    Open: 'مفتوح للعروض',
    'Awaiting Payment': 'بانتظار الدفع',
    'In Progress': 'قيد التنفيذ',
    Submitted: 'تم التسليم',
    Completed: 'مكتمل',
    Cancelled: 'ملغي',
  };
  return (
    <div className="admin-tab-content">
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
        <div className="section-header">
          <div>
            <h3 className="section-title">المشاريع المنشورة ({projectsList.length})</h3>
            <p className="section-desc">سجل المشاريع المنشورة على منصة سوداوورك وحالتها التعاقدية.</p>
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
                <th>معاينة</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">لم يتم نشر أي مشاريع بعد</td>
                </tr>
              )}
              {projectsList.map((proj) => (
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
                    <Link to={`/projects/${proj.id}`} className="view-project-link">
                      <FiEye />
                      <span>عرض</span>
                    </Link>
                    {proj.status === 'Open' && (
                      <button type="button" className="cat-delete-btn" title="إيقاف المشروع" onClick={() => onModerateProject(proj)}>
                        <FiSlash />
                      </button>
                    )}
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
