
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Loader2, Info, AlertTriangle, Leaf, ShieldAlert } from 'lucide-react';
import { analyzeProduct } from '@/ai/flows/analyze-product-flow';
import type { AnalyzeProductInput, AnalyzeProductOutput } from '@/ai/flows/analyze-product-flow';
import { useToast } from '@/hooks/use-toast';

export default function ProductAnalyzerForm() {
  const [productNameInput, setProductNameInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalyzeProductOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyzeProduct = async () => {
    if (!productNameInput.trim()) {
      toast({ title: "Product Name Required", description: "Please enter a product name.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const input: AnalyzeProductInput = { productName: productNameInput };
      const result = await analyzeProduct(input);
      
      if (result) {
        setAnalysisResult(result);
        toast({ title: "Product Analysis Complete", description: `Analysis for ${result.productName} has been generated.` });
      } else {
        setAnalysisResult(null); 
        toast({ title: "Analysis Failed", description: "Could not generate a structured analysis for the product. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error analyzing product:", error);
      setAnalysisResult(null);
      toast({ title: "Error", description: "An unexpected error occurred during product analysis. The AI might be unable to process the request at this time.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="product-name-input" className="text-lg font-medium">Enter Product Name</Label>
        <Input
          id="product-name-input"
          placeholder="e.g., Chocolate Chip Cookies, Instant Coffee, Tomato Ketchup..."
          value={productNameInput}
          onChange={(e) => setProductNameInput(e.target.value)}
          className="mt-2 text-base"
        />
        <p className="text-xs text-muted-foreground mt-1">Enter a generic product name. The AI will list common ingredients and analyze them.</p>
      </div>

      <Button onClick={handleAnalyzeProduct} disabled={isLoading} size="lg" className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing Product...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze Product
          </>
        )}
      </Button>
      
      {analysisResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Leaf className="h-6 w-6 text-primary" />
              AI Product Analysis: {analysisResult.productName}
            </CardTitle>
            {analysisResult.introduction && (
                <CardDescription>{analysisResult.introduction}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.guessedIngredients && analysisResult.guessedIngredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Commonly Guessed Ingredients
                </h3>
                <ul className="list-disc list-inside bg-muted/30 p-3 rounded-md text-sm text-muted-foreground">
                  {analysisResult.guessedIngredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-1">Note: This is a general list. Actual ingredients vary by brand.</p>
              </div>
            )}

            {analysisResult.ingredientAnalysis && analysisResult.ingredientAnalysis.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-primary">Ingredient Details</h3>
                <Accordion type="single" collapsible className="w-full">
                  {analysisResult.ingredientAnalysis.map((item, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                      <AccordionTrigger className="text-base hover:no-underline">
                        {item.ingredientName}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pl-2">
                        {item.benefits && item.benefits.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Potential Benefits:</h4>
                            <ul className="list-disc list-inside text-sm space-y-0.5 pl-4">
                              {item.benefits.map((benefit, bIndex) => (
                                <li key={`benefit-${index}-${bIndex}`}>{benefit}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.risks && item.risks.length > 0 && (
                           <div>
                            <h4 className="font-medium text-red-700 dark:text-red-400 mb-1">Potential Risks/Harmfulness:</h4>
                            <ul className="list-disc list-inside text-sm space-y-0.5 pl-4">
                              {item.risks.map((risk, rIndex) => (
                                <li key={`risk-${index}-${rIndex}`}>{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(!item.benefits || item.benefits.length === 0) && (!item.risks || item.risks.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">No specific benefits or risks commonly highlighted for this ingredient in general food contexts, or it's a basic food component.</p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
            
            {analysisResult.overallConsiderations && (
              <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <CardTitle className="text-md font-semibold text-amber-700 dark:text-amber-300">Overall Considerations & Disclaimer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line text-amber-700 dark:text-amber-300">{analysisResult.overallConsiderations}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
