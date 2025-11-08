import React from 'react';
import { Loan, Client, Transaction } from '../types';
import { formatCurrency } from '../utils/loanCalculator';
import RecentMovements from './RecentMovements';
import { UserGroupIcon, CurrencyDollarIcon, BanknotesIcon, ChartBarIcon } from './icons/Icons';

interface DashboardProps {
  loans: Loan[];
  clients: Client[];
  transactions: Transaction[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-surface-100 rounded-xl shadow-lg p-6 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ loans, clients, transactions }) => {
    const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalReceivable = loans.reduce((sum, loan) => {
        const totalAmount = loan.installments.reduce((totalSum, inst) => totalSum + inst.amount, 0);
        const totalPaid = loan.installments.reduce((paidSum, inst) => paidSum + inst.payments.reduce((s, p) => s + p.amount, 0), 0);
        return sum + (totalAmount - totalPaid);
    }, 0);
    const overdueLoansCount = loans.filter(loan => loan.installments.some(inst => inst.status === 'Atrasada')).length;
    const clientCount = clients.length;

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
      <RecentMovements transactions={transactions} clients={clients} />
    </>
  );
};

export default Dashboard;
