export type Loan = {
  id: string;
  borrowerName: string;
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
  status: 'Ativo' | 'Atrasado' | 'Pago' | 'Pendente';
  payments: Payment[]; // This can be deprecated or used for history
};

export type Payment = {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
};
