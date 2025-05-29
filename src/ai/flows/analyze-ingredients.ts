
'use server';

/**
 * @fileOverview Analyzes a list of ingredients using Gemini to identify potentially unhealthy ingredients,
 * explain their health risks, provide FSSAI context, and list common products.
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
    .describe('A list of ingredients to analyze, separated by commas or new lines.'),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const AnalyzeIngredientsOutputSchema = z.object({
  introduction: z.string().describe("A brief introduction to the analysis of the ingredients."),
  harmfulEffects: z.array(z.string()).describe("A pointwise list of potential harmful effects of the identified ingredients. Each point should be a separate string in the array."),
  fssaiLimits: z.string().describe("Information on FSSAI (Food Safety and Standards Authority of India) maximum permissible limits for the ingredients, if available. State if not found or not applicable."),
  commonProducts: z.array(z.string()).describe("A list of approximately 5 common daily used products that may contain one or more of the analyzed ingredients. Each product should be a separate string in the array."),
  overallSummary: z.string().describe("A concluding summary of the ingredient analysis."),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const analyzeIngredientsPrompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an expert in health, nutrition, and food safety. Please analyze the following list of ingredients:
{{{ingredients}}}

Provide your analysis in a structured format. Your response MUST conform to the output schema.

Specifically, cover the following points:
1.  **Introduction**: Start with a brief introduction to your analysis of the provided ingredients.
2.  **Harmful Effects**: Identify any potentially unhealthy or concerning ingredients. For each, provide a pointwise list of their potential harmful effects. This should be an array of strings.
3.  **FSSAI Limits**: Discuss any relevant FSSAI (Food Safety and Standards Authority of India) guidelines or maximum permissible limits for these ingredients, if such information is publicly available and applicable. If specific FSSAI limits are not found for an ingredient, or if they are not applicable (e.g., for a whole food like 'apple'), clearly state that. This should be a descriptive string.
4.  **Common Products**: List approximately 5 common, daily-used food products that typically contain one or more of the analyzed (especially the concerning) ingredients. This should be an array of strings.
5.  **Overall Summary**: Conclude with an overall summary of your findings and any general advice.

Example for harmfulEffects: ["Causes digestive issues in sensitive individuals.", "May contribute to high blood pressure if consumed in excess."]
Example for commonProducts: ["Instant noodles", "Processed cheese slices", "Soft drinks", "Packaged biscuits", "Breakfast cereals"]

Ensure your entire response is a single JSON object matching the defined output schema.
`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzeIngredientsPrompt(input);
    if (!output) {
      // This would indicate a failure from the LLM to generate valid structured output.
      // Consider throwing an error or returning a default error structure.
      // For now, we'll rely on the non-null assertion and Genkit's schema enforcement.
      console.error("AI failed to generate valid structured output for ingredients analysis.");
      throw new Error("AI analysis failed to produce structured output.");
    }
    return output;
  }
);
