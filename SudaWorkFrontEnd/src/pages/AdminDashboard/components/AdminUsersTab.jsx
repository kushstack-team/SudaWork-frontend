import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminUsersTab({
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  onToggleUserStatus
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إدارة حسابات المستخدمين</h3>
            <p className="section-desc">عرض وتعديل وتجميد حسابات العملاء والمستقلين.</p>
          </div>

          <div className="users-filter-controls">
            <div className="search-input-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="بحث بالاسم أو البريد..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <select
              className="role-filter-select"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
            >
              <option value="all">جميع الأدوار</option>
              <option value="client">أصحاب الأعمال (Clients)</option>
              <option value="freelancer">المستقلون (Freelancers)</option>
              <option value="admin">المديرون (Admins)</option>
            </select>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>المستخدم</th>
                <th>البريد الإلكتروني</th>
                <th>الدور</th>
                <th>تاريخ الانضمام</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="table-user-cell">
                      <div className="user-avatar-initials">
                        {u.fullName ? u.fullName.charAt(0) : 'U'}
                      </div>
                      <span className="user-name-cell">{u.fullName}</span>
                    </div>
                  </td>
                  <td className="dir-ltr text-right">{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {u.role === 'client' && 'صاحب عمل'}
                      {u.role === 'freelancer' && 'مستقل'}
                      {u.role === 'admin' && 'مدير'}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <span className={`status-pill ${u.status}`}>
                      {u.status === 'active' ? 'نشط' : 'معلق / محظور'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        type="button"
                        className={`user-status-btn ${u.status === 'active' ? 'suspend' : 'activate'}`}
                        onClick={() => onToggleUserStatus(u)}
                      >
                        {u.status === 'active' ? 'تجميد الحساب' : 'تفعيل الحساب'}
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
