import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, ''); // Remove all non-digit characters
  cpf = cpf.substring(0, 11); // Limit to 11 digits
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return cpf;
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  phone = phone.replace(/\D/g, ''); // Remove all non-digit characters
  phone = phone.substring(0, 11); // Limit to 11 digits
  if (phone.length > 10) {
    // (xx) xxxxx-xxxx
    phone = phone.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (phone.length > 5) {
    // (xx) xxxx-xxxx
    phone = phone.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (phone.length > 2) {
    // (xx) xxxx
    phone = phone.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
  } else {
    phone = phone.replace(/^(\d*)/, '($1');
  }
  return phone;
}