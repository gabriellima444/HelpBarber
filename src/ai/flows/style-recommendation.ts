// Esta é uma server action.
'use server';

/**
 * @fileOverview Um agente de IA para recomendação de estilo.
 *
 * - recommendStyle - Uma função que gerencia o processo de recomendação de estilo.
 * - StyleRecommendationInput - O tipo de entrada para a função recommendStyle.
 * - StyleRecommendationOutput - O tipo de retorno para a função recommendStyle.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StyleRecommendationInputSchema = z.object({
  faceShape: z
    .string()
    .describe('O formato do rosto do usuário (ex: Redondo, Oval, Quadrado).'),
  hairType: z
    .string()
    .describe('O tipo de cabelo do usuário (ex: Liso, Ondulado, Cacheado).'),
  occasion: z
    .string()
    .describe('A ocasião para a qual o penteado é necessário (ex: casual, formal, festa).'),
});
export type StyleRecommendationInput = z.infer<typeof StyleRecommendationInputSchema>;

const StyleRecommendationOutputSchema = z.object({
  hairstyleRecommendation: z
    .string()
    .describe('Um penteado ou corte de cabelo masculino sugerido com base nos parâmetros de entrada.'),
  styleDescription: z.string().describe('Uma descrição do penteado ou corte de cabelo masculino sugerido.'),
});
export type StyleRecommendationOutput = z.infer<typeof StyleRecommendationOutputSchema>;

export async function recommendStyle(input: StyleRecommendationInput): Promise<StyleRecommendationOutput> {
  return recommendStyleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'styleRecommendationPrompt',
  input: {schema: StyleRecommendationInputSchema},
  output: {schema: StyleRecommendationOutputSchema},
  prompt: `Você é um barbeiro especialista em cabelos masculinos. Com base no formato do rosto, tipo de cabelo e ocasião do usuário, você recomendará um penteado ou corte de cabelo masculino adequado e o descreverá. A resposta deve ser em português do Brasil.

Formato do Rosto: {{{faceShape}}}
Tipo de Cabelo: {{{hairType}}}
Ocasião: {{{occasion}}}

Recomendação de Penteado Masculino:`,
});

const recommendStyleFlow = ai.defineFlow(
  {
    name: 'recommendStyleFlow',
    inputSchema: StyleRecommendationInputSchema,
    outputSchema: StyleRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
