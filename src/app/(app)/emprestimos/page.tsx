'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { loans } from '@/lib/data';
import { columns } from './components/columns';
import { DataTable } from '@/components/data-table';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Loan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const renderSubComponent = ({ row: loan }: { row: Loan }) => {
  return (
    <div className="bg-muted/50 p-4 rounded-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="font-medium text-sm">Taxa de Juros</p>
          <p className="text-muted-foreground">{loan.interestRate}% a.a.</p>
        </div>
        <div>
          <p className="font-medium text-sm">Data de Início</p>
          <p className="text-muted-foreground">
            {new Date(`${loan.startDate}T00:00:00`).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
      <h4 className="font-semibold mb-2">Histórico de Pagamentos</h4>
      {loan.payments.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data Pag.</TableHead>
              <TableHead className="text-right">Valor Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loan.payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(`${payment.paymentDate}T00:00:00`).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(payment.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhum pagamento registrado.
        </p>
      )}
    </div>
  );
};

export default function EmprestimosPage() {
  // In a real app, you'd fetch this data.
  const data = loans;

  return (
    <>
      <PageHeader
        title="Empréstimos"
        description="Gerencie todos os seus empréstimos aqui."
        action={
          <Button asChild>
            <Link href="/emprestimos/novo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Empréstimo
            </Link>
          </Button>
        }
      />
      <DataTable 
        columns={columns} 
        data={data} 
        renderSubComponent={renderSubComponent}
        getRowCanExpand={() => true}
      />
    </>
  );
}
