

export interface Client {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
}

export interface Payment {
  id:string;
  amount: number;
  date: string; // ISO string
  accountId: string;
  method: 'Dinheiro' | 'Transferência' | 'PIX';
  pixKey?: string;
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
  code: string;
  clientId: string;
  accountId: string;
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

export interface Transaction {
  id: string;
  accountId: string;
  amount: number; // positive for income, negative for outcome
  date: string; // ISO string
  type: 'payment' | 'deposit' | 'withdrawal';
  description: string;
  
  // Optional fields specific to payment type
  loanId?: string;
  clientId?: string;
  installmentNumber?: number;
  method?: 'Dinheiro' | 'Transferência' | 'PIX';
  pixKey?: string;
}


export type View = 'dashboard' | 'loans' | 'clients' | 'accounts' | 'calculator' | 'calendar';