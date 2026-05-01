import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecommendationForm from '@/components/style-advisor/recommendation-form';

// Mock robusto do Select para evitar erros de aninhamento DOM (div dentro de select)
jest.mock('@/components/ui/select', () => {
  return {
    Select: ({ onValueChange, children, defaultValue }: any) => (
      <select 
        data-testid="mock-select" 
        onChange={(e) => onValueChange(e.target.value)}
        defaultValue={defaultValue}
      >
        {children}
      </select>
    ),
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: ({ placeholder }: any) => <option value="">{placeholder}</option>,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  };
});

describe('RecommendationForm - IA Style Advisor (Padrão AAA)', () => {
  it('deve exibir mensagens de validação ao submeter formulário vazio', async () => {
    // Arrange
    render(<RecommendationForm />);
    const submitButton = screen.getByRole('button', { name: /Obter Recomendação/i });

    // Act
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Por favor, selecione o formato do seu rosto/i)).toBeInTheDocument();
    });
  });

  it('deve chamar a IA e exibir o resultado após preenchimento', async () => {
    // Arrange
    render(<RecommendationForm />);
    const selects = screen.getAllByTestId('mock-select');
    const submitButton = screen.getByRole('button', { name: /Obter Recomendação/i });

    // Act
    fireEvent.change(selects[0], { target: { value: 'Redondo' } });
    fireEvent.change(selects[1], { target: { value: 'Liso' } });
    fireEvent.change(selects[2], { target: { value: 'Festa' } });
    fireEvent.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/Corte Undercut/i)).toBeInTheDocument();
    });
  });
});
