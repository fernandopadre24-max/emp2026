
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ConfiguracoesPage() {
  return (
    <>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações da sua conta e do aplicativo."
      />
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            Suas informações pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">As opções de configuração de perfil serão exibidas aqui.</p>
        </CardContent>
      </Card>
    </>
  );
}
