import React, { useState, useMemo } from 'react';
// FIX: Import the `Installment` type to resolve a TypeScript error.
import { Client, Loan, Account, Installment } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import AmortizationTable from './AmortizationTable';
import { ChevronDownIcon, ExclamationTriangleIcon } from './icons/Icons';

interface LoanListProps {
  loans: Loan[];
  clients: Client[];
  accounts: Account[];
  onRecordPayment: (loanId: string, installmentNumber: number, amount: number, accountId: string) => void;
}

type LoanFilterStatus = 'Todos' | 'Atrasado' | 'Parcialmente Pago' | 'Pendente' | 'Quitado';

const LoanList: React.FC<LoanListProps> = ({ loans, clients, accounts, onRecordPayment }) => {
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<LoanFilterStatus>('Todos');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  };

  const toggleExpand = (loanId: string) => {
    setExpandedLoanId(expandedLoanId === loanId ? null : loanId);
  };

  const filteredLoans = useMemo(() => {
    if (activeFilter === 'Todos') {
      return loans;
    }
    if (activeFilter === 'Quitado') {
      return loans.filter(loan => loan.installments.every(inst => inst.status === 'Paga'));
    }
    
    const statusMap: { [key in LoanFilterStatus]?: Installment['status'] } = {
      'Atrasado': 'Atrasada',
      'Parcialmente Pago': 'Parcialmente Paga',
      'Pendente': 'Pendente',
    };
    
    const targetStatus = statusMap[activeFilter];

    if (targetStatus) {
      return loans.filter(loan => loan.installments.some(inst => inst.status === targetStatus));
    }
    return loans;
  }, [loans, activeFilter]);
  
  const filterOptions: LoanFilterStatus[] = ['Todos', 'Atrasado', 'Parcialmente Pago', 'Pendente', 'Quitado'];

  return (
     <>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-text-primary">Empréstimos</h1>
        <div className="flex space-x-2 p-1 bg-surface-200 rounded-lg">
          {filterOptions.map(option => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                activeFilter === option
                  ? 'bg-primary text-white shadow'
                  : 'text-text-secondary hover:bg-surface-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      {filteredLoans.length === 0 ? (
         <div className="text-center py-16 bg-surface-100 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-text-primary">Nenhum empréstimo encontrado</h3>
          <p className="text-text-secondary mt-2">
            {activeFilter === 'Todos' 
                ? 'Clique em "Novo Empréstimo" para começar.' 
                : 'Tente selecionar um filtro diferente.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map(loan => {
            const paidInstallments = loan.installments.filter(i => i.status === 'Paga').length;
            const totalInstallments = loan.installments.length;
            const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
            const isExpanded = expandedLoanId === loan.id;
            const hasOverdue = loan.installments.some(i => i.status === 'Atrasada');

            return (
              <div key={loan.id} className="bg-surface-100 rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
                <div className="p-6 cursor-pointer hover:bg-surface-200/50" onClick={() => toggleExpand(loan.id)}>
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-grow">
                      <p className="text-sm font-semibold text-primary">{getClientName(loan.clientId)}</p>
                      <p className="text-xl font-bold text-text-primary">{formatCurrency(loan.principal)}</p>
                      <p className="text-sm text-text-secondary">
                        {loan.installmentsCount} parcelas de ~{formatCurrency(loan.installments[0]?.amount)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 w-full sm:w-64">
                      <p className="text-sm text-text-secondary">Início em {formatDate(loan.startDate)}</p>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <span className="text-sm font-medium text-text-secondary">{paidInstallments}/{totalInstallments} Pagas</span>
                        <div className="w-24 bg-surface-300 rounded-full h-2.5">
                          <div className="bg-success h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      {hasOverdue && (
                        <div className="mt-2 flex items-center justify-end text-danger font-semibold">
                          <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                          <span>Parcelas Atrasadas</span>
                        </div>
                      )}
                    </div>
                    <div className="pl-4">
                        <button className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                  </div>
                </div>
                {isExpanded && (
                  <div className="p-4 md:p-6 border-t border-surface-300 bg-surface-200/30">
                    <AmortizationTable
                      loanId={loan.id}
                      installments={loan.installments}
                      accounts={accounts}
                      onRecordPayment={onRecordPayment}
                      clientName={getClientName(loan.clientId)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default LoanList;