import React, { useState, useEffect, useRef } from 'react';
import { Client, Loan } from '../types';
import { calculateAmortization, formatDate } from '../utils/loanCalculator';
import Calendar from './Calendar';

interface LoanFormProps {
  clients: Client[];
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (loan: Loan) => void;
  loanToEdit: Loan | null;
  closeModal: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ clients, addLoan, updateLoan, loanToEdit, closeModal }) => {
  const [clientId, setClientId] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const isEditMode = !!loanToEdit;
  const hasPayments = isEditMode && loanToEdit.installments.some(i => i.payments.length > 0);
  
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loanToEdit) {
      setClientId(loanToEdit.clientId);
      setPrincipal(String(loanToEdit.principal));
      setInterestRate(String(loanToEdit.interestRate));
      setInstallmentsCount(String(loanToEdit.installmentsCount));
      setStartDate(loanToEdit.startDate);
    } else {
        setClientId(clients[0]?.id || '');
    }
  }, [loanToEdit, clients]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const p = parseFloat(principal);
    const ir = parseFloat(interestRate);
    const ic = parseInt(installmentsCount, 10);

    if(!clientId || isNaN(p) || isNaN(ir) || isNaN(ic) || p <= 0 || ir <= 0 || ic <= 0) {
        alert("Por favor, preencha todos os campos com valores numéricos positivos e válidos.");
        return;
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
            alert("Não foi possível calcular as parcelas. Verifique se os valores inseridos são realistas.");
            return;
        }
        const newLoanData: Omit<Loan, 'id'> = {
          code: `EMP-${Date.now().toString().slice(-6)}`,
          clientId,
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
      {hasPayments && <p className="text-sm text-amber-600">Campos principais não podem ser editados pois este empréstimo já possui pagamentos registrados.</p>}
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover" disabled={clients.length === 0}>{isEditMode ? 'Atualizar Empréstimo' : 'Criar Empréstimo'}</button>
      </div>
    </form>
  );
};

export default LoanForm;
