import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FreelancerWallet.css';
import DashboardNavbar from '../../components/DashboardNavbar/DashboardNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/auth';
import { api } from '../../services/api';
import { usePlatform } from '../../context/platform';
import { FEATURES } from '../../constants/features';
import ErrorState from '../../components/common/ErrorState/ErrorState';
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
import useLoader from '../../hooks/useLoader';

const FreelancerWallet = () => {
  const { user } = useAuth();
  const { isFeatureAvailable, settings } = usePlatform();
  const withdrawalsEnabled = isFeatureAvailable(FEATURES.WITHDRAWALS);

  const [withdrawals, setWithdrawals] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTab, setActiveTab] = useState('withdrawals');
  const [actionSuccess, setActionSuccess] = useState('');

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('Bankak');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState(user?.fullName || '');
  const [modalError, setModalError] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  // Balances are computed by the server from completed contracts and payouts.
  const loadData = async () => {
    try {
      const [myWithdrawals, myContracts, myBalance] = await Promise.all([
        api.withdrawals.mine(),
        api.contracts.list(),
        api.withdrawals.balance(),
      ]);
      setWithdrawals(myWithdrawals);
      setContracts(myContracts);
      setBalance(myBalance);
      setLoadError(null);
    } catch (err) {
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  };

  useLoader(loadData, [user?.id], Boolean(user));

  const completedContracts = contracts.filter((c) => c.status === 'Completed');
  const availableBalance = balance?.available ?? 0;
  const inEscrowLocked = balance?.pendingEarnings ?? 0;
  const totalNetEarnings = balance?.totalEarned ?? 0;
  const commissionPercent = balance?.commissionPercent ?? 10;

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (!amount || amount <= 0) {
      setModalError('يرجى إدخال مبلغ سحب صالح بالجنيه السوداني.');
      return;
    }
    if (amount > availableBalance) {
      setModalError(`عذراً، رصيدك المتاح للسحب هو ${availableBalance.toLocaleString()} ج.س فقط.`);
      return;
    }
    if (accountNumber.trim().length < 3) {
      setModalError('يرجى كتابة رقم الحساب أو رقم المحفظة الإلكترونية.');
      return;
    }
    if (accountHolderName.trim().length < 2) {
      setModalError('يرجى كتابة اسم صاحب الحساب.');
      return;
    }

    setSubmittingWithdrawal(true);
    setModalError('');
    try {
      await api.withdrawals.create({
        amount,
        paymentMethod: payoutMethod,
        accountName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
      });

      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setAccountNumber('');
      setActionSuccess('تم تقديم طلب السحب بنجاح! ستراجعه الإدارة ثم تحوّل المبلغ وتُشعرك برقم العملية.');
      setTimeout(() => setActionSuccess(''), 6000);
      loadData();
    } catch (err) {
      setModalError(err.message || 'فشل إرسال طلب السحب، يرجى المحاولة ثانية.');
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
              disabled={availableBalance <= 0 || !withdrawalsEnabled}
              title={!withdrawalsEnabled ? 'طلبات السحب متوقفة مؤقتاً من قبل الإدارة' : availableBalance <= 0 ? 'لا يوجد رصيد متاح للسحب بعد' : undefined}
              onClick={() => {
                setWithdrawAmount(availableBalance.toString());
                setModalError('');
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
          {!withdrawalsEnabled && (
            <div className="wallet-alert error" role="status">
              <FiInfo className="alert-icon" />
              <span>طلبات السحب متوقفة مؤقتاً بقرار من إدارة المنصة. رصيدك محفوظ ويمكنك طلب السحب عند إعادة تفعيلها.</span>
            </div>
          )}
          {loadError && (
            <ErrorState title="تعذر تحميل بيانات المحفظة" error={loadError} onRetry={() => { setLoading(true); loadData(); }} />
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
                <span className="balance-sub">{balance?.pendingWithdrawals > 0 ? `${balance.pendingWithdrawals.toLocaleString()} ج.س قيد المعالجة` : 'متاح لطلب السحب'}</span>
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
                <span className="balance-sub">يُضاف إلى رصيدك فور اعتماد العميل للعمل</span>
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
                <span className="balance-sub">صافي أرباح المشاريع (بعد عمولة المنصة)</span>
              </div>
            </div>
          </div>

          {/* Payout instructions published by the admin */}
          {settings?.withdrawal_instructions && (
            <div className="payout-rails-banner">
              <div className="payout-banner-info">
                <div className="rails-badge">
                  <FiCreditCard />
                  <span>تعليمات السحب</span>
                </div>
                <p>{settings.withdrawal_instructions}</p>
              </div>
            </div>
          )}

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
            ) : loadError ? null : activeTab === 'withdrawals' ? (
              /* Withdrawals Table */
              withdrawals.length === 0 ? (
                <div className="empty-history-box">
                  <FiClock className="empty-icon" />
                  <h3>لم تقم بأي عمليات سحب بعد</h3>
                  <p>
                    {availableBalance > 0
                      ? 'لديك رصيد متاح الآن. اضغط على "طلب سحب أرباح" واختر طريقة الاستلام لتحويله إلى حسابك.'
                      : 'عندما يعتمد العملاء أعمالك المكتملة، ستُضاف أرباحك إلى رصيدك ويمكنك طلب سحبها من هنا.'}
                  </p>
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
                            <span className="ref-badge">{w.transactionReference || w.id.slice(0, 8)}</span>
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
                              {w.status === 'Paid' && 'تم التحويل بنجاح'}
                              {w.status === 'Approved' && 'معتمد - بانتظار التحويل'}
                              {w.status === 'Pending' && 'قيد المراجعة'}
                              {w.status === 'Rejected' && 'مرفوض'}
                            </span>
                            {w.adminReason && <div className="table-date">السبب: {w.adminReason}</div>}
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
                        <th>عمولة المنصة</th>
                        <th>صافي أرباحك</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedContracts.map((c) => {
                        const gross = Number(c.agreedPrice || 0);
                        // Fee snapshot stored when the contract was completed.
                        const fee = c.platformFee ?? Math.round(gross * commissionPercent) / 100;
                        const net = c.freelancerNet ?? gross - fee;

                        return (
                          <tr key={c.id}>
                            <td>
                              <Link to={`/contracts/${c.id}`} className="contract-ref-link">
                                #{c.id.slice(0, 8)}
                              </Link>
                            </td>
                            <td>
                              <span className="project-name-text">
                                {c.projectTitle}
                              </span>
                            </td>
                            <td>
                              <span className="table-date">
                                {new Date(c.completedAt || c.createdAt).toLocaleDateString('ar-EG')}
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
              {modalError && (
                <div className="wallet-alert error" role="alert">
                  <FiAlertCircle className="alert-icon" />
                  <span>{modalError}</span>
                </div>
              )}
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
                    min="1"
                    max={availableBalance}
                    step="any"
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
                  <label className={`radio-card ${payoutMethod === 'MTN Cash' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="payoutMethod"
                      value="MTN Cash"
                      checked={payoutMethod === 'MTN Cash'}
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
