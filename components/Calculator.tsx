import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(true);

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
        setDisplay('0.');
        setWaitingForOperand(false);
        return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };
  
  const calculate = (prev: number, current: number, op: string): number => {
      switch (op) {
          case '+': return prev + current;
          case '-': return prev - current;
          case '*': return prev * current;
          case '/': return prev / current;
          default: return current;
      }
  }

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setOperator(null);
    setPreviousValue(null);
    setWaitingForOperand(true);
  };

  // FIX: Refactored component definition to use a typed interface and React.FC, resolving a TypeScript error where the 'children' prop was not being recognized.
  interface CalculatorButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
  }

  const CalculatorButton: React.FC<CalculatorButtonProps> = ({
    onClick,
    children,
    className = '',
  }) => (
    <button
      onClick={onClick}
      className={`text-2xl font-semibold rounded-lg shadow-md hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      {children}
    </button>
  );

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">Calculadora</h1>
      <div className="max-w-xs mx-auto bg-surface-100 rounded-xl shadow-2xl p-4 space-y-4">
        <div className="bg-background text-text-primary text-right text-4xl font-mono p-4 rounded-lg overflow-x-auto">
          {display}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <CalculatorButton onClick={handleClear} className="col-span-2 bg-danger text-white">C</CalculatorButton>
          <CalculatorButton onClick={() => handleOperator('/')} className="bg-indigo-500 text-white">÷</CalculatorButton>
          <CalculatorButton onClick={() => handleOperator('*')} className="bg-indigo-500 text-white">×</CalculatorButton>
          
          <CalculatorButton onClick={() => handleDigit('7')} className="bg-surface-200">7</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('8')} className="bg-surface-200">8</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('9')} className="bg-surface-200">9</CalculatorButton>
          <CalculatorButton onClick={() => handleOperator('-')} className="bg-indigo-500 text-white">−</CalculatorButton>
          
          <CalculatorButton onClick={() => handleDigit('4')} className="bg-surface-200">4</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('5')} className="bg-surface-200">5</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('6')} className="bg-surface-200">6</CalculatorButton>
          <CalculatorButton onClick={() => handleOperator('+')} className="bg-indigo-500 text-white">+</CalculatorButton>
          
          <CalculatorButton onClick={() => handleDigit('1')} className="bg-surface-200">1</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('2')} className="bg-surface-200">2</CalculatorButton>
          <CalculatorButton onClick={() => handleDigit('3')} className="bg-surface-200">3</CalculatorButton>
          <CalculatorButton onClick={handleEquals} className="row-span-2 bg-primary text-white">=</CalculatorButton>

          <CalculatorButton onClick={() => handleDigit('0')} className="col-span-2 bg-surface-200">0</CalculatorButton>
          <CalculatorButton onClick={handleDecimal} className="bg-surface-200">.</CalculatorButton>
        </div>
      </div>
    </>
  );
};

export default Calculator;