import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AddProductSection from "@/components/specific/food-management/AddProductSection";
import ProductsDisplay from "@/components/specific/food-management/ProductsDisplay";
import { Separator } from "@/components/ui/separator";

export default function FoodManagementPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Food Management</CardTitle>
          <CardDescription>
            Add new products by scanning or manually entering their barcode, set expiry dates, and track your inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddProductSection />
        </CardContent>
      </Card>
      
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
