// Skeleton — Vue d'ensemble (dashboard/page.tsx)
// Reflects: 4 KPI cards + AI insight card section

function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

function SkeletonAiCard() {
  return (
    <div className="rounded-xl border bg-card p-6 animate-pulse">
      <div className="flex items-start gap-5">
        {/* Score circle */}
        <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 shrink-0" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-4/6 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-2.5 w-full bg-gray-100 dark:bg-gray-700/50 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-1.5">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Section label */}
      <div className="animate-pulse h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />

      {/* AI insight card */}
      <SkeletonAiCard />
    </div>
  )
}
