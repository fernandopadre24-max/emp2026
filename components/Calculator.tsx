import React, { useState } from 'react';
import { formatCurrency } from '../utils/loanCalculator';
import { ChartBarIcon, CurrencyDollarIcon } from './icons/Icons';

const StandardCalculator: React.FC = () => {
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
        </>
    );
};

const CompoundInterestCalculator: React.FC = () => {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [period, setPeriod] = useState('');
    const [rateType, setRateType] = useState<'monthly' | 'yearly'>('monthly');
    const [periodUnit, setPeriodUnit] = useState<'months' | 'years'>('months');
    const [result, setResult] = useState<{ finalAmount: number; totalInterest: number } | null>(null);
    const [error, setError] = useState('');

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);

        const p = parseFloat(principal);
        const r = parseFloat(rate);
        const t = parseInt(period, 10);

        if (isNaN(p) || isNaN(r) || isNaN(t) || p <= 0 || r <= 0 || t <= 0) {
            setError("Por favor, preencha todos os campos com valores positivos.");
            return;
        }

        const monthlyRate = rateType === 'yearly' ? (r / 100) / 12 : r / 100;
        const totalMonths = periodUnit === 'years' ? t * 12 : t;

        const finalAmount = p * Math.pow(1 + monthlyRate, totalMonths);
        const totalInterest = finalAmount - p;

        setResult({ finalAmount, totalInterest });
    };

    const inputStyles = "w-full px-3 py-2 border border-surface-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface-100 text-text-primary";

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-semibold text-center text-text-primary">Simulador de Juros Compostos</h2>
            <form onSubmit={handleCalculate} className="space-y-4">
                <div>
                    <label htmlFor="principal" className="block text-sm font-medium text-text-secondary mb-1">Valor Principal (R$)</label>
                    <input id="principal" type="number" step="0.01" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="Ex: 1000" className={inputStyles} />
                </div>

                <div>
                    <label htmlFor="rate" className="block text-sm font-medium text-text-secondary mb-1">Taxa de Juros (%)</label>
                    <div className="flex gap-2">
                        <input id="rate" type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} placeholder="Ex: 1.5" className={inputStyles} />
                        <div className="flex space-x-1 p-0.5 bg-surface-200 rounded-lg">
                            <button type="button" onClick={() => setRateType('monthly')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rateType === 'monthly' ? 'bg-white text-primary shadow' : 'text-text-secondary'}`}>Mensal</button>
                            <button type="button" onClick={() => setRateType('yearly')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rateType === 'yearly' ? 'bg-white text-primary shadow' : 'text-text-secondary'}`}>Anual</button>
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="period" className="block text-sm font-medium text-text-secondary mb-1">Período</label>
                    <div className="flex gap-2">
                        <input id="period" type="number" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ex: 12" className={inputStyles} />
                        <div className="flex space-x-1 p-0.5 bg-surface-200 rounded-lg">
                            <button type="button" onClick={() => setPeriodUnit('months')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${periodUnit === 'months' ? 'bg-white text-primary shadow' : 'text-text-secondary'}`}>Meses</button>
                            <button type="button" onClick={() => setPeriodUnit('years')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${periodUnit === 'years' ? 'bg-white text-primary shadow' : 'text-text-secondary'}`}>Anos</button>
                        </div>
                    </div>
                </div>
                
                <button type="submit" className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-secondary-hover transition-colors">
                    Calcular
                </button>
            </form>

            {error && <p className="text-sm text-center text-danger">{error}</p>}

            {result && (
                <div className="border-t border-surface-300 pt-6 mt-6 space-y-4 animate-fade-in-up">
                    <h3 className="text-lg font-semibold text-center text-text-primary">Resultado da Simulação</h3>
                    <div className="bg-surface-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <CurrencyDollarIcon className="w-8 h-8 text-primary mr-3" />
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Montante Final</p>
                                <p className="text-xl font-bold text-text-primary">{formatCurrency(result.finalAmount)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-surface-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <ChartBarIcon className="w-8 h-8 text-success mr-3" />
                            <div>
                                <p className="text-sm font-medium text-text-secondary">Total em Juros</p>
                                <p className="text-xl font-bold text-success">{formatCurrency(result.totalInterest)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in-up {
                0% { opacity: 0; transform: translateY(10px); }
                100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};


const Calculator: React.FC = () => {
    const [mode, setMode] = useState<'standard' | 'compound'>('standard');

    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-text-primary">Calculadora</h1>
            <div className="max-w-md mx-auto bg-surface-100 rounded-xl shadow-2xl p-4 space-y-4">
                <div className="flex justify-center space-x-1 p-1 bg-surface-200 rounded-lg">
                    <button
                        onClick={() => setMode('standard')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'standard' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:bg-surface-300'}`}
                        aria-pressed={mode === 'standard'}
                    >
                        Padrão
                    </button>
                    <button
                        onClick={() => setMode('compound')}
                        className={`w-full px-3 py-2 text-sm font-semibold rounded-md transition-colors ${mode === 'compound' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:bg-surface-300'}`}
                        aria-pressed={mode === 'compound'}
                    >
                        Juros Compostos
                    </button>
                </div>
                {mode === 'standard' ? <StandardCalculator /> : <CompoundInterestCalculator />}
            </div>
        </>
    );
};

export default Calculator;