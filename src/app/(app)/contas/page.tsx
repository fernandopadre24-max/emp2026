'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, PlusCircle, ArrowUpRight, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useFinancialData } from '@/context/financial-context';

export default function ContasPage() {
  const { accounts } = useFinancialData();
  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
  const totalIncome = accounts.flatMap(a => a.transactions).filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = accounts.flatMap(a => a.transactions).filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);


  return (
    <>
      <PageHeader
        title="Contas"
        action={
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Conta
            </Button>
        }
      />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                    <p className="text-xs text-muted-foreground">Soma dos saldos de {accounts.length} contas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Receitas Totais
                    </CardTitle>
                    <ArrowUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
                    <p className="text-xs text-muted-foreground">Soma de todas as receitas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Despesas Totais
                    </CardTitle>
                    <ArrowDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
                     <p className="text-xs text-muted-foreground">Soma de todas as despesas</p>
                </CardContent>
            </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
            <Card key={account.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <account.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{account.name}</CardTitle>
                                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                            </div>
                        </div>
                         {/* Placeholder for edit/delete icons */}
                    </div>
                </CardHeader>
                <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/contas/${account.id}`}>
                            Ver Extrato <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </>
  );
}
