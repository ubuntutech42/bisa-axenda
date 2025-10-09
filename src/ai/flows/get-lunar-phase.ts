
'use server';

/**
 * @fileOverview A flow that returns the lunar phase for a given date.
 *
 * - getLunarPhase - A function that handles the lunar phase request.
 * - GetLunarPhaseInput - The input type for the getLunarPhase function.
 * - GetLunarPhaseOutput - The return type for the getLunarPhase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetLunarPhaseInputSchema = z.object({
  date: z.string().describe("A data no formato YYYY-MM-DD para a qual a fase da lua deve ser calculada."),
});

export type GetLunarPhaseInput = z.infer<typeof GetLunarPhaseInputSchema>;

const GetLunarPhaseOutputSchema = z.object({
  phaseName: z.enum([
    "Lua Nova",
    "Lua Crescente Côncava",
    "Quarto Crescente",
    "Lua Crescente Gibosa",
    "Lua Cheia",
    "Lua Minguante Gibosa",
    "Quarto Minguante",
    "Lua Minguante Côncava"
  ]).describe("O nome da fase da lua para a data fornecida."),
  description: z.string().describe("Uma breve descrição poética ou de influência da fase da lua."),
});

export type GetLunarPhaseOutput = z.infer<typeof GetLunarPhaseOutputSchema>;

export async function getLunarPhase(input: GetLunarPhaseInput): Promise<GetLunarPhaseOutput> {
  return lunarPhaseFlow(input);
}

const lunarPhasePrompt = ai.definePrompt({
  name: 'lunarPhasePrompt',
  input: {schema: GetLunarPhaseInputSchema},
  output: {schema: GetLunarPhaseOutputSchema},
  prompt: `Você é um astrólogo e especialista em calendários lunares. 
  
  Para a data fornecida ({{{date}}}), determine a fase exata da lua no hemisfério sul.
  
  Forneça o nome exato da fase da lua e uma descrição poética e concisa sobre a energia e influência dessa fase para o dia.
  
  Seja breve e inspirador.`,
});

const lunarPhaseFlow = ai.defineFlow(
  {
    name: 'lunarPhaseFlow',
    inputSchema: GetLunarPhaseInputSchema,
    outputSchema: GetLunarPhaseOutputSchema,
  },
  async input => {
    const {output} = await lunarPhasePrompt(input);
    return output!;
  }
);
