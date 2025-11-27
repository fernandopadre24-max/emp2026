
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, PlusCircle, ArrowUpRight, Library, Wallet, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const accounts = [
    {
        name: 'Investimentos',
        balance: 40000.00,
        icon: Library,
    },
    {
        name: 'Nubank',
        balance: 4128.10,
        icon: Wallet,
    }
]

const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

export default function ContasPage() {
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
                        Total de Contas
                    </CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{accounts.length}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Saldo Total Geral
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                </CardContent>
            </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
            <Card key={account.name}>
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
                    <Button variant="outline" className="w-full">
                        Ver Extrato <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </>
  );
}
