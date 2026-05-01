'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc, collectionGroup, query } from 'firebase/firestore';
import { Loader2, Trash2, User, Scissors, Star, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Barber, Review } from '@/models/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Rating from '@/components/shared/rating';

interface Customer {
  id: string;
  name: string;
  email: string;
}

type DeleteItem =
  | { id: string; name: string; type: 'user' | 'barber' }
  | { id: string; name: string; type: 'review'; barberId: string; };

export default function AdminPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { isAdmin, isUserLoading } = useUser();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<DeleteItem | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isUserLoading, router]);

  const barbersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'barbers');
  }, [firestore, isAdmin]);
  const { data: barbers, isLoading: barbersLoading } = useCollection<Barber>(barbersQuery);

  const usersQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return collection(firestore, 'users');
  }, [firestore, isAdmin]);
  const { data: users, isLoading: usersLoading } = useCollection<Customer>(usersQuery);

  const reviewsQuery = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    return query(collectionGroup(firestore, 'reviews'));
  }, [firestore, isAdmin]);
  const { data: allReviews, isLoading: reviewsLoading } = useCollection<Review>(reviewsQuery);


  const enrichedReviews = useMemo(() => {
    if (!allReviews || !barbers) return [];
    const barbersMap = new Map(barbers.map(b => [b.id, b.name]));
    return allReviews.map(review => ({
      ...review,
      barberName: barbersMap.get(review.barberId) || 'Barbeiro Desconhecido',
    }));
  }, [allReviews, barbers]);

  useEffect(() => {
    if (isAdmin && !barbersLoading && !usersLoading && !reviewsLoading) {
      setIsDataLoading(false);
    }
  }, [isAdmin, barbersLoading, usersLoading, reviewsLoading])

  const handleDelete = async () => {
    if (!firestore || !itemToDelete) return;

    const { id, type, name } = itemToDelete;
    let docRef;

    if (type === 'review') {
      docRef = doc(firestore, 'barbers', itemToDelete.barberId, 'reviews', id);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: `Avaliação Excluída!`,
        description: `A avaliação de ${name} foi removida.`,
      });
    } else {
      const collectionName = type === 'user' ? 'users' : 'barbers';
      docRef = doc(firestore, collectionName, id);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: `${type === 'user' ? 'Usuário' : 'Barbeiro'} Excluído!`,
        description: `O registro de ${name} foi removido. A lista será atualizada em breve.`,
      });
    }

    setItemToDelete(null);
  };

  const handleFixLocations = async () => {
    if (!barbers || !firestore) return;

    const barbersWithoutCoords = barbers.filter(b => !b.coordinates);
    if (barbersWithoutCoords.length === 0) {
      toast({
        title: "Tudo certo!",
        description: "Todos os barbeiros já possuem coordenadas cadastradas.",
      });
      return;
    }

    setIsMigrating(true);
    let successCount = 0;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    for (const barber of barbersWithoutCoords) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(barber.location)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          const barberRef = doc(firestore, 'barbers', barber.id);
          setDocumentNonBlocking(barberRef, { coordinates: { lat, lng } }, { merge: true });
          successCount++;
        }
      } catch (e) {
        console.error(`Erro ao geocodificar barbeiro ${barber.name}:`, e);
      }
    }

    setIsMigrating(false);
    toast({
      title: "Migração Concluída!",
      description: `${successCount} barbeiros foram atualizados com sucesso no mapa.`,
    });
  };

  if (!isAdmin || isDataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const getDialogDescription = () => {
    if (!itemToDelete) return '';
    if (itemToDelete.type === 'review') {
      return `Você tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.`;
    }
    return `Você tem certeza que deseja excluir o registro de ${itemToDelete.name}? Esta ação não pode ser desfeita.`;
  }

  return (
    <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 relative z-10">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 md:text-5xl">
              Painel do Administrador
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Gerencie usuários, barbeiros e ferramentas de sistema com controle total.
            </p>
          </div>

        <div className="mb-8 flex justify-end">
          <Button
            variant="outline"
            onClick={handleFixLocations}
            disabled={isMigrating}
            className="flex items-center gap-2"
          >
            {isMigrating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar Coordenadas de Todos os Barbeiros
          </Button>
        </div>

        <Tabs defaultValue="barbers" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="barbers"><Scissors className='mr-2' /> Barbeiros</TabsTrigger>
            <TabsTrigger value="users"><User className='mr-2' /> Clientes</TabsTrigger>
            <TabsTrigger value="reviews"><Star className='mr-2' /> Avaliações</TabsTrigger>
          </TabsList>
          <TabsContent value="barbers">
            <Card className="shadow-xl border-primary/10 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Barbeiros</CardTitle>
                <CardDescription>Lista de todos os barbeiros cadastrados e status de localização.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {barbers && barbers.map(barber => (
                  <div key={barber.id} className="flex items-center gap-4 rounded-xl bg-background/50 border border-border/40 p-4 hover:bg-muted/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <Avatar className="h-12 w-12 border-2 border-primary/20"><AvatarFallback className="bg-primary/10 text-primary font-bold">{barber.name.charAt(0)}</AvatarFallback></Avatar>
                    <div className='flex-1'>
                      <p className="font-semibold flex items-center gap-2">
                        {barber.name}
                        {barber.coordinates ? (
                          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">No Mapa</span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">Sem Localização</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {barber.location}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ id: barber.id, name: barber.name, type: 'barber' })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="users">
            <Card className="shadow-xl border-primary/10 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">Clientes</CardTitle>
                <CardDescription>Lista de todos os clientes cadastrados.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {users && users.map(user => (
                  <div key={user.id} className="flex items-center gap-4 rounded-xl bg-background/50 border border-border/40 p-4 hover:bg-muted/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <Avatar className="h-12 w-12 border-2 border-primary/20"><AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback></Avatar>
                    <div className='flex-1'>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" onClick={() => setItemToDelete({ id: user.id, name: user.name, type: 'user' })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card className="shadow-xl border-primary/10 bg-card/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Avaliações</CardTitle>
                <CardDescription>Gerencie todas as avaliações do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrichedReviews.map((review) => (
                  <div key={review.id} className="flex items-start gap-4 rounded-xl bg-background/50 border border-border/40 p-4 hover:bg-muted/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{review.author} <span className='text-sm text-muted-foreground font-normal'>para</span> {review.barberName}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Rating rating={review.rating} size={14} />
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground italic">&ldquo;{review.comment}&rdquo;</p>
                    </div>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className='text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0' onClick={() => setItemToDelete({ id: review.id, name: review.author, type: 'review', barberId: review.barberId })}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão?</AlertDialogTitle>
          <AlertDialogDescription>
            {getDialogDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className={buttonVariants({ variant: "destructive" })}>
            Confirmar Exclusão
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
