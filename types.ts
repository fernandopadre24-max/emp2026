export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string; // ISO string
  accountId: string;
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'Pendente' | 'Paga' | 'Atrasada' | 'Parcialmente Paga';
  payments: Payment[];
}

export interface Loan {
  id: string;
  clientId: string;
  principal: number;
  interestRate: number; // monthly interest rate in percentage
  installmentsCount: number;
  startDate: string; // YYY-MM-DD
  installments: Installment[];
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction extends Payment {
  transactionId: string;
  loanId: string;
  clientId: string;
  installmentNumber: number;
}

export type View = 'dashboard' | 'loans' | 'clients' | 'accounts';
