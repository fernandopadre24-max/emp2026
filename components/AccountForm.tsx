import React, { useState, useEffect } from 'react';
import { Account } from '../types';

interface AccountFormProps {
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  accountToEdit: Account | null;
  closeModal: () => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ addAccount, updateAccount, accountToEdit, closeModal }) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const isEditMode = !!accountToEdit;

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setBalance(String(accountToEdit.balance));
    }
  }, [accountToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBalance = parseFloat(balance);
    if (!name.trim() || (!isEditMode && isNaN(newBalance))) {
        alert("Por favor, preencha todos os campos com valores válidos.");
        return;
    }

    if (isEditMode) {
      updateAccount({ ...accountToEdit, name });
    } else {
      addAccount({ name, balance: newBalance });
    }
    
    closeModal();
  };
  
  const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary disabled:bg-surface-200 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Nome da Conta</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} required />
      </div>
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">Saldo (R$)</label>
        <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputStyles} required disabled={isEditMode} />
        {isEditMode && <p className="text-xs text-text-secondary mt-1">O saldo só pode ser alterado através de transações.</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">{isEditMode ? 'Atualizar Conta' : 'Salvar Conta'}</button>
      </div>
    </form>
  );
};

export default AccountForm;