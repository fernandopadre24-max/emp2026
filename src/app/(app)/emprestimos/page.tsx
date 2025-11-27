'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { loans } from '@/lib/data';
import { PlusCircle, Edit, Trash2, Banknote, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import type { Loan } from '@/lib/types';
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

const LoanStatusFilters = () => {
    const [activeFilter, setActiveFilter] = React.useState('Todos');
    const filters = ['Todos', 'Atrasado', 'Parcialmente Pago', 'Pendente', 'Quitado'];

    return (
        <div className="flex items-center gap-2">
            {filters.map(filter => (
                <Button 
                    key={filter}
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                        activeFilter === filter 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-card text-card-foreground border-border',
                        'hover:bg-blue-500 hover:text-white'
                    )}
                    onClick={() => setActiveFilter(filter)}
                >
                    {filter}
                </Button>
            ))}
        </div>
    )
}

const AmortizationPlan = ({ loan }: { loan: Loan }) => {
    type Installment = Loan['installments'][0];
    const [isPaymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
    const [selectedInstallment, setSelectedInstallment] = React.useState<Installment | null>(null);

    const handlePayClick = (installment: Installment) => {
        setSelectedInstallment(installment);
        setPaymentDialogOpen(true);
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
              <TableCell className="text-right">
                <Button 
                    variant="link" 
                    className="text-blue-500 p-0 h-auto disabled:text-muted-foreground disabled:no-underline" 
                    onClick={() => handlePayClick(installment)}
                    disabled={installment.status === 'Pago'}
                >
                    Pagar
                </Button>
                <Button variant="link" className="text-muted-foreground p-0 h-auto ml-4">Histórico</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        installment={selectedInstallment}
        loan={loan}
    />
    </>
  );
};


const LoanCard = ({ loan }: { loan: Loan }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [forceUpdate, setForceUpdate] = React.useState(0);

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

  // Hack to force re-render when installment status changes inside the dialog
  React.useEffect(() => {
    const interval = setInterval(() => {
        if(isOpen) setForceUpdate(Date.now())
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen])

  return (
     <div className="bg-card border border-border rounded-lg p-4 mb-4">
       <Accordion type="single" collapsible onValueChange={(value) => setIsOpen(!!value)}>
         <AccordionItem value={loan.id} className="border-none">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-semibold text-foreground">{loan.borrowerName}</h2>
                        <Badge variant="outline" className="border-border text-muted-foreground">{loan.id}</Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground flex items-center gap-1"><Banknote className="w-3 h-3" /> Nubank</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground"><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="mt-2">
                        <p className="text-3xl font-bold text-foreground">{formatCurrency(loan.amount)}</p>
                        <p className="text-sm text-muted-foreground">{totalInstallments} parcelas de ~{formatCurrency(loan.amount / totalInstallments)}</p>
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
                 <AccordionTrigger className="p-2 self-center">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                 </AccordionTrigger>
            </div>
          <AccordionContent>
            <AmortizationPlan loan={loan} />
          </AccordionContent>
         </AccordionItem>
       </Accordion>
    </div>
  );
};


export default function EmprestimosPage() {
  const data = loans;

  return (
    <div className="text-white">
      <PageHeader
        title="Empréstimos"
        description="Gerencie todos os seus empréstimos aqui."
        action={
            <div className="flex items-center gap-4">
                <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white">
                    <Link href="/emprestimos/novo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Novo Empréstimo
                    </Link>
                </Button>
                 <Button variant="outline" className="text-foreground">
                    + Nova Conta
                </Button>
            </div>
        }
      />
      <div className="mb-4">
        <LoanStatusFilters />
      </div>
      <div>
        {data.map(loan => <LoanCard key={loan.id} loan={loan} />)}
      </div>
    </div>
  );
}
