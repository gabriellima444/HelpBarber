import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Verifica se a chave de API está presente no ambiente
if (typeof window === 'undefined' && !process.env.GEMINI_API_KEY) {
  console.error('ERRO: A variável de ambiente GEMINI_API_KEY não foi encontrada. A IA não funcionará até que esta chave seja configurada nas configurações do seu projeto no Firebase App Hosting.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});
