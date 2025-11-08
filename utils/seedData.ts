import { Client, Loan, Account, Transaction } from '../types';
import { calculateAmortization } from './loanCalculator';

const createSeedData = () => {
  const seedClients: Client[] = [
    {
      id: 'client_1',
      name: 'João da Silva',
      cpf: '123.456.789-00',
      phone: '(11) 98765-4321',
      address: 'Rua das Flores, 123, São Paulo, SP',
    },
    {
      id: 'client_2',
      name: 'Maria Oliveira',
      cpf: '987.654.321-00',
      phone: '(21) 91234-5678',
      address: 'Avenida Copacabana, 456, Rio de Janeiro, RJ',
    },
  ];

  const seedAccounts: Account[] = [
    {
      id: 'account_1',
      name: 'Caixa Principal',
      balance: 15000.00,
    },
    {
      id: 'account_2',
      name: 'Investimentos',
      balance: 50000.00,
    }
  ];

  const today = new Date();
  const startDate1 = new Date(today.getFullYear(), today.getMonth() - 2, 15).toISOString().split('T')[0];
  const installments1 = calculateAmortization(5000, 0.03, 12, startDate1);

  // Pagamentos para o primeiro empréstimo
  const payment1_1 = { id: `payment_${Date.now()}_1`, amount: 250, date: new Date(today.getFullYear(), today.getMonth() - 1, 10).toISOString(), accountId: 'account_1', method: 'Transferência' as const };
  const payment1_2 = { id: `payment_${Date.now()}_2`, amount: installments1[0].amount - 250, date: new Date(today.getFullYear(), today.getMonth() - 1, 14).toISOString(), accountId: 'account_1', method: 'Transferência' as const };
  const payment2_1 = { id: `payment_${Date.now()}_3`, amount: installments1[1].amount, date: new Date(today.getFullYear(), today.getMonth(), 13).toISOString(), accountId: 'account_1', method: 'PIX' as const, pixKey: 'joao@email.com' };
  
  installments1[0].payments.push(payment1_1, payment1_2);
  installments1[0].status = 'Paga';

  installments1[1].payments.push(payment2_1);
  installments1[1].status = 'Paga';
  
  const startDate2 = new Date(today.getFullYear(), today.getMonth() - 5, 5).toISOString().split('T')[0];
  const installments2 = calculateAmortization(12000, 0.025, 24, startDate2);
  
  const seedLoans: Loan[] = [
    {
      id: 'loan_1',
      code: 'EMP-001',
      clientId: 'client_1',
      principal: 5000,
      interestRate: 3,
      installmentsCount: 12,
      startDate: startDate1,
      installments: installments1,
    },
    {
      id: 'loan_2',
      code: 'EMP-002',
      clientId: 'client_2',
      principal: 12000,
      interestRate: 2.5,
      installmentsCount: 24,
      startDate: startDate2,
      installments: installments2,
    },
  ];

  const seedTransactions: Transaction[] = [
    { ...payment1_1, transactionId: `txn_${payment1_1.id}`, loanId: 'loan_1', clientId: 'client_1', installmentNumber: 1 },
    { ...payment1_2, transactionId: `txn_${payment1_2.id}`, loanId: 'loan_1', clientId: 'client_1', installmentNumber: 1 },
    { ...payment2_1, transactionId: `txn_${payment2_1.id}`, loanId: 'loan_1', clientId: 'client_1', installmentNumber: 2 },
  ];

  return { seedClients, seedAccounts, seedLoans, seedTransactions };
};

export default createSeedData;