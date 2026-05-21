import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-card/50 backdrop-blur-sm border-red-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-500/20 rounded-full w-fit">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-500">
                Oops! Algo deu errado
              </CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado na aplicação. Nossos cavaleiros estão investigando!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {import.meta.env.DEV && this.state.error && (
                <details className="bg-muted/20 p-3 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium mb-2">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="text-xs font-mono bg-background/50 p-2 rounded border overflow-auto max-h-32">
                    <div className="text-red-500 mb-1">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={this.handleRetry}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-cosmic-gold text-cosmic-dark hover:bg-cosmic-gold-light"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Se o problema persistir, recarregue a página ou entre em contato com o suporte.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para capturar erros em componentes funcionais
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error; // Isso fará com que o ErrorBoundary pai capture o erro
    }
  }, [error]);

  return { handleError, resetError };
};

export default ErrorBoundary;