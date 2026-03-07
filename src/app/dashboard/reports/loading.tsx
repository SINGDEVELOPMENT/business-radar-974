// Skeleton — Rapports AI (reports/page.tsx)
// Reflects: header | action bar (badge + buttons) |
//           latest report: score circle + summary card | strengths/weaknesses (2 col) |
//           recommendations card | previous reports list

function SkeletonReportCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse space-y-4">
      {/* Report type badge + date */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-3.5 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* Summary card: score circle + text */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-start gap-5">
          {/* Score circle */}
          <div className="w-20 h-20 rounded-full border-4 border-gray-200 dark:border-gray-700 shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-4/6 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>

      {/* Strengths + weaknesses (2 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-5 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="space-y-2.5">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-start gap-2">
                  <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded shrink-0 mt-0.5" />
                  <div className="h-3 flex-1 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations card */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border p-3.5 bg-gray-50 dark:bg-gray-800/50 animate-pulse">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-3 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-2.5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded pl-6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SkeletonPreviousReport() {
  return (
    <div className="rounded-xl border bg-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3.5 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded shrink-0" />
      </div>
      <div className="mt-2 space-y-1.5">
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
        <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    </div>
  )
}

export default function ReportsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-1.5">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* Action bar: usage badge + buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-5 w-44 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 w-44 bg-blue-200 dark:bg-blue-900 rounded-lg" />
        </div>
      </div>

      {/* Latest report (main block) */}
      <SkeletonReportCard />

      {/* Previous reports section */}
      <div className="space-y-2">
        <div className="animate-pulse h-3.5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <SkeletonPreviousReport key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
