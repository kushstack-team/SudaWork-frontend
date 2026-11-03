import { FiSearch, FiUserPlus } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';
import VerifiedBadge from '../../../components/VerifiedBadge/VerifiedBadge';

const statusLabel = (u) => {
  if (u.status === 'active') return 'نشط';
  if (u.deactivationType === 'DELETED') return 'محذوف';
  if (u.deactivationType === 'SELF') return 'معطّل من المستخدم';
  return 'معلق / محظور';
};

export default function AdminUsersTab({
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter,
  userStatusFilter = 'all',
  setUserStatusFilter,
  onAddAdmin,
  onToggleUserStatus,
  onDeleteUser,
  onToggleVerified,
  currentUserId
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">إدارة حسابات المستخدمين</h3>
            <p className="section-desc">عرض وتعديل وتجميد وحذف حسابات العملاء والمستقلين.</p>
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

            {setUserStatusFilter && (
              <select
                className="role-filter-select"
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                aria-label="حالة الحساب"
              >
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="suspended">غير نشط</option>
              </select>
            )}

            {onAddAdmin && (
              <button type="button" className="add-admin-btn" onClick={onAddAdmin}>
                <FiUserPlus />
                <span>إضافة مدير</span>
              </button>
            )}
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table-cell">لا يوجد مستخدمون مطابقون للبحث</td>
                </tr>
              )}
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="table-user-cell">
                      <div className="user-avatar-initials">
                        {u.fullName ? u.fullName.charAt(0) : 'U'}
                      </div>
                      <span className="user-name-cell">{u.fullName}</span>
                      {u.isVerified && <VerifiedBadge compact />}
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
                      {statusLabel(u)}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && u.id !== currentUserId && !u.isDeleted && (
                      <div className="user-table-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {onToggleVerified && (u.status === 'active' || u.isVerified) && (
                          <button
                            type="button"
                            className={`user-status-btn ${u.isVerified ? 'suspend' : 'activate'}`}
                            onClick={() => onToggleVerified(u)}
                          >
                            {u.isVerified ? 'إزالة التوثيق' : 'توثيق'}
                          </button>
                        )}
                        <button
                          type="button"
                          className={`user-status-btn ${u.status === 'active' ? 'suspend' : 'activate'}`}
                          onClick={() => onToggleUserStatus(u)}
                        >
                          {u.status === 'active' ? 'تجميد الحساب' : 'تفعيل الحساب'}
                        </button>
                        {onDeleteUser && (
                          <button
                            type="button"
                            className="user-delete-btn"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              backgroundColor: '#fff',
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onClick={() => onDeleteUser(u)}
                            title="حذف المستخدم نهائياً"
                          >
                            حذف
                          </button>
                        )}
                      </div>
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
