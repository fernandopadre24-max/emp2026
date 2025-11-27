'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useFinancialData } from '@/context/financial-context';

export default function AccountStatementPage({ params }: { params: { slug: string } }) {
  const { accounts } = useFinancialData();
  const account = accounts.find(acc => acc.id === params.slug);

  if (!account) {
    notFound();
  }

  const receitas = account.transactions.filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
  const despesas = account.transactions.filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);

  return (
    <>
      <PageHeader
        title={account.name}
        description={`Extrato detalhado da conta.`}
        action={
             <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                    <Link href="/contas">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para Contas
                    </Link>
                </Button>
                <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                </Button>
            </div>
        }
      />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Atual
                    </CardTitle>
                    <account.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Receitas no Período
                    </CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(receitas)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Despesas no Período
                    </CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">{formatCurrency(despesas)}</div>
                </CardContent>
            </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {account.transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell><Badge variant="secondary">{transaction.category}</Badge></TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    transaction.type === 'Receita' ? 'text-green-500' : 'text-red-500'
                  )}>
                    {transaction.type === 'Despesa' ? '-' : ''}{formatCurrency(transaction.amount)}
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
