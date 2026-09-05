import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEye } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminProjectsTab({
  categoriesList,
  projectsList,
  onOpenCategoryModal,
  onDeleteCategory
}) {
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
              <span>{cat.name}</span>
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
                <th>رقم المشروع</th>
                <th>عنوان المشروع</th>
                <th>الميزانية</th>
                <th>تاريخ النشر</th>
                <th>الحالة</th>
                <th>معاينة</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.map((proj) => (
                <tr key={proj.id}>
                  <td className="font-mono">#{proj.id}</td>
                  <td className="font-bold">{proj.title}</td>
                  <td>{(proj.budgetMin || 0).toLocaleString()} - {(proj.budgetMax || 0).toLocaleString()} ج.س</td>
                  <td>{formatDate(proj.createdAt)}</td>
                  <td>
                    <span className={`project-status-tag ${proj.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {proj.status === 'Open' && 'مفتوح للعروض'}
                      {proj.status === 'In Progress' && 'قيد التنفيذ'}
                      {proj.status === 'Completed' && 'مكتمل'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/projects/${proj.id}`} className="view-project-link">
                      <FiEye />
                      <span>عرض</span>
                    </Link>
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
