
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function CalendarioPage() {
  return (
    <>
      <PageHeader
        title="Calendário"
        description="Visualize os próximos vencimentos e pagamentos."
      />
      <Card>
        <CardContent className="pt-6">
          <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
            <p className="text-center text-muted-foreground">O componente de calendário será exibido aqui.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
