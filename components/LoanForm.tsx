import React, { useState, useEffect, useRef } from 'react';
import { Client, Loan, Account, Installment } from '../types';
import { calculateAmortization, formatDate, formatCurrency } from '../utils/loanCalculator';
import Calendar from './Calendar';

interface LoanFormProps {
  clients: Client[];
  accounts: Account[];
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (loan: Loan) => void;
  loanToEdit: Loan | null;
  closeModal: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ clients, accounts, addLoan, updateLoan, loanToEdit, closeModal }) => {
  const [clientId, setClientId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState('');
  const [simulationResults, setSimulationResults] = useState<Installment[] | null>(null);
  
  const isEditMode = !!loanToEdit;
  const hasPayments = isEditMode && loanToEdit.installments.some(i => i.payments.length > 0);
  
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loanToEdit) {
      setClientId(loanToEdit.clientId);
      setAccountId(loanToEdit.accountId);
      setPrincipal(String(loanToEdit.principal));
      setInterestRate(String(loanToEdit.interestRate));
      setInstallmentsCount(String(loanToEdit.installmentsCount));
      setStartDate(loanToEdit.startDate);
    } else {
        setClientId(clients[0]?.id || '');
        setAccountId(accounts[0]?.id || '');
    }
  }, [loanToEdit, clients, accounts]);
  
  // Clear simulation results if core values change
  useEffect(() => {
      setSimulationResults(null);
  }, [principal, interestRate, installmentsCount, startDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSimulate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError('');

    const p = parseFloat(principal);
    const ir = parseFloat(interestRate);
    const ic = parseInt(installmentsCount, 10);

    if(isNaN(p) || isNaN(ir) || isNaN(ic) || p <= 0 || ir <= 0 || ic <= 0) {
        setError("Para simular, preencha os campos de valor, juros e parcelas com valores positivos.");
        setSimulationResults(null);
        return;
    }

    const installments = calculateAmortization(p, ir / 100, ic, startDate);
    if (installments.length === 0) {
        setError("Não foi possível calcular a simulação. Verifique os valores inseridos.");
        setSimulationResults(null);
    } else {
        setSimulationResults(installments);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const p = parseFloat(principal);
    const ir = parseFloat(interestRate);
    const ic = parseInt(installmentsCount, 10);

    if(!clientId || !accountId || isNaN(p) || isNaN(ir) || isNaN(ic) || p <= 0 || ir <= 0 || ic <= 0) {
        setError("Por favor, preencha todos os campos com valores numéricos positivos e válidos.");
        return;
    }

    if (!isEditMode) {
      const selectedAccount = accounts.find(acc => acc.id === accountId);
      if (!selectedAccount) {
          setError("Conta selecionada não encontrada.");
          return;
      }
      if (selectedAccount.balance < p) {
          setError(`Saldo insuficiente na conta "${selectedAccount.name}". Saldo disponível: ${formatCurrency(selectedAccount.balance)}.`);
          return;
      }
    }


    if (isEditMode) {
        // Para edição, apenas alguns campos podem ser alterados
        // Recalcular parcelas só se os dados principais mudarem E não houver pagamentos
        const needsRecalculation = !hasPayments && (
            p !== loanToEdit.principal || 
            ir !== loanToEdit.interestRate || 
            ic !== loanToEdit.installmentsCount ||
            startDate !== loanToEdit.startDate
        );
        
        const installments = needsRecalculation 
            ? calculateAmortization(p, ir / 100, ic, startDate)
            : loanToEdit.installments;

        const updatedLoan: Loan = {
          ...loanToEdit,
          clientId,
          principal: p,
          interestRate: ir,
          installmentsCount: ic,
          startDate,
          installments,
        };
        updateLoan(updatedLoan);
    } else {
        const installments = calculateAmortization(p, ir / 100, ic, startDate);
        if (installments.length === 0) {
            setError("Não foi possível calcular as parcelas. Verifique se os valores inseridos são realistas.");
            return;
        }
        const newLoanData: Omit<Loan, 'id'> = {
          code: `EMP-${(Date.now() % 10000).toString().padStart(4, '0')}`,
          clientId,
          accountId,
          principal: p,
          interestRate: ir,
          installmentsCount: ic,
          startDate,
          installments,
        };
        addLoan(newLoanData);
    }

    closeModal();
  };
  
  const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary disabled:bg-surface-200 disabled:cursor-not-allowed";
  
  const totalPaid = simulationResults ? simulationResults.reduce((acc, inst) => acc + inst.amount, 0) : 0;
  const totalInterest = totalPaid - parseFloat(principal || '0');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Cliente</label>
        <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputStyles} required disabled={clients.length === 0}>
           {clients.length === 0 ? <option>Cadastre um cliente primeiro</option> : <option value="" disabled>Selecione um cliente</option>}
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Conta de Saída</label>
        <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputStyles} required disabled={isEditMode || accounts.length === 0}>
            {accounts.length === 0 ? <option>Nenhuma conta cadastrada</option> : <option value="" disabled>Selecione uma conta</option>}
            {accounts.map(account => (
            <option key={account.id} value={account.id}>{account.name} ({formatCurrency(account.balance)})</option>
            ))}
        </select>
        {isEditMode && <p className="text-xs text-text-secondary mt-1">A conta de origem não pode ser alterada após a criação.</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Valor Principal (R$)</label>
          <input type="number" step="0.01" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputStyles} required disabled={hasPayments} />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Taxa de Juros Mensal (%)</label>
          <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputStyles} required disabled={hasPayments} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Parcelas</label>
          <input type="number" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} className={inputStyles} required disabled={hasPayments} />
        </div>
        <div className="relative" ref={calendarRef}>
          <label className="block text-sm font-medium text-text-secondary mb-1">Data de Início</label>
          <input 
            type="text" 
            value={formatDate(startDate)} 
            onClick={() => !hasPayments && setIsCalendarOpen(prev => !prev)}
            className={`${inputStyles} ${hasPayments ? '' : 'cursor-pointer'}`} 
            readOnly 
            disabled={hasPayments} 
          />
           {isCalendarOpen && !hasPayments && (
            <div className="absolute top-full mt-2 z-20">
              <Calendar 
                selectedDate={startDate} 
                onDateSelect={(date) => {
                  setStartDate(date);
                  setIsCalendarOpen(false);
                }} 
              />
            </div>
          )}
        </div>
      </div>
      
       <div className="pt-2">
          <button 
            type="button" 
            onClick={handleSimulate}
            className="w-full px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-hover disabled:bg-gray-400 font-semibold"
            disabled={hasPayments}
          >
            Simular Empréstimo
          </button>
      </div>

      {simulationResults && (
        <div className="mt-4 p-4 bg-surface-200 rounded-lg animate-fade-in-up">
          <h3 className="text-lg font-semibold text-text-primary mb-3">Resultado da Simulação</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-surface-100 p-2 rounded-md">
                <p className="text-xs text-text-secondary">Valor da Parcela</p>
                <p className="font-bold text-primary">{formatCurrency(simulationResults[0]?.amount || 0)}</p>
            </div>
            <div className="bg-surface-100 p-2 rounded-md">
                <p className="text-xs text-text-secondary">Total a Pagar</p>
                <p className="font-bold text-text-primary">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-surface-100 p-2 rounded-md">
                <p className="text-xs text-text-secondary">Total de Juros</p>
                <p className="font-bold text-danger">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto border border-surface-300 rounded-md">
             <table className="min-w-full text-sm">
                <thead className="bg-surface-300/50">
                    <tr>
                        <th className="p-2 text-left font-medium">#</th>
                        <th className="p-2 text-left font-medium">Vencimento</th>
                        <th className="p-2 text-right font-medium">Valor</th>
                    </tr>
                </thead>
                <tbody className="bg-surface-100">
                    {simulationResults.map(inst => (
                        <tr key={inst.number} className="border-t border-surface-300">
                            <td className="p-2 font-mono">{inst.number}</td>
                            <td className="p-2">{formatDate(inst.dueDate)}</td>
                            <td className="p-2 text-right">{formatCurrency(inst.amount)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {hasPayments && <p className="text-sm text-amber-600">Campos principais não podem ser editados pois este empréstimo já possui pagamentos registrados.</p>}
      {error && <p className="text-sm text-danger mt-2">{error}</p>}
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover" disabled={clients.length === 0 || accounts.length === 0}>{isEditMode ? 'Atualizar Empréstimo' : 'Criar Empréstimo'}</button>
      </div>
    </form>
  );
};

export default LoanForm;
