'use server';

/**
 * @fileOverview A flow that analyzes the quality of a user's schedule and provides personalized recommendations.
 *
 * - analyzeScheduleQuality - A function that handles the schedule quality analysis process.
 * - AnalyzeScheduleQualityInput - The input type for the analyzeScheduleQuality function.
 * - AnalyzeScheduleQualityOutput - The return type for the analyzeScheduleQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeScheduleQualityInputSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string(),
      category: z.string(),
      timeSpent: z.number().describe('Time spent on the task in minutes.'),
      deadline: z.string().optional().describe('The deadline for the task in ISO format.'),
      priority: z.string().optional().describe('The priority of the task (e.g., high, medium, low).'),
    })
  ).describe('A list of tasks with their title, category, time spent, deadline, and priority.'),
  goals: z.string().describe('The user-defined goals to achieve.'),
  availableTime: z.number().describe('The total available time for tasks in minutes.'),
});

export type AnalyzeScheduleQualityInput = z.infer<typeof AnalyzeScheduleQualityInputSchema>;

const AnalyzeScheduleQualityOutputSchema = z.object({
  analysis: z.string().describe('An analysis of the schedule quality, including potential issues and areas for improvement.'),
  recommendations: z.string().describe('Personalized recommendations for optimizing task prioritization, time allocation, and overall schedule effectiveness.'),
});

export type AnalyzeScheduleQualityOutput = z.infer<typeof AnalyzeScheduleQualityOutputSchema>;

export async function analyzeScheduleQuality(input: AnalyzeScheduleQualityInput): Promise<AnalyzeScheduleQualityOutput> {
  return analyzeScheduleQualityFlow(input);
}

const analyzeScheduleQualityPrompt = ai.definePrompt({
  name: 'analyzeScheduleQualityPrompt',
  input: {schema: AnalyzeScheduleQualityInputSchema},
  output: {schema: AnalyzeScheduleQualityOutputSchema},
  prompt: `You are a schedule optimization expert providing analysis and recommendations for improving the quality and effectiveness of a user's schedule.

  Analyze the following tasks, considering their deadlines, priorities, time spent, and the user's goals. Also, consider the available time.
  Identify potential issues such as conflicting deadlines, inefficient time allocation, or misalignment with the user's goals. Provide specific, actionable recommendations for optimizing task prioritization, time allocation, and overall schedule effectiveness.

  Goals: {{{goals}}}
  Available Time: {{{availableTime}}} minutes

  Tasks:
  {{#each tasks}}
  - Title: {{{title}}}, Category: {{{category}}}, Time Spent: {{{timeSpent}}} minutes, Deadline: {{{deadline}}}, Priority: {{{priority}}}
  {{/each}}
  `,
});

const analyzeScheduleQualityFlow = ai.defineFlow(
  {
    name: 'analyzeScheduleQualityFlow',
    inputSchema: AnalyzeScheduleQualityInputSchema,
    outputSchema: AnalyzeScheduleQualityOutputSchema,
  },
  async input => {
    const {output} = await analyzeScheduleQualityPrompt(input);
    return output!;
  }
);
