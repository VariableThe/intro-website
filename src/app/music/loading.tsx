export default function MusicLoading() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header skeleton */}
        <div className="mb-16 pt-8">
          <div className="h-12 w-48 bg-foreground/5 animate-pulse mb-4" />
          <div className="h-5 w-96 bg-foreground/5 animate-pulse" />
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-foreground/5 animate-pulse" />
          ))}
        </div>

        {/* Now Playing skeleton */}
        <div className="mb-16 h-48 bg-foreground/5 animate-pulse" />

        {/* Two column grid skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="h-64 bg-foreground/5 animate-pulse" />
          <div className="h-64 bg-foreground/5 animate-pulse" />
        </div>

        {/* Wide section skeleton */}
        <div className="mb-16 h-80 bg-foreground/5 animate-pulse" />

        {/* Album grid skeleton */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-16">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-foreground/5 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
