import React from 'react';
import { Client, Loan, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import { formatCPF, formatPhone } from '../utils/formatters';
import { ArrowUturnLeftIcon, UserIcon, PhoneIcon, MapPinIcon, HashtagIcon, ArrowDownCircleIcon, ArrowUpCircleIcon } from './icons/Icons';

interface ClientDetailProps {
  client: Client;
  loans: Loan[];
  transactions: Transaction[];
  onBack: () => void;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ client, loans, transactions, onBack }) => {
    const totalLoaned = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const payments = transactions.filter(tx => tx.type === 'payment');
    const totalPaid = payments.reduce((sum, tx) => sum + tx.amount, 0);

    const getLoanStatus = (loan: Loan) => {
        if (loan.installments.every(i => i.status === 'Paga')) {
            return { text: 'Quitado', className: 'bg-green-100 text-green-800' };
        }
        if (loan.installments.some(i => i.status === 'Atrasada')) {
            return { text: 'Com Atraso', className: 'bg-red-100 text-red-800' };
        }
        return { text: 'Ativo', className: 'bg-blue-100 text-blue-800' };
    };

    return (
        <div className="animate-fade-in">
            <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-text-primary">Detalhes do Cliente</h1>
                <button
                    onClick={onBack}
                    className="flex items-center px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold"
                >
                    <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                    Voltar para a Lista
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {/* Client Info */}
                    <div className="bg-surface-100 rounded-xl shadow-lg p-6">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 rounded-full bg-indigo-500 text-white">
                                <UserIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-text-primary">{client.name}</h3>
                                <p className="text-sm text-text-secondary">ID: {client.id.substring(0, 10)}...</p>
                            </div>
                        </div>
                        <div className="space-y-3 border-t border-surface-300 pt-4">
                            <div className="flex items-center text-sm text-text-secondary">
                                <HashtagIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                                <span>{formatCPF(client.cpf)}</span>
                            </div>
                            <div className="flex items-center text-sm text-text-secondary">
                                <PhoneIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                                <span>{formatPhone(client.phone)}</span>
                            </div>
                            <div className="flex items-center text-sm text-text-secondary">
                                <MapPinIcon className="w-5 h-5 mr-3 text-gray-400 shrink-0" />
                                <span>{client.address}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Financial Summary */}
                    <div className="bg-surface-100 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4 text-text-primary">Resumo Financeiro</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-text-secondary">
                                    <ArrowDownCircleIcon className="w-6 h-6 mr-2 text-danger" />
                                    <span className="font-medium">Total Emprestado</span>
                                </div>
                                <span className="font-bold text-lg text-danger">{formatCurrency(totalLoaned)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-text-secondary">
                                    <ArrowUpCircleIcon className="w-6 h-6 mr-2 text-success" />
                                    <span className="font-medium">Total Pago</span>
                                </div>
                                <span className="font-bold text-lg text-success">{formatCurrency(totalPaid)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Loans List */}
                    <div className="bg-surface-100 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4 text-text-primary">Empréstimos</h3>
                        {loans.length > 0 ? (
                            <ul className="divide-y divide-surface-300">
                                {loans.map(loan => {
                                    const status = getLoanStatus(loan);
                                    return (
                                        <li key={loan.id} className="py-4">
                                            <div className="flex justify-between items-start flex-wrap gap-2">
                                                <div>
                                                    <p className="font-bold text-text-primary">{formatCurrency(loan.principal)}</p>
                                                    <div className="flex items-center gap-x-3 text-sm text-text-secondary mt-1">
                                                        <span className="font-mono bg-surface-200 px-2 py-0.5 rounded-full">{loan.code}</span>
                                                        <span>Início: {formatDate(loan.startDate)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.className}`}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-center text-text-secondary py-4">Nenhum empréstimo encontrado para este cliente.</p>
                        )}
                    </div>

                    {/* Payments History */}
                    <div className="bg-surface-100 rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-semibold mb-4 text-text-primary">Histórico de Pagamentos</h3>
                        {payments.length > 0 ? (
                            <div className="max-h-96 overflow-y-auto">
                                <ul className="divide-y divide-surface-300">
                                    {payments.map(tx => (
                                        <li key={tx.id} className="py-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-text-primary">{tx.description}</p>
                                                    <p className="text-sm text-text-secondary">{formatDate(tx.date)}</p>
                                                </div>
                                                <p className="font-semibold text-success">{formatCurrency(tx.amount)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <p className="text-center text-text-secondary py-4">Nenhum pagamento registrado para este cliente.</p>
                        )}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s ease-in-out; }
            `}</style>
        </div>
    );
};

export default ClientDetail;
