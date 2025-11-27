
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loans } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { User, DollarSign, List, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Client = {
  name: string;
  slug: string;
  totalBorrowed: number;
  activeLoans: number;
  totalLoans: number;
};

function createSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}


export default function ClientesPage() {
  const clients = loans.reduce((acc, loan) => {
    let client = acc.find(c => c.name === loan.borrowerName);
    if (!client) {
      client = {
        name: loan.borrowerName,
        slug: createSlug(loan.borrowerName),
        totalBorrowed: 0,
        activeLoans: 0,
        totalLoans: 0,
      };
      acc.push(client);
    }
    client.totalBorrowed += loan.amount;
    client.totalLoans += 1;
    if (loan.status === 'Ativo' || loan.status === 'Atrasado') {
      client.activeLoans += 1;
    }
    return acc;
  }, [] as Client[]);

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Visualize e gerencie seus clientes."
        action={
            <Button>
                Novo Cliente
            </Button>
        }
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map(client => (
          <Card key={client.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{client.name}</CardTitle>
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4"/> Total Emprestado</span>
                <span className="font-semibold">{formatCurrency(client.totalBorrowed)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2"><List className="h-4 w-4"/> Empréstimos</span>
                <span className="font-semibold">{client.activeLoans} Ativos / {client.totalLoans} Total</span>
              </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/clientes/${client.slug}`}>
                        Ver Detalhes <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
