import type { ReactNode } from 'react';
import Header from './Header';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted/50 text-muted-foreground py-6 text-center text-sm">
        <div className="mt-3 pt-3 border-t border-muted-foreground/20">
          <p className="font-semibold mb-1">Developed by:</p>
          <ul className="space-y-0.5">
            <li>Yashvanth M U (1RV23IS141)</li>
            <li>Yashwanth Rathi (1RV23IS142)</li>
            <li>V Nikhil (1RV23IS132)</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
