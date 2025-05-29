
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddProductSection from "@/components/specific/food-management/AddProductSection";
import ProductsDisplay from "@/components/specific/food-management/ProductsDisplay";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export default function FoodManagementPage() {
  return (
    <div className="space-y-8">
      <TooltipProvider>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <span>Food Management</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-semibold mb-1">Key Features:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Add products via barcode or manually.</li>
                    <li>AI-powered ingredient suggestions.</li>
                    <li>Track quantity and assign categories.</li>
                    <li>Monitor expiry dates with status indicators.</li>
                    <li>Sort, filter, and export your product list.</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </CardTitle>
            <CardDescription>
              Add new products by scanning or manually entering their barcode, set expiry dates, and track your inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddProductSection />
          </CardContent>
        </Card>
      </TooltipProvider>
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Tracked Products</CardTitle>
          <CardDescription>
            View, manage, and export your tracked food items. Items nearing expiry or expired are highlighted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsDisplay />
        </CardContent>
      </Card>
    </div>
  );
}
