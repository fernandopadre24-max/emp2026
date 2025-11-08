// utils/formatters.ts

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
  const cleaned = cpf.replace(/\D/g, ''); // Remove non-digit characters
  
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .substring(0, 14);
};

export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, ''); // Remove non-digit characters

  if (cleaned.length > 10) {
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  }
  
  return cleaned
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 14);
};
