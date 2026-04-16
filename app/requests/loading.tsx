export default function RequestsLoading() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar skeleton */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col z-50">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="h-9 w-28 bg-muted animate-pulse rounded" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ))}
          <div className="pt-4 pb-2">
            <div className="h-3 w-12 bg-muted/40 animate-pulse rounded mx-3" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-12 bg-muted/60 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 ml-64">
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8 space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-72 bg-muted/60 animate-pulse rounded" />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-24 bg-muted/40 animate-pulse rounded-lg" />
            ))}
          </div>

          {/* Request cards skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 bg-card border border-border rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted/60 animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-20 bg-muted/40 animate-pulse rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
