interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({ title = 'No results', description = 'No hackathons found matching your criteria.' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📡</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}
