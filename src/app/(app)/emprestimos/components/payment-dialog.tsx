'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Loan } from '@/lib/types';
import { Banknote } from 'lucide-react';

type Installment = Loan['installments'][0];

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  installment: Installment | null;
  loan: Loan | null;
  onPaymentSuccess: (loanId: string, installmentNumber: number, amount: number, paymentDate: string, paymentMethod: string) => void;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  installment,
  loan,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [amount, setAmount] = React.useState('');
  const [paymentDate, setPaymentDate] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const { toast } = useToast();

  React.useEffect(() => {
    if (installment) {
      setAmount((installment.amount - installment.paidAmount).toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('pix');
    }
  }, [installment]);

  const handlePayment = () => {
    if (!loan || !installment) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Valor Inválido',
        description: 'Por favor, insira um valor de pagamento válido.',
      });
      return;
    }

    onPaymentSuccess(loan.id, installment.number, paymentAmount, paymentDate, paymentMethod);

    toast({
      title: 'Pagamento Registrado!',
      description: `Pagamento de ${formatCurrency(
        paymentAmount
      )} registrado para a parcela #${installment.number}.`,
      className: 'bg-primary text-primary-foreground',
    });

    onOpenChange(false);
  };
  
  if (!installment || !loan) return null;

  const remainingAmount = installment.amount - installment.paidAmount;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Parcela #{installment.number} de {loan.borrowerName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor a Pagar</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={formatCurrency(remainingAmount)}
            />
             <p className="text-xs text-muted-foreground">
              Valor restante da parcela: {formatCurrency(remainingAmount)}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Data do Pagamento</Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={setPaymentMethod}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handlePayment}>
            <Banknote className="mr-2" />
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
