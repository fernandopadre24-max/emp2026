'use client';

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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';

const formSchema = z.object({
  borrowerName: z.string().min(2, {
    message: 'O nome do mutuário deve ter pelo menos 2 caracteres.',
  }),
  amount: z.coerce.number().positive({ message: 'O valor deve ser positivo.' }),
  interestRate: z.coerce.number().min(0, { message: 'A taxa de juros não pode ser negativa.' }),
  dueDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data inválida."}),
});

export default function NovoEmprestimoPage() {
    const { toast } = useToast();
    const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      borrowerName: '',
      amount: 0,
      interestRate: 0,
      dueDate: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, this would be a server action to save the data
    console.log(values);
    toast({
        title: "Sucesso!",
        description: "Novo empréstimo registrado.",
        className: 'bg-primary text-primary-foreground'
    });
    router.push('/emprestimos');
  }

  return (
    <>
    <PageHeader title="Novo Empréstimo" description="Preencha os dados para registrar um novo empréstimo." />
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="borrowerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Mutuário</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Empréstimo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Juros (% a.a.)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 5.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.push('/emprestimos')}>Cancelar</Button>
                <Button type="submit">Salvar Empréstimo</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}
