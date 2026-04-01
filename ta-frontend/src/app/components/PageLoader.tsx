export function PageLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="h-72 rounded-xl bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-6 rounded bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    </div>
  );
}