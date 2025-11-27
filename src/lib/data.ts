import type { Loan } from '@/lib/types';

export const loans: Loan[] = [
  {
    id: 'EMP-232570',
    borrowerName: 'João da Silva',
    amount: 1500,
    interestRate: 10,
    startDate: '2025-11-08',
    status: 'Ativo',
    installments: [
      {
        number: 1,
        dueDate: '2025-12-08',
        amount: 525.0,
        principal: 500.0,
        interest: 25.0,
        paidAmount: 525.0,
        status: 'Pago',
      },
      {
        number: 2,
        dueDate: '2026-01-08',
        amount: 525.0,
        principal: 500.0,
        interest: 25.0,
        paidAmount: 0,
        status: 'Pendente',
      },
      {
        number: 3,
        dueDate: '2026-02-08',
        amount: 525.0,
        principal: 500.0,
        interest: 25.0,
        paidAmount: 0,
        status: 'Pendente',
      },
    ],
    payments: [
      { id: 'PAG-001', loanId: 'EMP-232570', amount: 525.0, paymentDate: '2025-12-05' },
    ],
  },
  {
    id: 'EMP-761238',
    borrowerName: 'Maria Oliveira',
    amount: 500,
    interestRate: 12,
    startDate: '2025-11-16',
    status: 'Quitado',
    installments: [
       { number: 1, dueDate: '2025-12-16', amount: 105, principal: 100, interest: 5, paidAmount: 105, status: 'Pago' },
       { number: 2, dueDate: '2026-01-16', amount: 105, principal: 100, interest: 5, paidAmount: 105, status: 'Pago' },
       { number: 3, dueDate: '2026-02-16', amount: 105, principal: 100, interest: 5, paidAmount: 105, status: 'Pago' },
       { number: 4, dueDate: '2026-03-16', amount: 105, principal: 100, interest: 5, paidAmount: 105, status: 'Pago' },
       { number: 5, dueDate: '2026-04-16', amount: 105, principal: 100, interest: 5, paidAmount: 105, status: 'Pago' },
    ],
    payments: [
        { id: 'PAG-002', loanId: 'EMP-761238', amount: 525, paymentDate: '2026-04-15' },
    ]
  },
  {
    id: 'EMP-9368',
    borrowerName: 'Fernando Sena',
    amount: 5000,
    interestRate: 8,
    startDate: '2025-11-17',
    status: 'Ativo',
    installments: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1,
      dueDate: new Date(2025, 11, 17 + i * 30).toISOString().split('T')[0],
      amount: 875,
      principal: 833.33,
      interest: 41.67,
      paidAmount: 0,
      status: 'Pendente',
    })),
    payments: []
  },
    {
    id: 'EMP-6001',
    borrowerName: 'Fernando Sena',
    amount: 5000,
    interestRate: 8,
    startDate: '2025-11-17',
    status: 'Ativo',
    installments: Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      dueDate: new Date(2025, 11, 17 + i * 30).toISOString().split('T')[0],
      amount: 458.33,
      principal: 416.67,
      interest: 41.66,
      paidAmount: 0,
      status: 'Pendente',
    })),
    payments: []
  },
];
