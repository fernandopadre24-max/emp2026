'use client';

import * as React from 'react';
import type { Account, Client, Loan, Payment, Transaction } from '@/lib/types';
import type { NewLoanFormValues } from '@/app/(app)/emprestimos/components/new-loan-dialog';
import { User as UserIcon, Library, Wallet } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { writeBatch, collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { add, format } from 'date-fns';

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
  seedDatabase: () => Promise<void>;
}

const FinancialDataContext = React.createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { data: accountsData, loading: accountsLoading } = useCollection<Account>('accounts');
  const { data: clientsData, loading: clientsLoading } = useCollection<Client>('clients');
  const { data: loansData, loading: loansLoading } = useCollection<Loan>('loans');
  const firestore = useFirestore();
  
  const loading = accountsLoading || clientsLoading || loansLoading;

  const accounts = React.useMemo(() => {
    if (!accountsData) return [];
    return accountsData.map(a => {
        let icon = Wallet; 
        if (a.name.toLowerCase().includes('investimento')) icon = Library;
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
  
    const seedDatabase = async () => {
    const batch = writeBatch(firestore);

    // 1. Seed Accounts (2)
    const accountIds = ['nubank', 'itau'];
    const accountNames = ['Nubank', 'Itau'];
    accountIds.forEach((id, index) => {
      const accountRef = doc(firestore, 'accounts', id);
      batch.set(accountRef, {
        name: accountNames[index],
        balance: Math.random() * 20000 + 5000,
        transactions: [],
      });
    });

    // 2. Seed Clients (4)
    const clientIds = Array.from({ length: 4 }, () => nanoid(10));
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Daniel'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza'];
    
    const clients = clientIds.map((id, index) => {
        const client = {
            id,
            name: `${firstNames[index]} ${lastNames[index]}`,
            cpf: `000.000.000-0${index}`,
            phone: `(11) 90000-000${index}`,
            address: `Rua Teste, ${index}, Bairro Exemplo`,
        };
        const clientRef = doc(firestore, 'clients', id);
        batch.set(clientRef, client);
        return client;
    });

    // 3. Seed Loans (10)
    for (let i = 0; i < 10; i++) {
        const loanId = nanoid(12);
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const randomAccount = accountIds[Math.floor(Math.random() * accountIds.length)];
        
        const amount = Math.floor(Math.random() * 9000) + 1000;
        const interestRate = parseFloat((Math.random() * 5 + 1).toFixed(2));
        const numInstallments = [3, 6, 12, 24][Math.floor(Math.random() * 4)];
        const startDate = format(add(new Date(), { months: -Math.floor(Math.random() * 6) }), 'yyyy-MM-dd');
        
        const monthlyInterestRate = interestRate / 100;
        const installmentAmount = (amount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numInstallments));

        let remainingBalance = amount;
        const installments = Array.from({ length: numInstallments }).map((_, j) => {
            const interest = remainingBalance * monthlyInterestRate;
            const principal = installmentAmount - interest;
            remainingBalance -= principal;

            const dueDate = add(new Date(`${startDate}T00:00:00`), { months: j + 1 });
            return {
                number: j + 1,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                amount: parseFloat(installmentAmount.toFixed(2)),
                principal: parseFloat(principal.toFixed(2)),
                interest: parseFloat(interest.toFixed(2)),
                paidAmount: 0,
                status: 'Pendente' as const,
            };
        });
        
        const loanRef = doc(firestore, 'loans', loanId);
        batch.set(loanRef, {
            id: loanId,
            borrowerName: randomClient.name,
            clientId: randomClient.id,
            accountId: randomAccount,
            amount,
            interestRate,
            startDate,
            status: 'Ativo',
            installments,
            payments: [],
        });
    }

    await batch.commit();
  };

  const value = {
    accounts,
    clients,
    loans: loansData || [],
    loading,
    createLoan,
    updateLoan,
    deleteLoan,
    registerPayment,
    seedDatabase,
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
