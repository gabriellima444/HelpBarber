
'use client';

import { useState, useMemo } from 'react';
import { add, format, set, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, CheckCircle, Loader2, Ban } from 'lucide-react';
import type { Barber, Appointment } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ToastAction } from '@/components/ui/toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allTimes = ['09:00', '09:45', '10:30', '11:15', '12:00', '13:30', '14:15', '15:00', '15:45', '16:30', '17:15'];

export default function BookingSection({ barber, appointments }: { barber: Barber; appointments: Appointment[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const { toast } = useToast();
  const { user, isUserLoading, profileData } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
  const selectedService = useMemo(() => 
    barber.services.find(s => s.name === selectedServiceName) || null, 
  [selectedServiceName, barber.services]);

  const bookedTimes = useMemo(() => {
    if (!date) return new Set<string>();
    const day = format(date, 'yyyy-MM-dd');
    return new Set(
      appointments
        .filter(a => format(new Date(a.startTime), 'yyyy-MM-dd') === day)
        .map(a => format(new Date(a.startTime), 'HH:mm'))
    );
  }, [date, appointments]);

  const handleConfirmBooking = async () => {
    if (!user || !firestore || !date || !selectedTime || !selectedService) return;
    
    setIsBooking(true);
    const [h, m] = selectedTime.split(':').map(Number);
    const start = set(date, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
    
    const customerName = (profileData as any)?.name || user.displayName || user.email?.split('@')[0] || 'Cliente';
    const appointmentId = uuidv4();
    
    const app: Appointment = {
      id: appointmentId,
      barberId: barber.id,
      barberName: barber.name,
      barberLocation: barber.location,
      customerId: user.uid,
      customerName: customerName,
      startTime: start.toISOString(),
      endTime: add(start, { minutes: selectedService.duration }).toISOString(),
      status: 'booked',
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.duration
    };

    try {
      setDocumentNonBlocking(doc(firestore, 'barbers', barber.id, 'appointments', appointmentId), app, { merge: true });
      setDocumentNonBlocking(doc(firestore, 'users', user.uid, 'appointments', appointmentId), app, { merge: true });
      
      toast({ 
        title: 'Agendamento Confirmado!', 
        description: `${selectedService.name} marcado para às ${selectedTime}.`,
        action: <ToastAction altText="Ver Agendamentos" onClick={() => router.push('/meus-agendamentos')}>Ver</ToastAction> 
      });
      
      setSelectedTime(null); 
      setSelectedServiceName(null);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao agendar', description: 'Tente novamente.' });
    } finally {
      setIsBooking(false);
    }
  };
  
  return (
    <Card className="shadow-lg border-none">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Agendar Horário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase text-muted-foreground">1. Escolha o Serviço</h4>
          <Select value={selectedServiceName || ''} onValueChange={v => { setSelectedServiceName(v); setSelectedTime(null); }}>
            <SelectTrigger className="h-12"><SelectValue placeholder="Selecione um serviço..." /></SelectTrigger>
            <SelectContent>
              {barber.services?.map(s => (
                <SelectItem key={s.id} value={s.name}>{s.name} - R${s.price.toFixed(2)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={cn(!selectedService && "opacity-50 pointer-events-none transition-opacity")}>
          <h4 className="mb-3 text-sm font-bold uppercase text-muted-foreground">2. Selecione a Data</h4>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' className="w-full h-12 justify-start font-medium border-2 hover:border-primary/50">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ptBR }) : 'Escolha uma data'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={date} 
                onSelect={d => { setDate(d); setSelectedTime(null); }} 
                disabled={d => d < startOfDay(new Date())} 
                locale={ptBR} 
              />
            </PopoverContent>
          </Popover>
        </div>

        {date && selectedService && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="mb-3 text-sm font-bold uppercase text-muted-foreground">3. Horários Disponíveis</h4>
            <div className="grid grid-cols-3 gap-2">
              {allTimes.map(t => {
                const isBooked = bookedTimes.has(t);
                return (
                  <Button 
                    key={t} 
                    variant={selectedTime === t ? 'default' : 'outline'} 
                    onClick={() => setSelectedTime(t)} 
                    disabled={isBooked} 
                    className={cn(
                      "h-10 font-bold transition-all",
                      selectedTime === t ? "ring-2 ring-primary ring-offset-2" : "",
                      isBooked && "bg-muted text-muted-foreground border-transparent opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isBooked ? <Ban className="h-3 w-3 mr-1" /> : null}
                    {t}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogDescription>Para realizar um agendamento, você precisa estar conectado à sua conta.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar Explorando</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push('/login')}>Fazer Login</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="w-full text-lg h-14 font-bold" 
              size="lg" 
              disabled={!date || !selectedTime || !selectedService || isBooking || isUserLoading} 
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  setShowLoginPrompt(true);
                }
              }}
            >
              {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />} 
              Confirmar Agendamento
            </Button>
          </AlertDialogTrigger>
          {user && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Reserva?</AlertDialogTitle>
                <AlertDialogDescription className="text-base">
                  <span className="font-bold text-primary">{selectedService?.name}</span> com <span className="font-bold text-foreground">{barber.name}</span>
                  <br />
                  No dia <span className="font-bold text-foreground">{date && format(date, "dd/MM/yyyy")}</span> às <span className="font-bold text-foreground">{selectedTime}</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Ajustar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmBooking} className="font-bold">Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
