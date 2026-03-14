// src/components/shared/ErrorBoundary.tsx

import * as React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center p-12 space-y-6 border-accent-red/30">
            <div className="h-20 w-20 rounded-3xl bg-accent-red/10 flex items-center justify-center text-accent-red mx-auto">
              <AlertTriangle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-text-primary">Something went wrong</h2>
              <p className="text-text-muted text-sm">
                An unexpected error occurred in the application. Our team has been notified.
              </p>
            </div>
            {this.state.error && (
              <div className="p-4 rounded-xl bg-black/20 text-left overflow-x-auto">
                <code className="text-[10px] text-accent-red font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Reload Application
            </Button>
          </Card>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
