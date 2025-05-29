'use server';
/**
 * @fileOverview Guesses common ingredients for a given product name using AI.
 *
 * - guessIngredientsForProduct - A function that handles guessing ingredients.
 * - GuessIngredientsInput - The input type for the guessIngredientsForProduct function.
 * - GuessIngredientsOutput - The return type for the guessIngredientsForProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GuessIngredientsInputSchema = z.object({
  productName: z.string().describe('The name of the food product.'),
});
export type GuessIngredientsInput = z.infer<typeof GuessIngredientsInputSchema>;

const GuessIngredientsOutputSchema = z.object({
  ingredients: z.string().nullable().describe('A comma-separated string of common ingredients for the product, or null if not determinable.'),
});
export type GuessIngredientsOutput = z.infer<typeof GuessIngredientsOutputSchema>;

export async function guessIngredientsForProduct(input: GuessIngredientsInput): Promise<GuessIngredientsOutput> {
  return guessIngredientsFlow(input);
}

const guessIngredientsPrompt = ai.definePrompt({
  name: 'guessIngredientsPrompt',
  input: {schema: GuessIngredientsInputSchema},
  output: {schema: GuessIngredientsOutputSchema},
  prompt: `Given the product name: {{{productName}}}

List the common ingredients typically found in this type of product as a single, comma-separated string.
For example, if the product is "Chocolate Chip Cookies", a possible output is "Flour, Sugar, Butter, Chocolate Chips, Eggs, Vanilla Extract, Baking Soda, Salt".

If you cannot reasonably determine common ingredients for this product, return null for the ingredients field.
Ensure your output is a JSON object matching the defined schema.
`,
});

const guessIngredientsFlow = ai.defineFlow(
  {
    name: 'guessIngredientsFlow',
    inputSchema: GuessIngredientsInputSchema,
    outputSchema: GuessIngredientsOutputSchema,
  },
  async (input) => {
    const {output} = await guessIngredientsPrompt(input);
    if (!output) {
      console.error("AI failed to generate valid structured output for ingredient guessing.");
      // Return null for ingredients if the AI output is completely missing
      return { ingredients: null };
    }
    // The schema enforces `ingredients` can be string or null, so output.ingredients is fine.
    return output;
  }
);
