
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-ingredients.ts';
import '@/ai/flows/summarize-analysis-flow.ts';
import '@/ai/flows/analyze-product-flow.ts';
import '@/ai/flows/guess-ingredients-flow.ts';

