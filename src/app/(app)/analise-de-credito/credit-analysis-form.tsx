'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { runCreditAnalysis } from './actions';
import { type CreditRiskOutput } from '@/ai/flows/credit-risk-assessment';
import { Loader2, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  borrowerData: z.string().min(50, {
    message: 'Forneça detalhes suficientes sobre o mutuário (mínimo 50 caracteres).',
  }),
  loanAmount: z.coerce.number().positive({ message: 'O valor do empréstimo deve ser positivo.' }),
  loanPurpose: z.string().min(10, { message: 'O propósito do empréstimo deve ter pelo menos 10 caracteres.' }),
});

export function CreditAnalysisForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreditRiskOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowerData: '',
      loanAmount: 1000,
      loanPurpose: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const analysisResult = await runCreditAnalysis(values);
      setResult(analysisResult);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na Análise',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getRiskBadgeVariant = (riskLevel: 'Low' | 'Medium' | 'High' | undefined) => {
    switch (riskLevel) {
      case 'Low':
        return 'default'; // Green
      case 'Medium':
        return 'secondary'; // Gray
      case 'High':
        return 'destructive'; // Red
      default:
        return 'secondary';
    }
  };

  const getRiskIcon = (riskLevel: 'Low' | 'Medium' | 'High' | undefined) => {
    switch (riskLevel) {
        case 'Low':
            return <ThumbsUp className="h-6 w-6 text-primary" />;
        case 'Medium':
            return <AlertCircle className="h-6 w-6 text-yellow-500" />;
        case 'High':
            return <ThumbsDown className="h-6 w-6 text-destructive" />;
        default:
            return null;
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dados para Análise</CardTitle>
          <CardDescription>Preencha as informações abaixo para que a IA possa gerar uma análise de risco.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="borrowerData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dados do Mutuário</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ex: Cliente com bom histórico de crédito, renda mensal de R$5000, sem dívidas pendentes..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Empréstimo (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Ex: 10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Propósito do Empréstimo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Compra de veículo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Realizar Análise'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Resultado da Análise</CardTitle>
          <CardDescription>A recomendação da IA será exibida aqui.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Aguarde, a IA está processando os dados...</p>
            </div>
          )}
          {result && !isLoading && (
            <div className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Nível de Risco</p>
                        <Badge variant={getRiskBadgeVariant(result.riskLevel)} className="text-lg">
                            {result.riskLevel === 'Low' ? 'Baixo' : result.riskLevel === 'Medium' ? 'Médio' : 'Alto'}
                        </Badge>
                    </div>
                    {getRiskIcon(result.riskLevel)}
                </div>
              
              <div>
                <h3 className="font-semibold">Fatores de Risco</h3>
                <p className="mt-1 text-sm text-muted-foreground">{result.riskFactors}</p>
              </div>
              <div>
                <h3 className="font-semibold">Ação Recomendada</h3>
                <p className="mt-1 text-sm text-muted-foreground">{result.recommendedAction}</p>
              </div>
            </div>
          )}
          {!result && !isLoading && (
             <div className="flex h-full items-center justify-center rounded-lg border border-dashed">
                <p className="text-center text-muted-foreground">O resultado aparecerá aqui.</p>
             </div>
          )}
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">Atenção: Esta é uma recomendação gerada por IA e deve ser usada como um auxílio à decisão, não como uma aprovação ou negação final.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
