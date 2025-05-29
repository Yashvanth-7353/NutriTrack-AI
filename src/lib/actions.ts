'use server';

import fs from 'fs/promises';
import path from 'path';
import type { BarcodeInfo } from './types';

// This function simulates looking up a barcode in a local JSON database.
// In a real application, this could be an actual database query.
export async function lookupBarcodeAction(barcode: string): Promise<BarcodeInfo | null> {
  try {
    // Construct the path to barcodes.json within the public directory
    // For server-side access, it's better to read from project dir if possible and not rely on public for data files meant for backend
    // For simplicity with Next.js deployment, placing in project root or a known server-readable path.
    // Let's assume barcodes.json is in `src/data` for server actions.
    // Adjust path if you place it elsewhere, e.g., `data/barcodes.json` at project root.
    const filePath = path.join(process.cwd(), 'public/data/barcodes.json'); // Corrected path
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const barcodeDatabase: BarcodeInfo[] = JSON.parse(fileContent);
    
    const product = barcodeDatabase.find(item => item.barcode === barcode);
    
    return product || null;
  } catch (error) {
    console.error('Error looking up barcode:', error);
    // It's good practice to not expose detailed error messages to the client.
    // throw new Error('Failed to lookup barcode due to a server error.');
    // For this app, returning null is sufficient to indicate not found or error.
    return null; 
  }
}
