'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Banknote, Calendar, TrendingUp, Percent, FileSpreadsheet } from 'lucide-react';
import type { Loan, Payment } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PaymentDialog } from './components/payment-dialog';
import { NewLoanDialog } from './components/new-loan-dialog';
import { DeleteAlertDialog } from '@/components/delete-alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PaymentHistoryDialog } from './components/payment-history-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { DollarSign, List, AlertTriangle } from 'lucide-react';
import { useFinancialData } from '@/context/financial-context';
import Link from 'next/link';
import { NewLoanFormValues } from './novo/page';
import { AmortizationDialog } from './components/amortization-dialog';

type LoanStatusFilter = 'Todos' | 'Atrasado' | 'Parcialmente Pago' | 'Pendente' | 'Quitado' | 'Ativo';
type Installment = Loan['installments'][0];

export default function EmprestimosPage() {
  const { loans, deleteLoan, registerPayment, createLoan, updateLoan } = useFinancialData();
  const [activeFilter, setActiveFilter] = React.useState<LoanStatusFilter>('Todos');
  const [isNewLoanOpen, setNewLoanOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState<Loan | null>(null);
  const [deletingLoanId, setDeletingLoanId] = React.useState<string | null>(null);
  const [paymentState, setPaymentState] = React.useState<{ loan: Loan; installment: Installment } | null>(null);
  const [historyState, setHistoryState] = React.useState<{ loan: Loan; installment: Installment } | null>(null);
  const [amortizationState, setAmortizationState] = React.useState<Loan | null>(null);


  const { toast } = useToast();

  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setNewLoanOpen(true);
  };
  
  const handleOpenDeleteDialog = (loanId: string) => {
    setDeletingLoanId(loanId);
  };

  const handleOpenPaymentDialog = (installment: Installment) => {
    if (!amortizationState) return;
    setPaymentState({ loan: amortizationState, installment });
  };

  const handleOpenHistoryDialog = (installment: Installment) => {
    if (!amortizationState) return;
    setHistoryState({ loan: amortizationState, installment });
  };

  const handleDeleteLoan = async () => {
    if (!deletingLoanId) return;
    const loanToDelete = loans.find(l => l.id === deletingLoanId);
    await deleteLoan(deletingLoanId);
    toast({
      title: "Empréstimo Excluído",
      description: `O empréstimo para ${loanToDelete?.borrowerName} foi removido.`,
    });
    setDeletingLoanId(null);
  };
  
  const handlePayment = (
    loanId: string,
    installmentNumber: number,
    paymentAmount: number,
    paymentDate: string,
    paymentMethod: string,
    destinationAccountId: string,
  ) => {
    registerPayment(loanId, installmentNumber, paymentAmount, paymentDate, paymentMethod, destinationAccountId);
    setPaymentState(null); // Close dialog on success
  };

  const handleConfirmLoanDialog = (values: NewLoanFormValues, id?: string) => {
    if (id) {
        updateLoan(values, id);
    }
  }

  const filteredLoans = React.useMemo(() => {
    if (activeFilter === 'Todos') return loans;
    if (activeFilter === 'Parcialmente Pago') return loans.filter(loan => loan.installments.some(i => i.status === 'Parcialmente Pago'));
    if (activeFilter === 'Quitado') return loans.filter(loan => loan.status === 'Quitado' || loan.status === 'Pago');
    return loans.filter(loan => {
      const isOverdue = (loan.status === 'Ativo' || loan.status === 'Pendente') && loan.installments.some(i => (i.status === 'Pendente' || i.status === 'Parcialmente Pago') && new Date(i.dueDate + 'T00:00:00') < new Date());
      const displayStatus = isOverdue ? 'Atrasado' : loan.status;
      return displayStatus === activeFilter;
    });
  }, [activeFilter, loans]);

  const summary = React.useMemo(() => ({
    totalEmprestado: loans.reduce((acc, loan) => acc + loan.amount, 0),
    totalRecebido: loans.flatMap(l => l.payments).reduce((acc, p) => acc + p.amount, 0),
    emprestimosAtivos: loans.filter(l => l.status === 'Ativo').length,
    emprestimosAtrasados: loans.filter(l => l.status === 'Atrasado' || l.installments.some(i => i.status === 'Pendente' && new Date(i.dueDate + 'T00:00:00') < new Date())).length,
  }), [loans]);
  
  const loanToDelete = loans.find(l => l.id === deletingLoanId);

  return (
    <div className="text-white">
      <PageHeader
        title="Empréstimos"
        description="Gerencie todos os seus empréstimos aqui."
        action={
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/emprestimos/novo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Empréstimo
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emprestado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalEmprestado)}</div>
            <p className="text-xs text-muted-foreground">Valor total de todos os empréstimos</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalRecebido)}</div>
                <p className="text-xs text-muted-foreground">Soma de todos os pagamentos</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{summary.emprestimosAtivos}</div>
            <p className="text-xs text-muted-foreground">Empréstimos aguardando quitação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Pagamento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">+{summary.emprestimosAtrasados}</div>
            <p className="text-xs text-muted-foreground">Empréstimos com pagamentos atrasados</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {(['Todos', 'Ativo', 'Atrasado', 'Pendente', 'Quitado'] as LoanStatusFilter[]).map(filter => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              className={cn('shrink-0', activeFilter === filter ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground border-border')}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {filteredLoans.map(loan => {
          const totalInstallments = loan.installments.length;
          const paidInstallments = loan.installments.filter(i => i.status === 'Pago').length;
          const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
          const totalAmountPayable = loan.installments.reduce((acc, i) => acc + i.amount, 0);
          const totalInterest = totalAmountPayable - loan.amount - (loan.iofValue || 0);

          const nextInstallment = loan.installments.find(i => i.status === 'Pendente' || i.status === 'Parcialmente Pago');

          const isOverdue = (loan.status === 'Ativo' || loan.status === 'Pendente') && loan.installments.some(i => (i.status === 'Pendente' || i.status === 'Parcialmente Pago') && new Date(i.dueDate + 'T00:00:00') < new Date());
          const displayStatus = isOverdue ? 'Atrasado' : loan.status;

          const getStatusClasses = (status: Loan['status']) => {
            switch (status) {
              case 'Quitado':
              case 'Pago':
                return 'border-green-500/50 bg-green-500/10 text-green-400';
              case 'Atrasado':
                return 'border-red-500/50 bg-red-500/10 text-red-400';
              case 'Ativo':
              case 'Pendente':
              default:
                return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
            }
          };

          return (
            <Card key={loan.id} className="flex flex-col w-[380px] shrink-0">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">{loan.borrowerName}</CardTitle>
                        <CardDescription className="text-xs">{loan.code}</CardDescription>
                    </div>
                    <Badge className={cn('text-xs', getStatusClasses(displayStatus))}>{displayStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-grow">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Principal</p>
                  <p className="text-2xl font-bold">{formatCurrency(loan.amount)}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><Percent className="w-3 h-3" /> Juros (mês)</p>
                        <p className="font-semibold">{loan.interestRate}%</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Custo Efetivo</p>
                        <p className="font-semibold">{formatCurrency(totalInterest)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total a Pagar</p>
                        <p className="font-semibold">{formatCurrency(totalAmountPayable)}</p>
                    </div>
                    {nextInstallment && (
                        <div className="space-y-1">
                            <p className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Próx. Parcela</p>
                            <p className="font-semibold">{new Date(nextInstallment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span>{paidInstallments}/{totalInstallments} pagas</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="w-full" onClick={() => setAmortizationState(loan)}>
                    <FileSpreadsheet className="mr-2" />
                    Ver Parcelas
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleOpenEditLoan(loan)}><Edit /></Button>
                <Button variant="ghost" size="icon" className="shrink-0 hover:text-destructive" onClick={() => handleOpenDeleteDialog(loan.id)}><Trash2 /></Button>
              </CardFooter>
            </Card>
          );
        })}
        {filteredLoans.length === 0 && (
          <div className="col-span-full flex h-40 w-full items-center justify-center rounded-lg border border-dashed text-center">
            <p className="text-muted-foreground">Nenhum empréstimo encontrado para o filtro "{activeFilter}".</p>
          </div>
        )}
      </div>

      <NewLoanDialog
        isOpen={isNewLoanOpen}
        onOpenChange={(isOpen) => {
            if (!isOpen) setEditingLoan(null);
            setNewLoanOpen(isOpen);
        }}
        loanToEdit={editingLoan}
        onConfirm={handleConfirmLoanDialog}
      />

      <DeleteAlertDialog
        isOpen={!!deletingLoanId}
        onOpenChange={(isOpen) => !isOpen && setDeletingLoanId(null)}
        onConfirm={handleDeleteLoan}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o empréstimo para ${loanToDelete?.borrowerName}? Esta ação não pode ser desfeita.`}
      />

       <AmortizationDialog
          isOpen={!!amortizationState}
          onOpenChange={(isOpen) => !isOpen && setAmortizationState(null)}
          loan={amortizationState}
          onPayClick={handleOpenPaymentDialog}
          onHistoryClick={handleOpenHistoryDialog}
        />

      <PaymentDialog
        isOpen={!!paymentState}
        onOpenChange={(isOpen) => !isOpen && setPaymentState(null)}
        loan={paymentState?.loan ?? null}
        installment={paymentState?.installment ?? null}
        onPaymentSuccess={handlePayment}
      />

      <PaymentHistoryDialog
        isOpen={!!historyState}
        onOpenChange={(isOpen) => !isOpen && setHistoryState(null)}
        loan={historyState?.loan ?? null}
        installment={historyState?.installment ?? null}
      />
    </div>
  );
}
