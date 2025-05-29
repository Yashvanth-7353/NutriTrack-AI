import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyzerForm from "@/components/specific/ingredient-analyzer/AnalyzerForm";
import { FlaskConical, HelpCircle } from "lucide-react";

export default function IngredientAnalyzerPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            AI Ingredient Health Analyzer
          </CardTitle>
          <CardDescription>
            Enter a list of ingredients to get an AI-powered analysis of potential health risks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnalyzerForm />
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
           <HelpCircle className="h-6 w-6 text-muted-foreground" />
           <CardTitle className="text-xl font-semibold">How it Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            This tool uses a powerful AI model (Google Gemini) to analyze food ingredients. Simply paste or type the list of ingredients from a food label into the text area.
          </p>
          <p>
            The AI will identify potentially unhealthy ingredients and provide explanations about their associated health risks.
          </p>
          <p>
            <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered medical advice. Always consult with a healthcare professional or registered dietitian for personalized health and nutrition guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
