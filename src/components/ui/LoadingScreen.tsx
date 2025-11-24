import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  variant?: "splash" | "inline" | "overlay";
  message?: string;
  className?: string;
}

/**
 * LoadingScreen Component
 * 
 * Variações:
 * - splash: Tela cheia com fundo gradient (para carregamento inicial)
 * - inline: Loading compacto para uso dentro de componentes
 * - overlay: Overlay sobre conteúdo existente
 */
export default function LoadingScreen({ 
  variant = "splash", 
  message = "Carregando...",
  className 
}: LoadingScreenProps) {
  
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50",
        className
      )}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-cosmic-gold-light border-b-transparent animate-spin" 
                 style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          </div>
          <p className="text-base font-medium text-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // variant === "splash"
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-6">
        {/* Animated cosmic loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-cosmic-gold-light border-b-transparent animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          <div className="absolute inset-4 rounded-full border-4 border-cosmic-purple border-l-transparent animate-spin" 
               style={{ animationDuration: '0.75s' }} />
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {message}
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparando sua jornada pelos elementos
          </p>
        </div>
      </div>
    </div>
  );
}
