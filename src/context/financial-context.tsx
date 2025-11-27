'use client';

import * as React from 'react';
import { add } from 'date-fns';
import { accounts as initialAccounts, clients as initialClients, loans as initialLoans } from '@/lib/data';
import type { Account, Client, Loan, Payment, Transaction } from '@/lib/types';
import type { NewLoanFormValues } from '@/app/(app)/emprestimos/components/new-loan-dialog';

interface FinancialDataContextType {
  accounts: Account[];
  clients: Client[];
  loans: Loan[];
  createLoan: (values: NewLoanFormValues) => void;
  updateLoan: (values: NewLoanFormValues, id: string) => void;
  deleteLoan: (id: string) => void;
  registerPayment: (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string
  ) => void;
}

const FinancialDataContext = React.createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts);
  const [clients, setClients] = React.useState<Client[]>(initialClients);
  const [loans, setLoans] = React.useState<Loan[]>(initialLoans);

  const createLoan = (values: NewLoanFormValues) => {
    const {
      clientId,
      accountId,
      amount,
      installments: numInstallments,
      interestRate,
      startDate,
      iofRate,
      iofValue
    } = values;

    const client = clients.find(c => c.id === clientId);
    if (!client) {
        console.error("Client not found");
        return;
    }
    
    // Calculate installments
    const monthlyInterestRate = interestRate / 100;
    const iof = iofValue || (iofRate ? amount * (iofRate / 100) : 0);
    const totalLoanAmount = amount + iof;
    const installmentAmount = totalLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numInstallments)) / (Math.pow(1 + monthlyInterestRate, numInstallments) - 1);
    
    let remainingBalance = totalLoanAmount;
    const installments: Loan['installments'] = [];
     for (let i = 1; i <= numInstallments; i++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = installmentAmount - interest;
        remainingBalance -= principal;
        const dueDate = add(new Date(`${startDate}T00:00:00`), { months: i });
        installments.push({
            number: i,
            dueDate: dueDate.toISOString().split('T')[0],
            amount: installmentAmount,
            principal: principal,
            interest: interest,
            paidAmount: 0,
            status: 'Pendente'
        });
    }

    const newLoan: Loan = {
      id: `EMP-${Date.now()}`,
      borrowerName: client.name,
      clientId,
      accountId,
      amount,
      interestRate,
      startDate,
      installments,
      status: 'Ativo',
      payments: [],
      iofRate,
      iofValue,
    };

    setLoans(prev => [...prev, newLoan]);

    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        const newTransaction: Transaction = {
          id: `TRX-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          description: `Empréstimo concedido a ${client.name}`,
          amount: amount,
          type: 'Despesa',
          category: 'Empréstimos',
          referenceId: newLoan.id,
        };
        return {
          ...acc,
          balance: acc.balance - amount,
          transactions: [...acc.transactions, newTransaction],
        };
      }
      return acc;
    }));
  };

  const updateLoan = (values: NewLoanFormValues, id: string) => {
    // Note: In a real-world scenario, updating a loan would be complex,
    // especially if payments have already been made. This is a simplified version.
    setLoans(prevLoans => prevLoans.map(loan => {
        if (loan.id === id) {
            // Recalculate installments based on new values
            const { amount, installments: numInstallments, interestRate, startDate } = values;
            const monthlyInterestRate = interestRate / 100;
            const installmentAmount = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numInstallments)) / (Math.pow(1 + monthlyInterestRate, numInstallments) - 1);

            let remainingBalance = amount;
            const newInstallments: Loan['installments'] = [];
            for (let i = 1; i <= numInstallments; i++) {
                const interest = remainingBalance * monthlyInterestRate;
                const principal = installmentAmount - interest;
                remainingBalance -= principal;
                const dueDate = add(new Date(`${startDate}T00:00:00`), { months: i });

                const existingInstallment = loan.installments.find(inst => inst.number === i);

                newInstallments.push({
                    number: i,
                    dueDate: dueDate.toISOString().split('T')[0],
                    amount: installmentAmount,
                    principal,
                    interest,
                    paidAmount: existingInstallment?.paidAmount || 0,
                    status: existingInstallment?.status || 'Pendente',
                });
            }

            return {
                ...loan,
                ...values,
                installments: newInstallments,
            };
        }
        return loan;
    }));
  };
  
  const deleteLoan = (id: string) => {
    // In a real app, you might want to handle associated transactions,
    // but here we'll just remove the loan.
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };
  
  const registerPayment = (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string
  ) => {

    const newPayment: Payment = {
        id: `PAG-${Date.now()}`,
        loanId,
        installmentNumber,
        amount: paymentAmount,
        paymentDate,
        method: paymentMethod,
        destinationAccountId,
    };
    
    // Update Loan State
    setLoans(prevLoans =>
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const newPayments = [...loan.payments, newPayment];
          const newInstallments = loan.installments.map(inst => {
            if (inst.number === installmentNumber) {
              const newPaidAmount = inst.paidAmount + paymentAmount;
              return {
                ...inst,
                paidAmount: newPaidAmount,
                status: newPaidAmount >= inst.amount ? 'Pago' : 'Parcialmente Pago',
              };
            }
            return inst;
          });

          const allPaid = newInstallments.every(inst => inst.status === 'Pago');
          const newLoanStatus = allPaid ? 'Quitado' : loan.status;

          return { ...loan, installments: newInstallments, payments: newPayments, status: newLoanStatus };
        }
        return loan;
      })
    );

    // Update Account State
    setAccounts(prevAccounts => 
        prevAccounts.map(account => {
            if (account.id === destinationAccountId) {
                const loan = loans.find(l => l.id === loanId);
                const newTransaction: Transaction = {
                    id: `TRX-${Date.now()}`,
                    date: paymentDate,
                    description: `Pagamento parcela #${installmentNumber} de ${loan?.borrowerName}`,
                    amount: paymentAmount,
                    type: 'Receita',
                    category: 'Pagamentos',
                    referenceId: newPayment.id,
                };
                return {
                    ...account,
                    balance: account.balance + paymentAmount,
                    transactions: [...account.transactions, newTransaction],
                };
            }
            return account;
        })
    );
  };


  return (
    <FinancialDataContext.Provider value={{ accounts, clients, loans, createLoan, updateLoan, deleteLoan, registerPayment }}>
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = React.useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialProvider');
  }
  return context;
}
