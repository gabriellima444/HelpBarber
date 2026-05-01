'use client';
import React, { Suspense, useMemo, useState } from 'react';
import BarberFilters from '@/components/barbers/barber-filters';
import BarberList from '@/components/barbers/barber-list';
import BarbersMapAll from '@/components/barbers/barbers-map-all';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Barber } from '@/models/types';
import { Loader2, List, Map as MapIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';

function BarbersPageContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'list' | 'map'>('list');
  
  const barbersQuery = useMemo(() => firestore ? collection(firestore, 'barbers') : null, [firestore]);
  const { data: barbers, isLoading: barbersLoading } = useCollection<Barber>(barbersQuery);

  const locations = useMemo(() => {
    if (!barbers) return [];
    return Array.from(new Set(barbers.map(b => b.location)));
  }, [barbers]);

  const filteredBarbers = useMemo(() => {
    if (!barbers) return [];
    const search = searchParams.get('search')?.toLowerCase() || '';
    const location = searchParams.get('location');
    const rating = Number(searchParams.get('rating') || 0);

    return barbers.filter(barber => {
      const matchesSearch = search 
        ? barber.name.toLowerCase().includes(search) || 
          barber.specialties?.some(s => s.toLowerCase().includes(search))
        : true;
      const matchesLocation = location && location !== 'all' ? barber.location === location : true;
      const matchesRating = (barber.rating || 0) >= rating;
      return matchesSearch && matchesLocation && matchesRating;
    });
  }, [barbers, searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Encontre o Barbeiro Ideal
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Explore os melhores profissionais da cidade. Visualize por lista ou veja quem está mais perto de você no mapa.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
            <BarberFilters locations={locations} />
        </div>
        
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-2 md:w-[200px]">
            <TabsTrigger value="list"><List className="mr-2 h-4 w-4" /> Lista</TabsTrigger>
            <TabsTrigger value="map"><MapIcon className="mr-2 h-4 w-4" /> Mapa</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {barbersLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6">
            {view === 'list' ? (
                <BarberList barbers={filteredBarbers} />
            ) : (
                <div className="animate-in fade-in duration-500">
                    <BarbersMapAll barbers={filteredBarbers} />
                </div>
            )}
        </div>
      )}
    </div>
  );
}

export default function BarbersPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    }>
      <BarbersPageContent />
    </Suspense>
  );
}
