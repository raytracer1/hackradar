export default function HackathonDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6">
      <div className="h-64 w-full rounded-xl bg-gray-200" />
      <div className="flex gap-3">
        <div className="h-6 w-20 rounded-full bg-gray-200" />
        <div className="h-6 w-24 rounded-full bg-gray-200" />
      </div>
      <div className="h-10 w-3/4 rounded bg-gray-200" />
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="mt-1 h-5 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-5 w-full rounded bg-gray-200" />
        <div className="h-5 w-5/6 rounded bg-gray-200" />
        <div className="h-5 w-4/6 rounded bg-gray-200" />
      </div>
    </div>
  );
}
