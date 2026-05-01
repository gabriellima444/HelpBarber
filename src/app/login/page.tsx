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
import { useAuth, useUser, useFirestore } from '@/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, User, Scissors, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const loginFormSchema = z.object({
  email: z.string().min(1, { message: 'O email é obrigatório.' }).email('Email inválido'),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isBarber, isAdmin, isUserLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBarberLogin, setIsBarberLogin] = useState(false);

  useEffect(() => {
    if (!isUserLoading && user && !isLoading) {
      if (isAdmin) {
        router.push('/admin');
      } else if (isBarber) {
        router.push('/barber-dashboard');
      } else {
        router.push('/barbers');
      }
    }
  }, [user, isUserLoading, isBarber, isAdmin, router, isLoading]);

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    if (!auth || !firestore) return;
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const currentUser = userCredential.user;

      const idTokenResult = await currentUser.getIdTokenResult();
      if (idTokenResult.claims.admin === true) {
        toast({ title: 'Acesso Administrativo' });
        router.push('/admin');
        return;
      }

      toast({ title: 'Bem-vindo de volta!' });
    } catch (err: any) {
      setError(err.code === 'auth/invalid-credential' ? 'Email ou senha inválidos.' : 'Erro na autenticação.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordReset(email: string) {
    if (!auth || !email) return;
    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: 'E-mail de redefinição enviado' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao processar solicitação' });
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="container relative flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4 sm:py-12 overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-2xl border border-border/50 bg-card/60 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto p-3 bg-primary/10 rounded-2xl w-fit">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black tracking-tighter">HelpBarber</CardTitle>
            <CardDescription className="text-sm sm:text-base font-medium">
              {isBarberLogin ? 'Portal de Gestão do Barbeiro' : 'Seu estilo começa aqui'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-10">
          <div className="flex items-center justify-center space-x-2 mb-8 bg-muted/30 p-1.5 rounded-2xl border border-border/20">
            <Label htmlFor="user-type" className={cn("cursor-pointer flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl transition-all text-xs font-bold", !isBarberLogin ? "bg-background shadow-md text-primary scale-100" : "text-muted-foreground opacity-70")}><User className="mr-2 h-4 w-4"/>Cliente</Label>
            <Switch id="user-type" checked={isBarberLogin} onCheckedChange={(val) => { setIsBarberLogin(val); setError(null); }} />
            <Label htmlFor="user-type" className={cn("cursor-pointer flex-1 flex items-center justify-center px-4 py-2.5 rounded-xl transition-all text-xs font-bold", isBarberLogin ? "bg-background shadow-md text-primary scale-100" : "text-muted-foreground opacity-70")}><Scissors className="mr-2 h-4 w-4"/>Barbeiro</Label>
          </div>

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField control={loginForm.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</FormLabel>
                  <FormControl><Input placeholder="seu@email.com" className="h-12 bg-muted/20 border-muted focus:ring-primary/20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={loginForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha</FormLabel>
                  <FormControl><Input type="password" placeholder="Sua senha" className="h-12 bg-muted/20 border-muted focus:ring-primary/20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {error && <p className="text-xs font-bold text-destructive text-center bg-destructive/10 p-3 rounded-xl border border-destructive/20 animate-in slide-in-from-top-2">{error}</p>}
              <div className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild><Button variant="link" className="p-0 h-auto text-xs font-bold opacity-70 hover:opacity-100">Esqueci minha senha</Button></AlertDialogTrigger>
                  <AlertDialogContent className="w-[95%] max-w-md rounded-3xl glass-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-bold">Redefinir Senha</AlertDialogTitle>
                      <p className="text-sm text-muted-foreground">Enviaremos um link de recuperação para o e-mail cadastrado.</p>
                    </AlertDialogHeader>
                    <div className="py-6">
                      <Input type="email" placeholder="seu@email.com" className="h-12" onChange={(e) => loginForm.setValue('email', e.target.value)} defaultValue={loginForm.getValues('email')} />
                    </div>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="rounded-xl">Voltar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onPasswordReset(loginForm.getValues('email'))} disabled={isResetting} className="rounded-xl premium-gradient">
                        {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Enviar E-mail'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black premium-gradient shadow-xl shadow-primary/30 group" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...</> : (
                    <span className="flex items-center">
                        Acessar Minha Conta
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-10 pt-6 text-center text-sm border-t border-border/50">
            <p className="text-muted-foreground font-medium">Ainda não tem uma conta? <Link href="/cadastro" className="underline font-black text-primary hover:text-primary/80 transition-colors">Cadastre-se grátis</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
