import React, { useMemo, useState } from 'react';
import { Loan, Client, Transaction, Account } from '../types';
import { formatCurrency } from '../utils/loanCalculator';
import RecentMovements from './RecentMovements';
import { UserGroupIcon, CurrencyDollarIcon, BanknotesIcon, ChartBarIcon, EyeIcon, EyeSlashIcon } from './icons/Icons';

interface DashboardProps {
  loans: Loan[];
  clients: Client[];
  transactions: Transaction[];
  accounts: Account[];
}

type RevenueFilter = '6m' | '12m' | 'ytd';
type LoanStatusVisibility = {
    onTime: boolean;
    overdue: boolean;
    paidOff: boolean;
};
type LoanStatusChartType = 'pie' | 'bar';

const formatCurrencyForAxis = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-surface-100 rounded-xl shadow-lg p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ loans, clients, transactions, accounts }) => {
    const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>('6m');
    const [statusVisibility, setStatusVisibility] = useState<LoanStatusVisibility>({ onTime: true, overdue: true, paidOff: true });
    const [loanStatusChartType, setLoanStatusChartType] = useState<LoanStatusChartType>('pie');

    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalReceivable = loans.reduce((sum, loan) => {
        const totalAmount = loan.installments.reduce((totalSum, inst) => totalSum + inst.amount, 0);
        const totalPaid = loan.installments.reduce((paidSum, inst) => paidSum + inst.payments.reduce((s, p) => s + p.amount, 0), 0);
        return sum + (totalAmount - totalPaid);
    }, 0);
    const overdueLoansCount = loans.filter(loan => loan.installments.some(inst => inst.status === 'Atrasada')).length;
    const clientCount = clients.length;

    const loanStatusData = useMemo(() => {
        let onTime = 0;
        let overdue = 0;
        let paidOff = 0;

        loans.forEach(loan => {
            if (loan.installments.every(i => i.status === 'Paga')) {
                paidOff++;
            } else if (loan.installments.some(i => i.status === 'Atrasada')) {
                overdue++;
            } else {
                onTime++;
            }
        });
        
        return {
            onTime: { count: onTime },
            overdue: { count: overdue },
            paidOff: { count: paidOff },
        };
    }, [loans]);

    const filteredLoanStatusData = useMemo(() => {
        const data = {
            onTime: statusVisibility.onTime ? loanStatusData.onTime.count : 0,
            overdue: statusVisibility.overdue ? loanStatusData.overdue.count : 0,
            paidOff: statusVisibility.paidOff ? loanStatusData.paidOff.count : 0,
        };
        const total = data.onTime + data.overdue + data.paidOff || 1;
        return {
            onTime: { count: data.onTime, percent: (data.onTime / total) * 100 },
            overdue: { count: data.overdue, percent: (data.overdue / total) * 100 },
            paidOff: { count: data.paidOff, percent: (data.paidOff / total) * 100 },
            total: data.onTime + data.overdue + data.paidOff,
        };
    }, [loanStatusData, statusVisibility]);

    const monthlyRevenueData = useMemo(() => {
        const now = new Date();
        let months: { label: string; year: number; month: number; total: number; }[] = [];
        
        const currentUTCFullYear = now.getUTCFullYear();
        const currentUTCMonth = now.getUTCMonth();

        if (revenueFilter === '12m') {
            months = Array.from({ length: 12 }, (_, i) => {
                const d = new Date(Date.UTC(currentUTCFullYear, currentUTCMonth - i, 1));
                return { label: d.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }), year: d.getUTCFullYear(), month: d.getUTCMonth(), total: 0 };
            }).reverse();
        } else if (revenueFilter === 'ytd') {
            months = Array.from({ length: currentUTCMonth + 1 }, (_, i) => {
                const d = new Date(Date.UTC(currentUTCFullYear, i, 1));
                return { label: d.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }), year: d.getUTCFullYear(), month: d.getUTCMonth(), total: 0 };
            });
        } else { // 6m default
            months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date(Date.UTC(currentUTCFullYear, currentUTCMonth - i, 1));
                return { label: d.toLocaleString('pt-BR', { month: 'short', timeZone: 'UTC' }), year: d.getUTCFullYear(), month: d.getUTCMonth(), total: 0 };
            }).reverse();
        }
        
        transactions.forEach(tx => {
            if (tx.amount > 0) {
                const txDate = new Date(tx.date);
                const txYear = txDate.getUTCFullYear();
                const txMonth = txDate.getUTCMonth();

                const monthData = months.find(m => m.year === txYear && m.month === txMonth);
                if (monthData) {
                    monthData.total += tx.amount;
                }
            }
        });

        const maxRevenue = Math.max(...months.map(m => m.total), 0);
        return { months, maxRevenue };
    }, [transactions, revenueFilter]);
    
    const LoanStatusChartFilter = () => {
        const filters: {key: LoanStatusChartType, label: string}[] = [
            { key: 'pie', label: 'Pizza' },
            { key: 'bar', label: 'Barra' },
        ];
        return (
            <div className="flex space-x-1 p-0.5 bg-surface-200 rounded-lg">
                {filters.map(f => (
                    <button key={f.key} onClick={() => setLoanStatusChartType(f.key)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            loanStatusChartType === f.key ? 'bg-white text-primary shadow' : 'text-text-secondary hover:bg-surface-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        )
    };
    
    const LoanStatusLegend = () => {
        const toggleVisibility = (status: keyof LoanStatusVisibility) => {
            setStatusVisibility(prev => ({...prev, [status]: !prev[status]}));
        }
        return (
            <div className="space-y-2">
                <div onClick={() => toggleVisibility('paidOff')} className={`flex items-center cursor-pointer p-1 rounded-md ${!statusVisibility.paidOff ? 'opacity-50' : ''}`}>
                    <span className="w-3 h-3 rounded-full bg-success mr-2"></span>
                    <span className="text-sm text-text-secondary flex-1">Quitado ({loanStatusData.paidOff.count})</span>
                    {statusVisibility.paidOff ? <EyeIcon className="w-4 h-4 ml-2 text-gray-400"/> : <EyeSlashIcon className="w-4 h-4 ml-2 text-gray-400"/>}
                </div>
                <div onClick={() => toggleVisibility('onTime')} className={`flex items-center cursor-pointer p-1 rounded-md ${!statusVisibility.onTime ? 'opacity-50' : ''}`}>
                    <span className="w-3 h-3 rounded-full bg-primary mr-2"></span>
                    <span className="text-sm text-text-secondary flex-1">Em Dia ({loanStatusData.onTime.count})</span>
                    {statusVisibility.onTime ? <EyeIcon className="w-4 h-4 ml-2 text-gray-400"/> : <EyeSlashIcon className="w-4 h-4 ml-2 text-gray-400"/>}
                </div>
                <div onClick={() => toggleVisibility('overdue')} className={`flex items-center cursor-pointer p-1 rounded-md ${!statusVisibility.overdue ? 'opacity-50' : ''}`}>
                    <span className="w-3 h-3 rounded-full bg-danger mr-2"></span>
                    <span className="text-sm text-text-secondary flex-1">Com Atraso ({loanStatusData.overdue.count})</span>
                    {statusVisibility.overdue ? <EyeIcon className="w-4 h-4 ml-2 text-gray-400"/> : <EyeSlashIcon className="w-4 h-4 ml-2 text-gray-400"/>}
                </div>
            </div>
        );
    };

    const PieChart = () => {
        const paidOffOffset = 0;
        const onTimeOffset = filteredLoanStatusData.paidOff.percent;
        const overdueOffset = filteredLoanStatusData.paidOff.percent + filteredLoanStatusData.onTime.percent;

        return (
            <svg width="150" height="150" viewBox="0 0 36 36" aria-label="Gráfico de pizza da situação dos empréstimos">
                <circle cx="18" cy="18" r="16" fill="var(--color-surface-300)" />
                <circle cx="18" cy="18" r="8" fill="transparent" stroke="var(--color-success)" strokeWidth="16"
                    strokeDasharray={`${filteredLoanStatusData.paidOff.percent} 100`}
                    strokeDashoffset={-paidOffOffset}
                    transform="rotate(-90 18 18)"
                    className="transition-all duration-500" />
                <circle cx="18" cy="18" r="8" fill="transparent" stroke="var(--color-primary)" strokeWidth="16"
                    strokeDasharray={`${filteredLoanStatusData.onTime.percent} 100`}
                    strokeDashoffset={-onTimeOffset}
                    transform="rotate(-90 18 18)"
                    className="transition-all duration-500" />
                <circle cx="18" cy="18" r="8" fill="transparent" stroke="var(--color-danger)" strokeWidth="16"
                    strokeDasharray={`${filteredLoanStatusData.overdue.percent} 100`}
                    strokeDashoffset={-overdueOffset}
                    transform="rotate(-90 18 18)"
                    className="transition-all duration-500" />
            </svg>
        );
    };
    
    const BarChart = () => {
        const data = [
            { label: 'Quitado', value: filteredLoanStatusData.paidOff.count, color: 'bg-success' },
            { label: 'Em Dia', value: filteredLoanStatusData.onTime.count, color: 'bg-primary' },
            { label: 'Com Atraso', value: filteredLoanStatusData.overdue.count, color: 'bg-danger' },
        ];
        const maxValue = Math.max(...data.map(d => d.value), 1);

        return (
            <div className="flex justify-around items-end h-[150px] w-[150px] space-x-4" aria-label="Gráfico de barras da situação dos empréstimos">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center group w-full h-full">
                         <div className="relative flex-grow flex items-end w-full">
                             <div 
                                 role="bar"
                                 aria-label={`${item.label}: ${item.value}`}
                                 title={`${item.label}: ${item.value}`}
                                 className={`w-full ${item.color} rounded-t-md hover:opacity-80 transition-all duration-300 cursor-pointer`}
                                 style={{ height: `${(item.value / maxValue) * 100}%` }}
                             ></div>
                         </div>
                     </div>
                ))}
            </div>
        );
    };

    const RevenueChartFilter = () => {
        const filters: {key: RevenueFilter, label: string}[] = [
            { key: '6m', label: 'Últimos 6M' },
            { key: '12m', label: 'Últimos 12M' },
            { key: 'ytd', label: 'Este Ano' },
        ];
        return (
            <div className="flex space-x-1 p-0.5 bg-surface-200 rounded-lg">
                {filters.map(f => (
                    <button key={f.key} onClick={() => setRevenueFilter(f.key)}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                            revenueFilter === f.key ? 'bg-white text-primary shadow' : 'text-text-secondary hover:bg-surface-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
        )
    };
    
    const RevenueChart = () => {
        const { months, maxRevenue } = monthlyRevenueData;
        
        const getChartYAxis = (maxVal: number) => {
            if (maxVal <= 0) return { ticks: [0, 25, 50, 75, 100], top: 100 };

            const numTicks = 4;
            const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
            const residual = maxVal / magnitude;
            let tickSize;

            if (residual > 5) tickSize = 2 * magnitude;
            else if (residual > 2) tickSize = magnitude;
            else if (residual > 1) tickSize = 0.5 * magnitude;
            else tickSize = 0.2 * magnitude;
            
            const top = Math.ceil(maxVal / tickSize) * tickSize;
            
            const ticks = [];
            const step = top / numTicks;
            for (let i = 0; i <= numTicks; i++) {
                ticks.push(i * step);
            }

            return { ticks, top };
        };

        const { ticks: yTicks, top: yAxisTop } = useMemo(() => getChartYAxis(maxRevenue), [maxRevenue]);
        
        const CHART_HEIGHT = 192; // Corresponds to h-48
        const PADDING = { top: 10, right: 10, bottom: 25, left: 45 };

        const barWidth = 30;
        const barSpacing = 20;
        const chartWidth = PADDING.left + PADDING.right + months.length * (barWidth + barSpacing);
        const chartHeight = CHART_HEIGHT;
        const plotHeight = chartHeight - PADDING.top - PADDING.bottom;

        return (
            <div className="h-48 w-full overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                <svg width={chartWidth} height={chartHeight} aria-label="Gráfico de Receita Mensal">
                    <g role="presentation">
                        {yTicks.map((tick, i) => {
                            const y = PADDING.top + plotHeight - (yAxisTop > 0 ? (tick / yAxisTop) * plotHeight : 0);
                            if (y < PADDING.top) return null;
                            return (
                                <g key={tick} className="text-text-secondary">
                                    <line 
                                        x1={PADDING.left} 
                                        x2={chartWidth - PADDING.right} 
                                        y1={y} y2={y} 
                                        stroke="var(--color-surface-300)"
                                        strokeDasharray={i === 0 ? "none" : "2,3"}
                                    />
                                    <text x={PADDING.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-current">
                                        {formatCurrencyForAxis(tick)}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                    <g role="list" aria-label="Barras de receita">
                        {months.map((month, index) => {
                            const x = PADDING.left + index * (barWidth + barSpacing) + barSpacing / 2;
                            const barHeight = yAxisTop > 0 ? (month.total / yAxisTop) * plotHeight : 0;
                            const y = chartHeight - PADDING.bottom - barHeight;

                            return (
                                <g key={month.label} role="listitem" aria-label={`${month.label}: ${formatCurrency(month.total)}`}>
                                    <rect 
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight > 0 ? barHeight : 0}
                                        rx="3"
                                        className="fill-primary/60 hover:fill-primary transition-colors cursor-pointer"
                                    >
                                        <title>{`${month.label}: ${formatCurrency(month.total)}`}</title>
                                    </rect>
                                    <text x={x + barWidth / 2} y={chartHeight - PADDING.bottom + 15} textAnchor="middle" className="text-xs fill-text-secondary">
                                        {month.label}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                </svg>
            </div>
        );
    };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Painel de Controle</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Emprestado"
          value={formatCurrency(totalPrincipal)}
          icon={<CurrencyDollarIcon className="w-8 h-8 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Saldo a Receber"
          value={formatCurrency(totalReceivable)}
          icon={<ChartBarIcon className="w-8 h-8 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Clientes Ativos"
          value={clientCount}
          icon={<UserGroupIcon className="w-8 h-8 text-white" />}
          color="bg-indigo-500"
        />
        <StatCard
          title="Empréstimos com Atraso"
          value={overdueLoansCount}
          icon={<BanknotesIcon className="w-8 h-8 text-white" />}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-surface-100 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text-primary">Situação dos Empréstimos</h3>
                <LoanStatusChartFilter />
              </div>
              <div className="flex items-center justify-center space-x-8">
                {loanStatusChartType === 'pie' ? <PieChart /> : <BarChart />}
                <LoanStatusLegend />
              </div>
          </div>
          <div className="bg-surface-100 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-text-primary">Receita Mensal</h3>
                <RevenueChartFilter />
              </div>
              <RevenueChart />
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentMovements transactions={transactions} clients={clients} loans={loans} />
        <div className="bg-surface-100 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">Resumo das Contas</h3>
          {accounts.length > 0 ? (
            <ul className="divide-y divide-surface-300">
              {accounts.map(account => (
                <li key={account.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-full">
                      <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="font-medium text-text-primary">{account.name}</p>
                  </div>
                  <p className="font-semibold text-lg text-success">{formatCurrency(account.balance)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-secondary">Nenhuma conta cadastrada.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
