import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-ghost-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-brand-400 animate-spin-slow" />
        </div>
        <p className="mt-4 text-gray-400 text-sm animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-ghost-400 animate-spin" />
      <p className="mt-3 text-gray-400 text-sm">{message}</p>
    </div>
  );
}
