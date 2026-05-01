'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useTransition } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recommendStyle, type StyleRecommendationOutput } from '@/ai/flows/style-recommendation';
import { Loader2, Sparkles } from 'lucide-react';

const formSchema = z.object({
  faceShape: z.string().min(1, 'Por favor, selecione o formato do seu rosto.'),
  hairType: z.string().min(1, 'Por favor, selecione o seu tipo de cabelo.'),
  occasion: z.string().min(1, 'Por favor, selecione uma ocasião.'),
});

const faceShapes = ['Redondo', 'Oval', 'Quadrado', 'Coração', 'Longo', 'Diamante'];
const hairTypes = ['Liso', 'Ondulado', 'Cacheado', 'Crespo'];
const occasions = ['Dia a dia', 'Trabalho', 'Festa', 'Formal', 'Encontro'];

export default function RecommendationForm() {
  const [isPending, startTransition] = useTransition();
  const [recommendation, setRecommendation] = useState<StyleRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceShape: '',
      hairType: '',
      occasion: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      setError(null);
      setRecommendation(null);
      try {
        const result = await recommendStyle(values);
        setRecommendation(result);
      } catch (e) {
        setError('Ocorreu um erro ao obter sua recomendação. Por favor, tente novamente.');
        console.error(e);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <Card className="relative z-10 shadow-lg">
            <CardHeader>
                <CardTitle>Encontre Seu Estilo</CardTitle>
                <CardDescription>Preencha o formulário para obter uma recomendação de corte de cabelo personalizada da nossa IA.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="faceShape"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Formato do Rosto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o formato do seu rosto" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {faceShapes.map(shape => <SelectItem key={shape} value={shape}>{shape}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="hairType"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Cabelo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione seu tipo de cabelo" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {hairTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="occasion"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ocasião</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma ocasião" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {occasions.map(occ => <SelectItem key={occ} value={occ}>{occ}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando Recomendação...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Obter Recomendação</>
                        )}
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>

        <div className="relative z-10">
            <Card className="min-h-[20rem] flex items-center justify-center">
                <CardContent className="text-center p-6">
                    {isPending && (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                            <p className="font-semibold">Nossa IA está procurando o corte ideal...</p>
                            <p className="text-sm">Isso pode levar alguns instantes.</p>
                        </div>
                    )}
                    {!isPending && recommendation && (
                        <div className="text-left space-y-4 animate-in fade-in-50 duration-500">
                             <h3 className="text-2xl font-bold font-headline text-primary">{recommendation.hairstyleRecommendation}</h3>
                             <p className="text-muted-foreground leading-relaxed">{recommendation.styleDescription}</p>
                        </div>
                    )}
                    {!isPending && error && (
                        <div className="text-destructive-foreground bg-destructive p-4 rounded-md">
                           <p className="font-bold">Oops!</p>
                           <p>{error}</p>
                        </div>
                    )}
                     {!isPending && !recommendation && !error && (
                        <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <Sparkles className="h-12 w-12 text-primary/50" />
                            <p className="font-semibold">Sua recomendação de estilo aparecerá aqui.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
