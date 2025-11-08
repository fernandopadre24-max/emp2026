import React from 'react';
import { View } from '../types';
import { ChartBarIcon, BanknotesIcon, UserGroupIcon, BuildingLibraryIcon, CurrencyDollarIcon, PlusIcon } from './icons/Icons';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onNewClient: () => void;
  onNewLoan: () => void;
  onNewAccount: () => void;
}

const NavLink: React.FC<{
  viewName: View;
  currentView: View;
  onNavigate: (view: View) => void;
  // FIX: Specified that the icon element accepts a className prop to resolve React.cloneElement type error.
  icon: React.ReactElement<{ className?: string }>;
  children: React.ReactNode;
}> = ({ viewName, currentView, onNavigate, icon, children }) => {
  const isActive = currentView === viewName;
  const linkClasses = `flex items-center px-4 py-3 text-text-secondary hover:bg-primary-hover/10 hover:text-primary rounded-lg transition-colors group ${
    isActive ? 'bg-primary/10 text-primary font-semibold' : ''
  }`;
  const iconClasses = `w-6 h-6 text-gray-400 group-hover:text-primary transition-colors ${
    isActive ? 'text-primary' : ''
  }`;

  return (
    <button onClick={() => onNavigate(viewName)} className={linkClasses}>
      {React.cloneElement(icon, { className: iconClasses })}
      <span className="ml-3">{children}</span>
    </button>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onNewClient, onNewLoan, onNewAccount }) => {
  return (
    <aside className="w-64 bg-surface-100 shadow-lg flex flex-col p-4 space-y-4 shrink-0 h-full">
      <div className="flex items-center space-x-3 p-2 mb-4">
        <div className="p-2 bg-primary rounded-lg">
          <CurrencyDollarIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-primary">Gestor Financeiro</h1>
      </div>
      
      <nav className="flex-grow space-y-2">
        <NavLink viewName="dashboard" currentView={currentView} onNavigate={onNavigate} icon={<ChartBarIcon />}>
          Painel de Controle
        </NavLink>
        <NavLink viewName="loans" currentView={currentView} onNavigate={onNavigate} icon={<BanknotesIcon />}>
          Empréstimos
        </NavLink>
        <NavLink viewName="clients" currentView={currentView} onNavigate={onNavigate} icon={<UserGroupIcon />}>
          Clientes
        </NavLink>
        <NavLink viewName="accounts" currentView={currentView} onNavigate={onNavigate} icon={<BuildingLibraryIcon />}>
          Contas
        </NavLink>
      </nav>

      <div className="space-y-2 border-t border-surface-300 pt-4">
        <button onClick={onNewClient} className="w-full flex items-center justify-center bg-secondary text-white font-semibold py-2 px-4 rounded-lg hover:bg-secondary-hover transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" /> Novo Cliente
        </button>
        <button onClick={onNewLoan} className="w-full flex items-center justify-center bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" /> Novo Empréstimo
        </button>
        <button onClick={onNewAccount} className="w-full flex items-center justify-center bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" /> Nova Conta
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
