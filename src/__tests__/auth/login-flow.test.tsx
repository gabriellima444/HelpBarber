
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { signInWithEmailAndPassword } from 'firebase/auth';

describe('Login Flow - Integration Test', () => {
  it('should show error message for invalid credentials', async () => {
    (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    });

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Senha/i);
    const loginButton = screen.getByRole('button', { name: /Acessar Minha Conta/i });

    fireEvent.change(emailInput, { target: { value: 'teste@erro.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou senha inválidos/i)).toBeInTheDocument();
    });
  });
});
