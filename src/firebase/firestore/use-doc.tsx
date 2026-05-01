'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Tipo utilitário para adicionar um campo 'id' a um tipo T fornecido. */
type WithId<T> = T & { id: string };

/**
 * Interface para o valor de retorno do hook useDoc.
 * @template T Tipo dos dados do documento.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Dados do documento com ID, ou null.
  isLoading: boolean;       // True se estiver carregando.
  error: FirestoreError | Error | null; // Objeto de erro, ou null.
}

/**
 * Hook do React para se inscrever em um único documento do Firestore em tempo real.
 * Lida com referências nulas.
 * 
 * IMPORTANTE! VOCÊ DEVE MEMOIZAR o memoizedDocRef informado
 *  
 * @template T Tipo opcional para os dados do documento. O padrão é any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef -
 * A DocumentReference do Firestore. Aguarda se for null/undefined.
 * @returns {UseDocResult<T>} Objeto com data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  // Inicializamos como true se houver um ref, para evitar o 404 imediato
  const [isLoading, setIsLoading] = useState<boolean>(!!memoizedDocRef);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
