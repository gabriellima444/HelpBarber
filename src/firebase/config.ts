
/**
 * Configuração do Firebase.
 * Todas as variáveis de ambiente são obrigatórias e devem estar definidas em `.env.local`.
 * Falha ruidosamente com log de erro se alguma estiver faltando.
 */
const requiredVars = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} as const;

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test';

const missing = Object.entries(requiredVars)
  .filter(([, val]) => !val)
  .map(([key]) => key);

if (missing.length > 0) {
  const message = `[Firebase] ⚠️ Variáveis de ambiente OBRIGATÓRIAS não encontradas: ${missing.join(', ')}.`;
  
  if (isBuildTime) {
    console.warn(`${message} Usando placeholders para o build.`);
  } else {
    throw new Error(
      `${message}\n` +
      `Verifique seu arquivo .env.local e garanta que todas as NEXT_PUBLIC_FIREBASE_* estejam definidas.`
    );
  }
}

export const firebaseConfig = {
  projectId: requiredVars.projectId || "placeholder-project-id",
  appId: requiredVars.appId || "placeholder-app-id",
  apiKey: requiredVars.apiKey || "placeholder-api-key",
  authDomain: requiredVars.authDomain || "placeholder-auth-domain",
  storageBucket: requiredVars.storageBucket || "placeholder-storage-bucket",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
};
