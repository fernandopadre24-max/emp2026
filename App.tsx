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
import TransactionForm from './components/TransactionForm';

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
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForNewTransaction, setAccountForNewTransaction] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', onConfirm: () => {} });


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
  }, []);

  // Client CRUD
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: `client_${Date.now()}` };
    setClients(prev => [...prev, newClient]);
  };
  const updateClient = (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
  };
  const deleteClient = (clientId: string) => {
     if (loans.some(l => l.clientId === clientId)) {
        alert('Este cliente não pode ser excluído pois possui empréstimos ativos.');
        return;
    }
    setClients(prev => prev.filter(c => c.id !== clientId));
  };
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  }
  const handleDeleteClient = (clientId: string) => {
    setConfirmation({
      isOpen: true,
      message: 'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      onConfirm: () => deleteClient(clientId),
    });
  };
  
  // Loan CRUD
  const addLoan = (loan: Loan) => {
    setLoans(prev => [...prev, loan]);
  };
  const updateLoan = (loan: Loan) => {
    setLoans(prev => prev.map(l => l.id === loan.id ? loan : l));
  };
  const deleteLoan = (loanId: string) => {
    setLoans(prev => prev.filter(l => l.id !== loanId));
    setTransactions(prev => prev.filter(t => t.loanId !== loanId));
  };
  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setIsLoanModalOpen(true);
  }
  const handleDeleteLoan = (loanId: string) => {
     setConfirmation({
      isOpen: true,
      message: 'Tem certeza que deseja excluir este empréstimo? Todas as transações associadas serão removidas.',
      onConfirm: () => deleteLoan(loanId),
    });
  }

  // Account CRUD
  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = { ...account, id: `account_${Date.now()}` };
    setAccounts(prev => [...prev, newAccount]);
  };
  const updateAccount = (account: Account) => {
    setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };
  const deleteAccount = (accountId: string) => {
    if (transactions.some(t => t.accountId === accountId)) {
      alert('Esta conta não pode ser excluída pois possui transações registradas.');
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== accountId));
  };
  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsAccountModalOpen(true);
  }
  const handleDeleteAccount = (accountId: string) => {
    setConfirmation({
      isOpen: true,
      message: 'Tem certeza que deseja excluir esta conta?',
      onConfirm: () => deleteAccount(accountId),
    });
  };
  
  // Transaction logic
  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'loanId' | 'clientId' | 'installmentNumber' | 'method' | 'pixKey'>) => {
      const newTransaction: Transaction = {
          ...transactionData,
          id: `txn_${Date.now()}`
      };
      setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setAccounts(prev => prev.map(acc => 
          acc.id === newTransaction.accountId 
              ? { ...acc, balance: acc.balance + newTransaction.amount }
              : acc
      ));
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
      const clientName = clients.find(c => c.id === paidLoan!.clientId)?.name || 'Cliente';
      const newTransaction: Transaction = {
        id: `txn_${paymentId}`,
        accountId,
        loanId,
        clientId: paidLoan.clientId,
        installmentNumber,
        amount,
        date: new Date().toISOString(),
        type: 'payment',
        description: `Pag. Parcela #${installmentNumber} - ${clientName}`,
        method,
        pixKey,
      };
      setTransactions(prev => [...prev, newTransaction]);
    }
  };
  
  const openTransactionModal = (accountId: string) => {
    setAccountForNewTransaction(accountId);
    setIsTransactionModalOpen(true);
  };

  // Modal handlers
  const closeClientModal = () => {
    setIsClientModalOpen(false);
    setEditingClient(null);
  };
  const closeLoanModal = () => {
    setIsLoanModalOpen(false);
    setEditingLoan(null);
  };
  const closeAccountModal = () => {
    setIsAccountModalOpen(false);
    setEditingAccount(null);
  };
  const closeTransactionModal = () => {
    setAccountForNewTransaction(null);
    setIsTransactionModalOpen(false);
  }

  const MainContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard loans={loans} clients={clients} transactions={transactions} />;
      case 'loans':
        return <LoanList loans={loans} clients={clients} accounts={accounts} onRecordPayment={recordPayment} onEdit={handleEditLoan} onDelete={handleDeleteLoan} />;
      case 'clients':
        return <ClientList clients={clients} onEdit={handleEditClient} onDelete={handleDeleteClient} onNewClient={() => setIsClientModalOpen(true)} />;
      case 'accounts':
        return <AccountsList accounts={accounts} transactions={transactions} clients={clients} onEdit={handleEditAccount} onDelete={handleDeleteAccount} onNewTransaction={openTransactionModal} />;
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
      />
      <div className="flex-1 flex flex-col overflow-y-hidden">
        <TopHeader 
          currentTheme={theme} 
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
          onNewLoan={() => setIsLoanModalOpen(true)}
          onNewAccount={() => setIsAccountModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <MainContent />
        </main>
      </div>


      <Modal isOpen={isClientModalOpen} onClose={closeClientModal} title={editingClient ? "Editar Cliente" : "Novo Cliente"}>
        <ClientForm addClient={addClient} updateClient={updateClient} clientToEdit={editingClient} closeModal={closeClientModal} />
      </Modal>

      <Modal isOpen={isLoanModalOpen} onClose={closeLoanModal} title={editingLoan ? "Editar Empréstimo" : "Novo Empréstimo"}>
        {/* FIX: Changed `closeModal` to `closeLoanModal` to pass the correct modal closing function. */}
        <LoanForm clients={clients} addLoan={addLoan} updateLoan={updateLoan} loanToEdit={editingLoan} closeModal={closeLoanModal} />
      </Modal>

      <Modal isOpen={isAccountModalOpen} onClose={closeAccountModal} title={editingAccount ? "Editar Conta" : "Nova Conta"}>
        <AccountForm addAccount={addAccount} updateAccount={updateAccount} accountToEdit={editingAccount} closeModal={closeAccountModal} />
      </Modal>

      <Modal isOpen={isTransactionModalOpen && !!accountForNewTransaction} onClose={closeTransactionModal} title="Adicionar Movimento">
        <TransactionForm
          accountId={accountForNewTransaction!}
          addTransaction={addTransaction}
          closeModal={closeTransactionModal}
        />
      </Modal>
      
      <Modal isOpen={confirmation.isOpen} onClose={() => setConfirmation({ ...confirmation, isOpen: false })} title="Confirmar Exclusão">
        <div>
          <p className="text-text-secondary">{confirmation.message}</p>
          <div className="flex justify-end space-x-4 pt-6">
            <button 
              onClick={() => setConfirmation({ ...confirmation, isOpen: false })} 
              className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300 transition-colors">
                Cancelar
            </button>
            <button 
              onClick={() => { confirmation.onConfirm(); setConfirmation({ ...confirmation, isOpen: false }); }}
              className="px-4 py-2 bg-danger text-white rounded-md hover:bg-red-700 transition-colors">
                Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;