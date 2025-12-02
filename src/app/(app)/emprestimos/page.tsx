'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Banknote, ChevronDown } from 'lucide-react';
import type { Loan, Payment } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PaymentDialog } from './components/payment-dialog';
import { NewLoanDialog } from './components/new-loan-dialog';
import { DeleteAlertDialog } from '@/components/delete-alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PaymentHistoryDialog } from './components/payment-history-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, List, AlertTriangle } from 'lucide-react';
import { useFinancialData } from '@/context/financial-context';
import Link from 'next/link';
import { NewLoanFormValues } from './novo/page';

type LoanStatusFilter = 'Todos' | 'Atrasado' | 'Parcialmente Pago' | 'Pendente' | 'Quitado' | 'Ativo';
type Installment = Loan['installments'][0];

// Componente para a tabela de amortização (plano de pagamento)
const AmortizationPlan = ({
  loan,
  onPayClick,
  onHistoryClick,
}: {
  loan: Loan;
  onPayClick: (installment: Installment) => void;
  onHistoryClick: (installment: Installment) => void;
}) => {
  const getStatusInfo = (status: Installment['status'], dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
    const dueDateObj = new Date(dueDate + 'T00:00:00');

    if ((status === 'Pendente' || status === 'Parcialmente Pago') && dueDateObj < today) {
      return { text: 'Atrasado', variant: 'destructive' };
    }

    switch (status) {
      case 'Pago':
        return { text: 'Pago', variant: 'default' };
      case 'Parcialmente Pago':
        return { text: 'Parcialmente Pago', variant: 'secondary' };
      case 'Pendente':
      default:
        return { text: 'Pendente', variant: 'outline' };
    }
  };

  return (
    <div className="bg-card-foreground/5 p-4 mt-2 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-foreground">Plano de Amortização</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-white/10">
              <TableHead className="text-muted-foreground">#</TableHead>
              <TableHead className="text-muted-foreground">Vencimento</TableHead>
              <TableHead className="text-muted-foreground">Valor Parcela</TableHead>
              <TableHead className="text-muted-foreground">Principal</TableHead>
              <TableHead className="text-muted-foreground">Juros</TableHead>
              <TableHead className="text-muted-foreground">Valor Pago</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.installments.map((installment) => {
              const statusInfo = getStatusInfo(installment.status, installment.dueDate);
              return (
                <TableRow key={installment.number} className="border-b-white/10">
                  <TableCell className="font-medium text-foreground">{installment.number}</TableCell>
                  <TableCell className="text-foreground">{new Date(installment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(installment.amount)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(installment.principal)}</TableCell>
                  <TableCell className="text-foreground">{formatCurrency(installment.interest)}</TableCell>
                  <TableCell className="text-green-400">{formatCurrency(installment.paidAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant as any} className="text-xs">
                      {statusInfo.text}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto disabled:text-muted-foreground disabled:no-underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPayClick(installment);
                      }}
                      disabled={installment.status === 'Pago'}
                    >
                      Pagar
                    </Button>
                    <Button
                      variant="link"
                      className="text-muted-foreground p-0 h-auto ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        onHistoryClick(installment);
                      }}
                    >
                      Histórico
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};


export default function EmprestimosPage() {
  const { loans, deleteLoan, registerPayment, createLoan, updateLoan } = useFinancialData();
  const [activeFilter, setActiveFilter] = React.useState<LoanStatusFilter>('Todos');
  const [isNewLoanOpen, setNewLoanOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState<Loan | null>(null);
  const [deletingLoanId, setDeletingLoanId] = React.useState<string | null>(null);
  const [paymentState, setPaymentState] = React.useState<{ loan: Loan; installment: Installment } | null>(null);
  const [historyState, setHistoryState] = React.useState<{ loan: Loan; installment: Installment } | null>(null);

  const { toast } = useToast();

  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setNewLoanOpen(true);
  };
  
  const handleOpenNewLoan = () => {
    setEditingLoan(null);
    setNewLoanOpen(true);
  };

  const handleOpenDeleteDialog = (loanId: string) => {
    setDeletingLoanId(loanId);
  };

  const handleOpenPaymentDialog = (loan: Loan, installment: Installment) => {
    setPaymentState({ loan, installment });
  };

  const handleOpenHistoryDialog = (loan: Loan, installment: Installment) => {
    setHistoryState({ loan, installment });
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
    return loans.filter(loan => loan.status === activeFilter);
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

      <div>
        {filteredLoans.map(loan => {
          const totalInstallments = loan.installments.length;
          const paidInstallments = loan.installments.filter(i => i.status === 'Pago').length;
          const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
          const totalAmount = loan.installments.reduce((acc, i) => acc + i.amount, 0);
          
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
            <Accordion key={loan.id} type="single" collapsible className="bg-card border border-border rounded-lg mb-4">
              <AccordionItem value={loan.id} className="border-none">
                <div className="flex w-full p-4 items-start">
                    <div className="flex-1 group/trigger">
                        <AccordionTrigger className="w-full p-0 hover:no-underline text-left flex-1 [&>svg]:hidden">
                            <div className="flex flex-col md:flex-row gap-4 w-full text-left items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-foreground">{loan.borrowerName}</h2>
                                    <div className="flex items-center gap-2 flex-wrap mt-2">
                                        <Badge variant="outline" className="border-border text-muted-foreground">{loan.code}</Badge>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-3xl font-bold text-foreground">{formatCurrency(loan.amount)}</p>
                                        <p className="text-sm text-muted-foreground">{totalInstallments} parcelas de ~{formatCurrency(totalAmount / totalInstallments)}</p>
                                    </div>
                                </div>
                                <div className="w-full md:w-64 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Início em {new Date(loan.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                        <Badge className={cn('text-xs', getStatusClasses(displayStatus))}>{displayStatus}</Badge>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm text-muted-foreground">{paidInstallments}/{totalInstallments} Pagas</p>
                                        <Progress value={progress} className="h-2 mt-1 bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>
                    </div>
                    <div className="flex flex-col items-center justify-start gap-1 pl-4">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => handleOpenEditLoan(loan)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={() => handleOpenDeleteDialog(loan.id)}><Trash2 className="w-4 h-4" /></Button>
                        <AccordionTrigger className="p-0 [&>svg]:mx-auto"><ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" /></AccordionTrigger>
                    </div>
                </div>
                <AccordionContent className="p-4 pt-0">
                  <AmortizationPlan
                    loan={loan}
                    onPayClick={(installment) => handleOpenPaymentDialog(loan, installment)}
                    onHistoryClick={(installment) => handleOpenHistoryDialog(loan, installment)}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
        {filteredLoans.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
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

    