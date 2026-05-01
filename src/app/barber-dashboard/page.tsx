'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useUser, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy, where } from 'firebase/firestore';
import { Loader2, Calendar, PlusCircle, Trash2, Edit, X, Camera, Upload, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Appointment, Review, Service, Barber } from '@/models/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Rating from '@/components/shared/rating';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { compressAndResizeImage } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  price: z.preprocess(v => Number(v), z.number().min(1)),
  duration: z.preprocess(v => Number(v), z.number().min(5)),
});

export default function BarberDashboardPage() {
  const { user, isUserLoading, isBarber, profileData } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const barber = profileData as Barber;
  const today = useMemo(() => startOfDay(new Date()).toISOString(), []);

  // Consultas ao Firestore
  const appointmentsQuery = useMemo(() =>
    (!firestore || !user) ? null : query(
      collection(firestore, 'barbers', user.uid, 'appointments'),
      where('startTime', '>=', today),
      orderBy('startTime', 'asc')
    ), [firestore, user, today]);

  const reviewsQuery = useMemo(() =>
    (!firestore || !user) ? null : query(
      collection(firestore, 'barbers', user.uid, 'reviews'),
      orderBy('date', 'desc')
    ), [firestore, user]);

  const { data: appointments, isLoading: appLoading } = useCollection<Appointment>(appointmentsQuery);
  const { data: reviews, isLoading: revLoading } = useCollection<Review>(reviewsQuery);

  const services = barber?.services || [];
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', price: 0, duration: 0 }
  });

  useEffect(() => {
    if (!isUserLoading && (!user || !isBarber)) router.push('/login');
  }, [user, isUserLoading, isBarber, router]);

  const onServiceSubmit = async (values: z.infer<typeof schema>) => {
    if (!user || !firestore) return;
    setIsSaving(true);
    const updated = editingService
      ? services.map(s => s.id === editingService.id ? { ...values, id: s.id } : s)
      : [...services, { ...values, id: uuidv4() }];

    setDocumentNonBlocking(doc(firestore, 'barbers', user.uid), { services: updated }, { merge: true });
    setIsSaving(false);
    setIsServiceDialogOpen(false);
    toast({ title: editingService ? 'Serviço atualizado' : 'Serviço adicionado' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 921600) { // 900KB
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await compressAndResizeImage(reader.result as string);
        setDocumentNonBlocking(doc(firestore, 'barbers', user!.uid), { profilePictureId: res }, { merge: true });
        setIsAvatarDialogOpen(false);
        toast({ title: 'Foto atualizada' });
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'O limite é 900KB.' });
    }
  };

  if (isUserLoading || !user || !isBarber) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-primary h-12 w-12" />
    </div>
  );

  if (!barber) return (
    <div className="p-20 text-center">
      <Loader2 className="animate-spin inline mr-2" /> Carregando perfil...
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-8 relative">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-primary shadow-sm">
            <AvatarImage src={barber.profilePictureId?.startsWith('data') ? barber.profilePictureId : PlaceHolderImages.find(i => i.id === barber.profilePictureId)?.imageUrl} />
            <AvatarFallback className="text-4xl">{barber.name[0]}</AvatarFallback>
          </Avatar>
          <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-md hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Alterar Foto de Perfil</DialogTitle></DialogHeader>
              <div className="flex flex-col items-center gap-6 py-4">
                <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="h-4 w-4" /> Carregar do Dispositivo (Máx 900KB)
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Olá, {barber.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Gerencie sua agenda, serviços e feedback dos clientes com excelência.
          </p>
        </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-lg border-primary/10 bg-card/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Próximos Agendamentos</CardTitle>
            <CardDescription>Horários marcados a partir de hoje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {appLoading ? (
              <div className="py-10 text-center"><Loader2 className="animate-spin inline h-8 w-8" /></div>
            ) : appointments?.length ? (
              appointments.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-background/50 border border-border/40 rounded-xl hover:bg-muted/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{a.customerName || 'Cliente'}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {a.serviceName} • {format(new Date(a.startTime), "d 'de' MMMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-primary">R${a.servicePrice.toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setAppointmentToCancel(a)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-medium">Nenhum agendamento futuro encontrado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-lg border-primary/10 bg-card/80 backdrop-blur-md">
            <CardHeader className="flex-row justify-between items-center space-y-0">
              <CardTitle className="text-xl">Meus Serviços</CardTitle>
              <Button size="sm" className="h-8" onClick={() => { setEditingService(null); form.reset({ name: '', price: 0, duration: 0 }); setIsServiceDialogOpen(true); }}>
                <PlusCircle className="h-4 w-4 mr-1" /> Novo
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map(s => (
                <div key={s.id} className="flex justify-between items-center p-3 bg-background/50 border border-border/40 rounded-lg group hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-bold text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">R${s.price} • {s.duration}min</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingService(s); form.reset(s); setIsServiceDialogOpen(true); }}>
                      <Edit className="h-4 w-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setServiceToDelete(s)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/10 bg-card/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Avaliações</CardTitle>
              <CardDescription>O que seus clientes estão dizendo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {revLoading ? (
                <Loader2 className="animate-spin mx-auto h-6 w-6" />
              ) : reviews?.length ? (
                reviews.map(r => (
                  <div key={r.id} className="p-3 bg-muted/20 border-l-4 border-primary rounded-r-lg space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs truncate max-w-[120px]">{r.author}</p>
                      <Rating rating={r.rating} size={10} />
                    </div>
                    <p className="text-xs text-muted-foreground italic line-clamp-3">&ldquo;{r.comment}&rdquo;</p>
                    <p className="text-[10px] text-muted-foreground/60 text-right">{format(new Date(r.date), 'dd/MM/yy')}</p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-muted-foreground">Nenhuma avaliação ainda.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingService ? 'Editar' : 'Novo'} Serviço</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onServiceSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-muted-foreground">Nome do Serviço</label>
              <Input placeholder="Ex: Corte Degrade" {...form.register('name')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Preço (R$)</label>
                <Input type="number" step="0.01" {...form.register('price')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase text-muted-foreground">Duração (min)</label>
                <Input type="number" {...form.register('duration')} />
              </div>
            </div>
            <Button type="submit" className="w-full text-lg h-12" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!appointmentToCancel} onOpenChange={o => !o && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a cancelar o horário de <span className="font-bold text-foreground">{appointmentToCancel?.customerName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={() => {
              if (appointmentToCancel?.id) {
                deleteDocumentNonBlocking(doc(firestore, 'barbers', user!.uid, 'appointments', appointmentToCancel.id));
                deleteDocumentNonBlocking(doc(firestore, 'users', appointmentToCancel.customerId, 'appointments', appointmentToCancel.id));
                toast({ title: 'Agendamento removido' });
              }
              setAppointmentToCancel(null);
            }}>Confirmar Cancelamento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
