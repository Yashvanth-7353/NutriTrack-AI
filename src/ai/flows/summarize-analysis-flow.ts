
'use server';
/**
 * @fileOverview Summarizes a detailed ingredient analysis into a concise, point-by-point format.
 *
 * - summarizeAnalysis - A function that handles the summarization process.
 * - SummarizeAnalysisInput - The input type (which is the output of analyzeIngredients flow).
 * - SummarizeAnalysisOutput - The return type for the summarizeAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { AnalyzeIngredientsOutput } from './analyze-ingredients'; // Import the type

// Use the existing AnalyzeIngredientsOutput schema as the input for this flow
// We can redefine it here or ensure it's correctly imported and used.
// For simplicity in this flow, we'll refer to it by its imported type.
// The prompt will expect fields like introduction, harmfulEffects, etc.
const SummarizeAnalysisInputSchema = z.object({
  introduction: z.string().describe("The introduction from the detailed analysis."),
  harmfulEffects: z.array(z.string()).describe("The list of harmful effects from the detailed analysis."),
  fssaiLimits: z.string().describe("The FSSAI limits information from the detailed analysis."),
  commonProducts: z.array(z.string()).describe("The list of common products from the detailed analysis."),
  overallSummary: z.string().describe("The overall summary from the detailed analysis."),
});
export type SummarizeAnalysisInput = AnalyzeIngredientsOutput; // Alias for clarity

const SummarizeAnalysisOutputSchema = z.object({
  conciseSummaryPoints: z.array(z.string()).describe("A concise, point-by-point summary of the ingredient analysis, highlighting the most critical information. Each point should be a separate string in the array.")
});
export type SummarizeAnalysisOutput = z.infer<typeof SummarizeAnalysisOutputSchema>;

export async function summarizeAnalysis(input: SummarizeAnalysisInput): Promise<SummarizeAnalysisOutput> {
  return summarizeAnalysisFlow(input);
}

const summarizeAnalysisPrompt = ai.definePrompt({
  name: 'summarizeAnalysisPrompt',
  input: {schema: SummarizeAnalysisInputSchema},
  output: {schema: SummarizeAnalysisOutputSchema},
  prompt: `You are an expert summarizer. You will receive a detailed analysis of food ingredients. Your task is to condense this analysis into a concise, point-by-point summary. Focus on the most critical health implications, significant FSSAI warnings (if any were noted), and key takeaways. Make the points easy to understand quickly.

Here is the detailed analysis to summarize:
Introduction: {{{introduction}}}
Harmful Effects:
{{#if harmfulEffects}}
{{#each harmfulEffects}}
- {{{this}}}
{{/each}}
{{else}}
None listed.
{{/if}}
FSSAI Limits: {{{fssaiLimits}}}
Common Products:
{{#if commonProducts}}
{{#each commonProducts}}
- {{{this}}}
{{/each}}
{{else}}
None listed.
{{/if}}
Overall Summary: {{{overallSummary}}}

Provide your summary as an array of strings, where each string is a single summary point. Each point should be impactful and brief.
Example output: ["High sugar content may lead to health issues.", "Contains MSG, which can cause reactions in sensitive individuals.", "FSSAI advises caution with artificial sweeteners found."]
`,
});

const summarizeAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeAnalysisFlow',
    inputSchema: SummarizeAnalysisInputSchema,
    outputSchema: SummarizeAnalysisOutputSchema,
  },
  async (input) => {
    // Ensure all expected fields from AnalyzeIngredientsOutput are passed, even if empty
    const preparedInput = {
        introduction: input.introduction || "",
        harmfulEffects: input.harmfulEffects || [],
        fssaiLimits: input.fssaiLimits || "",
        commonProducts: input.commonProducts || [],
        overallSummary: input.overallSummary || "",
    };
    const {output} = await summarizeAnalysisPrompt(preparedInput);
    if (!output) {
      console.error("AI failed to generate valid structured output for summary.");
      throw new Error("AI summarization failed to produce structured output.");
    }
    return output;
  }
);

