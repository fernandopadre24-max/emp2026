'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, PlusCircle, ArrowUpRight, DollarSign, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import { useFinancialData } from '@/context/financial-context';
import { NewAccountDialog } from './components/new-account-dialog';
import { NewTransactionDialog } from './components/new-transaction-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ContasPage() {
  const { accounts, loading } = useFinancialData();
  const [isNewAccountOpen, setNewAccountOpen] = React.useState(false);
  const [isNewTransactionOpen, setNewTransactionOpen] = React.useState(false);
  const [openCollapsibles, setOpenCollapsibles] = React.useState<Set<string>>(new Set());

  const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
  const totalIncome = accounts.flatMap(a => a.transactions).filter(t => t.type === 'Receita').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = accounts.flatMap(a => a.transactions).filter(t => t.type === 'Despesa').reduce((acc, t) => acc + t.amount, 0);
  
  const toggleCollapsible = (accountId: string) => {
    setOpenCollapsibles(prev => {
        const newSet = new Set(prev);
        if (newSet.has(accountId)) {
            newSet.delete(accountId);
        } else {
            newSet.add(accountId);
        }
        return newSet;
    });
  };

  return (
    <>
      <PageHeader
        title="Contas"
        action={
            <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={() => setNewTransactionOpen(true)}>
                    <Banknote className="mr-2 h-4 w-4" />
                    Nova Transação
                </Button>
                <Button onClick={() => setNewAccountOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Conta
                </Button>
            </div>
        }
      />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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

      <div className="space-y-4">
        {loading ? (
            <p>Carregando contas...</p>
        ) : (
            accounts.map((account) => (
                <Collapsible key={account.id} asChild onOpenChange={() => toggleCollapsible(account.id)}>
                    <Card>
                        <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 rounded-t-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <account.icon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle>{account.name}</CardTitle>
                                            <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", openCollapsibles.has(account.id) && "rotate-180")} />
                                    </div>
                                </div>
                            </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <CardContent className="pt-4">
                                <h4 className="mb-2 font-semibold text-sm text-muted-foreground">Últimas Transações</h4>
                                <div className="rounded-md border max-h-60 overflow-y-auto">
                                    <Table>
                                        <TableBody>
                                        {account.transactions?.length > 0 ? account.transactions.slice(0,5).map((transaction) => (
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
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">Nenhuma transação nesta conta.</TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/contas/${account.id}`}>
                                        Ver Extrato Completo <ArrowUpRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </CollapsibleContent>
                    </Card>
                </Collapsible>
            ))
        )}
      </div>
      
      <NewAccountDialog isOpen={isNewAccountOpen} onOpenChange={setNewAccountOpen} />
      <NewTransactionDialog isOpen={isNewTransactionOpen} onOpenChange={setNewTransactionOpen} />
    </>
  );
}
