// Skeleton — Réseaux Sociaux (social/page.tsx)
// Reflects: 4 KPI cards | FB vs IG comparison card |
//           engagement chart | best post card | top-5 posts list

function SkeletonKpiCard() {
  return (
    <div className="rounded-xl border bg-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1.5" />
      <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
    </div>
  )
}

function SkeletonPlatformStat() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
        <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded-full ml-auto" />
      </div>
      <div className="space-y-2 pl-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonTopPost({ rank }: { rank: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold text-gray-100 dark:text-gray-800 w-6 shrink-0 select-none">
          {rank}
        </span>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="flex items-center gap-4 mt-1">
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SocialLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-pulse space-y-1.5">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-64 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>

      {/* Facebook vs Instagram comparison card */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SkeletonPlatformStat />
          <SkeletonPlatformStat />
        </div>
      </div>

      {/* Engagement chart */}
      <div className="rounded-xl border bg-card p-5 animate-pulse">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* Best post card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-amber-200 dark:bg-amber-700 rounded" />
          <div className="h-4 w-28 bg-amber-200 dark:bg-amber-700 rounded" />
        </div>
        <div className="flex items-start gap-3">
          <div className="h-5 w-16 bg-amber-200 dark:bg-amber-700 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-3 w-4/5 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="flex gap-4 mt-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 posts */}
      <div className="space-y-3">
        <div className="animate-pulse h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3, 4, 5].map((rank) => (
          <SkeletonTopPost key={rank} rank={rank} />
        ))}
      </div>
    </div>
  )
}
