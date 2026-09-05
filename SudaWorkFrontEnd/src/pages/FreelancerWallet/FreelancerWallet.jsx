import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FreelancerWallet.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { mockApi } from '../../services/mockApi';
import { calculateFreelancerNet, calculatePlatformFee } from '../../utils/finance';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiClock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowUpRight, 
  FiX, 
  FiCreditCard, 
  FiSmartphone, 
  FiInfo,
  FiBriefcase
} from 'react-icons/fi';

const FreelancerWallet = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bankak');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user?.fullName || '');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userWithdrawals, userContracts, allProjects] = await Promise.all([
        mockApi.withdrawalRequests.getByFreelancer(user.id),
        mockApi.contracts.getByUser(user.id),
        mockApi.projects.getAll(),
      ]);

      setWithdrawals(userWithdrawals);
      setContracts(userContracts);

      const pMap = {};
      allProjects.forEach((p) => {
        pMap[p.id] = p;
      });
      setProjectsMap(pMap);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Financial calculations
  const completedContracts = contracts.filter((c) => c.status === 'Completed');
  const activeContracts = contracts.filter((c) => c.status === 'Active' || c.status === 'Submitted');

  // Total gross & net earnings from completed work
  const totalNetEarnings = completedContracts.reduce(
    (sum, c) => sum + calculateFreelancerNet(c.agreedPrice || 0),
    0
  );

  // Escrow locked earnings from active work
  const inEscrowLocked = activeContracts.reduce(
    (sum, c) => sum + calculateFreelancerNet(c.agreedPrice || 0),
    0
  );

  // Total withdrawn (Paid or Pending)
  const totalWithdrawn = withdrawals
    .filter((w) => w.status !== 'Rejected')
    .reduce((sum, w) => sum + Number(w.amount || 0), 0);

  // Available balance
  const availableBalance = Math.max(0, totalNetEarnings - totalWithdrawn);

  // Submit Withdrawal Request
  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setActionError('يرجى إدخال مبلغ سحب صالح بالجنيه السوداني.');
      return;
    }
    if (amount > availableBalance) {
      setActionError(`عذراً، رصيدك المتاح للسحب هو ${availableBalance.toLocaleString()} ج.س فقط.`);
      return;
    }
    if (!accountNumber.trim()) {
      setActionError('يرجى كتابة رقم الحساب أو رقم المحفظة الإلكترونية.');
      return;
    }

    setSubmittingWithdrawal(true);
    setActionError('');
    try {
      const details = payoutMethod === 'Bankak'
        ? `رقم الحساب: ${accountNumber.trim()} - باسم: ${accountHolderName.trim()}`
        : `رقم الهاتف: ${accountNumber.trim()} - باسم: ${accountHolderName.trim()}`;

      await mockApi.withdrawalRequests.create({
        freelancerId: user.id,
        amount,
        method: payoutMethod,
        accountDetails: details,
      });

      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setAccountNumber('');
      setActionSuccess('تم تقديم طلب السحب بنجاح! سيتم تحويل المبلغ لحسابك عبر بنكك خلال ساعات العمل.');
      setTimeout(() => setActionSuccess(''), 5000);
      loadData();
    } catch (err) {
      console.error('Failed to submit withdrawal:', err);
      setActionError(err.message || 'فشل إرسال طلب السحب، يرجى المحاولة ثانية.');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  return (
    <div className="freelancer-wallet-page" dir="rtl">
      <DashboardNavbar />

      <main className="freelancer-wallet-main">
        <div className="wallet-container">

          {/* Header */}
          <div className="wallet-header">
            <div>
              <h1 className="wallet-title">المحفظة المالية والأرباح</h1>
              <p className="wallet-desc">
                تتبع عوائد مشاريعك المكتملة، الرصيد المعلق في الضمان، وسحب أرباحك إلى حساب بنكك مباشرة.
              </p>
            </div>

            <button
              type="button"
              className="withdraw-funds-btn"
              disabled={availableBalance <= 0}
              onClick={() => {
                setWithdrawAmount(availableBalance.toString());
                setIsWithdrawModalOpen(true);
              }}
            >
              <FiArrowUpRight />
              <span>طلب سحب أرباح</span>
            </button>
          </div>

          {/* Alert Success / Error */}
          {actionSuccess && (
            <div className="wallet-alert success" role="alert">
              <FiCheckCircle className="alert-icon" />
              <span>{actionSuccess}</span>
            </div>
          )}
          {actionError && (
            <div className="wallet-alert error" role="alert">
              <FiAlertCircle className="alert-icon" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Balance Cards Grid */}
          <div className="wallet-stats-grid">
            {/* Available Balance (Primary Highlight) */}
            <div className="balance-card primary-card">
              <div className="balance-icon-wrap">
                <FiDollarSign />
              </div>
              <div className="balance-content">
                <span className="balance-label">الرصيد المتاح للسحب</span>
                <h2 className="balance-amount">{availableBalance.toLocaleString()} ج.س</h2>
                <span className="balance-sub">جاهز للتحويل الفوري إلى بنكك</span>
              </div>
            </div>

            {/* Pending In Escrow */}
            <div className="balance-card">
              <div className="balance-icon-wrap amber">
                <FiClock />
              </div>
              <div className="balance-content">
                <span className="balance-label">الرصيد المعلق في الضمان</span>
                <h3 className="balance-val">{inEscrowLocked.toLocaleString()} ج.س</h3>
                <span className="balance-sub">يُحرر تلقائياً فور اعتماد تسليماتك</span>
              </div>
            </div>

            {/* Total Historical Net Earnings */}
            <div className="balance-card">
              <div className="balance-icon-wrap green">
                <FiTrendingUp />
              </div>
              <div className="balance-content">
                <span className="balance-label">إجمالي الأرباح التاريخية</span>
                <h3 className="balance-val">{totalNetEarnings.toLocaleString()} ج.س</h3>
                <span className="balance-sub">صافي أرباح المشاريع (بعد عمولة 10%)</span>
              </div>
            </div>
          </div>

          {/* Sudanese Payment Rails Notice Card */}
          <div className="payout-rails-banner">
            <div className="payout-banner-info">
              <div className="rails-badge">
                <FiCreditCard />
                <span>التحويل البنكي المباشر</span>
              </div>
              <h3>سحب الأرباح متاح عبر تطبيق بنكك (بنك الخرطوم)</h3>
              <p>
                يتم إرسال مستحقاتك وأرباحك مباشرة إلى حسابك المصرفي في بنكك بالجنيه السوداني دون أي رسوم تحويل إضافية.
              </p>
            </div>
            <div className="rails-chips">
              <span className="chip active">بنكك (Bankak)</span>
              <span className="chip">زين كاش (Zain Cash)</span>
              <span className="chip">MTN كاش</span>
            </div>
          </div>

          {/* History Section Tabs */}
          <div className="wallet-history-card">
            <div className="history-tabs-strip">
              <button
                type="button"
                className={`history-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdrawals')}
              >
                سجل طلبات السحب ({withdrawals.length})
              </button>
              <button
                type="button"
                className={`history-tab ${activeTab === 'earnings' ? 'active' : ''}`}
                onClick={() => setActiveTab('earnings')}
              >
                سجل الأرباح المكتسبة ({completedContracts.length})
              </button>
            </div>

            {loading ? (
              <div className="wallet-loading">
                <div className="profile-spinner" />
                <p>جارٍ تحميل المعاملات...</p>
              </div>
            ) : activeTab === 'withdrawals' ? (
              /* Withdrawals Table */
              withdrawals.length === 0 ? (
                <div className="empty-history-box">
                  <FiClock className="empty-icon" />
                  <h3>لم تقم بأي عمليات سحب بعد</h3>
                  <p>عندما تتوفر لديك أرباح مكتملة، يمكنك سحبها إلى حسابك المصرفي في أي وقت.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="wallet-table">
                    <thead>
                      <tr>
                        <th>رقم المعاملة</th>
                        <th>طريقة السحب</th>
                        <th>بيانات الحساب / الهاتف</th>
                        <th>المبلغ المسحوب</th>
                        <th>تاريخ الطلب</th>
                        <th>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w.id}>
                          <td>
                            <span className="ref-badge">{w.id}</span>
                          </td>
                          <td>
                            <span className="method-pill">
                              {w.method === 'Bankak' ? 'بنكك (بنك الخرطوم)' : w.method}
                            </span>
                          </td>
                          <td>
                            <span className="account-details-text">{w.accountDetails}</span>
                          </td>
                          <td>
                            <strong className="withdrawn-amount">
                              {Number(w.amount).toLocaleString()} ج.س
                            </strong>
                          </td>
                          <td>
                            <span className="table-date">
                              {new Date(w.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </td>
                          <td>
                            <span className={`status-pill pill-${w.status.toLowerCase()}`}>
                              {(w.status === 'Paid' || w.status === 'Completed') && 'تم التحويل بنجاح'}
                              {w.status === 'Pending' && 'قيد المعالجة'}
                              {w.status === 'Rejected' && 'مرفوض'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Completed Earnings Table */
              completedContracts.length === 0 ? (
                <div className="empty-history-box">
                  <FiBriefcase className="empty-icon" />
                  <h3>لا توجد مشاريع مكتملة ومغلقة بعد</h3>
                  <p>أكمل تسليمات مشاريعك السارية لتضاف أرباحها مباشرة إلى رصيدك المتاح.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="wallet-table">
                    <thead>
                      <tr>
                        <th>رقم العقد</th>
                        <th>اسم المشروع</th>
                        <th>تاريخ الإكمال</th>
                        <th>قيمة العقد الإجمالية</th>
                        <th>عمولة المنصة (10%)</th>
                        <th>صافي أرباحك (90%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedContracts.map((c) => {
                        const proj = projectsMap[c.projectId];
                        const gross = Number(c.agreedPrice || 0);
                        const fee = calculatePlatformFee(gross);
                        const net = calculateFreelancerNet(gross);

                        return (
                          <tr key={c.id}>
                            <td>
                              <Link to={`/contracts/${c.id}`} className="contract-ref-link">
                                #{c.id}
                              </Link>
                            </td>
                            <td>
                              <span className="project-name-text">
                                {proj?.title || 'مشروع في سوداوورك'}
                              </span>
                            </td>
                            <td>
                              <span className="table-date">
                                {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                              </span>
                            </td>
                            <td>
                              <span>{gross.toLocaleString()} ج.س</span>
                            </td>
                            <td>
                              <span className="fee-text">-{fee.toLocaleString()} ج.س</span>
                            </td>
                            <td>
                              <strong className="net-earned-text">+{net.toLocaleString()} ج.س</strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

        </div>
      </main>

      {/* Withdrawal Request Modal */}
      {isWithdrawModalOpen && (
        <div className="wallet-modal-backdrop" onClick={() => !submittingWithdrawal && setIsWithdrawModalOpen(false)}>
          <div className="wallet-modal-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="modal-header">
              <h3>طلب سحب الأرباح</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsWithdrawModalOpen(false)}
                disabled={submittingWithdrawal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="wallet-form">
              <div className="modal-balance-reminder">
                <span className="reminder-label">الرصيد المتاح للسحب:</span>
                <strong className="reminder-val">{availableBalance.toLocaleString()} ج.س</strong>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="withdraw-amount">
                  المبلغ المراد سحبه (بالجنيه السوداني) <span className="required">*</span>
                </label>
                <div className="amount-input-box">
                  <input
                    id="withdraw-amount"
                    type="number"
                    min="1000"
                    max={availableBalance}
                    step="500"
                    className="modal-input"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="max-btn"
                    onClick={() => setWithdrawAmount(availableBalance.toString())}
                  >
                    كامل الرصيد
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">طريقة استلام الأرباح</label>
                <div className="payout-options-radios">
                  <label className={`radio-card ${payoutMethod === 'Bankak' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="Bankak"
                      checked={payoutMethod === 'Bankak'}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                    />
                    <FiCreditCard />
                    <span>بنكك (بنك الخرطوم)</span>
                  </label>
                  <label className={`radio-card ${payoutMethod === 'Zain Cash' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="Zain Cash"
                      checked={payoutMethod === 'Zain Cash'}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                    />
                    <FiSmartphone />
                    <span>زين كاش</span>
                  </label>
                  <label className={`radio-card ${payoutMethod === 'MTN Money' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="MTN Money"
                      checked={payoutMethod === 'MTN Money'}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                    />
                    <FiSmartphone />
                    <span>MTN كاش</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="account-num">
                  {payoutMethod === 'Bankak' ? 'رقم الحساب المصرفي في بنكك' : 'رقم الهاتف المسجل في المحفظة'} <span className="required">*</span>
                </label>
                <input
                  id="account-num"
                  type="text"
                  className="modal-input"
                  placeholder={payoutMethod === 'Bankak' ? 'مثال: 2948102' : 'مثال: 0912345678'}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="holder-name">
                  اسم صاحب الحساب بالكامل (مطابق للمصرف) <span className="required">*</span>
                </label>
                <input
                  id="holder-name"
                  type="text"
                  className="modal-input"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions-strip">
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submittingWithdrawal || availableBalance <= 0}
                >
                  <FiArrowUpRight />
                  <span>{submittingWithdrawal ? 'جارٍ إرسال الطلب...' : 'تأكيد طلب السحب'}</span>
                </button>
                <button
                  type="button"
                  className="modal-cancel-btn"
                  disabled={submittingWithdrawal}
                  onClick={() => setIsWithdrawModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FreelancerWallet;
