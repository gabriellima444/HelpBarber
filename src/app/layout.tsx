import type { Metadata, Viewport } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'HelpBarber - Sistema Profissional de Agendamento e Estilo com IA',
  description: 'Plataforma avançada para gestão de barbearias com recomendações de estilo personalizadas via Inteligência Artificial.',
  keywords: ['Next.js', 'Firebase', 'IA Generativa', 'Genkit', 'TypeScript', 'USCS', 'Projeto de Extensão'],
  authors: [{ name: 'Gabriel Perencine Lima' }],
  metadataBase: new URL('https://helpbarber--studio-5735207536-45873.us-east4.hosted.app'),
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'HelpBarber - Gestão e Estilo com Inteligência Artificial',
    description: 'Transformando a experiência estética masculina através da tecnologia e IA.',
    siteName: 'HelpBarber',
    url: 'https://helpbarber--studio-5735207536-45873.us-east4.hosted.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={cn('h-full font-sans', ptSans.variable)} suppressHydrationWarning>
      <body
        className={cn(
          'h-full bg-background antialiased'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
