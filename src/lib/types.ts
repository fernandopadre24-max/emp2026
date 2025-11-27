export type Loan = {
  id: string;
  borrowerName: string;
  amount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  status: 'Ativo' | 'Atrasado' | 'Pago';
  payments: Payment[];
};

export type Payment = {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
};
