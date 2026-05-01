
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useUser, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, where, Timestamp, orderBy, doc } from 'firebase/firestore';
import { Loader2, Calendar, MapPin, Clock, X, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment } from '@/models/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
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

export default function MeusAgendamentosPage() {
  const { user, isUserLoading, isBarber } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (isBarber) {
        router.push('/barber-dashboard');
      }
    }
  }, [user, isUserLoading, isBarber, router]);

  const appointmentsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    const today = startOfDay(new Date());
    return query(
      collection(firestore, 'users', user.uid, 'appointments'),
      where('startTime', '>=', today.toISOString()),
      orderBy('startTime', 'asc')
    );
  }, [firestore, user]);

  const { data: appointments, isLoading: appointmentsLoading } = useCollection<Appointment>(appointmentsQuery);

  const handleCancelAppointment = async () => {
    if (!firestore || !user || !appointmentToCancel || !appointmentToCancel.id || !appointmentToCancel.barberId) return;

    setIsCancelling(true);

    const userAppointmentRef = doc(firestore, 'users', user.uid, 'appointments', appointmentToCancel.id);
    const barberAppointmentRef = doc(firestore, 'barbers', appointmentToCancel.barberId, 'appointments', appointmentToCancel.id);
      
    deleteDocumentNonBlocking(userAppointmentRef);
    deleteDocumentNonBlocking(barberAppointmentRef);

    toast({
      title: 'Agendamento Cancelado!',
      description: 'Seu horário foi cancelado com sucesso.',
    });
    
    setIsCancelling(false);
    setAppointmentToCancel(null);
  };
  
  if (isUserLoading || appointmentsLoading || !user || isBarber) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <AlertDialog open={!!appointmentToCancel} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Meus Agendamentos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Aqui estão seus próximos cortes de cabelo e serviços de barbearia.
          </p>
        </div>

        {appointments && appointments.length > 0 ? (
          <div className="space-y-6">
            {appointments.map(app => (
              <Card key={app.id} className="group relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4 bg-muted/30 p-4">
                      <Avatar>
                          <AvatarFallback>{app.barberName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                          <CardTitle className="text-xl">
                              <Link href={`/barbers/${app.barberId}`} className="hover:underline">
                                  {app.barberName}
                              </Link>
                          </CardTitle>
                          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4"/> {app.barberLocation}
                          </p>
                      </div>
                       <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setAppointmentToCancel(app)}
                          >
                              <X className="h-4 w-4" />
                          </Button>
                      </AlertDialogTrigger>
                  </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{format(new Date(app.startTime), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                      <p className="text-sm text-muted-foreground">Data</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{format(new Date(app.startTime), 'HH:mm')}</p>
                      <p className="text-sm text-muted-foreground">Horário</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3 md:col-span-2">
                    <Tag className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{app.serviceName}</p>
                      <p className="text-sm text-muted-foreground">Serviço</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 justify-end">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-primary">R$ {app.servicePrice.toFixed(2)}</p>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-lg bg-card py-12 text-center shadow-sm">
             <h2 className="text-2xl font-semibold text-card-foreground">Nenhum Agendamento Futuro</h2>
             <p className="mt-2 text-muted-foreground">Você ainda não tem nenhum horário marcado.</p>
             <Button asChild className="mt-6">
                  <Link href="/barbers">Encontrar um Barbeiro</Link>
             </Button>
          </div>
        )}
      </div>

      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
              <AlertDialogDescription>
                  Você tem certeza que deseja cancelar seu horário para <span className="font-bold">{appointmentToCancel?.serviceName}</span> com{' '}
                  <span className="font-bold">{appointmentToCancel?.barberName}</span> em{' '}
                  <span className="font-bold">
                      {appointmentToCancel && format(new Date(appointmentToCancel.startTime), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </span>
                  ? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelAppointment} disabled={isCancelling} className={buttonVariants({ variant: "destructive" })}>
                  {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Cancelamento"}
              </AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
