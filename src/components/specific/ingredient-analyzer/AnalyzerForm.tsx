"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckSquare, Loader2 } from 'lucide-react';
import { analyzeIngredients } from '@/ai/flows/analyze-ingredients'; // Ensure this path is correct
import type { AnalyzeIngredientsInput } from '@/ai/flows/analyze-ingredients';
import { useToast } from '@/hooks/use-toast';

export default function AnalyzerForm() {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!ingredientsInput.trim()) {
      toast({ title: "Ingredients Required", description: "Please enter a list of ingredients.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setAnalysisResult('');

    try {
      const input: AnalyzeIngredientsInput = { ingredients: ingredientsInput };
      const result = await analyzeIngredients(input);
      if (result && result.analysis) {
        setAnalysisResult(result.analysis);
        toast({ title: "Analysis Complete", description: "Ingredient analysis has been generated." });
      } else {
        setAnalysisResult("No analysis could be generated for the provided ingredients.");
        toast({ title: "Analysis Failed", description: "Could not generate analysis. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      setAnalysisResult("An error occurred while analyzing ingredients. Please check the console for details and try again.");
      toast({ title: "Error", description: "An unexpected error occurred during analysis.", variant: "destructive" });
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
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-foreground">
              {analysisResult}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
