// Skeleton — Concurrents (competitors/page.tsx)
// Reflects: title | management card (list of competitors) |
//           4 KPI cards | chart | competitor detail cards (2 col grid)
// Note: CompetitorsPageClient has its own internal Loader2 spinner.
// This loading.tsx covers the Suspense boundary during the server component auth check.

function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

function SkeletonCompetitorRow() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 animate-pulse">
      <div className="flex-1 space-y-1.5 min-w-0">
        <div className="h-3.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-3">
          <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-14 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 ml-3 shrink-0" />
    </div>
  )
}

function SkeletonCompetitorCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 animate-pulse">
      {/* Card header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-44 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-6 w-28 bg-gray-100 dark:bg-gray-800 rounded-full shrink-0" />
      </div>
      {/* 2×2 metric tiles */}
      <div className="grid grid-cols-2 gap-3">
        {[
          'bg-amber-50 dark:bg-amber-500/10',
          'bg-blue-50 dark:bg-blue-500/10',
          'bg-purple-50 dark:bg-purple-500/10',
          'bg-gray-50 dark:bg-slate-800',
        ].map((cls, i) => (
          <div key={i} className={`flex flex-col gap-1 p-3 rounded-xl ${cls}`}>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CompetitorsLoading() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="animate-pulse space-y-1">
        <div className="h-7 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-60 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* Competitors management card */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="space-y-2 mb-4">
          <SkeletonCompetitorRow />
          <SkeletonCompetitorRow />
        </div>
        <div className="h-4 w-52 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* Competitor detail cards (2 col) */}
      <div className="space-y-3">
        <div className="animate-pulse h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonCompetitorCard />
          <SkeletonCompetitorCard />
        </div>
      </div>
    </div>
  )
}
