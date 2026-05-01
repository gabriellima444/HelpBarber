
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Scissors, User, Check, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn, compressAndResizeImage } from '@/lib/utils';
import { uploadBase64ToStorage } from '@/lib/storage';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const baseSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  profilePictureId: z.string().min(1, { message: 'Selecione ou carregue uma foto de perfil.' }),
});

const barberSchema = baseSchema.extend({
  location: z.string().min(3, { message: 'O endereço completo é obrigatório.' }),
  experience: z.preprocess((a) => Number.parseInt(z.string().parse(a), 10), 
    z.number().min(0, { message: 'A experiência não pode ser negativa.' })),
});

type BarberFormValues = z.infer<typeof barberSchema>;
type BaseFormValues = z.infer<typeof baseSchema>;

export default function CadastroPage() {
  const { toast } = useToast();
  const { auth, firestore, storage } = useFirebase();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBarber, setIsBarber] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BarberFormValues>({
    resolver: zodResolver(isBarber ? barberSchema : baseSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      location: '',
      experience: 0,
      profilePictureId: '',
    },
  });

  const genericAvatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar-'));

  useEffect(() => {
    form.reset({
      name: '',
      email: '',
      password: '',
      location: '',
      experience: 0,
      profilePictureId: '',
    });
  }, [isBarber, form]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        toast({ variant: 'destructive', title: 'Arquivo muito grande' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const resized = await compressAndResizeImage(reader.result as string);
        form.setValue('profilePictureId', resized);
      };
      reader.readAsDataURL(file);
    }
  };

  async function getCoordinates(address: string) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) return null;
      const response = await fetch(
        `https://maps.googleapis.com/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await response.json();
      return data.status === 'OK' && data.results.length > 0 ? data.results[0].geometry.location : null;
    } catch (e) {
      return null;
    }
  }

  async function onSubmit(values: BarberFormValues | BaseFormValues) {
    if (!auth || !firestore) return;
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: values.name });

      let profilePictureUrl = values.profilePictureId;
      if (profilePictureUrl && profilePictureUrl.startsWith('data:')) {
        profilePictureUrl = await uploadBase64ToStorage(storage, `users/${user.uid}/profilePicture.jpg`, profilePictureUrl);
      }

      if (isBarber && 'location' in values) {
        const barberValues = values as BarberFormValues;
        const address = barberValues.location;
        const coords = await getCoordinates(address);
        const barberProfile = {
          id: user.uid,
          name: values.name,
          email: values.email,
          location: address,
          experience: barberValues.experience || 0,
          specialties: ['Corte Clássico', 'Barba'],
          services: [
            { id: '1', name: 'Corte Social', price: 45.00, duration: 30 },
            { id: '2', name: 'Barba Completa', price: 30.00, duration: 20 }
          ],
          rating: 5,
          profilePictureId: profilePictureUrl,
          galleryImageIds: [],
          coordinates: coords,
        };
        setDocumentNonBlocking(doc(firestore, 'barbers', user.uid), barberProfile, { merge: true });
        router.push('/barber-dashboard');
      } else {
        const userProfile = {
          id: user.uid,
          name: values.name,
          email: values.email,
          profilePictureId: profilePictureUrl,
        };
        setDocumentNonBlocking(doc(firestore, 'users', user.uid), userProfile, { merge: true });
        router.push('/barbers');
      }
      toast({ title: 'Bem-vindo!', description: 'Sua conta foi criada com sucesso.' });
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta.');
    } finally {
      setIsLoading(false);
    }
  }

  const selectedPic = form.watch('profilePictureId');
  const isCustomUpload = selectedPic && (selectedPic.startsWith('data:') || selectedPic.startsWith('http'));

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 sm:py-12">
      <Card className="w-full max-w-lg shadow-xl border-none">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl sm:text-3xl font-bold">Crie sua Conta</CardTitle>
          <CardDescription>
             {isBarber ? 'Seja um parceiro HelpBarber.' : 'Encontre o melhor estilo.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="flex items-center justify-center space-x-2 mb-8 bg-muted/30 p-2 rounded-full">
            <Label htmlFor="user-type" className={cn("cursor-pointer flex items-center px-4 py-1 rounded-full transition-all text-xs", !isBarber && "bg-background shadow-sm text-primary font-bold")}>
              <User className="mr-2 h-4 w-4"/>Cliente
            </Label>
            <Switch id="user-type" checked={isBarber} onCheckedChange={setIsBarber} />
            <Label htmlFor="user-type" className={cn("cursor-pointer flex items-center px-4 py-1 rounded-full transition-all text-xs", isBarber && "bg-background shadow-sm text-primary font-bold")}>
              <Scissors className="mr-2 h-4 w-4"/>Barbeiro
            </Label>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="profilePictureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto de Perfil</FormLabel>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            {genericAvatars.map((avatar) => (
                              <div key={avatar.id} onClick={() => field.onChange(avatar.id)} className={cn("relative cursor-pointer rounded-full overflow-hidden border-2 transition-all hover:scale-105", field.value === avatar.id ? "border-primary scale-110 shadow-md" : "border-transparent opacity-60")}>
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={avatar.imageUrl} alt={avatar.description} className="h-full w-full object-cover" />
                                </div>
                                {field.value === avatar.id && <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full"><Check className="text-white h-5 w-5" /></div>}
                              </div>
                            ))}
                            <div onClick={() => fileInputRef.current?.click()} className={cn("relative cursor-pointer rounded-full overflow-hidden border-2 border-dashed border-muted-foreground/30 h-12 w-12 flex items-center justify-center transition-all hover:border-primary/50", isCustomUpload && field.value === selectedPic ? "border-primary border-solid scale-110 shadow-md" : "")}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {isCustomUpload ? <img src={selectedPic} alt="Perfil" className="h-full w-full object-cover rounded-full" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </div>
                        </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl><Input placeholder={isBarber ? "Ex: Barbearia do João" : "Seu nome"} {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="seu@email.com" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl><Input type="password" placeholder="Mínimo 6 caracteres" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              {isBarber && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                   <FormField control={form.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço Completo</FormLabel>
                          <FormControl><Input placeholder="Cidade, Estado, Rua, Número" {...field} /></FormControl>
                          <FormDescription className="text-xs">Usado para localização no mapa.</FormDescription>
                          <FormMessage />
                        </FormItem>
                    )} />
                   <FormField control={form.control} name="experience" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Experiência</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )} />
                </div>
              )}
              {error && <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
              <Button type="submit" className="w-full text-lg h-12 font-bold" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</> : 'Finalizar Cadastro'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
