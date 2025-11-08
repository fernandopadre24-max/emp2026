import React from 'react';
import { ChartBarIcon, BanknotesIcon, UserGroupIcon, BuildingLibraryIcon, CurrencyDollarIcon } from './icons/Icons';

interface LegacySidebarProps {
  onNewClient: () => void;
  onNewLoan: () => void;
  onNewAccount: () => void;
}

// FIX: The type for the icon prop was too generic for React.cloneElement to correctly infer its props.
// By specifying that the icon is a ReactElement that accepts an optional `className`, the TypeScript error is resolved.
const NavLink: React.FC<{ href: string; icon: React.ReactElement<{ className?: string }>; children: React.ReactNode }> = ({ href, icon, children }) => (
  <a
    href={href}
    className="flex items-center px-4 py-3 text-text-secondary hover:bg-primary-hover/10 hover:text-primary rounded-lg transition-colors group"
  >
    {React.cloneElement(icon, { className: "w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" })}
    <span className="ml-3 font-medium">{children}</span>
  </a>
);

const LegacySidebar: React.FC<LegacySidebarProps> = ({ onNewClient, onNewLoan, onNewAccount }) => {
  return (
    <aside className="w-64 bg-surface-100 shadow-lg flex flex-col p-4 space-y-4 shrink-0">
      <div className="flex items-center space-x-3 p-2 mb-4">
        <div className="p-2 bg-primary rounded-lg">
          <CurrencyDollarIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-primary">Gestor de Empréstimos</h1>
      </div>
      
      <nav className="flex-grow space-y-1">
        <NavLink href="#dashboard" icon={<ChartBarIcon />}>
          Painel de Controle
        </NavLink>
        <NavLink href="#loans" icon={<BanknotesIcon />}>
          Empréstimos
        </NavLink>
        <NavLink href="#clients" icon={<UserGroupIcon />}>
          Clientes
        </NavLink>
        <NavLink href="#accounts" icon={<BuildingLibraryIcon />}>
          Contas
        </NavLink>
      </nav>

      <div className="space-y-2 border-t border-surface-300 pt-4">
        <button
          onClick={onNewClient}
          className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          Novo Cliente
        </button>
        <button
          onClick={onNewLoan}
          className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Novo Empréstimo
        </button>
        <button
          onClick={onNewAccount}
          className="w-full bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-hover transition-colors"
        >
          Nova Conta
        </button>
      </div>
    </aside>
  );
};

export default LegacySidebar;