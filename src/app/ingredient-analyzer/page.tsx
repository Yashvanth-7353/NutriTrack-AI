
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnalyzerForm from "@/components/specific/ingredient-analyzer/AnalyzerForm";
import ProductAnalyzerForm from "@/components/specific/ingredient-analyzer/ProductAnalyzerForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, HelpCircle, ScanSearch, ListChecks } from "lucide-react";

export default function IngredientAnalyzerPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            AI Food Analysis Center
          </CardTitle>
          <CardDescription>
            Analyze ingredients lists or get insights on common food products using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingredients">
                <ListChecks className="mr-2 h-5 w-5" />
                Analyze Ingredients
              </TabsTrigger>
              <TabsTrigger value="product">
                <ScanSearch className="mr-2 h-5 w-5" />
                Analyze Product
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="mt-6">
              <AnalyzerForm />
            </TabsContent>
            <TabsContent value="product" className="mt-6">
              <ProductAnalyzerForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center gap-3">
           <HelpCircle className="h-6 w-6 text-muted-foreground" />
           <CardTitle className="text-xl font-semibold">How it Works & Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Ingredient Analyzer:</strong> Paste or type a list of ingredients from a food label. The AI will identify potentially unhealthy ingredients and provide explanations.
          </p>
          <p>
            <strong>Product Analyzer:</strong> Enter a common food product name (e.g., "Oreo Cookies", "Coca-Cola"). The AI will attempt to list common ingredients for that type of product and analyze their general health benefits and risks. Note that actual ingredients vary by brand and specific product.
          </p>
          <p>
            <strong>Disclaimer:</strong> This analysis is for informational purposes only and should not be considered medical or nutritional advice. The AI's information about products is based on common knowledge and may not reflect specific brand formulations. Always check product labels and consult with a healthcare professional or registered dietitian for personalized health and nutrition guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
