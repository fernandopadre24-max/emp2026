import React, { useState, useEffect, useMemo } from 'react';
import { Client, Loan, Account, Transaction, View, Payment } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import createSeedData from './utils/seedData';
import { updateInstallmentStatus } from './utils/loanCalculator';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import LoanList from './components/LoanList';
import AccountsList from './components/AccountsList';
import Calculator from './components/Calculator';
import Modal from './components/Modal';
import ClientForm from './components/ClientForm';
import LoanForm from './components/LoanForm';
import AccountForm from './components/AccountForm';

const App: React.FC = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', () => createSeedData().seedClients);
  const [loans, setLoans] = useLocalStorage<Loan[]>('loans', () => createSeedData().seedLoans);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', () => createSeedData().seedAccounts);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', () => createSeedData().seedTransactions);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const [view, setView] = useState<View>('dashboard');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    setLoans(prevLoans => prevLoans.map(loan => ({
      ...loan,
      installments: updateInstallmentStatus(loan.installments),
    })));
  }, []); // Executa apenas uma vez na montagem

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: `client_${Date.now()}` };
    setClients(prev => [...prev, newClient]);
  };

  const addLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: `account_${Date.now()}` };
    setAccounts(prev => [...prev, newAccount]);
  };

  const recordPayment = (loanId: string, installmentNumber: number, amount: number, accountId: string, method: Payment['method'], pixKey?: string) => {
    const paymentId = `payment_${Date.now()}`;
    
    let paidLoan: Loan | undefined;
    setLoans(prevLoans => {
      const newLoans = prevLoans.map(loan => {
        if (loan.id === loanId) {
          const newInstallments = loan.installments.map(inst => {
            if (inst.number === installmentNumber) {
              const newPayment: Payment = { id: paymentId, amount, date: new Date().toISOString(), accountId, method, pixKey };
              const updatedPayments = [...inst.payments, newPayment];
              const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
              const remaining = inst.amount - totalPaid;
              
              let newStatus: typeof inst.status = 'Parcialmente Paga';
              if (remaining < 0.01) {
                newStatus = 'Paga';
              }
              
              return { ...inst, payments: updatedPayments, status: newStatus };
            }
            return inst;
          });
          const updatedLoan = { ...loan, installments: newInstallments };
          paidLoan = updatedLoan;
          return updatedLoan;
        }
        return loan;
      });
      return newLoans;
    });

    setAccounts(prevAccounts => prevAccounts.map(acc => 
      acc.id === accountId ? { ...acc, balance: acc.balance + amount } : acc
    ));
    
    if (paidLoan) {
      const newTransaction: Transaction = {
        transactionId: `txn_${paymentId}`,
        id: paymentId,
        accountId,
        loanId,
        clientId: paidLoan.clientId,
        installmentNumber,
        amount,
        date: new Date().toISOString(),
        method,
        pixKey,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };

  const MainContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard loans={loans} clients={clients} transactions={transactions} />;
      case 'loans':
        return <LoanList loans={loans} clients={clients} accounts={accounts} onRecordPayment={recordPayment} />;
      case 'clients':
        return <ClientList clients={clients} />;
      case 'accounts':
        return <AccountsList accounts={accounts} transactions={transactions} clients={clients} />;
      case 'calculator':
        return <Calculator />;
      default:
        return <Dashboard loans={loans} clients={clients} transactions={transactions} />;
    }
  }

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans">
      <Sidebar
        currentView={view}
        onNavigate={setView}
        onNewClient={() => setIsClientModalOpen(true)}
        onNewLoan={() => setIsLoanModalOpen(true)}
        onNewAccount={() => setIsAccountModalOpen(true)}
      />
      <div className="flex-1 flex flex-col overflow-y-hidden">
        <TopHeader 
          currentTheme={theme} 
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <MainContent />
        </main>
      </div>


      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Novo Cliente">
        <ClientForm addClient={addClient} closeModal={() => setIsClientModalOpen(false)} />
      </Modal>

      <Modal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} title="Novo Empréstimo">
        <LoanForm clients={clients} addLoan={addLoan} closeModal={() => setIsLoanModalOpen(false)} />
      </Modal>

      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title="Nova Conta">
        <AccountForm addAccount={addAccount} closeModal={() => setIsAccountModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default App;