export function PageLoading({ label = 'Loading SODA...' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 animate-fade-in">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  )
}
