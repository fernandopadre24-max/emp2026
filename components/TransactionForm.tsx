import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import Calendar from './Calendar';
import { formatDate } from '../utils/loanCalculator';

interface TransactionFormProps {
    accountId: string;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'loanId' | 'clientId' | 'installmentNumber' | 'method' | 'pixKey'>) => void;
    updateTransaction: (transaction: Transaction) => void;
    transactionToEdit: Transaction | null;
    closeModal: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ accountId, addTransaction, updateTransaction, transactionToEdit, closeModal }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    
    const isEditMode = !!transactionToEdit;

    useEffect(() => {
        if (transactionToEdit) {
            setDescription(transactionToEdit.description);
            setAmount(String(Math.abs(transactionToEdit.amount)));
            setType(transactionToEdit.amount >= 0 ? 'deposit' : 'withdrawal');
            setDate(transactionToEdit.date.split('T')[0]);
        }
    }, [transactionToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numericAmount = parseFloat(amount);

        if (!description.trim() || isNaN(numericAmount) || numericAmount <= 0) {
            setError("Por favor, preencha a descrição e um valor positivo.");
            return;
        }

        const finalAmount = type === 'deposit' ? numericAmount : -numericAmount;
        
        if (isEditMode) {
            const updatedTransaction: Transaction = {
                ...transactionToEdit,
                description,
                amount: finalAmount,
                date,
                type
            };
            updateTransaction(updatedTransaction);
        } else {
            addTransaction({
                accountId,
                amount: finalAmount,
                date,
                type,
                description,
            });
        }

        closeModal();
    };

    const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Tipo de Movimento</label>
                <div className="flex space-x-2 p-1 bg-surface-200 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setType('deposit')}
                        className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                            type === 'deposit' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:bg-surface-300'
                        }`}
                    >
                        Entrada
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('withdrawal')}
                        className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                            type === 'withdrawal' ? 'bg-danger text-white shadow' : 'text-text-secondary hover:bg-surface-300'
                        }`}
                    >
                        Saída
                    </button>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyles} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Valor (R$)</label>
                    <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputStyles} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Data</label>
                    <input type="text" value={formatDate(date)} className={`${inputStyles} cursor-default`} readOnly />
                </div>
            </div>

            <div>
              <Calendar selectedDate={date} onDateSelect={setDate} />
            </div>
            
            {error && <p className="text-sm text-danger">{error}</p>}
            
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                    {isEditMode ? 'Atualizar Movimento' : 'Salvar Movimento'}
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;