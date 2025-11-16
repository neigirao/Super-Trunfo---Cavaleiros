export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-cosmic-nebula to-cosmic-dark flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        {/* Animated cosmic loader */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-cosmic-gold-light border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
          <div className="absolute inset-4 rounded-full border-4 border-cosmic-purple border-l-transparent animate-spin" style={{ animationDuration: '0.75s' }} />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Carregando cosmos...
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparando sua jornada pelos elementos
          </p>
        </div>
      </div>
    </div>
  );
}