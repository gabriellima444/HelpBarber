'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, AlertTriangle } from 'lucide-react';

interface BarberMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  barberName: string;
  className?: string;
}

export default function BarberMap({ coordinates, barberName, className }: BarberMapProps) {
  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapApiKey
  });

  if (!mapApiKey) {
    return (
      <Alert variant="destructive" className={cn("h-[300px] flex flex-col items-center justify-center text-center", className)}>
        <AlertTriangle className="h-10 w-10 mb-2" />
        <AlertTitle>Chave de API do Google Maps Ausente</AlertTitle>
        <AlertDescription>
          Por favor, configure a variável de ambiente NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no arquivo .env.
        </AlertDescription>
      </Alert>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive" className={cn("h-[300px] flex flex-col items-center justify-center text-center", className)}>
        <AlertTriangle className="h-10 w-10 mb-2" />
        <AlertTitle>Erro ao Carregar o Mapa</AlertTitle>
        <AlertDescription>
          A chave de API fornecida parece ser inválida ou não tem permissão para o Maps JavaScript API. Verifique no Console do Google Cloud.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) return (
    <div className={cn("h-[300px] md:h-[400px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center", className)}>
      <MapPin className="h-8 w-8 text-muted-foreground animate-bounce" />
    </div>
  );

  return (
    <div className={cn('h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden border', className)}>
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={coordinates}
            zoom={15}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
            }}
        >
            <Marker position={coordinates} title={barberName} />
        </GoogleMap>
    </div>
  );
}
