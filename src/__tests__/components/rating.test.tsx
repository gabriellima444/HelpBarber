
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Rating from '@/components/shared/rating';

describe('Rating Component - Integration Test', () => {
  it('deve renderizar o número correto de estrelas', () => {
    const { container } = render(<Rating rating={3} totalStars={5} />);
    const stars = container.querySelectorAll('svg');
    expect(stars.length).toBe(5);
  });

  it('deve aplicar a cor correta para estrelas ativas', () => {
    const { container } = render(<Rating rating={2} totalStars={5} />);
    const stars = container.querySelectorAll('svg');
    
    // Verifica se as duas primeiras estrelas têm a classe de cor amarela (fill)
    expect(stars[0]).toHaveClass('text-yellow-400');
    expect(stars[1]).toHaveClass('text-yellow-400');
    
    // Verifica se a terceira estrela é cinza
    expect(stars[2]).toHaveClass('text-gray-300');
  });

  it('deve permitir interação quando o modo interativo estiver ativado', () => {
    const onRatingChange = jest.fn();
    const { container } = render(
      <Rating rating={0} interactive={true} onRatingChange={onRatingChange} />
    );
    
    const stars = container.querySelectorAll('svg');
    fireEvent.click(stars[3]); // Clica na 4ª estrela
    
    expect(onRatingChange).toHaveBeenCalledWith(4);
  });
});
