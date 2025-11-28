'use client';

import * as React from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export default function CalendarioPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <>
      <PageHeader
        title="Calendário"
        description="Visualize os próximos vencimentos e pagamentos."
      />
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </>
  );
}
