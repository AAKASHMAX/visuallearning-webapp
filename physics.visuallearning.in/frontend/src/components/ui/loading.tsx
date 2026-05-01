"use client";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="flex flex-col items-center gap-4">
        {/* Atom animation */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-accent animate-pulse" />
          </div>
          <div className="absolute inset-0 border-2 border-accent/30 rounded-full animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-1 border-2 border-secondary/30 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          <div className="absolute inset-2 border-2 border-energy/30 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
        </div>
        <p className="text-text-muted text-sm animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin ${className}`} />
  );
}
