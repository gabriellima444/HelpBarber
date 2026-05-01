
'use client';

import React, { useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import type { Barber } from '@/models/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, MapPin, AlertTriangle, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BarbersMapAllProps {
  barbers: Barber[];
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: -23.5505, lng: -46.6333 };

export default function BarbersMapAll({ barbers, className }: BarbersMapAllProps) {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const mapApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapApiKey
  });

  const resolveAvatarUrl = (idOrUrl?: string) => {
    if (!idOrUrl) return null;
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return idOrUrl;
    const placeholder = PlaceHolderImages.find(img => img.id === idOrUrl);
    return placeholder ? placeholder.imageUrl : null;
  };

  const barbersWithCoords = useMemo(() => 
    barbers.filter(b => b.coordinates && b.coordinates.lat && b.coordinates.lng),
  [barbers]);

  const center = useMemo(() => {
    if (barbersWithCoords.length === 0) return defaultCenter;
    return barbersWithCoords[0].coordinates!;
  }, [barbersWithCoords]);

  if (!mapApiKey) {
    return (
      <Alert variant="destructive" className={cn("h-[400px] sm:h-[500px] flex flex-col items-center justify-center text-center", className)}>
        <AlertTriangle className="h-10 w-10 mb-2" />
        <AlertTitle>Chave de API Ausente</AlertTitle>
        <AlertDescription>
          O mapa geral requer uma chave de API válida no arquivo .env.
        </AlertDescription>
      </Alert>
    );
  }

  if (loadError) {
    return (
      <Alert variant="destructive" className={cn("h-[400px] sm:h-[500px] flex flex-col items-center justify-center text-center", className)}>
        <AlertTriangle className="h-10 w-10 mb-2" />
        <AlertTitle>Erro no Mapa</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o Google Maps. Verifique sua conexão ou a chave de API.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) return (
    <div className={cn("h-[400px] sm:h-[500px] w-full flex flex-col items-center justify-center bg-muted animate-pulse rounded-lg", className)}>
      <MapPin className="h-8 w-8 text-muted-foreground animate-bounce mb-2" />
      <span className="text-sm text-muted-foreground">Carregando mapa...</span>
    </div>
  );

  return (
    <div className={cn('h-[400px] sm:h-[500px] w-full rounded-lg shadow-inner border overflow-hidden', className)}>
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={{
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ],
                disableDefaultUI: true,
                zoomControl: true,
                gestureHandling: "greedy"
            }}
        >
            {barbersWithCoords.map((barber) => (
                <Marker
                    key={barber.id}
                    position={barber.coordinates!}
                    onClick={() => setSelectedBarber(barber)}
                    title={barber.name}
                />
            ))}

            {selectedBarber && selectedBarber.coordinates && (
                <InfoWindow
                    position={selectedBarber.coordinates}
                    onCloseClick={() => setSelectedBarber(null)}
                >
                    <div className="p-1 min-w-[180px] max-w-[220px] text-slate-900 bg-white">
                        <div className="flex flex-col items-center py-2">
                            <div className="relative h-16 w-16 mb-3 overflow-hidden rounded-full border-2 border-primary/20 bg-slate-100 flex items-center justify-center">
                                {resolveAvatarUrl(selectedBarber.profilePictureId) ? (
                                    <Image 
                                        src={resolveAvatarUrl(selectedBarber.profilePictureId) || ''} 
                                        alt={selectedBarber.name}
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-cover"
                                        unoptimized // Firebase Storage images can be complex to optimize via Next.js default loader without configuration
                                    />
                                ) : (
                                    <User className="h-8 w-8 text-primary/40" />
                                )}
                            </div>
                            <h3 className="font-bold text-sm mb-1 text-center w-full truncate text-slate-900">
                                {selectedBarber.name}
                            </h3>
                            <div className="flex items-center text-[10px] text-slate-500 mb-2 justify-center w-full">
                                <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                <span className="truncate">{selectedBarber.location}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-slate-700">{selectedBarber.rating.toFixed(1)}</span>
                            </div>
                            <Link 
                                href={`/barbers/${selectedBarber.id}`}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Ver Perfil
                            </Link>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    </div>
  );
}
