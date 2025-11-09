import React, { useState, useMemo } from 'react';
// FIX: Import the `Installment` type to resolve a TypeScript error.
// FIX: Import the `Payment` type to correctly type the onRecordPayment prop.
import { Client, Loan, Account, Installment, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import AmortizationTable from './AmortizationTable';
import { ChevronDownIcon, ExclamationTriangleIcon, PencilIcon, TrashIcon, BuildingLibraryIcon } from './icons/Icons';

interface LoanListProps {
  loans: Loan[];
  clients: Client[];
  accounts: Account[];
  onRecordPayment: (loanId: string, installmentNumber: number, amount: number, accountId: string, method: Payment['method'], pixKey?: string) => void;
  onEdit: (loan: Loan) => void;
  onDelete: (loanId: string) => void;
}

type LoanFilterStatus = 'Todos' | 'Atrasado' | 'Parcialmente Pago' | 'Pendente' | 'Quitado';

const LoanList: React.FC<LoanListProps> = ({ loans, clients, accounts, onRecordPayment, onEdit, onDelete }) => {
  const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<LoanFilterStatus>('Todos');

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'Cliente desconhecido';
  };
  
  const getAccountName = (accountId: string) => {
    return accounts.find(a => a.id === accountId)?.name || 'Conta desconhecida';
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
            
            const allPayments = loan.installments.flatMap(inst => inst.payments);
            const lastPayment = allPayments.length > 0
              ? allPayments.reduce((latest, current) => new Date(current.date) > new Date(latest.date) ? current : latest)
              : null;
              
            const totalInterestToPay = loan.installments.reduce((sum, inst) => sum + inst.interest, 0);
            const totalCost = totalInterestToPay + (loan.iofAmount || 0);
            
            return (
              <div key={loan.id} className="bg-surface-100 rounded-xl shadow-lg overflow-hidden transition-shadow hover:shadow-xl">
                <div className="p-6 cursor-pointer hover:bg-surface-200/50" onClick={() => toggleExpand(loan.id)}>
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div className="flex-grow">
                       <div className="flex items-center gap-x-3 mb-2 flex-wrap gap-y-2">
                        <p className="text-sm font-semibold text-primary">{getClientName(loan.clientId)}</p>
                        <span className="text-xs text-text-secondary font-mono bg-surface-200 px-2 py-0.5 rounded-full">{loan.code}</span>
                        <div className="flex items-center text-xs text-text-secondary bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                          <BuildingLibraryIcon className="w-3 h-3 mr-1.5" />
                          <span>{getAccountName(loan.accountId)}</span>
                        </div>
                         <div className="flex space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(loan); }} className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors" title="Editar Empréstimo">
                              <PencilIcon className="w-4 h-4 text-blue-600" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(loan.id); }} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Excluir Empréstimo">
                              <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                      </div>
                      <p className="text-xl font-bold text-text-primary">{formatCurrency(loan.principal)}</p>
                      <p className="text-sm text-text-secondary">
                        {loan.installmentsCount} parcelas de ~{formatCurrency(loan.installments[0]?.amount)}
                      </p>
                      <div className="mt-2 text-xs text-text-secondary flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                            Juros: <span className="font-semibold text-text-primary">{formatCurrency(totalInterestToPay)}</span>
                        </span>
                         {loan.iofAmount && loan.iofAmount > 0 && (
                            <span>
                                IOF: <span className="font-semibold text-text-primary">{formatCurrency(loan.iofAmount)}</span>
                            </span>
                         )}
                        <span>
                            Custo Efetivo Total: <span className="font-semibold text-danger">{formatCurrency(totalCost)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 w-full sm:w-auto">
                      <p className="text-sm text-text-secondary">Início em {formatDate(loan.startDate)}</p>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        <span className="text-sm font-medium text-text-secondary">{paidInstallments}/{totalInstallments} Pagas</span>
                        <div className="w-24 bg-surface-300 rounded-full h-2.5">
                          <div className="bg-success h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      {lastPayment && (
                        <div className="mt-2 text-xs text-text-secondary">
                          Último Pgto: <span className="font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full">{lastPayment.method}</span> em {formatDate(lastPayment.date)}
                        </div>
                      )}
                      {hasOverdue && (
                        <div className="mt-2 flex items-center justify-end text-danger font-semibold">
                          <ExclamationTriangleIcon className="w-5 h-5 mr-1" />
                          <span>Parcelas Atrasadas</span>
                        </div>
                      )}
                    </div>
                    <div className="pl-4 flex items-center">
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
                      loanCode={loan.code}
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
