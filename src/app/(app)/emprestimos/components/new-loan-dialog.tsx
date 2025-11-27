'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { add } from 'date-fns';

type SimulatedInstallment = {
  number: number;
  dueDate: string;
  amount: number;
  principal: number;
  interest: number;
};

type SimulationResult = {
  installments: SimulatedInstallment[];
  totalAmount: number;
  totalInterest: number;
};

const formSchema = z.object({
  client: z.string().min(1, 'Selecione um cliente.'),
  account: z.string().min(1, 'Selecione uma conta.'),
  amount: z.coerce.number().positive('O valor principal deve ser positivo.'),
  installments: z.coerce
    .number()
    .int()
    .positive('O número de parcelas deve ser um inteiro positivo.'),
  interestRate: z.coerce.number().min(0, 'A taxa de juros não pode ser negativa.'),
  iofRate: z.coerce.number().min(0, 'A taxa de IOF não pode ser negativa.').optional(),
  iofValue: z.coerce.number().min(0, 'O valor do IOF não pode ser negativo.').optional(),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Data de início inválida.',
  }),
});

interface NewLoanDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NewLoanDialog({ isOpen, onOpenChange }: NewLoanDialogProps) {
  const { toast } = useToast();
  const [simulation, setSimulation] = React.useState<SimulationResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: '',
      account: '',
      amount: 1000,
      installments: 12,
      interestRate: 1.99,
      startDate: new Date().toISOString().split('T')[0],
      iofRate: '' as any,
      iofValue: '' as any,
    },
  });

  function handleSimulate() {
    const values = form.getValues();
    const { amount, installments, interestRate, startDate } = values;

    if (!amount || !installments || interestRate === undefined || !startDate) {
        toast({
            variant: "destructive",
            title: "Erro de Validação",
            description: "Por favor, preencha os campos de valor, parcelas, juros e data de início.",
        });
        return;
    }

    const monthlyInterestRate = interestRate / 100;
    const iof = values.iofValue || (values.iofRate ? amount * (values.iofRate / 100) : 0);
    const totalLoanAmount = amount + iof;

    // Tabela Price
    const installmentAmount = totalLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, installments)) / (Math.pow(1 + monthlyInterestRate, installments) - 1);

    let remainingBalance = totalLoanAmount;
    const simulatedInstallments: SimulatedInstallment[] = [];

    for (let i = 1; i <= installments; i++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = installmentAmount - interest;
        remainingBalance -= principal;

        const dueDate = add(new Date(`${startDate}T00:00:00`), { months: i });

        simulatedInstallments.push({
            number: i,
            dueDate: dueDate.toLocaleDateString('pt-BR'),
            amount: installmentAmount,
            principal: principal,
            interest: interest,
        });
    }
    
    setSimulation({
      installments: simulatedInstallments,
      totalAmount: installmentAmount * installments,
      totalInterest: (installmentAmount * installments) - amount,
    });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Sucesso!',
      description: 'Novo empréstimo registrado.',
      className: 'bg-primary text-primary-foreground',
    });
    onOpenChange(false);
    setSimulation(null);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
            setSimulation(null);
            form.reset();
        }
    }}>
      <DialogContent className="sm:max-w-[700px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Novo Empréstimo</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="joao-silva">João da Silva</SelectItem>
                        <SelectItem value="maria-oliveira">Maria Oliveira</SelectItem>
                        <SelectItem value="fernando-sena">Fernando Sena</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta de Saída</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="investimentos">Investimentos (R$ 40.000,00)</SelectItem>
                        <SelectItem value="nubank">Nubank (R$ 4.128,10)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Principal (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de Juros Mensal (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iofRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxa de IOF (%) (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 0.38"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iofValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do IOF (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Calculado ou manual"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {simulation && (
                 <div className="space-y-4 rounded-lg border bg-background/50 p-4">
                    <div className='flex items-center justify-between'>
                        <h4 className="font-semibold">Resultado da Simulação</h4>
                        <Button variant="ghost" size="sm" onClick={() => setSimulation(null)}>Limpar</Button>
                    </div>
                    
                    <div className='grid grid-cols-3 gap-4 text-sm'>
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground">Valor da Parcela</p>
                            <p className="font-bold text-lg">{formatCurrency(simulation.installments[0]?.amount || 0)}</p>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground">Total de Juros</p>
                            <p className="font-bold text-lg">{formatCurrency(simulation.totalInterest)}</p>
                        </div>
                        <div className="rounded-md border p-3">
                            <p className="text-muted-foreground">Custo Total</p>
                            <p className="font-bold text-lg">{formatCurrency(simulation.totalAmount)}</p>
                        </div>
                    </div>
                    
                    <div className="max-h-[200px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead className="text-right">Principal</TableHead>
                                    <TableHead className="text-right">Juros</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {simulation.installments.map((inst) => (
                                    <TableRow key={inst.number}>
                                        <TableCell>{inst.number}</TableCell>
                                        <TableCell>{inst.dueDate}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(inst.principal)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(inst.interest)}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(inst.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="secondary" onClick={handleSimulate}>
                Simular Empréstimo
              </Button>
              <Button type="submit">Criar Empréstimo</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
