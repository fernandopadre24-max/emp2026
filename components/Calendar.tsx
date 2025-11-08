import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface CalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect }) => {
  // Adiciona T00:00:00 para evitar problemas de fuso horário ao instanciar a data
  const initialDate = new Date(selectedDate + 'T00:00:00');
  const [currentDate, setCurrentDate] = useState(initialDate);

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const { calendarDays, month, year } = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDayOfMonth }, () => null);
    
    return { calendarDays: [...paddingDays, ...days], month, year };
  }, [currentDate]);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="bg-surface-200 p-3 rounded-lg w-full">
      <div className="flex justify-between items-center mb-2">
        <button type="button" onClick={() => changeMonth(-1)} className="p-1.5 rounded-full hover:bg-surface-300 transition-colors">
          <ChevronLeftIcon className="w-5 h-5 text-text-secondary" />
        </button>
        <span className="font-semibold text-text-primary text-sm capitalize">
          {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={() => changeMonth(1)} className="p-1.5 rounded-full hover:bg-surface-300 transition-colors">
          <ChevronRightIcon className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-text-secondary">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i} className="w-8 h-8 flex items-center justify-center">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-1">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={`pad-${index}`} />;
          
          const date = new Date(year, month, day);
          const dateString = date.toISOString().split('T')[0];
          
          const isSelected = dateString === selectedDate;
          const isToday = date.getTime() === today.getTime();

          let buttonClass = 'w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm ';
          if (isSelected) {
            buttonClass += 'bg-primary text-white font-bold shadow';
          } else if (isToday) {
            buttonClass += 'bg-primary/20 text-primary font-semibold';
          } else {
            buttonClass += 'text-text-primary hover:bg-surface-300';
          }
          
          return (
            <div key={day} className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => onDateSelect(dateString)}
                className={buttonClass}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;