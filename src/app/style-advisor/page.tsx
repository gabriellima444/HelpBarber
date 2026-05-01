'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import RecommendationForm from '@/components/style-advisor/recommendation-form';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function StyleAdvisorPage() {
  const { user, isUserLoading, isBarber } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (isBarber) {
        router.push('/barber-dashboard');
      }
    }
  }, [user, isUserLoading, isBarber, router]);

  const heroImage = PlaceHolderImages.find(p => p.id === 'style-advisor-hero');

  if (isUserLoading || !user || isBarber) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="relative h-64 md:h-80 w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt="Homem com corte de cabelo estiloso"
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/30" />
        <div className="absolute inset-0 flex items-end justify-center pb-8 md:pb-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-white drop-shadow-lg">
              Consultor de Estilo com IA
            </h1>
            <p className="mt-2 text-lg text-white/90 drop-shadow-md max-w-2xl mx-auto">
              Não tem certeza do próximo corte? Descreva suas características e encontre o estilo ideal para você.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 -mt-16">
        <RecommendationForm />
      </div>
    </>
  );
}
