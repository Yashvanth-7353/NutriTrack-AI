
"use client";

import type { ReactNode } from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Trash2, AlertTriangle, CheckCircle2, XCircle, Info, PlusCircle, MinusCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
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

type SortableKey = 'productName' | 'expiryDate' | 'uploadDate' | 'status';
type SortConfig = {
  key: SortableKey;
  direction: 'asc' | 'desc';
};
type FilterStatus = TrackedProduct['status'] | 'all';

const statusOrder: Record<TrackedProduct['status'], number> = {
  'Valid': 1,
  'Near Expiry': 2,
  'Expired': 3,
};

export default function ProductsDisplay() {
  const [rawProducts, setRawProducts] = useState<TrackedProduct[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<TrackedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'expiryDate', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const processAndSetProducts = useCallback((productsToProcess: TrackedProduct[]) => {
    let processed = [...productsToProcess].map(p => ({
      ...p,
      status: calculateExpiryStatus(p.expiryDate),
      quantity: p.quantity || 1,
      category: p.category || 'Uncategorized',
    }));

    // Apply filter
    if (filterStatus !== 'all') {
      processed = processed.filter(p => p.status === filterStatus);
    }

    // Apply sort
    processed.sort((a, b) => {
      let comparison = 0;
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];

      if (sortConfig.key === 'status') {
        comparison = statusOrder[a.status] - statusOrder[b.status];
      } else if (sortConfig.key === 'expiryDate' || sortConfig.key === 'uploadDate') {
        comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }

      return sortConfig.direction === 'asc' ? comparison : comparison * -1;
    });
    
    setDisplayedProducts(processed);
  }, [sortConfig, filterStatus]);


  const loadProducts = useCallback(() => {
    setIsLoading(true);
    try {
      const storedProductsJSON = localStorage.getItem(LS_PRODUCTS_KEY);
      const loadedFromStorage: TrackedProduct[] = storedProductsJSON ? JSON.parse(storedProductsJSON) : [];
      setRawProducts(loadedFromStorage);
    } catch (error) {
      console.error("Failed to load products from localStorage", error);
      toast({ title: "Error", description: "Could not load products.", variant: "destructive" });
      setRawProducts([]);
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

  useEffect(() => {
    if (!isLoading) {
      processAndSetProducts(rawProducts);
    }
  }, [rawProducts, sortConfig, filterStatus, isLoading, processAndSetProducts]);


  const handleUpdateQuantity = (productId: string, change: number) => {
    try {
      const updatedRawProducts = rawProducts.map(p => {
        if (p.id === productId) {
          const newQuantity = (p.quantity || 1) + change;
          return { ...p, quantity: Math.max(1, newQuantity) };
        }
        return p;
      });
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedRawProducts));
      setRawProducts(updatedRawProducts); // This will trigger re-processing
      toast({ title: "Quantity Updated", description: "Product quantity has been adjusted." });
    } catch (error) {
      console.error("Failed to update quantity in localStorage", error);
      toast({ title: "Error", description: "Could not update quantity.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = (productId: string) => {
    try {
      const updatedRawProducts = rawProducts.filter(p => p.id !== productId);
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedRawProducts));
      setRawProducts(updatedRawProducts); // This will trigger re-processing
      toast({ title: "Product Removed", description: "The product has been removed from your tracker." });
    } catch (error) {
      console.error("Failed to delete product from localStorage", error);
      toast({ title: "Error", description: "Could not remove product.", variant: "destructive" });
    }
  };

  const requestSort = (key: SortableKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortableKey): ReactNode => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="ml-2 h-3 w-3 text-primary" /> : 
      <ArrowDown className="ml-2 h-3 w-3 text-primary" />;
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
            <Label htmlFor="status-filter" className="text-sm">Filter by Status:</Label>
            <Select
                value={filterStatus}
                onValueChange={(value: string) => setFilterStatus(value as FilterStatus)}
            >
                <SelectTrigger id="status-filter" className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Valid">Valid</SelectItem>
                <SelectItem value="Near Expiry">Near Expiry</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={() => exportToCSV(displayedProducts)} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Download as CSV
        </Button>
      </div>

      {displayedProducts.length === 0 && !isLoading && (
         <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">
              {filterStatus === 'all' ? 'No products tracked yet.' : `No products match the filter "${filterStatus}".`}
            </p>
            <p className="text-sm text-muted-foreground">
              {filterStatus === 'all' ? 'Add products using the form above to see them here.' : 'Try a different filter or add more products.'}
            </p>
        </div>
      )}

      {displayedProducts.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableCaption>
              A list of your tracked food products. 
              Currently sorted by {sortConfig.key} ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
              {filterStatus !== 'all' && `, filtered by status: ${filterStatus}`}.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead 
                    className="w-[180px] cursor-pointer hover:bg-muted/50 group"
                    onClick={() => requestSort('productName')}
                >
                    <div className="flex items-center">Product Name {getSortIcon('productName')}</div>
                </TableHead>
                <TableHead>Barcode</TableHead>
                <TableHead className="w-[80px]">Qty</TableHead>
                <TableHead>Category</TableHead>
                <TableHead 
                    className="cursor-pointer hover:bg-muted/50 group"
                    onClick={() => requestSort('expiryDate')}
                >
                    <div className="flex items-center">Expiry Date {getSortIcon('expiryDate')}</div>
                </TableHead>
                <TableHead 
                    className="cursor-pointer hover:bg-muted/50 group"
                    onClick={() => requestSort('uploadDate')}
                >
                    <div className="flex items-center">Upload Date {getSortIcon('uploadDate')}</div>
                </TableHead>
                <TableHead 
                    className="cursor-pointer hover:bg-muted/50 group"
                    onClick={() => requestSort('status')}
                >
                    <div className="flex items-center">Status {getSortIcon('status')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedProducts.map((product) => (
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
      )}
    </div>
  );
}

