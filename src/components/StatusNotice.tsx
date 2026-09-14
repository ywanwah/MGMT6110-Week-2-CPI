import { AlertCircle, AlertTriangle, CloudOff, Loader2, RefreshCw } from 'lucide-react';

interface StatusNoticeProps {
  type: 'loading' | 'empty' | 'refused' | 'unreachable';
  sentence: string;
  details?: string;
  onRetry?: () => void;
}

export function StatusNotice({ type, sentence, details, onRetry }: StatusNoticeProps) {
  const configs = {
    loading: {
      icon: Loader2,
      iconClass: 'text-sky-600 animate-spin',
      bgClass: 'bg-sky-50 border-sky-200 text-sky-900',
      badge: 'Data Loading',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300'
    },
    empty: {
      icon: AlertCircle,
      iconClass: 'text-amber-600',
      bgClass: 'bg-amber-50 border-amber-200 text-amber-900',
      badge: 'Data Empty',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    refused: {
      icon: AlertTriangle,
      iconClass: 'text-rose-600',
      bgClass: 'bg-rose-50 border-rose-200 text-rose-900',
      badge: 'Upstream Refused',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    unreachable: {
      icon: CloudOff,
      iconClass: 'text-slate-600',
      bgClass: 'bg-slate-50 border-slate-200 text-slate-900',
      badge: 'Upstream Unreachable',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div
      id={`status-notice-${type}`}
      className={`rounded-xl border p-6 my-6 shadow-xs ${config.bgClass} transition-all`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-white/80 shadow-xs shrink-0">
            <Icon className={`w-6 h-6 ${config.iconClass}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config.badgeClass}`}>
                {config.badge}
              </span>
            </div>
            {/* The primary explicit sentence requested by the user */}
            <p className="text-base font-medium tracking-tight leading-relaxed">
              {sentence}
            </p>
            {details && (
              <p className="text-xs opacity-80 font-mono break-all pt-1">
                {details}
              </p>
            )}
          </div>
        </div>

        {onRetry && type !== 'loading' && (
          <button
            id={`retry-button-${type}`}
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition shadow-xs cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Query
          </button>
        )}
      </div>
    </div>
  );
}
