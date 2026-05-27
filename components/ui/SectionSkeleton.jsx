'use client';

function Shimmer({ className = '' }) {
  return (
    <>
      <div className={`relative overflow-hidden rounded-xl bg-slate-800/80 ${className}`}>
        <div className="absolute inset-0 -translate-x-full animate-[skeletonShimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <style jsx global>{`
        @keyframes skeletonShimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="mt-4 h-7 w-28" />
          <Shimmer className="mt-3 h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80">
      <div className="border-b border-slate-700/50 p-4">
        <Shimmer className="h-4 w-48" />
      </div>
      <div className="divide-y divide-slate-800/70">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: cols }).map((__, colIndex) => (
              <Shimmer key={colIndex} className={`h-4 ${colIndex === 0 ? 'w-full' : 'w-4/5'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderCardSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex gap-2">
                <Shimmer className="h-6 w-24 rounded-full" />
                <Shimmer className="h-6 w-28 rounded-full" />
              </div>
              <Shimmer className="mt-4 h-7 w-48" />
              <Shimmer className="mt-3 h-4 w-72 max-w-full" />
            </div>
            <div className="w-44">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="mt-3 h-8 w-36" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_176px]">
            <div className="rounded-2xl bg-slate-950/50 p-3">
              <Shimmer className="h-4 w-full" />
              <Shimmer className="mt-3 h-4 w-5/6" />
              <Shimmer className="mt-3 h-4 w-3/4" />
            </div>
            <div className="grid gap-2">
              <Shimmer className="h-9 w-full" />
              <Shimmer className="h-9 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SectionSkeleton({ type = 'table' }) {
  return (
    <div className="space-y-4">
      <CardSkeleton />
      {type === 'orders' ? <OrderCardSkeleton /> : <TableSkeleton />}
    </div>
  );
}
