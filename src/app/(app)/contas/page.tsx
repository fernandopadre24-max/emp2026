
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Banknote, PlusCircle } from 'lucide-react';

export default function ContasPage() {
  return (
    <>
      <PageHeader
        title="Contas Bancárias"
        description="Gerencie as contas bancárias de origem e destino dos seus empréstimos."
        action={
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Conta
            </Button>
        }
      />
      <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <Banknote className="w-8 h-8 text-primary" />
                <div>
                    <CardTitle>Nubank</CardTitle>
                    <CardDescription>Conta Principal</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground">Esta é uma conta de exemplo. Você poderá adicionar e gerenciar suas contas bancárias aqui.</p>
          </CardContent>
      </Card>
    </>
  );
}
