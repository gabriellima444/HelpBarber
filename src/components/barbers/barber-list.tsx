'use client';

import React from 'react';
import BarberCard from '@/components/barbers/barber-card';
import type { Barber } from '@/models/types';
import { SearchX } from 'lucide-react';

export default function BarberList({ barbers }: { barbers: Barber[] }) {
  if (!barbers.length) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-20 text-center border-2 border-dashed border-muted">
        <div className="rounded-full bg-muted p-4 mb-4">
            <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Nenhum Barbeiro Encontrado</h2>
        <p className="mt-2 text-muted-foreground max-w-xs">
          Não encontramos resultados para os filtros aplicados. Tente ajustar sua busca.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {barbers.map((barber: Barber) => (
        <BarberCard key={barber.id} barber={barber} />
      ))}
    </div>
  );
}
