
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, FlaskConical, Leaf, Bot } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <Leaf className="mx-auto h-24 w-24 text-primary" />
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Welcome to NutriTrack AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for tracking food safety, analyzing ingredients, managing expiry dates, and understanding FSSAI guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <ShoppingBasket className="h-10 w-10 text-accent" />
            <div>
              <CardTitle className="text-2xl">Food Management</CardTitle>
              <CardDescription>Track products, manage expiry dates, and get alerts.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Efficiently manage your food inventory. Add products, monitor expiry dates, quantity, and category.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/food-management">
                Go to Food Management
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <FlaskConical className="h-10 w-10 text-accent" />
            <div>
              <CardTitle className="text-2xl">AI Ingredient Analyzer</CardTitle>
              <CardDescription>Analyze ingredients for potential health risks.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Understand your food better. Input ingredients or product names for detailed AI analysis.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/ingredient-analyzer">
                Go to AI Analyzer
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center gap-4">
            <Bot className="h-10 w-10 text-accent" />
            <div>
              <CardTitle className="text-2xl">FSSAI Chatbot</CardTitle>
              <CardDescription>Ask questions about FSSAI rules & regulations.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered answers to your queries about FSSAI guidelines and food safety standards in India.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/fssai-chatbot">
                Go to FSSAI Chatbot
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
