import React, { useState } from 'react';
import { Client, Loan } from '../types';
import { calculateAmortization } from '../utils/loanCalculator';

interface LoanFormProps {
  clients: Client[];
  addLoan: (loan: Loan) => void;
  closeModal: () => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ clients, addLoan, closeModal }) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [installmentsCount, setInstallmentsCount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const p = parseFloat(principal);
    const ir = parseFloat(interestRate);
    const ic = parseInt(installmentsCount, 10);

    if(!clientId || isNaN(p) || isNaN(ir) || isNaN(ic) || p <= 0 || ir <= 0 || ic <= 0) {
        alert("Por favor, preencha todos os campos com valores numéricos positivos e válidos.");
        return;
    }

    const installments = calculateAmortization(p, ir / 100, ic, startDate);
    
    if (installments.length === 0) {
        alert("Não foi possível calcular as parcelas. Verifique se os valores inseridos são realistas (ex: taxa de juros não muito alta).");
        return;
    }

    const newLoan: Loan = {
      id: `loan_${Date.now()}`,
      clientId,
      principal: p,
      interestRate: ir,
      installmentsCount: ic,
      startDate,
      installments,
    };

    addLoan(newLoan);
    closeModal();
  };
  
  const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary";

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
          <input type="number" step="0.01" value={principal} onChange={(e) => setPrincipal(e.target.value)} className={inputStyles} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Taxa de Juros Mensal (%)</label>
          <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputStyles} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nº de Parcelas</label>
          <input type="number" value={installmentsCount} onChange={(e) => setInstallmentsCount(e.target.value)} className={inputStyles} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Data de Início</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyles} required />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover" disabled={clients.length === 0}>Criar Empréstimo</button>
      </div>
    </form>
  );
};

export default LoanForm;
