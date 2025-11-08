import React from 'react';
import { SunIcon, MoonIcon, CurrencyDollarIcon } from './icons/Icons';

interface TopHeaderProps {
  currentTheme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ currentTheme, onThemeToggle }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-surface-300 dark:border-surface-300-dark bg-surface-100 dark:bg-surface-100-dark shrink-0">
        <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-primary">Gestor Financeiro</h1>
        </div>
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-surface-200 dark:hover:bg-surface-200-dark transition-colors"
        aria-label="Toggle theme"
      >
        {currentTheme === 'light' ? (
          <MoonIcon className="w-6 h-6" />
        ) : (
          <SunIcon className="w-6 h-6" />
        )}
      </button>
    </header>
  );
};

export default TopHeader;
