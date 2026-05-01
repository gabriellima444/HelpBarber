'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Define o formato de todos os eventos possíveis e seus respectivos tipos de carga útil (payload).
 * Isso centraliza as definições de eventos para garantir a segurança de tipos em toda a aplicação.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// Um tipo genérico para uma função de callback.
type Callback<T> = (data: T) => void;

/**
 * Um emissor de eventos pub/sub fortemente tipado.
 * Ele usa um tipo genérico T que estende um registro de nomes de eventos para tipos de payload.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // O objeto events armazena arrays de callbacks, indexados pelo nome do evento.
  // Os tipos garantem que um callback para um evento específico corresponda ao seu tipo de payload.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Inscreve-se em um evento.
     * @param eventName O nome do evento para se inscrever.
     * @param callback A função a ser chamada quando o evento for emitido.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Cancela a inscrição de um evento.
     * @param eventName O nome do evento para cancelar a inscrição.
     * @param callback O callback específico a ser removido.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Publica um evento para todos os assinantes.
     * @param eventName O nome do evento a ser emitido.
     * @param data A carga útil de dados que corresponde ao tipo do evento.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Cria e exporta uma instância única (singleton) do emissor, tipada com nossa interface AppEvents.
export const errorEmitter = createEventEmitter<AppEvents>();
