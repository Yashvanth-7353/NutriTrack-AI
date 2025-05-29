"use client";

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Barcode, CalendarPlus, Info, PackagePlus, AlertTriangle } from 'lucide-react';
import { lookupBarcodeAction } from '@/lib/actions';
import type { BarcodeInfo, TrackedProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCurrentDateFormatted, calculateExpiryStatus } from '@/lib/utils';

const LS_PRODUCTS_KEY = 'nutriTrackProducts';

export default function AddProductSection() {
  const [barcode, setBarcode] = useState('');
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);
  const [foundProductInfo, setFoundProductInfo] = useState<BarcodeInfo | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [customProductName, setCustomProductName] = useState('');
  const [customIngredients, setCustomIngredients] = useState('');
  const [isManualEntry, setIsManualEntry] = useState(false);

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
    setIsManualEntry(false);

    try {
      const product = await lookupBarcodeAction(barcode.trim());
      if (product) {
        setFoundProductInfo(product);
        toast({ title: "Product Found", description: `${product.productName} details loaded.` });
      } else {
        toast({ title: "Product Not Found", description: "No product found for this barcode. You can add it manually.", variant: "destructive" });
        setIsManualEntry(true); // Enable manual entry if barcode not found
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to lookup barcode.", variant: "destructive" });
      console.error(error);
      setIsManualEntry(true); // Enable manual entry on error
    } finally {
      setIsLoadingBarcode(false);
    }
  };

  const handleAddProduct = (e: FormEvent) => {
    e.preventDefault();
    if (!expiryDate) {
      toast({ title: "Expiry Date Required", description: "Please enter the expiry date.", variant: "destructive" });
      return;
    }

    const productName = isManualEntry ? customProductName : foundProductInfo?.productName;
    const ingredients = isManualEntry ? customIngredients : foundProductInfo?.ingredients;

    if (!productName) {
        toast({ title: "Product Name Required", description: "Please enter the product name for manual entry or look up a barcode.", variant: "destructive" });
        return;
    }

    const newProduct: TrackedProduct = {
      id: Date.now().toString(), // Simple unique ID
      barcode: barcode.trim() || 'MANUAL', // Use 'MANUAL' if no barcode was entered (manual mode)
      productName,
      ingredients: ingredients || 'N/A',
      expiryDate,
      uploadDate: getCurrentDateFormatted(),
      status: calculateExpiryStatus(expiryDate),
    };

    try {
      const existingProductsJSON = localStorage.getItem(LS_PRODUCTS_KEY);
      const existingProducts: TrackedProduct[] = existingProductsJSON ? JSON.parse(existingProductsJSON) : [];
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify([...existingProducts, newProduct]));
      
      toast({ title: "Product Added", description: `${newProduct.productName} has been added to your tracker.` });
      
      // Reset form
      setBarcode('');
      setFoundProductInfo(null);
      setExpiryDate('');
      setCustomProductName('');
      setCustomIngredients('');
      setIsManualEntry(false);
      setProductsVersion(v => v + 1); // Trigger re-render for ProductsDisplay

      // Dispatch a custom event to notify ProductsDisplay component
      window.dispatchEvent(new CustomEvent('productsUpdated'));

    } catch (error) {
        toast({ title: "Storage Error", description: "Could not save product. Local storage might be full or disabled.", variant: "destructive"});
        console.error("Error saving to localStorage:", error);
    }
  };
  
  // Placeholder for barcode image upload
  const handleBarcodeImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Image Upload (Demo)",
        description: `File "${file.name}" selected. Actual barcode scanning from image is not implemented in this demo. Please type barcode manually.`,
        variant: "default",
        duration: 5000,
      });
    }
  };


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
            <Button onClick={handleBarcodeLookup} disabled={isLoadingBarcode} className="w-full sm:w-auto">
              {isLoadingBarcode ? 'Looking up...' : 'Lookup Barcode'}
            </Button>
          </div>
           <div className="space-y-1">
            <Label htmlFor="barcode-image-upload">Or Upload Barcode Image (Demo)</Label>
            <Input id="barcode-image-upload" type="file" accept="image/*" onChange={handleBarcodeImageUpload} className="text-sm"/>
            <p className="text-xs text-muted-foreground">Note: Image processing is for demonstration. Please use manual barcode entry.</p>
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
                <>
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
                  <div>
                    <Label htmlFor="manual-ingredients">Ingredients</Label>
                    <Input
                      id="manual-ingredients"
                      value={customIngredients}
                      onChange={(e) => setCustomIngredients(e.target.value)}
                      placeholder="Enter ingredients, comma separated"
                      className="mt-1"
                    />
                  </div>
                </>
              )}
              {!isManualEntry && foundProductInfo && (
                <div className="space-y-2 text-sm p-3 bg-secondary/50 rounded-md">
                  <p><strong>Product Name:</strong> {foundProductInfo.productName}</p>
                  <p><strong>Ingredients:</strong> {foundProductInfo.ingredients || 'N/A'}</p>
                </div>
              )}
              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                  className="mt-1"
                  min={getCurrentDateFormatted()} // Optional: prevent past dates
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <CalendarPlus className="mr-2 h-4 w-4" /> Add to Tracker
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
       {!barcode && !foundProductInfo && !isManualEntry && (
         <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md flex items-start gap-3 text-sm">
            <Info className="h-5 w-5 mt-0.5 shrink-0"/>
            <p>Enter a product barcode to automatically fetch its details, or enable manual entry if the barcode is not found or you wish to add a custom product.</p>
         </div>
       )}
       {barcode && !isLoadingBarcode && !foundProductInfo && !isManualEntry && (
         <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0"/>
            <p>Product not found for barcode "{barcode}". You can proceed to add it manually by filling in the expiry date and optionally overriding product name/ingredients if needed.</p>
         </div>
       )}

    </div>
  );
}
