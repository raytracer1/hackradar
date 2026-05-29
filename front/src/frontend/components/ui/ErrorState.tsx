interface ErrorStateProps {
  message?: string;
}

export default function ErrorState({ message = 'Something went wrong. Please try again later.' }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900">Error</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
    </div>
  );
}
