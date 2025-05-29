
'use server';
/**
 * @fileOverview A Genkit flow for an FSSAI chatbot.
 *
 * - fssaiQuery - A function to handle user queries about FSSAI.
 * - FssaiChatInput - The input type for the fssaiQuery function.
 * - FssaiChatOutput - The return type for the fssaiQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FssaiChatInputSchema = z.object({
  query: z.string().describe('The user query about FSSAI rules and regulations.'),
  // We could add conversationHistory here in the future if needed
  // conversationHistory: z.array(z.object({role: z.enum(["user", "model"]), parts: z.array(z.object({text: z.string()}))})).optional().describe("Previous conversation history.")
});
export type FssaiChatInput = z.infer<typeof FssaiChatInputSchema>;

const FssaiChatOutputSchema = z.object({
  response: z.string().describe('The AI chatbot response to the user query.'),
});
export type FssaiChatOutput = z.infer<typeof FssaiChatOutputSchema>;

export async function fssaiQuery(input: FssaiChatInput): Promise<FssaiChatOutput> {
  return fssaiChatFlow(input);
}

const fssaiChatPrompt = ai.definePrompt({
  name: 'fssaiChatPrompt',
  input: {schema: FssaiChatInputSchema},
  output: {schema: FssaiChatOutputSchema},
  prompt: `You are a helpful AI assistant specialized in FSSAI (Food Safety and Standards Authority of India) rules, regulations, and food safety guidelines in India.
Your goal is to answer user questions accurately and clearly based on publicly available information about FSSAI.

When responding:
- Be polite and conversational.
- If a question is clearly outside the scope of FSSAI or food safety in India (e.g., asking about car repair, sports scores), politely state that you are specialized in FSSAI topics and cannot answer it.
- For every response you provide regarding FSSAI, **you MUST conclude** with the following disclaimer, exactly as written, on a new line:
"Please note: This information is for general guidance only. Always refer to official FSSAI notifications, its website (fssai.gov.in), or consult with a qualified food safety professional for definitive advice and the most current regulations."

User's question: {{{query}}}
`,
});

const fssaiChatFlow = ai.defineFlow(
  {
    name: 'fssaiChatFlow',
    inputSchema: FssaiChatInputSchema,
    outputSchema: FssaiChatOutputSchema,
  },
  async (input) => {
    const {output} = await fssaiChatPrompt(input);
    if (!output || !output.response) {
      console.error("AI failed to generate a valid structured response for FSSAI chat.");
      // Provide a fallback response if AI fails
      return { response: "I'm sorry, I encountered an issue processing your request. Please try again.\n\nPlease note: This information is for general guidance only. Always refer to official FSSAI notifications, its website (fssai.gov.in), or consult with a qualified food safety professional for definitive advice and the most current regulations." };
    }
    return output;
  }
);
