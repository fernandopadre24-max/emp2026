import { Client, Loan, Account, Transaction } from '../types';
import { calculateAmortization } from './loanCalculator';

// Initial data for clients
export const initialClients: Client[] = [
  { id: '1', name: 'João da Silva', cpf: '123.456.789-00', phone: '(11) 98765-4321', address: 'Rua das Flores, 123' },
  { id: '2', name: 'Maria Oliveira', cpf: '987.654.321-00', phone: '(21) 91234-5678', address: 'Avenida Brasil, 456' },
];

// Initial data for accounts - balance recalculated based on all seed transactions
export const initialAccounts: Account[] = [
  { id: 'acc1', name: 'Conta Principal', balance: 16454.61 },
  { id: 'acc2', name: 'Poupança', balance: 50000 },
];

// Initial data for loans
const loan1Installments = calculateAmortization(5000, 0.03, 12, '2024-01-15');
const loan2Installments = calculateAmortization(10000, 0.025, 24, '2024-03-01');

export const initialLoans: Loan[] = [
  {
    id: 'loan1',
    code: 'EMP-001',
    clientId: '1',
    accountId: 'acc1',
    principal: 5000,
    interestRate: 3,
    installmentsCount: 12,
    startDate: '2024-01-15',
    installments: loan1Installments.map((inst, i) => {
        if (i < 3) { // Simulate some paid installments
            const payment = { id: `p${i}`, amount: inst.amount, date: new Date(2024, i, 15).toISOString(), accountId: 'acc1', method: 'PIX' as const, pixKey: 'joao@email.com' };
            return { ...inst, status: 'Paga', payments: [payment] };
        }
        return inst;
    }),
  },
  {
    id: 'loan2',
    code: 'EMP-002',
    clientId: '2',
    accountId: 'acc1',
    principal: 10000,
    interestRate: 2.5,
    installmentsCount: 24,
    startDate: '2024-03-01',
    installments: loan2Installments,
  },
];

// Initial data for transactions based on the initial paid installments
const paymentTransactions: Transaction[] = initialLoans
  .flatMap(loan => 
    loan.installments
    .filter(inst => inst.status === 'Paga')
    .flatMap(inst => inst.payments.map(p => ({
        id: `tx_${p.id}`,
        accountId: p.accountId,
        amount: p.amount,
        date: p.date,
        type: 'payment' as const,
        description: `Pag. Parcela #${inst.number} - ${initialClients.find(c => c.id === loan.clientId)?.name}`,
        loanId: loan.id,
        clientId: loan.clientId,
        installmentNumber: inst.number,
        method: p.method,
        pixKey: p.pixKey,
    })))
  );
  
// Create withdrawal transactions for the initial loans
const withdrawalTransactions: Transaction[] = initialLoans.map(loan => ({
    id: `tx_wd_${loan.id}`,
    accountId: loan.accountId,
    amount: -loan.principal,
    date: loan.startDate,
    type: 'withdrawal' as const,
    description: `Saída Empréstimo - ${initialClients.find(c => c.id === loan.clientId)?.name} (${loan.code})`,
    loanId: loan.id,
    clientId: loan.clientId,
}));

export const initialTransactions: Transaction[] = [...paymentTransactions, ...withdrawalTransactions]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());