'use server';

/**
 * @fileOverview A flow that provides AI-powered insights into the user's progress towards their goals and the quality of their schedule.
 *
 * - getTimeTrackingInsights - A function that handles the time tracking and progress insights process.
 * - TimeTrackingInsightsInput - The input type for the getTimeTrackingInsights function.
 * - TimeTrackingInsightsOutput - The return type for the getTimeTrackingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimeTrackingInsightsInputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      timeSpent: z.number().describe('Time spent on the task in minutes.'),
      deadline: z.string().optional().describe('The deadline for the task in ISO format.'),
    })
  ).describe('A list of tasks with their title, category, time spent, and deadline.'),
  goals: z.string().describe('The user defined goals to achieve.'),
});

export type TimeTrackingInsightsInput = z.infer<typeof TimeTrackingInsightsInputSchema>;

const TimeTrackingInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-powered insights into the user\'s progress and schedule quality.'),
  recommendations: z.string().describe('Recommendations for improving productivity and time management.'),
});

export type TimeTrackingInsightsOutput = z.infer<typeof TimeTrackingInsightsOutputSchema>;

export async function getTimeTrackingInsights(input: TimeTrackingInsightsInput): Promise<TimeTrackingInsightsOutput> {
  return timeTrackingInsightsFlow(input);
}

const timeTrackingInsightsPrompt = ai.definePrompt({
  name: 'timeTrackingInsightsPrompt',
  input: {schema: TimeTrackingInsightsInputSchema},
  output: {schema: TimeTrackingInsightsOutputSchema},
  prompt: `You are a productivity expert providing insights and recommendations based on the user's time tracking data and goals.

  Analyze the following tasks, the time spent on them, and how that time is distributed across different categories. Consider the user's stated goals.
  Provide insights into their progress, the quality of their schedule, and the balance of time across categories. Offer specific, actionable recommendations for improvement.

  Goals: {{{goals}}}

  Tasks:
  {{#each tasks}}
  - Title: {{{title}}}, Category: {{{category}}}, Time Spent: {{{timeSpent}}} minutes, Deadline: {{{deadline}}}
  {{/each}}
  `,
});

const timeTrackingInsightsFlow = ai.defineFlow(
  {
    name: 'timeTrackingInsightsFlow',
    inputSchema: TimeTrackingInsightsInputSchema,
    outputSchema: TimeTrackingInsightsOutputSchema,
  },
  async input => {
    const {output} = await timeTrackingInsightsPrompt(input);
    return output!;
  }
);
