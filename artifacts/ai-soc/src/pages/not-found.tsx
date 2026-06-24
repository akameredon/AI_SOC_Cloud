import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-background/50">
      <Card className="w-full max-w-md mx-4 bg-card/50 border-destructive/20 shadow-2xl">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/30">
            <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-mono font-bold tracking-widest text-foreground uppercase">
              System Fault 404
            </h1>
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Requested telemetry module not found
            </p>
          </div>

          <Link href="/">
            <Button variant="outline" className="font-mono tracking-widest uppercase border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
              Return to Control
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
