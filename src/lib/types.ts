export interface BarcodeInfo {
  barcode: string;
  productName: string;
  ingredients: string;
}

export interface TrackedProduct {
  id: string; // unique id for the tracked item instance
  productName: string;
  barcode: string;
  expiryDate: string; // YYYY-MM-DD
  uploadDate: string; // YYYY-MM-DD
  status: 'Valid' | 'Near Expiry' | 'Expired';
  ingredients: string;
}
