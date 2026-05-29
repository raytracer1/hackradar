'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="mb-4 text-6xl">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-2 text-gray-500">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}
