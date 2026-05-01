
'use client';

import { notFound, useParams } from 'next/navigation';
import { useDoc, useCollection, useFirestore } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Barber, Appointment, Review } from '@/models/types';
import Image from 'next/image';
import { Clock, MapPin, Star, Trophy, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { startOfDay } from 'date-fns';

import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import BookingSection from '@/components/barbers/booking-section';
import ReviewsSection from '@/components/barbers/reviews-section';

const BarberMap = dynamic(() => import('@/components/barbers/barber-map'), {
  loading: () => <div className="h-[300px] md:h-[400px] w-full bg-muted rounded-lg flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>,
  ssr: false,
});

export default function BarberProfilePage() {
  const params = useParams();
  const barberId = params?.barberId as string;
  const firestore = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const todayISO = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return startOfDay(new Date()).toISOString();
  }, []);

  const appointmentsQuery = useMemo(() => {
    if (!firestore || !barberId || !todayISO) return null;
    return query(
        collection(firestore, 'barbers', barberId, 'appointments'),
        where('startTime', '>=', todayISO)
    );
  }, [firestore, barberId, todayISO]);

  const reviewsQuery = useMemo(() => {
    if (!firestore || !barberId) return null;
    return query(collection(firestore, 'barbers', barberId, 'reviews'), orderBy('date', 'desc'));
  }, [firestore, barberId]);

  const barberRef = useMemo(() => firestore && barberId ? doc(firestore, 'barbers', barberId) : null, [firestore, barberId]);

  const { data: barber, isLoading: isBarberLoading } = useDoc<Barber>(barberRef);
  const { data: appointments, isLoading: areAppointmentsLoading } = useCollection<Appointment>(appointmentsQuery);
  const { data: reviews } = useCollection<Review>(reviewsQuery);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return barber?.rating || 0;
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    return sum / reviews.length;
  }, [reviews, barber]);

  if (!isMounted || isBarberLoading || areAppointmentsLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!barber) {
    notFound();
  }

  const resolveAvatarUrl = (idOrUrl?: string) => {
    if (!idOrUrl) return undefined;
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return idOrUrl;
    return PlaceHolderImages.find(img => img.id === idOrUrl)?.imageUrl;
  };

  const profilePicUrl = resolveAvatarUrl(barber.profilePictureId);
  const initials = barber.name.split(' ').map(n => n[0]).join('') || 'B';
  const galleryImages = barber.galleryImageIds?.map(id => PlaceHolderImages.find(p => p.id === id)).filter(Boolean) || [];
    
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row items-start gap-6 p-6 md:items-center">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={profilePicUrl} alt={barber.name} />
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold md:text-4xl text-primary">{barber.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                        <div className="flex items-center"><MapPin className="mr-2 h-4 w-4" /> {barber.location}</div>
                        <div className="flex items-center"><Trophy className="mr-2 h-4 w-4" /> {barber.experience} anos de experiência</div>
                        <div className="flex items-center"><Star className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" /> {averageRating.toFixed(1)} média</div>
                    </div>
                </div>
            </CardHeader>
          </Card>
          
          {barber.coordinates && (
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <BarberMap coordinates={barber.coordinates} barberName={barber.name} className="h-[300px] md:h-[400px]" />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barber.services && barber.services.length > 0 ? barber.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-muted-foreground">
                            <Clock className="mr-2 h-4 w-4" /> {service.duration} min
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">R${service.price.toFixed(2)}</TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                            Nenhum serviço disponível.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {galleryImages && galleryImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Galeria</CardTitle>
              </CardHeader>
              <CardContent>
                <Carousel className="w-full">
                  <CarouselContent>
                    {galleryImages.map((img) => img && (
                      <CarouselItem key={img.id}>
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <Image src={img.imageUrl} alt={img.description} fill style={{objectFit: 'cover'}} data-ai-hint={img.imageHint} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="ml-14"/>
                  <CarouselNext className="mr-14"/>
                </Carousel>
              </CardContent>
            </Card>
          )}

          <ReviewsSection barberId={barberId} />

        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            {barber && <BookingSection barber={barber} appointments={appointments ?? []} />}
          </div>
        </div>
      </div>
    </div>
  );
}
