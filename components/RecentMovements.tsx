import React from 'react';
import { Transaction, Client } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';

interface RecentMovementsProps {
    transactions: Transaction[];
    clients: Client[];
}

const RecentMovements: React.FC<RecentMovementsProps> = ({ transactions, clients }) => {
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="bg-surface-100 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Movimentações Recentes</h3>
            {recentTransactions.length > 0 ? (
                <ul className="divide-y divide-surface-300">
                    {recentTransactions.map(tx => {
                        const client = clients.find(c => c.id === tx.clientId);
                        const description = `Pag. Parcela #${tx.installmentNumber} - ${client?.name || 'Cliente'}`;
                        
                        return (
                            <li key={tx.transactionId} className="py-4 flex justify-between items-center">
                                <div>
                                    <p className="text-md font-medium text-text-primary">{description}</p>
                                    <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                                </div>
                                <p className="text-md font-semibold text-success">+{formatCurrency(tx.amount)}</p>
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
