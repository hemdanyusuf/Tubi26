import { AlertCircle, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Veriler yükleniyor...' }: { label?: string }) {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center gap-3 text-text-muted-light">
      <LoaderCircle className="w-8 h-8 animate-spin" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>
      <div>
        <h2 className="font-bold text-text-dark">Bir sorun oluştu</h2>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-primary font-bold text-sm hover:bg-primary-hover">
          Yeniden Dene
        </button>
      )}
    </div>
  );
}
