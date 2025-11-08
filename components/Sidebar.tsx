import React from 'react';
import { View } from '../types';
import { ChartBarIcon, BanknotesIcon, UserGroupIcon, BuildingLibraryIcon, CalculatorIcon } from './icons/Icons';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

const NavLink: React.FC<{
  viewName: View;
  currentView: View;
  onNavigate: (view: View) => void;
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


const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <aside className="w-64 bg-surface-100 shadow-lg flex flex-col p-4 space-y-4 shrink-0 h-full border-r border-surface-300">
      <nav className="flex-grow space-y-2 pt-4">
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
         <NavLink viewName="calculator" currentView={currentView} onNavigate={onNavigate} icon={<CalculatorIcon />}>
          Calculadora
        </NavLink>
      </nav>

    </aside>
  );
};

export default Sidebar;