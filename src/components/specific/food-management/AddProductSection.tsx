
"use client";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Barcode, CalendarPlus, Info, PackagePlus, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { lookupBarcodeAction } from '@/lib/actions';
import type { BarcodeInfo, TrackedProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCurrentDateFormatted, calculateExpiryStatus } from '@/lib/utils';
import { guessIngredientsForProduct } from '@/ai/flows/guess-ingredients-flow';

const LS_PRODUCTS_KEY = 'nutriTrackProducts';

export default function AddProductSection() {
  const [barcode, setBarcode] = useState('');
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  const [foundProductInfo, setFoundProductInfo] = useState<BarcodeInfo | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [isSuggestingIngredients, setIsSuggestingIngredients] = useState(false);

  const { toast } = useToast();

  // Effect to trigger re-render on other components that use localStorage
  const [_, setProductsVersion] = useState(0); 


  const handleBarcodeLookup = async () => {
    if (!barcode.trim()) {
      toast({ title: "Barcode required", description: "Please enter a barcode.", variant: "destructive" });
      return;
    }
    setIsLoadingBarcode(true);
    setFoundProductInfo(null);
    setExpiryDate('');
    setCustomProductName('');
    setCustomIngredients('');
    setQuantity(1);
    setCategory('');
    setIsManualEntry(false);

    try {
      const product = await lookupBarcodeAction(barcode.trim());
      if (product) {
        setFoundProductInfo(product);
        setCustomIngredients(product.ingredients || ''); 
        toast({ title: "Product Found", description: `${product.productName} details loaded.` });
      } else {
        toast({ title: "Product Not Found", description: "No product found for this barcode. You can add it manually.", variant: "destructive" });
        setIsManualEntry(true);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to lookup barcode.", variant: "destructive" });
      console.error(error);
      setIsManualEntry(true);
    } finally {
      setIsLoadingBarcode(false);
    }
  };

  const handleSuggestIngredients = async () => {
    const productNameToSuggest = isManualEntry ? customProductName : foundProductInfo?.productName;
    if (!productNameToSuggest) {
      toast({ title: "Product Name Needed", description: "Please provide a product name before suggesting ingredients.", variant: "destructive" });
      return;
    }
    setIsSuggestingIngredients(true);
    try {
      const result = await guessIngredientsForProduct({ productName: productNameToSuggest });
      if (result.ingredients) {
        setCustomIngredients(result.ingredients);
        toast({ title: "Ingredients Suggested", description: "AI has suggested ingredients based on the product name." });
      } else {
        toast({ title: "No Ingredients Suggested", description: "AI could not determine common ingredients for this product.", variant: "default" });
      }
    } catch (error) {
      console.error("Error suggesting ingredients:", error);
      toast({ title: "AI Error", description: "Failed to suggest ingredients.", variant: "destructive" });
    } finally {
      setIsSuggestingIngredients(false);
    }
  };

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      toast({ title: "Expiry Date Required", description: "Please enter the expiry date.", variant: "destructive" });
      return;
    }
    if (quantity < 1) {
      toast({ title: "Invalid Quantity", description: "Quantity must be at least 1.", variant: "destructive" });
      return;
    }

    const productName = isManualEntry ? customProductName : foundProductInfo?.productName;
    const ingredients = customIngredients.trim() ? customIngredients : (foundProductInfo?.ingredients || 'N/A');

    if (!productName) {
        toast({ title: "Product Name Required", description: "Please enter the product name for manual entry or look up a barcode.", variant: "destructive" });
        return;
    }

    const newProduct: TrackedProduct = {
      id: Date.now().toString(),
      barcode: barcode.trim() || 'MANUAL',
      productName,
      ingredients: ingredients,
      expiryDate,
      uploadDate: getCurrentDateFormatted(),
      status: calculateExpiryStatus(expiryDate),
      quantity,
      category: category.trim() || 'Uncategorized',
    };

    try {
      const existingProductsJSON = localStorage.getItem(LS_PRODUCTS_KEY);
      const existingProducts: TrackedProduct[] = existingProductsJSON ? JSON.parse(existingProductsJSON) : [];
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify([...existingProducts, newProduct]));
      
      toast({ title: "Product Added", description: `${newProduct.productName} has been added to your tracker.` });
      
      setBarcode('');
      setFoundProductInfo(null);
      setExpiryDate('');
      setCustomProductName('');
      setCustomIngredients('');
      setQuantity(1);
      setCategory('');
      setIsManualEntry(false);
      setProductsVersion(v => v + 1); 
      window.dispatchEvent(new CustomEvent('productsUpdated'));

    } catch (error) {
        toast({ title: "Storage Error", description: "Could not save product. Local storage might be full or disabled.", variant: "destructive"});
        console.error("Error saving to localStorage:", error);
    }
  };
  
  const canSuggestIngredients = (isManualEntry && !!customProductName.trim()) || (!!foundProductInfo?.productName.trim());

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Barcode className="h-6 w-6 text-primary" />
            Lookup or Add Product
          </CardTitle>
          <CardDescription>Enter barcode to find product details or add manually.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="barcode-input">Barcode Number</Label>
              <Input
                id="barcode-input"
                type="text"
                placeholder="e.g., 1234567890123"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleBarcodeLookup} disabled={isLoadingBarcode || isSuggestingIngredients} className="w-full sm:w-auto">
              {isLoadingBarcode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoadingBarcode ? 'Looking up...' : 'Lookup Barcode'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(foundProductInfo || isManualEntry) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <PackagePlus className="h-6 w-6 text-primary" />
              Product Details
            </CardTitle>
             {foundProductInfo && !isManualEntry && (
                 <CardDescription>Product: {foundProductInfo.productName}</CardDescription>
             )}
             {isManualEntry && (
                <CardDescription>Manually adding new product. Please fill in the details.</CardDescription>
             )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              {isManualEntry && (
                <div>
                  <Label htmlFor="manual-product-name">Product Name</Label>
                  <Input
                    id="manual-product-name"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder="Enter product name"
                    required
                    className="mt-1"
                  />
                </div>
              )}
              {!isManualEntry && foundProductInfo && (
                <div className="space-y-2 text-sm p-3 bg-secondary/50 rounded-md mb-2">
                  <p><strong>Product Name:</strong> {foundProductInfo.productName}</p>
                  <p><strong>Database Ingredients:</strong> {foundProductInfo.ingredients || 'N/A'}</p>
                </div>
              )}

              <div>
                <Label htmlFor="product-ingredients">Ingredients</Label>
                <div className="flex flex-col sm:flex-row gap-2 items-start">
                  <Input
                    id="product-ingredients"
                    value={customIngredients}
                    onChange={(e) => setCustomIngredients(e.target.value)}
                    placeholder="Enter ingredients, or use AI suggestion"
                    className="mt-1 flex-grow"
                  />
                  {canSuggestIngredients && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestIngredients}
                      disabled={isSuggestingIngredients || isLoadingBarcode}
                      className="mt-1 w-full sm:w-auto"
                    >
                      {isSuggestingIngredients ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Suggest with AI
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Comma-separated. You can edit after AI suggestion.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Dairy, Produce, Pantry"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="mt-1"
                  min={getCurrentDateFormatted()}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto" disabled={isSuggestingIngredients || isLoadingBarcode}>
                <CalendarPlus className="mr-2 h-4 w-4" /> Add to Tracker
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
       {!barcode && !foundProductInfo && !isManualEntry && (
         <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md flex items-start gap-3 text-sm">
            <Info className="h-5 w-5 mt-0.5 shrink-0"/>
            <p>Enter a product barcode to automatically fetch its details, or enable manual entry if the barcode is not found or you wish to add a custom product. You can then use AI to suggest ingredients based on the product name, and set its quantity, category, and expiry date.</p>
         </div>
       )}
       {barcode && !isLoadingBarcode && !foundProductInfo && !isManualEntry && (
         <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0"/>
            <p>Product not found for barcode "{barcode}". You can proceed to add it manually by filling in the product name, quantity, category, then use AI to suggest ingredients, and set the expiry date.</p>
         </div>
       )}

    </div>
  );
}

    