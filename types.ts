// types.ts

export interface Receipt {
  data: string; // base64 data URL
  name: string;
  type: string;
}

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
  method: 'Dinheiro' | 'Transferência' | 'PIX';
  pixKey?: string;
  receipt?: Receipt;
}

export interface Installment {
  number: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  status: 'Pendente' | 'Paga' | 'Atrasada' | 'Parcialmente Paga';
  payments: Payment[];
}

export interface Loan {
  id: string;
  code: string;
  clientId: string;
  accountId: string;
  principal: number;
  interestRate: number;
  installmentsCount: number;
  startDate: string; // YYYY-MM-DD
  installments: Installment[];
  iofRate?: number;
  iofAmount?: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  date: string; // ISO string
  type: 'payment' | 'withdrawal' | 'deposit';
  description: string;
  loanId?: string;
  clientId?: string;
  installmentNumber?: number;
  method?: Payment['method'];
  pixKey?: string;
  receipt?: Receipt;
}

export type View = 'dashboard' | 'loans' | 'clients' | 'accounts' | 'calculator' | 'calendar';