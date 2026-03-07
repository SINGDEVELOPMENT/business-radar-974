// Skeleton — Avis Google (reviews/page.tsx)
// Reflects: header + export button | 4 KPI cards | chart | reviews list

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

function SkeletonReviewItem() {
  return (
    <div className="rounded-xl border bg-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            {/* Stars */}
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function ReviewsLoading() {
  return (
    <div className="space-y-6">
      {/* Header row with export button */}
      <div className="flex items-start justify-between gap-3 flex-wrap animate-pulse">
        <div className="space-y-1.5">
          <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>

      {/* 4 KPI cards (2 cols on mobile, 4 on lg) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* Recent activity line */}
      <div className="animate-pulse flex items-center gap-2">
        <div className="h-4 w-4 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-3.5 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 animate-pulse flex-wrap">
        {[80, 64, 72, 64].map((w, i) => (
          <div key={i} className={`h-8 w-${w === 80 ? '20' : w === 64 ? '16' : '18'} bg-gray-200 dark:bg-gray-700 rounded-full`}
            style={{ width: `${w}px` }} />
        ))}
      </div>

      {/* Reviews list — 5 items */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonReviewItem key={i} />
        ))}
      </div>
    </div>
  )
}
