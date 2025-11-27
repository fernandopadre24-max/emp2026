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
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    client: z.string().min(1, 'Selecione um cliente.'),
    account: z.string().min(1, 'Selecione uma conta.'),
    amount: z.coerce.number().positive('O valor principal deve ser positivo.'),
    installments: z.coerce.number().int().positive('O número de parcelas deve ser um inteiro positivo.'),
    interestRate: z.coerce.number().min(0, 'A taxa de juros não pode ser negativa.'),
    iofRate: z.coerce.number().min(0, 'A taxa de IOF não pode ser negativa.').optional(),
    iofValue: z.coerce.number().min(0, 'O valor do IOF não pode ser negativo.').optional(),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Data de início inválida."}),
});


interface NewLoanDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NewLoanDialog({ isOpen, onOpenChange }: NewLoanDialogProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: '',
      account: '',
      amount: 1000,
      installments: 12,
      interestRate: 1.99,
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
        title: "Sucesso!",
        description: "Novo empréstimo registrado.",
        className: 'bg-primary text-primary-foreground'
    });
    onOpenChange(false);
    // Maybe re-fetch loans data here
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground border-border">
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
                            <Input type="number" step="0.01" placeholder="Ex: 0.38" {...field} />
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
                                {/* This could be calculated or manual */}
                                <Input type="number" step="0.01" placeholder="Calculado ou manual" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <DialogFooter className="pt-6">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button type="button" variant="secondary" className="bg-green-600 hover:bg-green-700 text-white">Simular Empréstimo</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white">Criar Empréstimo</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
