'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RatingProps {
  rating: number;
  totalStars?: number;
  className?: string;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export default function Rating({ rating, totalStars = 5, className, size = 16, interactive = false, onRatingChange }: RatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div 
      className={cn('flex items-center gap-1', className, interactive && 'cursor-pointer')} 
      aria-label={`Avaliação: ${rating} de ${totalStars} estrelas`}
      onMouseLeave={handleMouseLeave}
    >
      {Array.from({ length: totalStars }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            'transition-colors',
            i < displayRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          )}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
        />
      ))}
    </div>
  );
}
