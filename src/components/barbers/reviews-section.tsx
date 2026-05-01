
'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import Rating from "@/components/shared/rating";
import { useUser, useFirestore, addDocumentNonBlocking, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Review } from "@/models/types";
import { Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const reviewFormSchema = z.object({
  comment: z.string().min(10, 'Sua avaliação deve ter pelo menos 10 caracteres.').max(500, 'Sua avaliação não pode ter mais de 500 caracteres.'),
  rating: z.number().min(1, 'A avaliação deve ser de no mínimo 1 estrela.').max(5, 'A avaliação deve ser de no máximo 5 estrelas.'),
});

interface ReviewsSectionProps {
  barberId: string;
}

export default function ReviewsSection({ barberId }: ReviewsSectionProps) {
  const { user, isUserLoading, profileData } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const reviewsRef = useMemo(() => {
      if (!firestore || !barberId) return null;
      return query(
          collection(firestore, 'barbers', barberId, 'reviews'),
          orderBy('date', 'desc')
      );
  }, [firestore, barberId]);
  const { data: reviews, isLoading: areReviewsLoading } = useCollection<Review>(reviewsRef);

  const form = useForm<z.infer<typeof reviewFormSchema>>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      comment: '',
      rating: 0,
    },
  });
  
  const ratingValue = form.watch('rating');

  async function onSubmit(values: z.infer<typeof reviewFormSchema>) {
    if (!user || !firestore) return;
    setIsSubmitting(true);

    const authorName = (profileData as any)?.name || user.displayName || user.email || 'Anônimo';

    const newReviewData: Omit<Review, 'id'> = {
      barberId: barberId,
      customerId: user.uid,
      author: authorName,
      comment: values.comment,
      rating: values.rating,
      date: new Date().toISOString(),
    };

    const reviewsColRef = collection(firestore, 'barbers', barberId, 'reviews');
    
    try {
        await addDocumentNonBlocking(reviewsColRef, newReviewData);
        toast({ title: 'Avaliação enviada!', description: 'Obrigado pelo seu feedback.' });
        form.reset();
    } catch (e) {
        toast({ title: 'Erro ao enviar avaliação', description: 'Por favor, tente novamente.', variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avaliações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isUserLoading ? (
            <div className="h-48 bg-muted rounded-md animate-pulse"></div>
        ) : user ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className='flex items-start gap-4'>
                    <Avatar>
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-2'>
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='sr-only'>Sua avaliação</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={`Deixe sua avaliação para este barbeiro...`} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className='flex justify-between items-center'>
                            <FormField
                                control={form.control}
                                name="rating"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='sr-only'>Nota</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-muted-foreground">Sua nota:</p>
                                                <Rating rating={ratingValue} onRatingChange={(rating) => field.onChange(rating)} interactive={true} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="sm" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                <span className='ml-2'>Enviar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
            </Form>
        ) : (
            <div className='text-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-md'>
                <p><Link href="/" className='text-primary font-semibold underline'>Faça login</Link> para deixar uma avaliação.</p>
            </div>
        )}

        <div className="space-y-6 pt-6 border-t">
          {areReviewsLoading ? (
             <div className="flex justify-center items-center h-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : reviews && reviews.length > 0 ? reviews.map((review) => (
            <div key={review.id} className="flex gap-4">
              <Avatar>
                <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">{review.author}</p>
                  <Rating rating={review.rating} size={14} />
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{review.comment}</p>
                 <p className="text-xs text-muted-foreground mt-2">{new Date(review.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-8">Ainda não há avaliações para este barbeiro. Seja o primeiro!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
