export function Spinner({ className = "" }: { className?: string }) {
  return <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
    <div className="w-8 h-8 border-2 border-accent/15 border-t-accent rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </div>;
}
export function PageLoader() {
  return <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4"><Spinner /><p className="text-xs tracking-wide text-text-muted">A moment for something good.</p></div>;
}
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse motion-reduce:animate-none bg-surface-light rounded-xl ${className}`} />;
}
