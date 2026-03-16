'use server';

/**
 * @fileOverview A flow that generates motivational quotes from prominent Black figures.
 *
 * - generateMotivationalQuote - A function that generates a motivational quote.
 * - MotivationalQuoteInput - The input type for the generateMotivationalQuote function.
 * - MotivationalQuoteOutput - The return type for the generateMotivationalQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalQuoteInputSchema = z.object({
  context: z.string().describe('The context in which the quote will be displayed.'),
});

export type MotivationalQuoteInput = z.infer<typeof MotivationalQuoteInputSchema>;

const MotivationalQuoteOutputSchema = z.object({
  quote: z.string().describe('A motivational quote from a prominent Black figure.'),
});

export type MotivationalQuoteOutput = z.infer<typeof MotivationalQuoteOutputSchema>;

export async function generateMotivationalQuote(input: MotivationalQuoteInput): Promise<MotivationalQuoteOutput> {
  return motivationalQuoteFlow(input);
}

const motivationalQuotePrompt = ai.definePrompt({
  name: 'motivationalQuotePrompt',
  input: {schema: MotivationalQuoteInputSchema},
  output: {schema: MotivationalQuoteOutputSchema},
  prompt: `You are a generator of motivational quotes from prominent Black figures, tailored to the given context.

  Context: {{{context}}}

  Please provide a relevant and inspiring quote.
  `,
});

const motivationalQuoteFlow = ai.defineFlow(
  {
    name: 'motivationalQuoteFlow',
    inputSchema: MotivationalQuoteInputSchema,
    outputSchema: MotivationalQuoteOutputSchema,
  },
  async input => {
    const {output} = await motivationalQuotePrompt(input);
    return output!;
  }
);
