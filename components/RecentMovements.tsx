import React from 'react';
import { Transaction, Client, Loan } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';

interface RecentMovementsProps {
    transactions: Transaction[];
    clients: Client[];
    loans: Loan[];
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ transactions, clients, loans }) => {
    const recentTransactions = transactions
        .filter(tx => tx.amount > 0) // Show only income
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="bg-surface-100 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Movimentações Recentes</h3>
            {recentTransactions.length > 0 ? (
                <ul className="divide-y divide-surface-300">
                    {recentTransactions.map(tx => {
                        const loan = loans.find(l => l.id === tx.loanId);
                        
                        return (
                            <li key={tx.id} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-md font-medium text-text-primary">{tx.description}</p>
                                     <div className="flex items-center text-sm text-text-secondary mt-1 space-x-3">
                                        {loan && <span className="font-mono bg-surface-200 px-1.5 py-0.5 rounded-sm text-xs">{loan.code}</span>}
                                        {tx.method && <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{tx.method}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-md font-semibold text-success">+{formatCurrency(tx.amount)}</p>
                                    <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="text-center py-8">
                    <p className="text-text-secondary">Nenhuma movimentação recente.</p>
                </div>
            )}
        </div>
    );
};

export default RecentMovements;