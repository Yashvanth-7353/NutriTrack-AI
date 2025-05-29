
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckSquare, Loader2 } from 'lucide-react';
import { analyzeIngredients } from '@/ai/flows/analyze-ingredients';
import type { AnalyzeIngredientsInput, AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { useToast } from '@/hooks/use-toast';

export default function AnalyzerForm() {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeIngredientsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!ingredientsInput.trim()) {
      toast({ title: "Ingredients Required", description: "Please enter a list of ingredients.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null); // Clear previous results

    try {
      const input: AnalyzeIngredientsInput = { ingredients: ingredientsInput };
      const result = await analyzeIngredients(input);
      
      if (result) {
        setAnalysisResult(result);
        toast({ title: "Analysis Complete", description: "Ingredient analysis has been generated." });
      } else {
        // This case might be hit if the flow returns null despite output schema
        setAnalysisResult(null); 
        toast({ title: "Analysis Failed", description: "Could not generate a structured analysis. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      setAnalysisResult(null);
      toast({ title: "Error", description: "An unexpected error occurred during analysis. The AI might be unable to process the request at this time.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="ingredients-input" className="text-lg font-medium">Enter Ingredients</Label>
        <Textarea
          id="ingredients-input"
          placeholder="e.g., Sugar, Palm Oil, Whole Wheat Flour, Sodium Nitrate, Ascorbic Acid..."
          value={ingredientsInput}
          onChange={(e) => setIngredientsInput(e.target.value)}
          rows={6}
          className="mt-2 text-base"
        />
        <p className="text-xs text-muted-foreground mt-1">Separate ingredients by commas or new lines.</p>
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} size="lg" className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze Ingredients
          </>
        )}
      </Button>

      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckSquare className="h-6 w-6 text-primary" />
              AI Analysis Result
            </CardTitle>
            <CardDescription>Health insights based on the ingredients provided.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.introduction && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-primary">Introduction</h3>
                <p className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-foreground">{analysisResult.introduction}</p>
              </div>
            )}

            {analysisResult.harmfulEffects && analysisResult.harmfulEffects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-primary">Potential Harmful Effects</h3>
                <ul className="list-disc list-inside prose prose-sm max-w-none dark:prose-invert text-foreground space-y-1 pl-4">
                  {analysisResult.harmfulEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.fssaiLimits && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-primary">FSSAI Limits & Guidelines</h3>
                <p className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-foreground">{analysisResult.fssaiLimits}</p>
              </div>
            )}

            {analysisResult.commonProducts && analysisResult.commonProducts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-primary">Commonly Found In</h3>
                <ul className="list-disc list-inside prose prose-sm max-w-none dark:prose-invert text-foreground space-y-1 pl-4">
                  {analysisResult.commonProducts.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysisResult.overallSummary && (
              <div>
                <h3 className="text-lg font-semibold mb-1 text-primary">Overall Summary</h3>
                <p className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-foreground">{analysisResult.overallSummary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
