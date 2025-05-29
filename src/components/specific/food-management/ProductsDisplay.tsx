"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Trash2, AlertTriangle, CheckCircle2, XCircle, Info, PlusCircle, MinusCircle } from 'lucide-react';
import type { TrackedProduct } from '@/lib/types';
import { formatDate, calculateExpiryStatus, exportToCSV } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LS_PRODUCTS_KEY = 'nutriTrackProducts';

export default function ProductsDisplay() {
  const [products, setProducts] = useState<TrackedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadProducts = useCallback(() => {
    setIsLoading(true);
    try {
      const storedProductsJSON = localStorage.getItem(LS_PRODUCTS_KEY);
      const storedProducts: TrackedProduct[] = storedProductsJSON ? JSON.parse(storedProductsJSON) : [];
      
      const updatedProducts = storedProducts.map(p => ({
        ...p,
        status: calculateExpiryStatus(p.expiryDate),
        quantity: p.quantity || 1, // Ensure quantity exists, default to 1
        category: p.category || 'Uncategorized', // Ensure category exists
      })).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      setProducts(updatedProducts);
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      toast({ title: "Error", description: "Could not load products.", variant: "destructive" });
      setProducts([]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadProducts();
    window.addEventListener('productsUpdated', loadProducts);
    return () => {
      window.removeEventListener('productsUpdated', loadProducts);
    };
  }, [loadProducts]);

  const handleUpdateQuantity = (productId: string, change: number) => {
    try {
      const updatedProducts = products.map(p => {
        if (p.id === productId) {
          const newQuantity = (p.quantity || 1) + change;
          return { ...p, quantity: Math.max(1, newQuantity) }; // Ensure quantity is at least 1
        }
        return p;
      });
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      toast({ title: "Quantity Updated", description: "Product quantity has been adjusted." });
    } catch (error) {
      console.error("Failed to update quantity in localStorage", error);
      toast({ title: "Error", description: "Could not update quantity.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      const updatedProducts = products.filter(p => p.id !== productId);
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      toast({ title: "Product Removed", description: "The product has been removed from your tracker." });
    } catch (error) {
      console.error("Failed to delete product from localStorage", error);
      toast({ title: "Error", description: "Could not remove product.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: TrackedProduct['status']) => {
    switch (status) {
      case 'Valid':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="mr-1 h-3 w-3" />Valid</Badge>;
      case 'Near Expiry':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-black"><AlertTriangle className="mr-1 h-3 w-3" />Near Expiry</Badge>;
      case 'Expired':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground">Loading products...</p>;
  }

  if (products.length === 0) {
    return (
      <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center">
        <Info className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-lg font-semibold text-muted-foreground">No products tracked yet.</p>
        <p className="text-sm text-muted-foreground">Add products using the form above to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => exportToCSV(products)} variant="outline" className="mb-4">
        <Download className="mr-2 h-4 w-4" /> Download as CSV
      </Button>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableCaption>A list of your tracked food products. Products are sorted by expiry date.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Product Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead className="w-[80px]">Qty</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className={
                product.status === 'Expired' ? 'bg-destructive/10' : product.status === 'Near Expiry' ? 'bg-yellow-400/10' : ''
              }>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 sm:h-7 sm:w-7" 
                      onClick={() => handleUpdateQuantity(product.id, -1)}
                      disabled={(product.quantity || 1) <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium w-4 text-center">{product.quantity || 1}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 sm:h-7 sm:w-7"
                      onClick={() => handleUpdateQuantity(product.id, 1)}
                      aria-label="Increase quantity"
                    >
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{product.category || 'Uncategorized'}</TableCell>
                <TableCell>{formatDate(product.expiryDate)}</TableCell>
                <TableCell>{formatDate(product.uploadDate)}</TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete product">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{product.productName}" (Quantity: {product.quantity}) from your tracker.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
