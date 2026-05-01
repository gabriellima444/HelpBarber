'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Scissors, Sparkles, Menu, LogOut, LogIn, CalendarClock, LayoutDashboard, UserPlus, Shield, User as UserIcon } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { Separator } from '@/components/ui/separator';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const customerNavLinks = [
  { href: '/barbers', label: 'Barbeiros', icon: Scissors },
  { href: '/style-advisor', label: 'Consultor de Estilo', icon: Sparkles },
  { href: '/meus-agendamentos', label: 'Meus Agendamentos', icon: CalendarClock },
];

const barberNavLinks = [
    { href: '/barber-dashboard', label: 'Dashboard', icon: LayoutDashboard },
]

const adminNavLinks = [
    { href: '/admin', label: 'Admin', icon: Shield }
];

export default function Header() {
  const pathname = usePathname();
  const { user, isUserLoading, isBarber, isAdmin, profileData } = useUser();
  const auth = useAuth();
  const router = useRouter();



  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/login');
    }
  };
  
  const navLinks = isAdmin ? adminNavLinks : isBarber ? barberNavLinks : customerNavLinks;

  const resolveAvatarUrl = (idOrUrl?: string) => {
    if (!idOrUrl) return undefined;
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return idOrUrl;
    return PlaceHolderImages.find(img => img.id === idOrUrl)?.imageUrl;
  };

  const userPhotoUrl = resolveAvatarUrl(profileData?.profilePictureId);

  const desktopNav = !isUserLoading && user && (
    <nav className="hidden md:flex items-center gap-1">
      {navLinks.map((link) => (
        <Button
          key={link.href}
          asChild
          variant={pathname === link.href ? 'secondary' : 'ghost'}
          className={cn(
            "transition-all",
            pathname === link.href ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent"
          )}
        >
          <Link href={link.href}>
            <link.icon className="mr-2 h-4 w-4" />
            {link.label}
          </Link>
        </Button>
      ))}
    </nav>
  );

  const authSection = (
    <div className="flex items-center gap-2">
      {isUserLoading ? (
        <div className="h-10 w-24 animate-pulse rounded-full bg-muted" />
      ) : user ? (
        <div className="flex items-center gap-3">
          <Link href={isBarber ? "/barber-dashboard" : "/perfil"} className="hover:opacity-80 transition-opacity">
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-sm ring-primary/10 ring-2 ring-offset-2 ring-offset-background">
              <AvatarImage src={userPhotoUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {isAdmin ? 'A' : (profileData?.name?.charAt(0) || <UserIcon className="h-4 w-4" />)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="ghost" onClick={handleSignOut} size="sm" className="hidden sm:flex hover:text-destructive hover:bg-destructive/5">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
         pathname !== '/login' && pathname !== '/' && pathname !== '/cadastro' && (
            <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Entrar</Link>
                </Button>
                <Button asChild className="shadow-lg shadow-primary/20">
                    <Link href="/cadastro"><UserPlus className="mr-2 h-4 w-4" /> Cadastrar</Link>
                </Button>
            </div>
         )
      )}
    </div>
  );

  const mobileNav = (
    <div className="flex items-center md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-xs glass-card">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">HelpBarber</span>
            </Link>
          </div>
          
          <nav className="flex flex-col gap-2 p-4">
            {!isUserLoading && user && navLinks.map((link) => (
               <SheetClose asChild key={link.href}>
                 <Button
                    asChild
                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                    className={cn(
                        'justify-start h-12 text-base',
                        pathname === link.href && "bg-primary/10 text-primary"
                    )}
                  >
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-5 w-5" />
                      {link.label}
                    </Link>
                </Button>
              </SheetClose>
            ))}
          </nav>
          
          <div className="mt-auto flex flex-col gap-2 p-4 border-t bg-muted/20">
              {isUserLoading ? (
                <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              ) : user ? (
                 <>
                    <SheetClose asChild>
                        <Button asChild variant="ghost" className="justify-start mb-2 h-14">
                            <Link href={isBarber ? "/barber-dashboard" : "/perfil"}>
                                <Avatar className="h-8 w-8 mr-3 border-2 border-primary/20">
                                    <AvatarImage src={userPhotoUrl} />
                                    <AvatarFallback>{profileData?.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start">
                                    <span className="font-bold text-sm">{profileData?.name}</span>
                                    <span className="text-xs text-muted-foreground">Ver Perfil</span>
                                </div>
                            </Link>
                        </Button>
                    </SheetClose>
                    <Button variant="ghost" onClick={handleSignOut} className="justify-start h-12 text-destructive hover:bg-destructive/5 hover:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                 </>
              ) : (
                pathname !== '/login' && pathname !== '/' && pathname !== '/cadastro' && (
                    <div className="grid grid-cols-2 gap-2">
                        <SheetClose asChild>
                             <Button asChild variant="secondary">
                                <Link href="/login"><LogIn className="mr-2 h-4 w-4" /> Entrar</Link>
                            </Button>
                        </SheetClose>
                         <SheetClose asChild>
                            <Button asChild>
                                <Link href="/cadastro"><UserPlus className="mr-2 h-4 w-4" /> Criar</Link>
                            </Button>
                        </SheetClose>
                    </div>
                )
              )}
             <Separator className="my-2" />
             <div className="flex items-center justify-between px-2 h-12">
                <span className="text-sm font-medium">Tema do App</span>
                <ThemeToggle />
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  const mainLink = (
     <Link href={user ? (isBarber ? '/barber-dashboard' : '/barbers') : '/'} className="flex items-center gap-2 group">
        <div className="p-1.5 bg-primary rounded-xl shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-6">
            <Scissors className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tighter text-foreground">HelpBarber</span>
    </Link>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8 hidden md:flex">
         {mainLink}
        </div>
        
        {mobileNav}

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className='md:hidden'>
                 {mainLink}
            </div>
            <div className="flex-1 md:flex-none">
                {desktopNav}
            </div>
            <div className="hidden md:flex items-center gap-4">
                <Separator orientation="vertical" className="h-6" />
                <ThemeToggle />
                { user && <Separator orientation="vertical" className="h-6" /> }
            </div>
            {authSection}
        </div>
      </div>
    </header>
  );
}