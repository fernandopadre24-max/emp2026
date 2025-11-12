import React, { useState, useMemo } from 'react';
import { Installment, Account, Payment, Receipt } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import Modal from './Modal';
import { BanknotesIcon, PaperClipIcon } from './icons/Icons';

interface AmortizationTableProps {
  loanId: string;
  loanCode: string;
  installments: Installment[];
  accounts: Account[];
  clientName: string;
  onRecordPayment: (loanId: string, installmentNumber: number, amount: number, accountId: string, method: Payment['method'], pixKey?: string, receipt?: Receipt) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const PaymentForm: React.FC<{
  installment: Installment;
  accounts: Account[];
  onConfirm: (amount: number, accountId: string, method: Payment['method'], pixKey?: string, receipt?: Receipt) => void;
  onCancel: () => void;
}> = ({ installment, accounts, onConfirm, onCancel }) => {
  const totalPaid = useMemo(() => installment.payments.reduce((sum, p) => sum + p.amount, 0), [installment.payments]);
  const remainingAmount = installment.amount - totalPaid;
  const [amount, setAmount] = useState(remainingAmount.toFixed(2));
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [method, setMethod] = useState<Payment['method']>('Dinheiro');
  const [pixKey, setPixKey] = useState('');
  const [error, setError] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Simple validation (e.g., size < 5MB)
          if (file.size > 5 * 1024 * 1024) {
              setError("O arquivo é muito grande. O limite é 5MB.");
              return;
          }
          setReceiptFile(file);
          setError('');
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paidAmount = parseFloat(amount);
    
    setError('');
    if (!accountId) { setError("Por favor, selecione uma conta."); return; }
    if (isNaN(paidAmount) || paidAmount <= 0) { setError("O valor do pagamento deve ser positivo."); return; }
    if (paidAmount > remainingAmount + 0.01) { setError(`O valor máximo do pagamento é ${formatCurrency(remainingAmount)}.`); return; }
    if (method === 'PIX' && !pixKey.trim()) { setError("Por favor, insira a chave PIX."); return; }
    if (isUploading) return;

    let receiptData: Receipt | undefined = undefined;
    if (receiptFile) {
        setIsUploading(true);
        try {
            const base64Data = await fileToBase64(receiptFile);
            receiptData = {
                data: base64Data,
                name: receiptFile.name,
                type: receiptFile.type,
            };
        } catch (err) {
            setError("Erro ao processar o arquivo. Tente novamente.");
            setIsUploading(false);
            return;
        }
        setIsUploading(false);
    }
    
    onConfirm(paidAmount, accountId, method, method === 'PIX' ? pixKey : undefined, receiptData);
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

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Anexar Recibo (Opcional)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                {receiptFile ? (
                    <>
                        <p className="text-sm text-text-secondary">{receiptFile.name}</p>
                        <button type="button" onClick={() => setReceiptFile(null)} className="text-xs text-danger hover:underline">Remover</button>
                    </>
                ) : (
                    <>
                        <div className="flex text-sm text-text-secondary">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-surface-100 rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                <span>Carregar um arquivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,.pdf" />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, PDF até 5MB</p>
                    </>
                )}
            </div>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:bg-gray-400" disabled={accounts.length === 0 || isUploading}>
          {isUploading ? 'Processando...' : 'Confirmar Pagamento'}
        </button>
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
                   {payment.receipt && (
                        <a href={payment.receipt.data} download={payment.receipt.name} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center text-xs text-primary hover:underline">
                            <PaperClipIcon className="w-3 h-3 mr-1" />
                            Ver Recibo
                        </a>
                   )}
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
              {['#', 'Vencimento', 'Valor Parcela', 'Principal', 'Juros', 'Valor Pago', 'Saldo Devedor', 'Status', 'Ações'].map(header => (
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
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary font-semibold">{formatCurrency(inst.amount)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(inst.principal)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(inst.interest)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-success font-medium">{formatCurrency(totalPaid)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatCurrency(inst.balance)}</td>
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
            onConfirm={(amount, accountId, method, pixKey, receipt) => {
              onRecordPayment(loanId, paymentModalInstallment.number, amount, accountId, method, pixKey, receipt);
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