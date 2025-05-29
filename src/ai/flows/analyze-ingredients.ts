// 'use server'
'use server';

/**
 * @fileOverview Analyzes a list of ingredients using Gemini to identify potentially unhealthy ingredients and explain their health risks.
 *
 * - analyzeIngredients - A function that handles the ingredient analysis process.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIngredientsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A list of ingredients to analyze, separated by commas.'),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const AnalyzeIngredientsOutputSchema = z.object({
  analysis: z
    .string()
    .describe('The analysis of the ingredients, including any unhealthy ingredients and their health risks.'),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const analyzeIngredientsPrompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are a health and nutrition expert. Please analyze the following list of ingredients and identify any potentially unhealthy ingredients and explain their health risks.\n\nIngredients: {{{ingredients}}}`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzeIngredientsPrompt(input);
    return output!;
  }
);
