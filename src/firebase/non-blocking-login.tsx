'use client';
import {
  Auth, // Importa o tipo Auth para auxílio de tipagem
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Inicia o login anônimo (não bloqueante). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRÍTICO: Chama signInAnonymously diretamente. NÃO use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // O código continua imediatamente. A mudança no estado de autenticação é tratada pelo ouvinte onAuthStateChanged.
}

/** Inicia o cadastro por email/senha (não bloqueante). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRÍTICO: Chama createUserWithEmailAndPassword diretamente. NÃO use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // O código continua imediatamente. A mudança no estado de autenticação é tratada pelo ouvinte onAuthStateChanged.
}

/** Inicia o login por email/senha (não bloqueante). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRÍTICO: Chama signInWithEmailAndPassword diretamente. NÃO use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // O código continua imediatamente. A mudança no estado de autenticação é tratada pelo ouvinte onAuthStateChanged.
}
