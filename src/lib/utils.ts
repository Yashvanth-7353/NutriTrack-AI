import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays, parseISO } from 'date-fns';
import type { TrackedProduct } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

export function getCurrentDateFormatted(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function calculateExpiryStatus(expiryDateStr: string): 'Valid' | 'Near Expiry' | 'Expired' {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day
  
  let expiryDate;
  try {
    expiryDate = parseISO(expiryDateStr);
  } catch (error) {
    console.error("Invalid date format for expiry:", expiryDateStr);
    return 'Expired'; // Default to expired if date is invalid
  }
  
  const daysUntilExpiry = differenceInDays(expiryDate, today);

  if (daysUntilExpiry < 0) {
    return 'Expired';
  }
  if (daysUntilExpiry <= 7) {
    return 'Near Expiry';
  }
  return 'Valid';
}

export function exportToCSV(products: TrackedProduct[]): void {
  if (!products.length) {
    alert("No products to export.");
    return;
  }
  const headers = ['Product Name', 'Barcode', 'Quantity', 'Category', 'Expiry Date', 'Upload Date', 'Status', 'Ingredients'];
  const csvRows = [
    headers.join(','),
    ...products.map(p => [
      `"${p.productName.replace(/"/g, '""')}"`,
      p.barcode,
      p.quantity,
      `"${(p.category || 'Uncategorized').replace(/"/g, '""')}"`,
      p.expiryDate,
      p.uploadDate,
      p.status,
      `"${(p.ingredients || '').replace(/"/g, '""')}"`
    ].join(','))
  ];
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'nutriTrack_products.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
