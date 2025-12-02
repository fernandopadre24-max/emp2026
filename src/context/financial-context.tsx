'use client';

import * as React from 'react';
import type { Account, Client, Loan, Payment, Transaction } from '@/lib/types';
import type { NewLoanFormValues } from '@/app/(app)/emprestimos/components/new-loan-dialog';
import { User as UserIcon, Library, Wallet } from 'lucide-react';
import { useCollection } from '@/firebase';

interface FinancialDataContextType {
  accounts: Account[];
  clients: Client[];
  loans: Loan[];
  loading: boolean;
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
  const { data: accountsData, loading: accountsLoading } = useCollection<Account>('accounts');
  const { data: clientsData, loading: clientsLoading } = useCollection<Client>('clients');
  const { data: loansData, loading: loansLoading } = useCollection<Loan>('loans');
  
  const loading = accountsLoading || clientsLoading || loansLoading;

  const accounts = React.useMemo(() => {
    if (!accountsData) return [];
    // Map icons based on ID or name, providing a default.
    return accountsData.map(a => {
        let icon = UserIcon;
        if (a.id === 'investimentos') icon = Library;
        if (a.id === 'nubank') icon = Wallet;
        return {...a, icon };
    });
  }, [accountsData]);

  const clients = React.useMemo(() => {
    if (!clientsData) return [];
    return clientsData.map(c => ({...c, avatar: UserIcon}));
  }, [clientsData]);

  const createLoan = (values: NewLoanFormValues) => {
    // This will be replaced with Firestore logic
    console.log("Creating loan (local):", values);
  };

  const updateLoan = (values: NewLoanFormValues, id: string) => {
    // This will be replaced with Firestore logic
    console.log("Updating loan (local):", id, values);
  };
  
  const deleteLoan = (id: string) => {
    // This will be replaced with Firestore logic
    console.log("Deleting loan (local):", id);
  };
  
  const registerPayment = (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string
  ) => {
    // This will be replaced with Firestore logic
    console.log("Registering payment (local):", { loanId, installmentNumber, paymentAmount });
  };


  const value = {
    accounts,
    clients,
    loans: loansData || [],
    loading,
    createLoan,
    updateLoan,
    deleteLoan,
    registerPayment
  };

  return (
    <FinancialDataContext.Provider value={value}>
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
