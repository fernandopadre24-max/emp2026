import React from 'react';
import { SunIcon, MoonIcon, CurrencyDollarIcon, PlusIcon } from './icons/Icons';

interface TopHeaderProps {
  currentTheme: 'light' | 'dark';
  onThemeToggle: () => void;
  onNewLoan: () => void;
  onNewAccount: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ currentTheme, onThemeToggle, onNewLoan, onNewAccount }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-surface-300 bg-surface-100 shrink-0">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-primary">Gestor Financeiro</h1>
        </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onNewLoan}
          className="hidden sm:flex items-center space-x-2 bg-primary text-white font-semibold py-2 px-4 text-sm rounded-lg hover:bg-primary-hover transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Novo Empréstimo</span>
        </button>
        <button
          onClick={onNewAccount}
          className="hidden sm:flex items-center space-x-2 bg-indigo-500 text-white font-semibold py-2 px-4 text-sm rounded-lg hover:bg-indigo-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Nova Conta</span>
        </button>
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full text-text-secondary hover:bg-surface-200 transition-colors"
          aria-label="Toggle theme"
        >
          {currentTheme === 'light' ? (
            <MoonIcon className="w-6 h-6" />
          ) : (
            <SunIcon className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
};

export default TopHeader;