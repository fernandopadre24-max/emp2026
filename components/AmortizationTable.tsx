import React, { useState, useMemo } from 'react';
import { Installment, Account, Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import Modal from './Modal';
// FIX: Removed unused icons that were not exported from the Icons module.
import { BanknotesIcon } from './icons/Icons';

interface AmortizationTableProps {
  loanId: string;
  loanCode: string;
  installments: Installment[];
  accounts: Account[];
  clientName: string;
  onRecordPayment: (loanId: string, installmentNumber: number, amount: number, accountId: string, method: Payment['method'], pixKey?: string) => void;
}

const PaymentForm: React.FC<{
  installment: Installment;
  accounts: Account[];
  onConfirm: (amount: number, accountId: string, method: Payment['method'], pixKey?: string) => void;
  onCancel: () => void;
}> = ({ installment, accounts, onConfirm, onCancel }) => {
  const totalPaid = useMemo(() => installment.payments.reduce((sum, p) => sum + p.amount, 0), [installment.payments]);
  const remainingAmount = installment.amount - totalPaid;
  const [amount, setAmount] = useState(remainingAmount.toFixed(2));
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [method, setMethod] = useState<Payment['method']>('Dinheiro');
  const [pixKey, setPixKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidAmount = parseFloat(amount);
    
    setError('');
    if (!accountId) { setError("Por favor, selecione uma conta."); return; }
    if (isNaN(paidAmount) || paidAmount <= 0) { setError("O valor do pagamento deve ser positivo."); return; }
    if (paidAmount > remainingAmount + 0.01) { setError(`O valor máximo do pagamento é ${formatCurrency(remainingAmount)}.`); return; }
    if (method === 'PIX' && !pixKey.trim()) { setError("Por favor, insira a chave PIX."); return; }
    
    onConfirm(paidAmount, accountId, method, method === 'PIX' ? pixKey : undefined);
  };

  const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Valor a Pagar (Restante: {formatCurrency(remainingAmount)})</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => { setAmount(e.target.value); setError(''); }} className={inputStyles} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Receber na Conta</label>
        <select value={accountId} onChange={(e) => { setAccountId(e.target.value); setError(''); }} className={inputStyles} required>
          {accounts.length === 0 ? <option disabled>Nenhuma conta cadastrada</option> : accounts.map(acc => (
            <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Método de Pagamento</label>
        <select value={method} onChange={(e) => { setMethod(e.target.value as Payment['method']); setError(''); }} className={inputStyles} required>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Transferência">Transferência</option>
            <option value="PIX">PIX</option>
        </select>
      </div>

      {method === 'PIX' && (
        <div className="animate-fade-in-up">
          <label className="block text-sm font-medium text-text-secondary mb-1">Chave PIX</label>
          <input type="text" value={pixKey} onChange={(e) => { setPixKey(e.target.value); setError(''); }} className={inputStyles} placeholder="CPF, e-mail, telefone, etc." required />
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400" disabled={accounts.length === 0}>Confirmar Pagamento</button>
      </div>
    </form>
  );
};

const PaymentHistoryModal: React.FC<{ installment: Installment; accounts: Account[]; onClose: () => void }> = ({ installment, accounts, onClose }) => {
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Conta desconhecida';
  
  return (
    <Modal isOpen={true} onClose={onClose} title={`Histórico: Parcela #${installment.number}`}>
       <ul className="divide-y divide-surface-300">
          {installment.payments.map(payment => (
            <li key={payment.id} className="py-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-bold text-success">{formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-text-secondary">{formatDate(payment.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full inline-block">{getAccountName(payment.accountId)}</p>
                  <p className="text-xs text-text-secondary mt-1">{payment.method}{payment.pixKey ? ` - ${payment.pixKey}` : ''}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
    </Modal>
  );
};


const AmortizationTable: React.FC<AmortizationTableProps> = ({ loanId, loanCode, installments, accounts, onRecordPayment, clientName }) => {
  const [paymentModalInstallment, setPaymentModalInstallment] = useState<Installment | null>(null);
  const [historyModalInstallment, setHistoryModalInstallment] = useState<Installment | null>(null);

  const getStatusBadge = (status: Installment['status']) => {
    const styles = {
      Paga: 'bg-green-100 text-green-800',
      Atrasada: 'bg-red-100 text-red-800 font-bold',
      'Parcialmente Paga': 'bg-orange-100 text-orange-800',
      Pendente: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <>
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Plano de Amortização - {clientName} ({loanCode})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-300">
          <thead className="bg-surface-200">
            <tr>
              {['#', 'Vencimento', 'Valor Total', 'Valor Pago', 'Status', 'Ações'].map(header => (
                 <th key={header} scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface-100 divide-y divide-surface-300">
            {installments.map((inst) => {
              const totalPaid = inst.payments.reduce((sum, p) => sum + p.amount, 0);
              return (
              <tr key={inst.number} className={inst.status === 'Atrasada' ? 'bg-danger/10' : ''}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{inst.number}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(inst.dueDate)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(inst.amount)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-success font-medium">{formatCurrency(totalPaid)}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(inst.status)}`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  {inst.status !== 'Paga' && (
                     <button onClick={() => setPaymentModalInstallment(inst)} disabled={accounts.length === 0} className="text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed">
                      Pagar
                    </button>
                  )}
                  {inst.payments.length > 0 && (
                     <button onClick={() => setHistoryModalInstallment(inst)} className="text-indigo-600 hover:text-indigo-800">
                      Histórico
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {paymentModalInstallment && (
        <Modal isOpen={!!paymentModalInstallment} onClose={() => setPaymentModalInstallment(null)} title={`Registrar Pagamento: Parcela #${paymentModalInstallment.number}`}>
          <PaymentForm installment={paymentModalInstallment} accounts={accounts} onCancel={() => setPaymentModalInstallment(null)}
            onConfirm={(amount, accountId, method, pixKey) => {
              onRecordPayment(loanId, paymentModalInstallment.number, amount, accountId, method, pixKey);
              setPaymentModalInstallment(null);
            }}
          />
        </Modal>
      )}
      
      {historyModalInstallment && (
        <PaymentHistoryModal installment={historyModalInstallment} accounts={accounts} onClose={() => setHistoryModalInstallment(null)} />
      )}
    </>
  );
};

export default AmortizationTable;