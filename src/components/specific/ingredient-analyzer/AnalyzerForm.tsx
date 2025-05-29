
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckSquare, Loader2, Library, FileText } from 'lucide-react';
import { analyzeIngredients } from '@/ai/flows/analyze-ingredients';
import type { AnalyzeIngredientsInput, AnalyzeIngredientsOutput } from '@/ai/flows/analyze-ingredients';
import { summarizeAnalysis } from '@/ai/flows/summarize-analysis-flow';
import type { SummarizeAnalysisOutput } from '@/ai/flows/summarize-analysis-flow';
import { useToast } from '@/hooks/use-toast';

export default function AnalyzerForm() {
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeIngredientsOutput | null>(null);
  const [summarizedResult, setSummarizedResult] = useState<SummarizeAnalysisOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!ingredientsInput.trim()) {
      toast({ title: "Ingredients Required", description: "Please enter a list of ingredients.", variant: "destructive" });
      return;
    }
    setIsLoadingAnalysis(true);
    setAnalysisResult(null); // Clear previous results
    setSummarizedResult(null); // Clear previous summary

    try {
      const input: AnalyzeIngredientsInput = { ingredients: ingredientsInput };
      const result = await analyzeIngredients(input);
      
      if (result) {
        setAnalysisResult(result);
        toast({ title: "Analysis Complete", description: "Detailed ingredient analysis has been generated." });
      } else {
        setAnalysisResult(null); 
        toast({ title: "Analysis Failed", description: "Could not generate a structured analysis. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error analyzing ingredients:", error);
      setAnalysisResult(null);
      toast({ title: "Error", description: "An unexpected error occurred during analysis. The AI might be unable to process the request at this time.", variant: "destructive" });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSummarize = async () => {
    if (!analysisResult) {
      toast({ title: "Analysis Required", description: "Please perform an initial analysis first.", variant: "destructive" });
      return;
    }
    setIsLoadingSummary(true);
    setSummarizedResult(null);

    try {
      const result = await summarizeAnalysis(analysisResult);
      if (result && result.conciseSummaryPoints) {
        setSummarizedResult(result);
        toast({ title: "Summarization Complete", description: "Concise summary has been generated." });
      } else {
        setSummarizedResult(null);
        toast({ title: "Summarization Failed", description: "Could not generate a concise summary. Please try again.", variant: "destructive"});
      }
    } catch (error) {
      console.error("Error summarizing analysis:", error);
      setSummarizedResult(null);
      toast({ title: "Error", description: "An unexpected error occurred during summarization.", variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
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

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={handleAnalyze} disabled={isLoadingAnalysis || isLoadingSummary} size="lg" className="w-full sm:w-auto">
          {isLoadingAnalysis ? (
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
        {analysisResult && !isLoadingAnalysis && (
           <Button onClick={handleSummarize} disabled={isLoadingSummary || isLoadingAnalysis} size="lg" variant="secondary" className="w-full sm:w-auto">
            {isLoadingSummary ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <Library className="mr-2 h-5 w-5" />
                Summarize Analysis
              </>
            )}
          </Button>
        )}
      </div>
      
      {summarizedResult && (
        <Card className="shadow-lg border-accent">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-accent">
              <FileText className="h-6 w-6" />
              Concise Summary
            </CardTitle>
            <CardDescription>A quick point-by-point overview of the analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
             <ul className="list-disc list-inside prose prose-sm max-w-none dark:prose-invert text-foreground space-y-1 pl-4">
              {summarizedResult.conciseSummaryPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckSquare className="h-6 w-6 text-primary" />
              Detailed AI Analysis
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
