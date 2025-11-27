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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { Loan, Payment } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type Installment = Loan['installments'][0];

interface PaymentHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  installment: Installment | null;
  loan: Loan | null;
}

// Mock payment history data. In a real app, this would come from an API.
const mockHistory: (Payment & { method: string })[] = [
    { id: 'PAG-001-A', loanId: 'EMP-232570', installmentNumber: 1, amount: 525.0, paymentDate: '2025-12-05', method: 'PIX' },
    { id: 'PAG-002-A', loanId: 'EMP-761238', installmentNumber: 1, amount: 105.0, paymentDate: '2025-12-15', method: 'Boleto' },
    { id: 'PAG-002-B', loanId: 'EMP-761238', installmentNumber: 2, amount: 105.0, paymentDate: '2026-01-15', method: 'PIX' },
    { id: 'PAG-002-C', loanId: 'EMP-761238', installmentNumber: 3, amount: 105.0, paymentDate: '2026-02-14', method: 'Dinheiro' },
    { id: 'PAG-002-D', loanId: 'EMP-761238', installmentNumber: 4, amount: 105.0, paymentDate: '2026-03-15', method: 'PIX' },
    { id: 'PAG-002-E', loanId: 'EMP-761238', installmentNumber: 5, amount: 105.0, paymentDate: '2026-04-15', method: 'PIX' },
];

export function PaymentHistoryDialog({
  isOpen,
  onOpenChange,
  installment,
  loan,
}: PaymentHistoryDialogProps) {
  if (!installment || !loan) return null;

  const paymentHistory = mockHistory.filter(
    (p) => p.loanId === loan.id && p.installmentNumber === installment.number
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos</DialogTitle>
          <DialogDescription>
            Mostrando pagamentos para a parcela #{installment.number} de{' '}
            {loan.borrowerName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Forma de Pagamento</TableHead>
                <TableHead className="text-right">Valor Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.paymentDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Nenhum pagamento registrado para esta parcela.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
