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
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { useFinancialData } from '@/context/financial-context';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'O nome da conta deve ter pelo menos 2 caracteres.',
  }),
  balance: z.coerce.number().min(0, {
    message: 'O saldo inicial não pode ser negativo.',
  }),
});

export type NewAccountFormValues = z.infer<typeof formSchema>;

interface NewAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function NewAccountDialog({ isOpen, onOpenChange }: NewAccountDialogProps) {
  const { toast } = useToast();
  const { createAccount } = useFinancialData();

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      balance: 0,
    },
  });
  
  React.useEffect(() => {
    if (!isOpen) {
        form.reset();
    }
  }, [isOpen, form]);


  function onSubmit(values: NewAccountFormValues) {
    createAccount(values);
    toast({
      title: 'Conta Criada!',
      description: `A conta "${values.name}" foi adicionada com sucesso.`,
      className: 'bg-primary text-primary-foreground',
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
          <DialogDescription>
            Crie uma nova conta para gerenciar suas finanças.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Carteira, Poupança..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Conta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
