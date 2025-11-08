import React, { useState, useMemo } from 'react';
import { Loan, Client, Installment } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';
import { formatCurrency, formatDate } from '../utils/loanCalculator';
import Modal from './Modal';

interface CalendarViewProps {
  loans: Loan[];
  clients: Client[];
}

interface CalendarInstallment extends Installment {
  clientName: string;
  loanCode: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ loans, clients }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayInstallments, setSelectedDayInstallments] = useState<CalendarInstallment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'Desconhecido';

  const installmentsByDate = useMemo(() => {
    const map = new Map<string, CalendarInstallment[]>();
    loans.forEach(loan => {
      loan.installments.forEach(inst => {
        const dateKey = inst.dueDate;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push({
          ...inst,
          clientName: getClientName(loan.clientId),
          loanCode: loan.code,
        });
      });
    });
    return map;
  }, [loans, clients]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(1); // Avoid issues with different month lengths
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };
  
  const openDayModal = (dateKey: string) => {
      const installments = installmentsByDate.get(dateKey) || [];
      if (installments.length > 0) {
        setSelectedDayInstallments(installments);
        setIsModalOpen(true);
      }
  };

  const closeDayModal = () => {
    setIsModalOpen(false);
    setSelectedDayInstallments([]);
  }

  const { calendarGrid, monthName, year } = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const grid: (number | null)[] = [
        ...Array(firstDayOfMonth).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];

    return {
      calendarGrid: grid,
      monthName: currentDate.toLocaleString('pt-BR', { month: 'long' }),
      year,
    };
  }, [currentDate]);

  const getStatusBadgeClasses = (status: Installment['status']) => {
    switch (status) {
      case 'Paga': return 'border border-success text-success bg-success/10';
      case 'Atrasada': return 'border border-danger text-danger bg-danger/10';
      case 'Parcialmente Paga': return 'border border-warning text-warning bg-warning/10';
      case 'Pendente': return 'border border-primary text-primary bg-primary/10';
      default: return 'border border-surface-300 text-text-secondary bg-surface-300/20';
    }
  };

  const getStatusModalBadgeClasses = (status: Installment['status']) => {
    switch (status) {
        case 'Paga': return 'bg-green-100 text-green-800';
        case 'Atrasada': return 'bg-red-100 text-red-800';
        case 'Parcialmente Paga': return 'bg-orange-100 text-orange-800';
        case 'Pendente': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to determine the most critical status for a given day
  const getDaySummaryStatus = (installments: CalendarInstallment[]): Installment['status'] | null => {
      if (installments.length === 0) return null;
      if (installments.some(i => i.status === 'Atrasada')) return 'Atrasada';
      if (installments.some(i => i.status === 'Parcialmente Paga')) return 'Parcialmente Paga';
      if (installments.some(i => i.status === 'Pendente')) return 'Pendente';
      if (installments.every(i => i.status === 'Paga')) return 'Paga';
      return null;
  };

  // Helper to get background color class based on status
  const getDayCellBgClass = (status: Installment['status'] | null) => {
      if (!status) return 'border-surface-300/50';
      switch (status) {
          case 'Atrasada': return 'bg-danger/10 border-danger/30';
          case 'Parcialmente Paga': return 'bg-warning/10 border-warning/30';
          case 'Pendente': return 'bg-primary/10 border-primary/30';
          case 'Paga': return 'bg-success/10 border-success/30';
          default: return 'border-surface-300/50';
      }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);


  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Calendário de Recebimentos</h1>
      <div className="bg-surface-100 rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-surface-200 transition-colors">
            <ChevronLeftIcon className="w-6 h-6 text-text-secondary" />
          </button>
          <h2 className="text-xl font-semibold text-text-primary capitalize">
            {monthName} de {year}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-surface-200 transition-colors">
            <ChevronRightIcon className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center font-medium text-text-secondary">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="py-2 hidden sm:block">{day}</div>
          ))}
           {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
            <div key={day} className="py-2 sm:hidden">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarGrid.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="border border-transparent"></div>;

            const currentDayDate = new Date(year, currentDate.getMonth(), day);
            const dateKey = currentDayDate.toISOString().split('T')[0];
            const dayInstallments = installmentsByDate.get(dateKey) || [];
            const dayStatus = getDaySummaryStatus(dayInstallments);
            const dayCellBgClass = getDayCellBgClass(dayStatus);
            const isToday = currentDayDate.getTime() === today.getTime();
            
            return (
              <div
                key={day}
                onClick={() => openDayModal(dateKey)}
                className={`relative min-h-[6rem] sm:min-h-[8rem] p-2 border rounded-md transition-colors ${dayCellBgClass} ${dayInstallments.length > 0 ? 'cursor-pointer hover:bg-surface-200/80' : ''}`}
              >
                <div className="flex justify-start">
                    <span className={`font-semibold text-text-primary text-sm ${isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
                </div>
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                    {dayInstallments.slice(0, 3).map(inst => (
                         <div key={inst.number + inst.loanCode} title={`${inst.clientName} - ${formatCurrency(inst.amount)}`} className={`text-xs p-1 rounded-md truncate font-semibold ${getStatusBadgeClasses(inst.status)}`}>
                           <span className="hidden sm:inline">{inst.clientName.split(' ')[0]} - </span>{formatCurrency(inst.amount)}
                        </div>
                    ))}
                    {dayInstallments.length > 3 && (
                        <div className="text-xs text-center font-bold text-text-secondary mt-1">
                            + {dayInstallments.length - 3} mais
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {isModalOpen && selectedDayInstallments.length > 0 && (
          <Modal
            isOpen={isModalOpen}
            onClose={closeDayModal}
            title={`Vencimentos para ${formatDate(selectedDayInstallments[0].dueDate)}`}
          >
              <ul className="divide-y divide-surface-300 max-h-[60vh] overflow-y-auto -mx-6 px-6">
                  {selectedDayInstallments.map((inst, idx) => (
                      <li key={idx} className="py-4">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                                <p className="font-semibold text-text-primary">{inst.clientName}</p>
                                <p className="text-sm text-text-secondary">Parcela #{inst.number} ({inst.loanCode})</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-text-primary">{formatCurrency(inst.amount)}</p>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusModalBadgeClasses(inst.status)}`}>
                                    {inst.status}
                                </span>
                            </div>
                          </div>
                      </li>
                  ))}
              </ul>
          </Modal>
      )}
    </>
  );
};

export default CalendarView;