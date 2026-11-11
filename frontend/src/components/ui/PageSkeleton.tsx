const block = 'bg-gray-100 dark:bg-slate-800 rounded-2xl';

export function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${block} h-[140px]`} />
        ))}
      </div>
      <div className={`${block} h-72`} />
      <div className={`${block} h-72`} />
    </div>
  );
}
