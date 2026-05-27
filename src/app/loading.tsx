export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-gray-200" />
          <div className="h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-gray-200" />
      </div>
      <div className="h-40 rounded-xl bg-gray-100" />
      <div className="h-64 rounded-xl bg-gray-100" />
    </div>
  )
}
