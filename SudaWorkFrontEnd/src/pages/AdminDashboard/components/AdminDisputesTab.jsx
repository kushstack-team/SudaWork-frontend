import React from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiShield } from 'react-icons/fi';
import { formatDate } from '../../../utils/formatters';

export default function AdminDisputesTab({
  disputesList,
  onOpenResolveDispute
}) {
  return (
    <div className="admin-tab-content">
      <div className="admin-card-section">
        <div className="section-header">
          <div>
            <h3 className="section-title">قضايا النزاعات والتحكيم والوساطة</h3>
            <p className="section-desc">الفصل في الخلافات التعاقدية وإصدار قرارات التحكيم الملزمة لحماية أموال الضمان.</p>
          </div>
        </div>

        <div className="admin-disputes-grid">
          {disputesList.length === 0 ? (
            <div className="empty-disputes-box">لا توجد نزاعات مسجلة حالياً في المنصة.</div>
          ) : (
            disputesList.map((disp) => (
              <div key={disp.id} className="admin-dispute-card">
                <div className="dispute-card-top">
                  <div>
                    <span className="dispute-id-tag">#{disp.id}</span>
                    <span className="dispute-date-text">{formatDate(disp.createdAt)}</span>
                  </div>
                  <span className={`dispute-status-badge ${disp.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {disp.status === 'Open' && 'مفتوح - بانتظار الإدارة'}
                    {disp.status === 'In Review' && 'قيد التحكيم والوساطة'}
                    {disp.status === 'Resolved' && 'تم الحل والتسوية'}
                    {disp.status === 'Dismissed' && 'مرفوض أو ملغي'}
                  </span>
                </div>

                <div className="dispute-card-main">
                  <h4 className="dispute-issue-title">{disp.reason}</h4>
                  <p className="dispute-issue-desc">{disp.description}</p>
                  {disp.desiredResolution && (
                    <div className="desired-resolution-box">
                      <strong>الحل المطلوب:</strong> {disp.desiredResolution}
                    </div>
                  )}

                  {disp.resolutionNotes && (
                    <div className="admin-resolution-notes-box">
                      <strong>قرار وتوجيهات الإدارة:</strong> {disp.resolutionNotes}
                    </div>
                  )}
                </div>

                <div className="dispute-card-bottom">
                  <div className="dispute-parties-meta">
                    {disp.contractId && (
                      <Link to={`/contracts/${disp.contractId}`} className="contract-link">
                        <FiFileText />
                        <span>العقد #{disp.contractId}</span>
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    className="dispute-resolve-btn"
                    onClick={() => onOpenResolveDispute(disp)}
                  >
                    <FiShield />
                    <span>إصدار قرار التحكيم / تعديل القرار</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
