import React, { useState } from 'react';
import { Account, Transaction, Client } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import { BanknotesIcon, ArrowUturnLeftIcon, CurrencyDollarIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';

interface AccountsListProps {
  accounts: Account[];
  transactions: Transaction[];
  clients: Client[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  onNewTransaction: (accountId: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts, transactions, clients, onEdit, onDelete, onNewTransaction, onEditTransaction, onDeleteTransaction }) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const renderStatementView = () => {
    const account = accounts.find(acc => acc.id === selectedAccountId);
    if (!account) return renderListView();

    const accountTransactions = transactions
      .filter(t => t.accountId === selectedAccountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return (
      <div className="bg-surface-100 rounded-xl shadow-lg p-6 animate-fade-in">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">{account.name}</h2>
            <p className="text-xl font-semibold text-success">{formatCurrency(account.balance)}</p>
          </div>
          <div className="flex items-center gap-x-4">
             <button
              onClick={() => onNewTransaction(account.id)}
              className="flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-hover transition-colors text-sm font-semibold"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Adicionar Movimento
            </button>
            <button
              onClick={() => setSelectedAccountId(null)}
              className="flex items-center px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold"
            >
              <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-300">
            <thead className="bg-surface-200">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Data</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Descrição</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-surface-100 divide-y divide-surface-300">
              {accountTransactions.length > 0 ? (
                accountTransactions.map(tx => {
                  const isPositive = tx.amount >= 0;
                  return (
                    <tr key={tx.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(tx.date)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-text-primary">{tx.description}</td>
                      <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                         <div className="flex items-center justify-end space-x-2">
                            {tx.type !== 'payment' && (
                                <button onClick={() => onEditTransaction(tx)} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors" title="Editar Movimento">
                                    <PencilIcon className="w-4 h-4 text-blue-600" />
                                </button>
                            )}
                            <button onClick={() => onDeleteTransaction(tx.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Excluir Movimento">
                                <TrashIcon className="w-4 h-4 text-red-600" />
                            </button>
                         </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-secondary">Nenhuma movimentação nesta conta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const renderListView = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return (
      <>
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-100 rounded-xl shadow-lg p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-indigo-500"><BanknotesIcon className="w-8 h-8 text-white" /></div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Total de Contas</p>
              <p className="text-2xl font-bold text-text-primary">{accounts.length}</p>
            </div>
          </div>
          <div className="bg-surface-100 rounded-xl shadow-lg p-6 flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-500"><CurrencyDollarIcon className="w-8 h-8 text-white" /></div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Saldo Total Geral</p>
              <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalBalance)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-surface-100 rounded-xl shadow-lg p-6 flex flex-col justify-between group relative">
              <div className="absolute top-4 right-4 flex space-x-2 z-10">
                <button onClick={() => onEdit(account)} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors" title="Editar Conta">
                  <PencilIcon className="w-4 h-4 text-blue-600" />
                </button>
                <button onClick={() => onDelete(account.id)} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Excluir Conta">
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>

              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-full bg-blue-500"><BanknotesIcon className="w-8 h-8 text-white" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{account.name}</h3>
                    <p className="text-2xl font-bold text-success">{formatCurrency(account.balance)}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedAccountId(account.id)} className="w-full mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-hover transition-colors">
                Ver Extrato
              </button>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
     <>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Contas</h1>
      {accounts.length === 0 ? (
        <div className="text-center py-16 bg-surface-100 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-text-primary">Nenhuma conta cadastrada</h3>
          <p className="text-text-secondary mt-2">Clique em "Nova Conta" para começar.</p>
        </div>
      ) : (
        selectedAccountId ? renderStatementView() : renderListView()
      )}
      <style>{`
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
      `}</style>
    </>
  );
};

export default AccountsList;