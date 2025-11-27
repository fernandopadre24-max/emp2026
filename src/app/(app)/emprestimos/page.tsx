import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { loans } from '@/lib/data';
import { columns } from './components/columns';
import { DataTable } from '@/components/data-table';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function EmprestimosPage() {
  // In a real app, you'd fetch this data.
  const data = loans;

  return (
    <>
      <PageHeader
        title="Empréstimos"
        description="Gerencie todos os seus empréstimos aqui."
        action={
          <Button asChild>
            <Link href="/emprestimos/novo">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Empréstimo
            </Link>
          </Button>
        }
      />
      <DataTable columns={columns} data={data} />
    </>
  );
}
