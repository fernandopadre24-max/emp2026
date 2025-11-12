import React, { useState, useEffect } from 'react';
import { Client, Loan, Account, Transaction, View, Payment, Installment, Receipt } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { initialClients, initialLoans, initialAccounts, initialTransactions } from './utils/seedData';
import { updateInstallmentStatus } from './utils/loanCalculator';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientDetail from './components/ClientDetail';
import LoanList from './components/LoanList';
import AccountsList from './components/AccountsList';
import Calculator from './components/Calculator';
import CalendarView from './components/CalendarView';
import Modal from './components/Modal';
import ClientForm from './components/ClientForm';
import LoanForm from './components/LoanForm';
import AccountForm from './components/AccountForm';
import TransactionForm from './components/TransactionForm';

const App: React.FC = () => {
  const [clients, setClients] = useLocalStorage<Client[]>('clients', initialClients);
  const [loans, setLoans] = useLocalStorage<Loan[]>('loans', initialLoans);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', initialAccounts);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', initialTransactions);
  
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const [view, setView] = useState<View>('dashboard');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [accountForNewTransaction, setAccountForNewTransaction] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState({ isOpen: false, message: '', onConfirm: () => {} });
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Update loan statuses on load
  useEffect(() => {
    setLoans(prevLoans => prevLoans.map(loan => ({
      ...loan,
      installments: updateInstallmentStatus(loan.installments)
    })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to centralize balance updates
  const updateAccountBalance = (accountId: string, amountChange: number) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(acc =>
        acc.id === accountId
          ? { ...acc, balance: acc.balance + amountChange }
          : acc
      )
    );
  };

  // Client CRUD
  const addClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = { id: `client_${Date.now()}`, ...clientData };
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
      onConfirm: () => {
        deleteClient(clientId);
        setSelectedClientId(null); // Go back to list if deleting from detail view
      },
    });
  };
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  const handleBackToClientList = () => {
    setSelectedClientId(null);
  };
  
  // Loan CRUD
  const addLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = { id: `loan_${Date.now()}`, ...loanData };
    const clientName = clients.find(c => c.id === newLoan.clientId)?.name || 'Cliente';
    
    const withdrawalTransaction: Transaction = {
        id: `tx_wd_${newLoan.id}`,
        accountId: newLoan.accountId,
        loanId: newLoan.id,
        clientId: newLoan.clientId,
        amount: -newLoan.principal,
        date: newLoan.startDate,
        type: 'withdrawal',
        description: `Saída Empréstimo - ${clientName} (${newLoan.code})`,
    };
    
    setLoans(prev => [...prev, newLoan]);
    setTransactions(prev => [...prev, withdrawalTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    updateAccountBalance(newLoan.accountId, -newLoan.principal);
  };
  const updateLoan = (loan: Loan) => {
    setLoans(prev => prev.map(l => l.id === loan.id ? loan : l));
  };
  const deleteLoan = (loanId: string) => {
    const loanToDelete = loans.find(l => l.id === loanId);
    if (!loanToDelete) return;

    // Find all transactions associated with this loan
    const relatedTransactions = transactions.filter(t => t.loanId === loanId);
    
    // Calculate the net financial impact on the account
    const netImpact = relatedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Revert the net impact on the account balance
    if (netImpact !== 0) {
        updateAccountBalance(loanToDelete.accountId, -netImpact);
    }

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
      message: 'Tem certeza que deseja excluir este empréstimo? Todas as transações associadas serão removidas e o saldo da conta de origem será ajustado.',
      onConfirm: () => deleteLoan(loanId),
    });
  }

  // Account CRUD
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = { id: `acc_${Date.now()}`, ...accountData };
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
        id: `tx_${Date.now()}`,
        ...transactionData,
      };
      setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      updateAccountBalance(newTransaction.accountId, newTransaction.amount);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    const oldTransaction = transactions.find(t => t.id === updatedTransaction.id);
    if (!oldTransaction) return;

    // This logic assumes the accountId of the transaction does not change.
    const amountDifference = updatedTransaction.amount - oldTransaction.amount;
    
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    updateAccountBalance(updatedTransaction.accountId, amountDifference);
  };
  
  const deleteTransaction = (transactionId: string) => {
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    // If it's a loan payment, also update the loan record
    if (transactionToDelete.type === 'payment' && transactionToDelete.loanId) {
        const paymentIdToDelete = transactionToDelete.id.replace('tx_', '');
        setLoans(prevLoans => prevLoans.map(loan => {
            if (loan.id === transactionToDelete.loanId) {
                const updatedInstallments = loan.installments.map(inst => {
                    const paymentExists = inst.payments.some(p => p.id === paymentIdToDelete);
                    if (paymentExists) {
                        const updatedPayments = inst.payments.filter(p => p.id !== paymentIdToDelete);
                        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
                        let newStatus: Installment['status'] = 'Pendente';
                        if (totalPaid > 0) {
                             newStatus = Math.abs(inst.amount - totalPaid) < 0.01 ? 'Paga' : 'Parcialmente Paga';
                        }
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dueDate = new Date(inst.dueDate);
                        dueDate.setUTCHours(0,0,0,0);
                        if (newStatus !== 'Paga' && dueDate < today) {
                            newStatus = 'Atrasada';
                        }

                        return { ...inst, payments: updatedPayments, status: newStatus };
                    }
                    return inst;
                });
                return { ...loan, installments: updatedInstallments };
            }
            return loan;
        }));
    }

    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    updateAccountBalance(transactionToDelete.accountId, -transactionToDelete.amount);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    setConfirmation({
      isOpen: true,
      message: 'Tem certeza que deseja excluir esta movimentação? O saldo da conta e o status do empréstimo (se aplicável) serão ajustados.',
      onConfirm: () => deleteTransaction(transactionId),
    });
  };

  const recordPayment = (loanId: string, installmentNumber: number, amount: number, accountId: string, method: Payment['method'], pixKey?: string, receipt?: Receipt) => {
    const loanToUpdate = loans.find(l => l.id === loanId);
    const accountToUpdate = accounts.find(a => a.id === accountId);

    if (!loanToUpdate || !accountToUpdate) {
      alert("Empréstimo ou conta não encontrada.");
      return;
    }

    const paymentId = `payment_${Date.now()}`;
    let updatedLoan = { ...loanToUpdate };

    // Update loan with new payment
    updatedLoan.installments = updatedLoan.installments.map(inst => {
      if (inst.number === installmentNumber) {
        const newPayment: Payment = { id: paymentId, amount, date: new Date().toISOString(), accountId, method, pixKey, receipt };
        const updatedPayments = [...inst.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
        const remaining = inst.amount - totalPaid;
        let newStatus: typeof inst.status = remaining < 0.01 ? 'Paga' : 'Parcialmente Paga';
        return { ...inst, payments: updatedPayments, status: newStatus };
      }
      return inst;
    });
    
    setLoans(prev => prev.map(l => l.id === loanId ? updatedLoan : l));

    // Update account balance
    updateAccountBalance(accountId, amount);

    // Create new transaction record
    const clientName = clients.find(c => c.id === updatedLoan!.clientId)?.name || 'Cliente';
    const newTransaction: Transaction = {
      id: `tx_${paymentId}`,
      accountId,
      loanId,
      clientId: updatedLoan.clientId,
      installmentNumber,
      amount,
      date: new Date().toISOString(),
      type: 'payment',
      description: `Pag. Parcela #${installmentNumber} - ${clientName}`,
      method,
      pixKey,
      receipt,
    };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const openTransactionModal = (accountId: string) => {
    setAccountForNewTransaction(accountId);
    setIsTransactionModalOpen(true);
  };

  // Modal handlers
  const closeClientModal = () => { setIsClientModalOpen(false); setEditingClient(null); };
  const closeLoanModal = () => { setIsLoanModalOpen(false); setEditingLoan(null); };
  const closeAccountModal = () => { setIsAccountModalOpen(false); setEditingAccount(null); };
  const closeTransactionModal = () => { 
    setAccountForNewTransaction(null); 
    setEditingTransaction(null);
    setIsTransactionModalOpen(false); 
  }

  const MainContent = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard loans={loans} clients={clients} transactions={transactions} accounts={accounts} />;
      case 'loans':
        return <LoanList loans={loans} clients={clients} accounts={accounts} onRecordPayment={recordPayment} onEdit={handleEditLoan} onDelete={handleDeleteLoan} />;
      case 'clients': {
        const selectedClient = clients.find(c => c.id === selectedClientId);

        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={selectedClient ? 'hidden lg:block lg:col-span-1' : 'lg:col-span-3'}>
                    <ClientList
                        clients={clients}
                        onEdit={handleEditClient}
                        onDelete={handleDeleteClient}
                        onNewClient={() => setIsClientModalOpen(true)}
                        onSelectClient={handleSelectClient}
                        selectedClientId={selectedClientId}
                    />
                </div>
                {selectedClient && (
                    <div className="lg:col-span-2">
                        <ClientDetail
                            client={selectedClient}
                            loans={loans.filter(l => l.clientId === selectedClientId)}
                            transactions={transactions.filter(t => t.clientId === selectedClientId)}
                            onBack={handleBackToClientList}
                        />
                    </div>
                )}
            </div>
        );
    }
      case 'accounts':
        return <AccountsList 
          accounts={accounts} 
          transactions={transactions} 
          clients={clients} 
          onEdit={handleEditAccount} 
          onDelete={handleDeleteAccount} 
          onNewTransaction={openTransactionModal}
          onEditTransaction={handleEditTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          />;
      case 'calculator':
        return <Calculator />;
      case 'calendar':
        return <CalendarView loans={loans} clients={clients} />;
      default:
        return <Dashboard loans={loans} clients={clients} transactions={transactions} accounts={accounts} />;
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
          onNavigate={setView}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <MainContent />
        </main>
      </div>

      <Modal isOpen={isClientModalOpen} onClose={closeClientModal} title={editingClient ? "Editar Cliente" : "Novo Cliente"}>
        <ClientForm addClient={addClient} updateClient={updateClient} clientToEdit={editingClient} closeModal={closeClientModal} />
      </Modal>

      <Modal isOpen={isLoanModalOpen} onClose={closeLoanModal} title={editingLoan ? "Editar Empréstimo" : "Novo Empréstimo"}>
        <LoanForm clients={clients} accounts={accounts} addLoan={addLoan} updateLoan={updateLoan} loanToEdit={editingLoan} closeModal={closeLoanModal} />
      </Modal>

      <Modal isOpen={isAccountModalOpen} onClose={closeAccountModal} title={editingAccount ? "Editar Conta" : "Nova Conta"}>
        <AccountForm addAccount={addAccount} updateAccount={updateAccount} accountToEdit={editingAccount} closeModal={closeAccountModal} />
      </Modal>

      <Modal 
        isOpen={isTransactionModalOpen && (!!accountForNewTransaction || !!editingTransaction)} 
        onClose={closeTransactionModal} 
        title={editingTransaction ? "Editar Movimento" : "Adicionar Movimento"}
      >
        <TransactionForm
          accountId={accountForNewTransaction || editingTransaction?.accountId!}
          addTransaction={addTransaction}
          updateTransaction={updateTransaction}
          transactionToEdit={editingTransaction}
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