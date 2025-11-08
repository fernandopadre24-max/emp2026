import { Installment } from '../types';

export const calculateAmortization = (
  principal: number,
  monthlyRate: number,
  installmentsCount: number,
  startDate: string
): Installment[] => {
  if (principal <= 0 || monthlyRate <= 0 || installmentsCount <= 0) {
    return [];
  }

  const installments: Installment[] = [];
  let balance = principal;

  const monthlyPayment =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, installmentsCount)) /
    (Math.pow(1 + monthlyRate, installmentsCount) - 1);
  
  if (!isFinite(monthlyPayment)) {
      return [];
  }

  const start = new Date(startDate);
  // Ajuste para garantir que a data de início seja considerada corretamente, ignorando o fuso horário
  start.setUTCHours(0, 0, 0, 0);

  for (let i = 1; i <= installmentsCount; i++) {
    const interest = balance * monthlyRate;
    const principalPortion = monthlyPayment - interest;
    balance -= principalPortion;

    if (i === installmentsCount) {
        balance = 0;
    }

    const dueDate = new Date(start);
    dueDate.setUTCMonth(start.getUTCMonth() + i);

    installments.push({
      number: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amount: monthlyPayment,
      principal: principalPortion,
      interest: interest,
      balance: Math.abs(balance),
      status: 'Pendente',
      payments: [],
    });
  }

  return installments;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
   // Adiciona T00:00:00 para tratar a data como local e evitar problemas de fuso
  const adjustedDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
  return new Intl.DateTimeFormat('pt-BR').format(adjustedDate);
};

export const updateInstallmentStatus = (installments: Installment[]): Installment[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return installments.map(inst => {
    if (inst.status === 'Paga') {
      return inst;
    }
    const dueDate = new Date(inst.dueDate);
    dueDate.setUTCHours(0,0,0,0);
    
    if (dueDate < today) {
      return { ...inst, status: 'Atrasada' };
    }
    return inst;
  });
};
