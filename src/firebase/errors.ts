'use client';
import { getAuth, type User } from 'firebase/auth';

type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string;
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Constrói um objeto auth compatível com as regras de segurança a partir do Usuário do Firebase.
 * @param currentUser O usuário do Firebase atualmente autenticado.
 * @returns Um objeto que espelha request.auth nas regras de segurança, ou null.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Constrói o objeto de requisição simulado e completo para a mensagem de erro.
 * Tenta obter o usuário autenticado atual com segurança.
 * @param context O contexto da operação falha do Firestore.
 * @returns Um objeto de requisição estruturado.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    // Tenta obter o usuário atual com segurança.
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // Isso capturará erros se o app do Firebase ainda não tiver sido inicializado.
    // Neste caso, procederemos sem informações de autenticação.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Constrói a mensagem de erro final e formatada para o LLM.
 * @param requestObject O objeto de requisição simulado.
 * @returns Uma string contendo a mensagem de erro e o payload JSON.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Permissões insuficientes ou ausentes: A seguinte requisição foi negada pelas Regras de Segurança do Firestore:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * Uma classe de erro customizada projetada para ser consumida por um LLM para depuração.
 * Ela estrutura a informação de erro para imitar o objeto de requisição
 * disponível nas Regras de Segurança do Firestore.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
  }
}
