'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { loans as initialLoans } from '@/lib/data';
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

type LoanStatus = 'Todos' | 'Atrasado' | 'Parcialmente Pago' | 'Pendente' | 'Quitado' | 'Ativo';
type Installment = Loan['installments'][0];

const LoanStatusFilters = ({ activeFilter, setActiveFilter }: { activeFilter: LoanStatus, setActiveFilter: (filter: LoanStatus) => void }) => {
    const filters: LoanStatus[] = ['Todos', 'Ativo', 'Atrasado', 'Pendente', 'Quitado'];

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {filters.map(filter => (
                <Button 
                    key={filter}
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        'shrink-0',
                        activeFilter === filter 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card text-card-foreground border-border'
                    )}
                    onClick={() => setActiveFilter(filter)}
                >
                    {filter}
                </Button>
            ))}
        </div>
    )
}

const AmortizationPlan = ({ loan, onPaymentMade }: { loan: Loan, onPaymentMade: (loanId: string, installmentNumber: number, amount: number, paymentDate: string, paymentMethod: string) => void }) => {
    const [isPaymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
    const [isHistoryDialogOpen, setHistoryDialogOpen] = React.useState(false);
    const [selectedInstallment, setSelectedInstallment] = React.useState<Installment | null>(null);

    const handlePayClick = (e: React.MouseEvent, installment: Installment) => {
        e.stopPropagation();
        setSelectedInstallment(installment);
        setPaymentDialogOpen(true);
    };

    const handleHistoryClick = (e: React.MouseEvent, installment: Installment) => {
        e.stopPropagation();
        setSelectedInstallment(installment);
        setHistoryDialogOpen(true);
    };

    const getStatusVariant = (status: Installment['status']) => {
        switch (status) {
        case 'Pago':
            return 'bg-green-500/20 text-green-400';
        case 'Parcialmente Pago':
            return 'bg-yellow-500/20 text-yellow-400';
        case 'Atrasado':
            return 'bg-red-500/20 text-red-400';
        case 'Pendente':
        default:
            return 'bg-gray-500/20 text-gray-400';
        }
    };

  return (
    <>
    <div className="bg-card-foreground/5 p-4 mt-2 rounded-lg">
      <h3 className="font-semibold text-lg mb-4 text-foreground">
        Plano de Amortização - {loan.borrowerName} ({loan.id})
      </h3>
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
            {loan.installments.map((installment) => (
                <TableRow key={installment.number} className="border-b-white/10">
                <TableCell className="font-medium text-foreground">{installment.number}</TableCell>
                <TableCell className="text-foreground">{new Date(installment.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-foreground">{formatCurrency(installment.amount)}</TableCell>
                <TableCell className="text-foreground">{formatCurrency(installment.principal)}</TableCell>
                <TableCell className="text-foreground">{formatCurrency(installment.interest)}</TableCell>
                <TableCell className="text-green-400">{formatCurrency(installment.paidAmount)}</TableCell>
                <TableCell>
                    <Badge className={cn('text-xs', getStatusVariant(installment.status))}>
                    {installment.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                    <Button 
                        variant="link" 
                        className="text-blue-500 p-0 h-auto disabled:text-muted-foreground disabled:no-underline" 
                        onClick={(e) => handlePayClick(e, installment)}
                        disabled={installment.status === 'Pago'}
                    >
                        Pagar
                    </Button>
                    <Button variant="link" className="text-muted-foreground p-0 h-auto ml-4" onClick={(e) => handleHistoryClick(e, installment)}>Histórico</Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>
    </div>
    <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        installment={selectedInstallment}
        loan={loan}
        onPaymentSuccess={onPaymentMade}
    />
    <PaymentHistoryDialog
        isOpen={isHistoryDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        installment={selectedInstallment}
        loan={loan}
    />
    </>
  );
};

const LoanCard = ({ loan, onEdit, onDelete, onPaymentMade }: { loan: Loan, onEdit: () => void, onDelete: () => void, onPaymentMade: (loanId: string, installmentNumber: number, amount: number, paymentDate: string, paymentMethod: string) => void }) => {
  const totalInstallments = loan.installments.length;
  const paidInstallments = loan.installments.filter(i => i.status === 'Pago').length;
  const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;
  const totalAmount = loan.installments.reduce((acc, i) => acc + i.amount, 0);
  const totalInterest = loan.installments.reduce((acc, i) => acc + i.interest, 0);

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
    <Accordion type="single" collapsible className="bg-card border border-border rounded-lg mb-4">
      <AccordionItem value={loan.id} className="border-none">
        <div className="flex w-full p-4 items-start justify-between">
          <AccordionTrigger className="w-full p-0 hover:no-underline text-left flex-1 [&>svg]:hidden">
             <div className="flex flex-col md:flex-row gap-4 w-full text-left items-start cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <h2 className="text-xl font-semibold text-foreground">{loan.borrowerName}</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <Badge variant="outline" className="border-border text-muted-foreground">{loan.id}</Badge>
                      <Badge variant="outline" className="border-border text-muted-foreground flex items-center gap-1"><Banknote className="w-3 h-3" /> Nubank</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(loan.amount)}</p>
                      <p className="text-sm text-muted-foreground">{totalInstallments} parcelas de ~{formatCurrency(totalAmount / totalInstallments)}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Juros: <span className="text-red-400">{formatCurrency(totalInterest)}</span> |
                        Custo Efetivo Total: <span className="text-foreground font-medium">{formatCurrency(loan.amount + totalInterest)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-64 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Início em {new Date(loan.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                      <Badge className={cn('text-xs', getStatusClasses(loan.status))}>{loan.status}</Badge>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">{paidInstallments}/{totalInstallments} Pagas</p>
                      <Progress value={progress} className="h-2 mt-1 bg-white/10" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Último Pgto: <span className="text-foreground">PIX</span> em {loan.payments.length > 0 ? new Date(loan.payments[loan.payments.length - 1].paymentDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                    </div>
                  </div>
                </div>
          </AccordionTrigger>
          <div className="flex flex-col items-center justify-start gap-1 pl-4">
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={onEdit}><Edit className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={onDelete}><Trash2 className="w-4 h-4" /></Button>
            <AccordionTrigger className="p-0 [&>svg]:mx-auto"><ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200" /></AccordionTrigger>
          </div>
        </div>
        <AccordionContent className="p-4 pt-0">
          <AmortizationPlan loan={loan} onPaymentMade={onPaymentMade} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};


export default function EmprestimosPage() {
  const [loans, setLoans] = React.useState<Loan[]>(initialLoans);
  const [activeFilter, setActiveFilter] = React.useState<LoanStatus>('Todos');
  const [isNewLoanOpen, setNewLoanOpen] = React.useState(false);
  const [editingLoan, setEditingLoan] = React.useState<Loan | null>(null);
  const [deletingLoan, setDeletingLoan] = React.useState<Loan | null>(null);
  const { toast } = useToast();

  const handleOpenNewLoan = () => {
    setEditingLoan(null);
    setNewLoanOpen(true);
  }

  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setNewLoanOpen(true);
  }
  
  const handleOpenDeleteDialog = (loan: Loan) => {
    setDeletingLoan(loan);
  }
  
  const handleDeleteLoan = () => {
    if (!deletingLoan) return;

    // Simulate API call
    setLoans(prevLoans => prevLoans.filter(l => l.id !== deletingLoan.id));

    toast({
      title: "Empréstimo Excluído",
      description: `O empréstimo para ${deletingLoan.borrowerName} foi removido.`,
    });
    setDeletingLoan(null);
  }
  
  const handlePayment = (loanId: string, installmentNumber: number, paymentAmount: number, paymentDate: string, paymentMethod: string) => {
    setLoans(prevLoans => {
      return prevLoans.map(loan => {
        if (loan.id === loanId) {
          const newPayments: Payment[] = [
            ...loan.payments,
            {
              id: `PAG-${Date.now()}`,
              loanId,
              installmentNumber,
              amount: paymentAmount,
              paymentDate,
              method: paymentMethod,
            },
          ];

          let loanStatus = loan.status;
          const newInstallments = loan.installments.map(inst => {
            if (inst.number === installmentNumber) {
              const newPaidAmount = inst.paidAmount + paymentAmount;
              let newStatus: Installment['status'] = 'Parcialmente Pago';
              if (newPaidAmount >= inst.amount) {
                newStatus = 'Pago';
              }
              return { ...inst, paidAmount: newPaidAmount, status: newStatus };
            }
            return inst;
          });

          const allPaid = newInstallments.every(inst => inst.status === 'Pago');
          if (allPaid) {
            loanStatus = 'Quitado';
          }

          return { ...loan, installments: newInstallments, payments: newPayments, status: loanStatus };
        }
        return loan;
      });
    });
  };


  const filteredLoans = React.useMemo(() => {
    if (activeFilter === 'Todos') {
      return loans;
    }
    if (activeFilter === 'Parcialmente Pago') {
        return loans.filter(loan => loan.installments.some(i => i.status === 'Parcialmente Pago'));
    }
    // Adjust filter logic for 'Quitado' which might be 'Pago' in data
    if (activeFilter === 'Quitado') {
        return loans.filter(loan => loan.status === 'Quitado' || loan.status === 'Pago');
    }
    return loans.filter(loan => loan.status === activeFilter);
  }, [activeFilter, loans]);

  const summary = React.useMemo(() => {
    const totalEmprestado = loans.reduce((acc, loan) => acc + loan.amount, 0);
    const totalRecebido = loans.flatMap(l => l.payments).reduce((acc, p) => acc + p.amount, 0);
    const emprestimosAtivos = loans.filter(l => l.status === 'Ativo').length;
    const emprestimosAtrasados = loans.filter(l => l.status === 'Atrasado').length;
    return { totalEmprestado, totalRecebido, emprestimosAtivos, emprestimosAtrasados };
  }, [loans]);

  return (
    <div className="text-white">
      <PageHeader
        title="Empréstimos"
        description="Gerencie todos os seus empréstimos aqui."
        action={
            <div className="flex items-center gap-4">
                <Button onClick={handleOpenNewLoan} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Empréstimo
                </Button>
            </div>
        }
      />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Emprestado
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalEmprestado)}</div>
                <p className="text-xs text-muted-foreground">
                Valor total de todos os empréstimos
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                Total Recebido
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-500">{formatCurrency(summary.totalRecebido)}</div>
                <p className="text-xs text-muted-foreground">
                Soma de todos os pagamentos
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
                <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{summary.emprestimosAtivos}</div>
                <p className="text-xs text-muted-foreground">
                Empréstimos aguardando quitação
                </p>
            </CardContent>
            </Card>
            <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas de Pagamento</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-500">+{summary.emprestimosAtrasados}</div>
                <p className="text-xs text-muted-foreground">
                Empréstimos com pagamentos atrasados
                </p>
            </CardContent>
            </Card>
        </div>


      <div className="mb-4">
        <LoanStatusFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      </div>
      <div>
        {filteredLoans.map(loan => <LoanCard key={loan.id} loan={loan} onEdit={() => handleOpenEditLoan(loan)} onDelete={() => handleOpenDeleteDialog(loan)} onPaymentMade={handlePayment} />)}
        {filteredLoans.length === 0 && (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-center">
                <p className="text-muted-foreground">Nenhum empréstimo encontrado para o filtro "{activeFilter}".</p>
            </div>
        )}
      </div>

      <NewLoanDialog 
        isOpen={isNewLoanOpen} 
        onOpenChange={setNewLoanOpen}
        loanToEdit={editingLoan}
      />

      <DeleteAlertDialog
        isOpen={!!deletingLoan}
        onOpenChange={(isOpen) => !isOpen && setDeletingLoan(null)}
        onConfirm={handleDeleteLoan}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o empréstimo para ${deletingLoan?.borrowerName}? Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}

    