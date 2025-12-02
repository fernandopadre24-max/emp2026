'use client';

import * as React from 'react';
import type { Account, Client, Loan, Payment, Transaction } from '@/lib/types';
import type { NewLoanFormValues } from '@/app/(app)/emprestimos/novo/page';
import { User as UserIcon, Library, Wallet } from 'lucide-react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { writeBatch, collection, doc, serverTimestamp, Timestamp, setDoc, addDoc, deleteDoc, updateDoc, runTransaction, where, query, getDocs, arrayUnion } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { add, format } from 'date-fns';
import type { NewAccountFormValues } from '@/app/(app)/contas/components/new-account-dialog';
import type { NewClientFormValues } from '@/app/(app)/clientes/components/new-client-dialog';

interface FinancialDataContextType {
  accounts: Account[];
  clients: Client[];
  loans: Loan[];
  loading: boolean;
  createLoan: (values: NewLoanFormValues) => Promise<void>;
  updateLoan: (values: NewLoanFormValues, id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;
  registerPayment: (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string
  ) => Promise<void>;
  seedDatabase: () => Promise<void>;
  createAccount: (values: NewAccountFormValues) => Promise<void>;
  createClient: (values: NewClientFormValues) => Promise<void>;
}

const FinancialDataContext = React.createContext<FinancialDataContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const firestore = useFirestore();
  const { user } = useUser();

  const { data: accountsData, loading: accountsLoading } = useCollection<Account>('accounts');
  const { data: clientsData, loading: clientsLoading } = useCollection<Client>('clients');
  const { data: loansData, loading: loansLoading } = useCollection<Loan>('loans');
  
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

  const createAccount = async (values: NewAccountFormValues) => {
    if (!firestore) return;
    const newAccountRef = doc(collection(firestore, 'accounts'));
    const newAccountData = { ...values, id: newAccountRef.id, transactions: [] };
    
    setDoc(newAccountRef, newAccountData).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `accounts/${newAccountRef.id}`,
          operation: 'create',
          requestResourceData: newAccountData,
        }, err));
    });
  }
  
  const createClient = async (values: NewClientFormValues) => {
    if (!firestore) return;
    const newClientRef = doc(collection(firestore, 'clients'));
    const newClientData = { ...values, id: newClientRef.id };

    setDoc(newClientRef, newClientData).catch(err => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `clients/${newClientRef.id}`,
          operation: 'create',
          requestResourceData: newClientData,
        }, err));
    });
  }


  const createLoan = async (values: NewLoanFormValues) => {
    if (!firestore || !loansData) return;

    try {
      await runTransaction(firestore, async (transaction) => {
        let clientId = values.clientId;
        let borrowerName = clients.find(c => c.id === clientId)?.name;

        const loanRef = doc(collection(firestore, 'loans'));

        // Perform all reads first
        const accountRef = doc(firestore, 'accounts', values.accountId);
        const accountDoc = await transaction.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Conta de origem não encontrada.");

        const accountData = accountDoc.data() as Account;
        if (accountData.balance < values.amount) throw new Error("Saldo insuficiente na conta de origem.");
        
        // Now perform all writes
        if (values.isNewClient && values.borrowerName) {
            const newClientRef = doc(collection(firestore, 'clients'));
            clientId = newClientRef.id;
            borrowerName = values.borrowerName;
            const newClientData = { 
                id: clientId,
                name: values.borrowerName,
                cpf: values.borrowerCpf,
                phone: values.borrowerPhone,
                address: values.borrowerAddress,
                email: values.email || 'n/a',
            };
            transaction.set(newClientRef, newClientData);
        }

        const newBalance = accountData.balance - values.amount;
        const loanTransaction: Transaction = {
            id: nanoid(10),
            date: format(new Date(), 'yyyy-MM-dd'),
            description: `Empréstimo concedido para ${borrowerName}`,
            amount: values.amount,
            type: 'Despesa',
            category: 'Empréstimo Concedido',
            referenceId: loanRef.id,
        };
        transaction.update(accountRef, { 
            balance: newBalance,
            transactions: arrayUnion(loanTransaction) 
        });

        // Calculate installments
        const { amount, installments: numInstallments, interestRate, startDate, iofRate, iofValue } = values;
        const monthlyInterestRate = interestRate / 100;
        const iof = iofValue || (iofRate ? amount * (iofRate / 100) : 0);
        const totalLoanAmount = amount + iof;
        const installmentAmount = totalLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numInstallments)) / (Math.pow(1 + monthlyInterestRate, numInstallments) - 1);
        
        let remainingBalance = totalLoanAmount;
        const installments = Array.from({ length: numInstallments }).map((_, i) => {
            const interest = remainingBalance * monthlyInterestRate;
            const principal = installmentAmount - interest;
            remainingBalance -= principal;

            const dueDate = add(new Date(`${startDate}T00:00:00`), { months: i + 1 });

            return {
                number: i + 1,
                dueDate: format(dueDate, 'yyyy-MM-dd'),
                amount: parseFloat(installmentAmount.toFixed(2)),
                principal: parseFloat(principal.toFixed(2)),
                interest: parseFloat(interest.toFixed(2)),
                paidAmount: 0,
                status: 'Pendente' as const,
            };
        });
        
        const newLoanCode = `EMP-${(loansData.length + 1).toString().padStart(3, '0')}`;

        // Create loan document
        const newLoan: Omit<Loan, 'payments'> = {
            id: loanRef.id,
            code: newLoanCode,
            borrowerName: borrowerName!,
            clientId: clientId!,
            accountId: values.accountId,
            amount,
            interestRate,
            iofRate,
            iofValue,
            startDate,
            status: 'Ativo',
            installments,
        };

        transaction.set(loanRef, {...newLoan, payments: []});
      });
    } catch (err: any) {
        console.error("Erro ao criar empréstimo:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'loans ou accounts',
          operation: 'write',
          requestResourceData: values,
        }, err));
    }
  };

  const updateLoan = async (values: NewLoanFormValues, id: string) => {
    if (!firestore) return;
    const loanRef = doc(firestore, 'loans', id);

    try {
      // NOTE: This is a simplified update. A full update would need to handle
      // transaction rollbacks and recalculations if the amount changes.
      // For now, we recalculate installments but don't adjust past account transactions.
      const { amount, installments: numInstallments, interestRate, startDate, iofRate, iofValue } = values;
      const monthlyInterestRate = interestRate / 100;
      const iof = iofValue || (iofRate ? amount * (iofRate / 100) : 0);
      const totalLoanAmount = amount + iof;
      const installmentAmount = totalLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numInstallments)) / (Math.pow(1 + monthlyInterestRate, numInstallments) - 1);
      
      let remainingBalance = totalLoanAmount;
      const installments = Array.from({ length: numInstallments }).map((_, i) => {
          const interest = remainingBalance * monthlyInterestRate;
          const principal = installmentAmount - interest;
          remainingBalance -= principal;
          const dueDate = add(new Date(`${startDate}T00:00:00`), { months: i + 1 });
          return {
              number: i + 1,
              dueDate: format(dueDate, 'yyyy-MM-dd'),
              amount: parseFloat(installmentAmount.toFixed(2)),
              principal: parseFloat(principal.toFixed(2)),
              interest: parseFloat(interest.toFixed(2)),
              paidAmount: 0, // Resets payment status on edit
              status: 'Pendente' as const,
          };
      });

      const updatedLoanData = {
        amount,
        interestRate,
        iofRate,
        iofValue,
        startDate,
        installments,
        payments: [], // Resets payments on edit
        status: 'Ativo',
      };

      await updateDoc(loanRef, updatedLoanData);

    } catch (err: any) {
        console.error("Erro ao atualizar empréstimo:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `loans/${id}`,
          operation: 'update',
          requestResourceData: values,
        }, err));
    }
  };
  
  const deleteLoan = async (id: string) => {
     if (!firestore) return;
    try {
      await runTransaction(firestore, async (transaction) => {
        const loanRef = doc(firestore, 'loans', id);
        const loanDoc = await transaction.get(loanRef);
        if (!loanDoc.exists()) throw new Error("Empréstimo não encontrado.");

        const loanData = loanDoc.data() as Loan;
        const accountRef = doc(firestore, 'accounts', loanData.accountId);
        const accountDoc = await transaction.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Conta associada não encontrada.");

        // Revert the original loan transaction
        const accountData = accountDoc.data() as Account;
        const newBalance = accountData.balance + loanData.amount;
        const updatedTransactions = accountData.transactions.filter(t => t.referenceId !== id);

        transaction.update(accountRef, {
            balance: newBalance,
            transactions: updatedTransactions,
        });

        // Delete the loan
        transaction.delete(loanRef);
      });
    } catch (err: any) {
      console.error("Erro ao deletar empréstimo:", err);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `loans/${id}`,
        operation: 'delete',
      }, err));
    }
  };
  
  const registerPayment = async (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string
  ) => {
    if (!firestore) return;
    
    try {
      await runTransaction(firestore, async (transaction) => {
        // 1. READ all documents first
        const loanRef = doc(firestore, 'loans', loanId);
        const accountRef = doc(firestore, 'accounts', destinationAccountId);
        
        const loanDoc = await transaction.get(loanRef);
        if (!loanDoc.exists()) throw new Error("Empréstimo não encontrado.");
        
        const accountDoc = await transaction.get(accountRef);
        if (!accountDoc.exists()) throw new Error("Conta de destino não encontrada.");

        // 2. PREPARE changes on copies of data, not direct mutation
        const loanData = loanDoc.data() as Loan;
        const accountData = accountDoc.data() as Account;
        
        // Find the correct installment
        const installmentIndex = loanData.installments.findIndex(i => i.number === installmentNumber);
        if (installmentIndex === -1) throw new Error("Parcela não encontrada.");

        const installmentToUpdate = loanData.installments[installmentIndex];

        // Create a new updated installment object
        const newPaidAmount = installmentToUpdate.paidAmount + paymentAmount;
        let newStatus = installmentToUpdate.status;
        if (newPaidAmount >= installmentToUpdate.amount) {
          newStatus = 'Pago';
        } else if (newPaidAmount > 0) {
          newStatus = 'Parcialmente Pago';
        }

        const updatedInstallment = {
            ...installmentToUpdate,
            paidAmount: newPaidAmount,
            status: newStatus
        };
        
        // Create new installments array
        const updatedInstallments = loanData.installments.map(inst => 
            inst.number === installmentNumber ? updatedInstallment : inst
        );
        
        // Create new payment object and updated payments array
        const newPayment: Payment = {
          id: nanoid(10),
          loanId,
          installmentNumber,
          amount: paymentAmount,
          paymentDate,
          method: paymentMethod,
          destinationAccountId,
        };
        const updatedPayments = [...loanData.payments, newPayment];

        // Check overall loan status
        const allPaid = updatedInstallments.every(i => i.status === 'Pago');
        const newLoanStatus = allPaid ? 'Quitado' : loanData.status;

        // Prepare account updates
        const newBalance = accountData.balance + paymentAmount;
        const paymentTransaction: Transaction = {
          id: nanoid(10),
          date: paymentDate,
          description: `Pagamento recebido de ${loanData.borrowerName} (Parcela #${installmentNumber})`,
          amount: paymentAmount,
          type: 'Receita',
          category: 'Recebimento Empréstimo',
          referenceId: loanId,
        };

        // 3. WRITE all changes at the end
        transaction.update(loanRef, {
          installments: updatedInstallments,
          payments: updatedPayments,
          status: newLoanStatus,
        });

        transaction.update(accountRef, {
            balance: newBalance,
            transactions: arrayUnion(paymentTransaction),
        });
      });
    } catch (err: any) {
        console.error("Erro ao registrar pagamento:", err);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `loans/${loanId} ou accounts/${destinationAccountId}`,
            operation: 'update',
        }, err));
    }
  };
  
  const seedDatabase = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);

    // Clear existing data
    const collections = ['clients', 'accounts', 'loans'];
    for (const coll of collections) {
      const snapshot = await getDocs(collection(firestore, coll));
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    // 1. Seed Accounts (2)
    const accountIds = ['nubank', 'itau'];
    const accountNames = ['Nubank', 'Itaú'];
    const seededAccounts = accountIds.map((id, index) => {
        const accountRef = doc(firestore, 'accounts', id);
        const data = {
            id,
            name: accountNames[index],
            balance: Math.random() * 20000 + 5000,
            transactions: [],
        };
        batch.set(accountRef, data);
        return data;
    });
    
    // 2. Seed Clients (4)
    const firstNames = ['Ana', 'Bruno', 'Carla', 'Daniel'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza'];
    
    const seededClients = firstNames.map((_, index) => {
        const clientRef = doc(collection(firestore, 'clients'));
        const client = {
            id: clientRef.id,
            name: `${firstNames[index]} ${lastNames[index]}`,
            cpf: `000.000.000-0${index}`,
            email: `${firstNames[index].toLowerCase()}.${lastNames[index].toLowerCase()}@example.com`,
            phone: `(11) 90000-000${index}`,
            address: `Rua Teste, ${index}, Bairro Exemplo`,
        };
        batch.set(clientRef, client);
        return client;
    });

    // 3. Seed Loans (10)
    for (let i = 0; i < 10; i++) {
        const loanRef = doc(collection(firestore, 'loans'));
        const randomClient = seededClients[Math.floor(Math.random() * seededClients.length)];
        const randomAccount = seededAccounts[Math.floor(Math.random() * seededAccounts.length)];
        
        const amount = Math.floor(Math.random() * 9000) + 1000;
        const interestRate = parseFloat((Math.random() * 5 + 1).toFixed(2));
        const numInstallments = [3, 6, 12, 24][Math.floor(Math.random() * 4)];
        const startDate = format(add(new Date(), { months: -Math.floor(Math.random() * 6) }), 'yyyy-MM-dd');
        
        const monthlyInterestRate = interestRate / 100;
        const installmentAmount = (amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numInstallments))) / (Math.pow(1 + monthlyInterestRate, numInstallments) - 1);

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
        
        batch.set(loanRef, {
            id: loanRef.id,
            code: `EMP-${(i + 1).toString().padStart(3, '0')}`,
            borrowerName: randomClient.name,
            clientId: randomClient.id,
            accountId: randomAccount.id,
            amount,
            interestRate,
            startDate,
            status: 'Ativo',
            installments,
            payments: [],
        });
    }

    try {
        await batch.commit();
    } catch(err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'batch write',
          operation: 'write',
        }, err));
    }
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
    createAccount,
    createClient,
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
