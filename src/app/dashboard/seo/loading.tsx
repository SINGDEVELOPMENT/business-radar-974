// Skeleton — SEO (seo/page.tsx)
// Reflects: 4 score cards | CWV card | 3 KPI cards | history chart |
//           on-page analysis card (2 col) + structured data card | issues card

function SkeletonScoreCard() {
  return (
    <div className="rounded-xl border bg-card p-4 flex flex-col items-center gap-1 animate-pulse">
      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 mb-1" />
      <div className="h-9 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
      <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full mt-0.5" />
    </div>
  )
}

function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

function SkeletonCwvCard() {
  return (
    <div className="rounded-xl p-3 bg-gray-100 dark:bg-gray-800 flex flex-col gap-1 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-2.5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

function SkeletonOnPageRow() {
  return (
    <div className="flex items-start gap-2 animate-pulse">
      <div className="h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 mt-0.5" />
      <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
      <div className="h-3.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

export default function SeoLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-1.5">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-60 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* 4 score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonScoreCard key={i} />
        ))}
      </div>

      {/* Core Web Vitals card */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded ml-auto" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonCwvCard key={i} />
          ))}
        </div>
      </div>

      {/* 3 technical KPI cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* History chart */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* On-page analysis + structured data (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((col) => (
          <div key={col} className="rounded-xl border bg-card p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonOnPageRow key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Issues card */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-5 w-8 bg-gray-200 dark:bg-gray-700 rounded-full ml-auto" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mt-1.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
