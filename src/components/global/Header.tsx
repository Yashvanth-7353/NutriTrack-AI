
import Link from 'next/link';
import { Leaf, ShoppingBasket, FlaskConical, Home, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-semibold hover:opacity-90 transition-opacity">
          <Leaf className="h-8 w-8 text-accent" />
          <span>NutriTrack AI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Link href="/" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Link href="/food-management" className="flex items-center gap-1">
              <ShoppingBasket className="h-4 w-4" />
              <span className="hidden sm:inline">Food Mgmt</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Link href="/ingredient-analyzer" className="flex items-center gap-1">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">AI Analyzer</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Link href="/fssai-chatbot" className="flex items-center gap-1">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">FSSAI Chat</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
