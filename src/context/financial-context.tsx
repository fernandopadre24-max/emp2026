'use client';

import * as React from 'react';
import { add } from 'date-fns';
import { accounts as initialAccounts, clients as initialClients, loans as initialLoans } from '@/lib/data';
import type { Account, Client, Loan, Payment, Transaction } from '@/lib/types';
import type { NewLoanFormValues } from '@/app/(app)/emprestimos/components/new-loan-dialog';
import { User as UserIcon } from 'lucide-react';
import { useCollection } from '@/firebase';

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
  const { data: accountsData, loading: accountsLoading } = useCollection<Account>('accounts');
  const { data: clientsData, loading: clientsLoading } = useCollection<Client>('clients');
  const { data: loansData, loading: loansLoading } = useCollection<Loan>('loans');
  
  const [accounts, setAccounts] = React.useState<Account[]>(initialAccounts);
  const [clients, setClients] = React.useState<Client[]>(initialClients);
  const [loans, setLoans] = React.useState<Loan[]>(initialLoans);

  React.useEffect(() => {
      if (accountsData) {
        // Here you would transform the Firestore data to match your Account type if needed
        // For now, we assume it matches. Icons will need special handling.
        setAccounts(accountsData.map(a => ({...a, icon: UserIcon})));
      }
  }, [accountsData])

  React.useEffect(() => {
      if (clientsData) {
        setClients(clientsData.map(c => ({...c, avatar: UserIcon})));
      }
  }, [clientsData])

  React.useEffect(() => {
      if (loansData) {
        setLoans(loansData);
      }
  }, [loansData])


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
    accounts: accountsLoading ? [] : accounts,
    clients: clientsLoading ? [] : clients,
    loans: loansLoading ? [] : loans,
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
