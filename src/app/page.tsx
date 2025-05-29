import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBasket, FlaskConical, Leaf } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-4">
        <Leaf className="mx-auto h-24 w-24 text-primary" />
        <h1 className="text-5xl font-bold tracking-tight text-foreground">
          Welcome to NutriTrack AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your intelligent assistant for tracking food safety, analyzing ingredients, and managing expiry dates. Keep your pantry healthy and safe with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
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
              Efficiently manage your food inventory. Add products using barcodes, monitor their expiry dates, and receive timely notifications to reduce waste and ensure safety.
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
              Leverage the power of AI to understand your food better. Input a list of ingredients and get a detailed analysis of potential health concerns and harmful substances.
            </p>
            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/ingredient-analyzer">
                Go to AI Analyzer
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
