import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Barber } from '@/models/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Rating from '@/components/shared/rating';

interface BarberCardProps {
  barber: Barber;
}

export default function BarberCard({ barber }: BarberCardProps) {
  const resolveAvatarUrl = (idOrUrl?: string) => {
    if (!idOrUrl) return undefined;
    if (idOrUrl.startsWith('data:') || idOrUrl.startsWith('http')) return idOrUrl;
    return PlaceHolderImages.find(img => img.id === idOrUrl)?.imageUrl;
  };

  const profilePicUrl = resolveAvatarUrl(barber.profilePictureId);
  const initials = barber.name.split(' ').map(n => n[0]).join('');
  const averageRating = barber.rating || 0;

  return (
    <Link href={`/barbers/${barber.id}`} className="group block h-full">
      <Card className="flex h-full flex-col border border-border/50 bg-card/50 shadow-sm transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 backdrop-blur-sm">
        <CardHeader className="flex-row items-center gap-4 pb-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-inner group-hover:border-primary/50 transition-colors">
              <AvatarImage src={profilePicUrl} alt={barber.name} />
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm border border-border">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="truncate text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              {barber.name}
            </h3>
            <div className="mt-1 flex items-center text-xs text-muted-foreground font-medium">
              <MapPin className="mr-1 h-3 w-3 shrink-0 text-primary" />
              <span className="truncate">{barber.location}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-4">
          <div className="flex flex-wrap gap-1.5">
            {barber.specialties && barber.specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider">
                {specialty}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/40 pt-4 bg-muted/5 rounded-b-lg group-hover:bg-primary/[0.02] transition-colors">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
                <Rating rating={averageRating} size={14} />
                <span className="text-xs font-bold text-foreground">
                {averageRating.toFixed(1)}
                </span>
            </div>
            <ArrowRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}