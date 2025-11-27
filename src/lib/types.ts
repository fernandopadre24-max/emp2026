import { LucideIcon } from "lucide-react";

export type Client = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  avatar: LucideIcon;
};

export type Loan = {
  id: string;
  borrowerName: string;
  clientId: string;
  amount: number;
  interestRate: number;
  startDate: string;
  installments: {
    number: number;
    dueDate: string;
    amount: number;
    principal: number;
    interest: number;
    paidAmount: number;
    status: 'Pendente' | 'Pago' | 'Parcialmente Pago' | 'Atrasado';
  }[];
  status: 'Ativo' | 'Atrasado' | 'Pago' | 'Pendente' | 'Quitado';
  payments: Payment[]; // This can be deprecated or used for history
};

export type Payment = {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Receita' | 'Despesa';
  category: string;
}

export type Account = {
  id: string;
  name: string;
  balance: number;
  icon: LucideIcon;
  transactions: Transaction[];
}
