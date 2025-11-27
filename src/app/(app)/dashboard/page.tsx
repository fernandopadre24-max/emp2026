import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { loans } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowUpRight, DollarSign, List, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const totalEmprestado = loans.reduce((acc, loan) => acc + loan.amount, 0);
  const totalRecebido = loans.flatMap(l => l.payments).reduce((acc, p) => acc + p.amount, 0);
  const emprestimosAtivos = loans.filter(l => l.status === 'Ativo').length;
  const emprestimosAtrasados = loans.filter(l => l.status === 'Atrasado').length;

  const recentLoans = [...loans].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);

   const getStatusVariant = (status: 'Ativo' | 'Atrasado' | 'Pago' | 'Pendente' | 'Quitado' | undefined): 'default' | 'secondary' | 'destructive' => {
      switch (status) {
        case 'Pago':
        case 'Quitado':
          return 'default'
        case 'Atrasado':
          return 'destructive';
        case 'Ativo':
        case 'Pendente':
        default:
          return 'secondary';
      }
    };

  return (
    <>
      <PageHeader
        title="Visão Geral"
        description="Bem-vindo ao seu painel de gestão de empréstimos."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Emprestado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEmprestado)}</div>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRecebido)}</div>
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
            <div className="text-2xl font-bold">+{emprestimosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos aguardando quitação
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Pagamento</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{emprestimosAtrasados}</div>
            <p className="text-xs text-muted-foreground">
              Empréstimos com pagamentos atrasados
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Empréstimos Recentes</CardTitle>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/emprestimos">
                Ver Todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mutuário</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Valor</TableHead>
                  <TableHead className="text-right">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="font-medium">{loan.borrowerName}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={getStatusVariant(loan.status)}>
                        {loan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{formatCurrency(loan.amount)}</TableCell>
                    <TableCell className="text-right">{new Date(loan.startDate).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
