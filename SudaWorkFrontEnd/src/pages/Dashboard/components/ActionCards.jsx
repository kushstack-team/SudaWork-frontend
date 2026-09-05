import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, 
  FiShield, 
  FiCreditCard,
  FiArrowLeft
} from 'react-icons/fi';
import './ActionCards.css';

const ActionCards = ({
  activeProjectsCount = 0,
  totalProposalsReceived = 0,
  activeContractsCount = 0,
  escrowAmount = 0,
  totalPaid = 0
}) => {
  const navigate = useNavigate();

  return (
    <section className="dashboard-action-cards" dir="rtl">
      <div className="action-cards-grid">
        
        {/* Card 1: My Projects & Proposals Received */}
        <div className="action-card" onClick={() => navigate('/client/projects')}>
          <div className="action-card-header">
            <div className="action-icon-box projects">
              <FiFileText className="action-card-icon" />
            </div>
            <span className="action-card-tag success">مشاريعك المنشورة</span>
          </div>

          <div className="action-card-body">
            <h3 className="action-card-title">المشاريع والعروض الواردة</h3>
            
            <div className="card-metrics-row">
              <div className="metric-stat">
                <span className="stat-label">مشاريع مفتوحة:</span>
                <strong className="stat-value">{activeProjectsCount}</strong>
              </div>
              <div className="metric-stat">
                <span className="stat-label">عروض بانتظار مراجعتك:</span>
                <strong className="stat-value text-highlight">{totalProposalsReceived}</strong>
              </div>
            </div>

            <div className="action-card-footer">
              <span>إدارة مشاريعك وفرز العروض</span>
              <FiArrowLeft className="card-footer-arrow" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Contracts & Escrow Locked */}
        <div className="action-card" onClick={() => navigate('/contracts')}>
          <div className="action-card-header">
            <div className="action-icon-box contracts">
              <FiShield className="action-card-icon" />
            </div>
            <span className="action-card-tag info">حماية الضمان</span>
          </div>

          <div className="action-card-body">
            <h3 className="action-card-title">العقود قيد التنفيذ والضمان</h3>
            
            <div className="card-metrics-row">
              <div className="metric-stat">
                <span className="stat-label">عقود جارية:</span>
                <strong className="stat-value">{activeContractsCount}</strong>
              </div>
              <div className="metric-stat">
                <span className="stat-label">محجوز بالضمان (Escrow):</span>
                <strong className="stat-value">{escrowAmount.toLocaleString()} ج.س</strong>
              </div>
            </div>

            <div className="action-card-footer">
              <span>متابعة التسليمات واعتماد المراحل</span>
              <FiArrowLeft className="card-footer-arrow" />
            </div>
          </div>
        </div>

        {/* Card 3: Payments & Invoices */}
        <div className="action-card" onClick={() => navigate('/client/payments')}>
          <div className="action-card-header">
            <div className="action-icon-box payments">
              <FiCreditCard className="action-card-icon" />
            </div>
            <span className="action-card-tag warning">المالية</span>
          </div>

          <div className="action-card-body">
            <h3 className="action-card-title">المدفوعات والتحويلات</h3>
            
            <div className="card-metrics-row">
              <div className="metric-stat">
                <span className="stat-label">إجمالي المدفوعات:</span>
                <strong className="stat-value">{totalPaid.toLocaleString()} ج.س</strong>
              </div>
              <div className="metric-stat">
                <span className="stat-label">طريقة الدفع المعتمدة:</span>
                <strong className="stat-value text-bank">بنك الخرطوم (بنكك)</strong>
              </div>
            </div>

            <div className="action-card-footer">
              <span>عرض سجل الفواتير والإيصالات</span>
              <FiArrowLeft className="card-footer-arrow" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ActionCards;
