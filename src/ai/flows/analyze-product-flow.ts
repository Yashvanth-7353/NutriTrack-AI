
'use server';
/**
 * @fileOverview Analyzes a product name to guess its common ingredients and then details
 * the potential health benefits and risks of each ingredient.
 *
 * - analyzeProduct - A function that handles the product analysis process.
 * - AnalyzeProductInput - The input type for the analyzeProduct function.
 * - AnalyzeProductOutput - The return type for the analyzeProduct function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductInputSchema = z.object({
  productName: z.string().describe('The name of the food product to analyze (e.g., "Chocolate Chip Cookies", "Instant Ramen Noodles").'),
});
export type AnalyzeProductInput = z.infer<typeof AnalyzeProductInputSchema>;

const IngredientDetailSchema = z.object({
  ingredientName: z.string().describe("Name of the ingredient."),
  benefits: z.array(z.string()).describe("Pointwise list of potential health benefits of this ingredient. State if none or not applicable. Be concise."),
  risks: z.array(z.string()).describe("Pointwise list of potential health risks or harmfulness of this ingredient. State if none or not applicable. Be concise.")
});

const AnalyzeProductOutputSchema = z.object({
  productName: z.string().describe("The name of the product that was analyzed."),
  introduction: z.string().describe("A brief introduction about the analysis of the product and its typical ingredients."),
  guessedIngredients: z.array(z.string()).describe("A list of common ingredients typically found in this type of product. This is a best-effort guess as exact formulations vary by brand and specific product."),
  ingredientAnalysis: z.array(IngredientDetailSchema).describe("Detailed analysis for each guessed ingredient, including its benefits and risks."),
  overallConsiderations: z.string().describe("General advice or considerations about consuming this type of product, based on its common ingredients. Include a disclaimer that actual ingredients can vary by brand, specific product, and that this is not medical advice.")
});
export type AnalyzeProductOutput = z.infer<typeof AnalyzeProductOutputSchema>;

export async function analyzeProduct(input: AnalyzeProductInput): Promise<AnalyzeProductOutput> {
  return analyzeProductFlow(input);
}

const analyzeProductPrompt = ai.definePrompt({
  name: 'analyzeProductPrompt',
  input: {schema: AnalyzeProductInputSchema},
  output: {schema: AnalyzeProductOutputSchema},
  prompt: `You are an expert in food science, nutrition, and consumer products.
The user will provide a product name: {{{productName}}}

Your task is to:
1.  **Introduction**: Write a brief introduction about the kind of product it is and that you will be analyzing its common ingredients.
2.  **Guess Ingredients**: Based on the product name, list common ingredients typically found in such a product. Acknowledge that this is a general list and specific brands may differ. Aim for a reasonable number of key ingredients (e.g., 5-10).
3.  **Analyze Each Ingredient**: For each ingredient you've listed:
    *   Provide a pointwise list of its potential health benefits. If none or not applicable for a common food item, state that.
    *   Provide a pointwise list of its potential health risks or harmfulness. If none or not applicable, state that. Be factual and balanced.
4.  **Overall Considerations**: Provide some general considerations or advice about consuming this type of product. Crucially, include a disclaimer stating that:
    *   The ingredient list is a general guess and actual ingredients can vary significantly by brand and specific product.
    *   This analysis is for informational purposes only and not medical advice.
    *   Users should always check the product's label for actual ingredients and consult with a healthcare professional for health advice.

Ensure your entire response is a single JSON object matching the defined output schema.

Example for an ingredient in ingredientAnalysis:
{
  "ingredientName": "High Fructose Corn Syrup",
  "benefits": ["Provides energy quickly.", "Can improve texture and stability in some products."],
  "risks": ["Excessive consumption linked to weight gain.", "May contribute to insulin resistance.", "Can increase risk of type 2 diabetes and fatty liver disease if overconsumed."]
}

Product to analyze: {{{productName}}}
`,
});

const analyzeProductFlow = ai.defineFlow(
  {
    name: 'analyzeProductFlow',
    inputSchema: AnalyzeProductInputSchema,
    outputSchema: AnalyzeProductOutputSchema,
  },
  async (input) => {
    const {output} = await analyzeProductPrompt(input);
    if (!output) {
      console.error("AI failed to generate valid structured output for product analysis.");
      throw new Error("AI product analysis failed to produce structured output.");
    }
    return output;
  }
);
