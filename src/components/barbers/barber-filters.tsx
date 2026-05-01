'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, MapPin, Star, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BarberFiltersProps {
  locations: string[];
}

export default function BarberFilters({ locations }: BarberFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!value || value === "all") {
      current.delete(key);
    } else {
      current.set(key, value);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${pathname}${query}`, { scroll: false });
  };
  
  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };
  
  const hasFilters = searchParams.size > 0;

  return (
    <div className="sticky top-14 z-40 border-b border-border/40 bg-background/80 p-4 backdrop-blur-md md:top-[64px] md:rounded-2xl md:border md:shadow-lg lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nome ou estilo..."
            className="h-11 border-none bg-muted/50 pl-10 focus-visible:ring-primary/20"
            defaultValue={searchParams.get('search') ?? ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:items-center">
          <div className="flex items-center gap-2 lg:w-48">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <Select
                value={searchParams.get('location') ?? 'all'}
                onValueChange={(value) => handleFilterChange('location', value)}
              >
                <SelectTrigger className="h-11 border-none bg-muted/50">
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Cidades</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          </div>

          <div className="flex items-center gap-2 lg:w-48">
              <Star className="h-4 w-4 text-yellow-500 shrink-0" />
              <Select
                  value={searchParams.get('rating') ?? 'all'}
                  onValueChange={(value) => handleFilterChange('rating', value)}
              >
                  <SelectTrigger className="h-11 border-none bg-muted/50">
                      <SelectValue placeholder="Avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Qualquer Nota</SelectItem>
                      <SelectItem value="4">4.0+</SelectItem>
                      <SelectItem value="3">3.0+</SelectItem>
                      <SelectItem value="2">2.0+</SelectItem>
                  </SelectContent>
              </Select>
          </div>
          
          {hasFilters && (
            <Button 
              variant="ghost" 
              onClick={clearFilters} 
              className="h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}