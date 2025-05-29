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
      <footer className="bg-muted/50 text-muted-foreground py-4 text-center text-sm">
        © {new Date().getFullYear()} NutriTrack AI. All rights reserved.
      </footer>
    </div>
  );
}
