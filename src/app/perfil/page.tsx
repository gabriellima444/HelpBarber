'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, setDocumentNonBlocking, useStorage } from '@/firebase';
import { doc } from 'firebase/firestore';
import { uploadBase64ToStorage } from '@/lib/storage';
import { Loader2, User, Check, Camera, AlertCircle, RefreshCw, LogOut, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn, compressAndResizeImage } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/firebase';

export default function PerfilPage() {
  const { user, isUserLoading, isBarber, isAdmin, profileData: rawProfileData } = useUser();
  const profileData = rawProfileData as any; // Cast to any to avoid "property does not exist" error on union type in some environments
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);



  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const resolveAvatarUrl = (idOrUrl?: string) => {
    if (!idOrUrl) return undefined;
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return idOrUrl;
    return PlaceHolderImages.find(img => img.id === idOrUrl)?.imageUrl;
  };

  const handleUpdateAvatar = (avatarId: string) => {
    if (!user || !firestore) return;
    const collectionName = isBarber ? 'barbers' : 'users';
    const docRef = doc(firestore, collectionName, user.uid);
    setDocumentNonBlocking(docRef, { profilePictureId: avatarId }, { merge: true });
    setIsAvatarDialogOpen(false);
    toast({ title: 'Foto de perfil atualizada!' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        toast({
          variant: 'destructive',
          title: 'Arquivo muito grande',
          description: 'Por favor, escolha uma foto menor que 2MB.',
        });
        return;
      }
      
      if (!storage || !user) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Serviço de armazenamento não disponível.',
        });
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const resized = await compressAndResizeImage(reader.result as string);
          const path = `users/${user.uid}/profile_${Date.now()}.jpg`;
          const downloadUrl = await uploadBase64ToStorage(storage, path, resized);
          handleUpdateAvatar(downloadUrl);
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          toast({
            variant: 'destructive',
            title: 'Erro no upload',
            description: 'Não foi possível salvar sua foto de perfil.',
          });
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast({
          variant: 'destructive',
          title: 'Erro na leitura',
          description: 'Não foi possível ler o arquivo selecionado.',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Se o carregamento terminou e não temos profileData, mostramos a tela de erro de sincronização
  if (!profileData && !isAdmin) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Perfil em Sincronização</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Não conseguimos carregar os detalhes do seu perfil no momento. Verifique sua conexão ou tente novamente.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Tentar Novamente
            </Button>
            <Button onClick={handleSignOut} variant="ghost" className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
            </Button>
        </div>
      </div>
    );
  }

  const userPhotoUrl = resolveAvatarUrl(profileData?.profilePictureId);
  const genericAvatars = PlaceHolderImages.filter(img => img.id.startsWith('avatar-'));

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary md:text-5xl">Meu Perfil</h1>
        <p className="mt-4 text-lg text-muted-foreground">Gerencie suas informações e foto de perfil.</p>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader className="flex flex-col items-center pb-8 border-b">
            <div className="relative mb-6">
                <Avatar className="h-40 w-40 border-4 border-primary shadow-xl">
                    <AvatarImage src={userPhotoUrl} />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                        {profileData?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="secondary" 
                            className="absolute bottom-1 right-1 h-12 w-12 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                            <Camera className="h-6 w-6" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md text-center">
                        <DialogHeader>
                            <DialogTitle>Mudar Foto de Perfil</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-6 py-6">
                            <div className="flex justify-center gap-4">
                                {genericAvatars.map(avatar => (
                                    <div 
                                        key={avatar.id} 
                                        onClick={() => handleUpdateAvatar(avatar.id)}
                                        className={cn(
                                            "relative cursor-pointer rounded-full overflow-hidden border-4 transition-all hover:opacity-100",
                                            profileData?.profilePictureId === avatar.id ? "border-primary opacity-100" : "border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                                            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                                            <img src={avatar.imageUrl} alt="Avatar" className="h-full w-full object-cover" />
                                        </div>
                                        {profileData?.profilePictureId === avatar.id && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full">
                                                <Check className="text-white h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="w-full flex justify-center">
                                <Button 
                                    variant="outline" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-2"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} 
                                    {isUploading ? 'Enviando...' : 'Carregar do Dispositivo'}
                                </Button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <CardTitle className="text-3xl">{profileData?.name}</CardTitle>
            <CardDescription className="text-lg">{profileData?.email}</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nome</label>
                    <p className="text-lg font-medium p-3 bg-muted/30 rounded-lg">{profileData?.name}</p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                    <p className="text-lg font-medium p-3 bg-muted/30 rounded-lg">{profileData?.email}</p>
                </div>
            </div>
            
            <div className="pt-6 flex flex-col gap-4">
                <Button variant="outline" className="w-full h-12 text-lg" onClick={() => router.push(isBarber ? '/barber-dashboard' : '/meus-agendamentos')}>
                    {isBarber ? 'Ir para o Painel do Barbeiro' : 'Ver Meus Agendamentos'}
                </Button>
                <Button variant="ghost" onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Sair da Conta
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
