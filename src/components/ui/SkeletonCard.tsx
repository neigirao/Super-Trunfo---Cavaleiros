import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  variant?: "element" | "list" | "compact";
  className?: string;
}

/**
 * SkeletonCard Component
 * 
 * Skeleton loaders para diferentes tipos de cards:
 * - element: Card de elemento químico (para Collection)
 * - list: Item de lista (para Ranking)
 * - compact: Card compacto genérico
 */
export function SkeletonCard({ variant = "element", className }: SkeletonCardProps) {
  
  if (variant === "list") {
    return (
      <div className={cn(
        "flex items-center space-x-4 p-4 bg-card rounded-lg border border-border",
        className
      )}>
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-[60%]" />
          <Skeleton className="h-3 w-[40%]" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "p-4 bg-card rounded-lg border border-border space-y-3",
        className
      )}>
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    );
  }

  // variant === "element"
  return (
    <div className={cn(
      "relative bg-card rounded-xl border-2 border-border overflow-hidden shadow-lg",
      className
    )}>
      {/* Header com símbolo */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-6 w-16 mx-auto" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </div>

      {/* Imagem */}
      <Skeleton className="w-full h-48" />

      {/* Informações */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-[80%]" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      </div>

      {/* Badge */}
      <div className="absolute top-2 right-2">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Grid de Skeleton Cards
 * Útil para mostrar múltiplos cards carregando
 */
export function SkeletonCardGrid({ 
  count = 6, 
  variant = "element",
  className 
}: { 
  count?: number; 
  variant?: "element" | "list" | "compact";
  className?: string;
}) {
  return (
    <div className={cn(
      variant === "list" 
        ? "space-y-4" 
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant={variant} />
      ))}
    </div>
  );
}
