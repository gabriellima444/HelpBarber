'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Scissors, 
  Sparkles, 
  CalendarCheck, 
  MapPin, 
  Star, 
  ArrowRight, 
  Shield, 
  Zap, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Agendamento Inteligente',
    description: 'Marque horários em tempo real com confirmação instantânea. Sem ligações, sem espera.',
  },
  {
    icon: Sparkles,
    title: 'Consultor de Estilo IA',
    description: 'Recomendações personalizadas de corte e estilo usando Inteligência Artificial Gemini.',
  },
  {
    icon: MapPin,
    title: 'Geolocalização',
    description: 'Encontre barbearias próximas no mapa interativo com avaliações e distância.',
  },
  {
    icon: Star,
    title: 'Avaliações Reais',
    description: 'Veja notas e comentários de clientes reais antes de escolher seu barbeiro.',
  },
];

const benefits = [
  'Agendamento 24/7 sem ligações',
  'Cancelamento flexível a qualquer momento',
  'Histórico completo de atendimentos',
  'Recomendações de estilo com IA',
  'Notificações e lembretes',
  'Perfil personalizado com avatares',
];

export default function LandingPage() {
  const { user, isUserLoading, isBarber } = useUser();
  const router = useRouter();

  // Redirect authenticated users
  useEffect(() => {
    if (!isUserLoading && user) {
      if (isBarber) {
        router.push('/barber-dashboard');
      } else {
        router.push('/barbers');
      }
    }
  }, [user, isUserLoading, isBarber, router]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 py-20 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap className="h-4 w-4" />
              Plataforma nº1 de Barbearias Inteligentes
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              Seu estilo começa{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                aqui.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-10 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              Encontre os melhores barbeiros da sua região, agende com um toque e descubra o corte ideal com nosso 
              <strong className="text-foreground"> Consultor de Estilo com Inteligência Artificial</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-black premium-gradient shadow-xl shadow-primary/30 group">
                <Link href="/cadastro">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold border-2 group">
                <Link href="/login">
                  Já tenho conta
                  <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>

            {/* Trust Badge */}
            <p className="mt-8 text-sm text-muted-foreground animate-in fade-in duration-700 delay-700">
              <Shield className="inline h-4 w-4 mr-1 text-primary" />
              100% gratuito para clientes · Deploy seguro via Firebase
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
            Tudo que você precisa,{' '}
            <span className="text-primary">em um só lugar</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma plataforma completa para transformar sua experiência com barbearias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={feature.title} className="group border border-border/50 bg-card/60 backdrop-blur-sm card-hover" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-muted/30" />
        <div className="container px-4 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-6">
                Por que escolher o{' '}
                <span className="text-primary">HelpBarber</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Chega de ligar para agendar horário. Com o HelpBarber, você tem controle total da sua experiência de estilo.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stylized Feature Highlight Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-3xl blur-2xl" />
              <Card className="relative border-primary/20 bg-card/80 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">Consultor de Estilo IA</h3>
                      <p className="text-sm text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                      <p className="font-bold text-xs text-muted-foreground mb-1">FORMATO DO ROSTO</p>
                      <p className="font-medium">Oval</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border/50">
                      <p className="font-bold text-xs text-muted-foreground mb-1">TIPO DE CABELO</p>
                      <p className="font-medium">Ondulado</p>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="font-bold text-xs text-primary mb-1">✨ RECOMENDAÇÃO DA IA</p>
                      <p className="font-medium">Corte Textured Crop — ideal para rostos ovais com cabelo ondulado. Moderno, versátil e de fácil manutenção.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* For Barbers Section */}
      <section className="container px-4 py-20 sm:py-28">
        <Card className="premium-gradient text-primary-foreground border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-12 lg:p-16 text-center relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Scissors className="h-8 w-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-4">
                É barbeiro? Cadastre-se grátis!
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
                Gerencie seus agendamentos, conquiste mais clientes e tenha visibilidade na plataforma que mais cresce no setor.
              </p>
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-black group">
                <Link href="/cadastro">
                  Criar Conta de Barbeiro
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20">
        <div className="container px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-xl">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold tracking-tighter">HelpBarber</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Projeto de Extensão Universitária · USCS — Universidade Municipal de São Caetano do Sul
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Gabriel Perencine Lima
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}