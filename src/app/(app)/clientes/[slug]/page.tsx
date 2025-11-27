
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { loans } from '@/lib/data';
import { formatCurrency, cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function createSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export default function ClientDetailsPage({ params }: { params: { slug: string } }) {
  const clientName = loans.find(loan => createSlug(loan.borrowerName) === params.slug)?.borrowerName;

  if (!clientName) {
    notFound();
  }

  const clientLoans = loans.filter(loan => loan.borrowerName === clientName);
  const totalBorrowed = clientLoans.reduce((acc, loan) => acc + loan.amount, 0);

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
        title={clientName}
        description={`Histórico de empréstimos do cliente.`}
        action={
             <Button variant="outline" asChild>
                <Link href="/clientes">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Clientes
                </Link>
            </Button>
        }
      />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Emprestado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalBorrowed)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de Empréstimos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{clientLoans.length}</div>
                </CardContent>
            </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empréstimos Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Empréstimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{loan.id}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge></TableCell>
                   <TableCell>{new Date(loan.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(loan.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/emprestimos`}>
                             <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
