
import React from 'react';
import { useGame } from '../../contexts/GameContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { formatMoney, formatDate } from '../../utils/formatters';
import { LOAN_OFFERS } from '../../constants';
import { DollarSign, Landmark, TrendingDown, Lock, Unlock, CreditCard, PieChart, CheckCircle, AlertOctagon } from 'lucide-react';

export const BankView: React.FC = () => {
  const { money, brandPrestige, activeLoans, totalInterestPaid, takeLoan, repayLoan, date } = useGame();
  const { t } = useLanguage();

  const daysUntilInterest = 28 - (date % 28);
  const totalPrincipal = activeLoans.reduce((acc, loan) => acc + loan.principal, 0);
  const totalMonthlyInterest = activeLoans.reduce((acc, loan) => acc + (loan.principal * loan.interestRate), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
        
        {/* TOP ROW: Stats Overview */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border-emerald-900">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-900/50 rounded-full border border-emerald-500/30">
                        <DollarSign size={24} className="text-emerald-400"/>
                    </div>
                    <div>
                        <div className="text-xs text-emerald-300 uppercase font-bold tracking-wider">{t('bank.cash_reserves')}</div>
                        <div className="text-2xl font-mono font-bold text-white">{formatMoney(money)}</div>
                    </div>
                </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/40 to-slate-900 border-red-900">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-900/50 rounded-full border border-red-500/30">
                        <TrendingDown size={24} className="text-red-400"/>
                    </div>
                    <div>
                        <div className="text-xs text-red-300 uppercase font-bold tracking-wider">{t('bank.monthly_interest')}</div>
                        <div className="text-2xl font-mono font-bold text-white">-{formatMoney(totalMonthlyInterest)}</div>
                        <div className="text-[10px] text-red-400">Due in {daysUntilInterest} days</div>
                    </div>
                </div>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-full border border-slate-600">
                        <Landmark size={24} className="text-slate-400"/>
                    </div>
                    <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{t('bank.total_debt')}</div>
                        <div className="text-2xl font-mono font-bold text-white">{formatMoney(totalPrincipal)}</div>
                        <div className="text-[10px] text-slate-500">{t('bank.interest_paid')}: {formatMoney(totalInterestPaid)}</div>
                    </div>
                </div>
            </Card>
        </div>

        {/* LEFT COL: Loan Offers */}
        <div className="lg:col-span-4 space-y-6">
            <h3 className="text-slate-400 font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                <CreditCard size={16} /> {t('bank.loan_offers')}
            </h3>

            {LOAN_OFFERS.map(offer => {
                const isLocked = brandPrestige < offer.minPrestige;
                const monthlyPayment = offer.amount * offer.interestRate;
                
                // Active Loan Count for this Tier
                const activeCount = activeLoans.filter(l => l.tierId === offer.id).length;
                const isLimitReached = activeCount >= 2;
                
                return (
                    <div 
                        key={offer.id} 
                        className={`p-5 rounded-lg border transition-all relative overflow-hidden group ${isLocked ? 'bg-slate-900 border-slate-800 opacity-60' : 'bg-slate-800 border-slate-600 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/20'}`}
                    >
                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div>
                                <h4 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{offer.name}</h4>
                                <div className="text-xs text-slate-400">{offer.description}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {isLocked ? (
                                    <Lock size={18} className="text-slate-500" />
                                ) : (
                                    <Unlock size={18} className="text-emerald-500" />
                                )}
                                {/* Count Badge */}
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isLimitReached ? 'bg-red-900/30 text-red-400 border-red-900' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                                    {activeCount} / 2 Active
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 relative z-10 p-3 bg-slate-900/50 rounded border border-slate-700/50">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-xs text-slate-500 uppercase">Principal</span>
                                <span className="text-xl font-mono font-bold text-emerald-400">{formatMoney(offer.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 flex items-center gap-1"><PieChart size={10}/> Interest Rate</span>
                                <span className="font-mono text-white">{(offer.interestRate * 100).toFixed(1)}% / mo</span>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-slate-700/50">
                                <span className="text-slate-500">Monthly Payment</span>
                                <span className="font-mono text-red-400">-{formatMoney(monthlyPayment)}</span>
                            </div>
                        </div>

                        {isLocked && (
                            <div className="mb-4 text-xs text-center p-2 bg-red-900/10 text-red-400 rounded border border-red-900/30">
                                Requires {offer.minPrestige} Prestige
                            </div>
                        )}

                        <Button 
                            variant="primary" 
                            className="w-full relative z-10"
                            disabled={isLocked || isLimitReached}
                            onClick={() => takeLoan(offer.id)}
                        >
                            {isLimitReached 
                                ? 'Limit Reached' 
                                : isLocked 
                                    ? t('common.locked') 
                                    : t('bank.borrow')
                            }
                        </Button>
                    </div>
                );
            })}
        </div>

        {/* RIGHT COL: Active Loans */}
        <div className="lg:col-span-8 space-y-6">
            <h3 className="text-slate-400 font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                <AlertOctagon size={16} /> {t('bank.active_debt')}
            </h3>

            {activeLoans.length === 0 ? (
                <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center">
                    <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-1">{t('bank.debt_free')}</h3>
                    <p className="text-slate-400 text-sm max-w-sm">
                        Your company currently has no outstanding liabilities with financial institutions.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeLoans.map(loan => {
                        const monthlyPayment = loan.principal * loan.interestRate;
                        const canRepay = money >= loan.principal;

                        return (
                            <div key={loan.id} className="bg-slate-900 border border-slate-700 p-5 rounded-lg flex flex-col justify-between hover:border-red-500/30 transition-colors">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{loan.name}</h4>
                                            <div className="text-xs text-slate-500 font-mono">{loan.id.split('_').pop()} • {formatDate(loan.dateTaken)}</div>
                                        </div>
                                        <div className="bg-red-900/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-900/30">
                                            {(loan.interestRate * 100).toFixed(1)}% APR
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">{t('bank.outstanding_principal')}</span>
                                            <span className="font-mono font-bold text-white">{formatMoney(loan.principal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">{t('bank.next_payment')}</span>
                                            <span className="font-mono font-bold text-red-400">-{formatMoney(monthlyPayment)}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    variant="secondary"
                                    onClick={() => repayLoan(loan.id)}
                                    disabled={!canRepay}
                                    className={`w-full ${canRepay ? 'hover:bg-emerald-900/50 hover:text-emerald-400 hover:border-emerald-500' : ''}`}
                                >
                                    {canRepay ? `${t('bank.repay')} (${formatMoney(loan.principal)})` : 'Insufficient Funds'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

    </div>
  );
};
