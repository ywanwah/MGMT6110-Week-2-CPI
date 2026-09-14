import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, ShieldAlert, XCircle, RefreshCw, X, Server } from 'lucide-react';
import type { HealthResponse } from '../types';

interface HealthStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HealthStatusModal({ isOpen, onClose }: HealthStatusModalProps) {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health');
      const data: HealthResponse = await res.json();
      setHealth(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to check server health');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div
        id="health-diagnostics-modal"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100/60 text-blue-700">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Health Diagnostics</h3>
              <p className="text-xs text-slate-500">SingStat API route status check</p>
            </div>
          </div>
          <button
            id="close-health-modal"
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {loading ? (
            <div className="py-8 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-600 font-medium">Checking /api/health endpoint...</p>
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              <p className="font-semibold">Request Error</p>
              <p>{error}</p>
            </div>
          ) : health ? (
            <div className="space-y-3">
              {/* Credential Status */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900">SINGSTAT_API_KEY Configured</div>
                  <div className="text-slate-500">Required environment variable check</div>
                </div>
                {health.keyConfigured ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <ShieldAlert className="w-3.5 h-3.5" /> Missing
                  </span>
                )}
              </div>

              {/* Upstream Answered */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900">Upstream Response</div>
                  <div className="text-slate-500">SingStat TableBuilder API response check</div>
                </div>
                {health.upstreamAnswered ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Answered
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <XCircle className="w-3.5 h-3.5" /> Unanswered
                  </span>
                )}
              </div>

              {/* Upstream HTTP Status */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900">Upstream HTTP Status</div>
                  <div className="text-slate-500">Status code returned by SingStat</div>
                </div>
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                  {health.upstreamStatus ? `HTTP ${health.upstreamStatus}` : 'N/A'}
                </span>
              </div>

              {health.error && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                  <div className="font-semibold">Notice</div>
                  <p>{health.error}</p>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                <span>Credential value is securely kept on serverless environment and never exposed.</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            id="refresh-health-btn"
            type="button"
            onClick={fetchHealth}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition cursor-pointer text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </button>
          <button
            id="dismiss-health-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
