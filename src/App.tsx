import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, Activity, Layers, ExternalLink } from 'lucide-react';
import type { FetchState } from './types';
import { CpiMetricCard } from './components/CpiMetricCard';
import { CpiTrendChart } from './components/CpiTrendChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { StatusNotice } from './components/StatusNotice';
import { HealthStatusModal } from './components/HealthStatusModal';

export default function App() {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: 'loading',
    sentence: 'Loading Singapore Consumer Price Index data from SingStat...'
  });

  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const fetchCpiData = useCallback(async () => {
    // Case 1: The data is loading
    setFetchState({
      status: 'loading',
      sentence: 'Loading Singapore Consumer Price Index data from SingStat...'
    });

    try {
      const response = await fetch('/api/cpi');

      // Check if upstream / serverless function returned non-2xx
      if (!response.ok) {
        let reason = 'Access or request was refused';
        try {
          const errJson = await response.json();
          reason = errJson.error || errJson.message || reason;
        } catch {
          // If body is empty or non-json
        }

        // Case 3: The upstream refused (or credential refused)
        setFetchState({
          status: 'refused',
          statusNum: response.status,
          sentence: `The SingStat service refused the request (HTTP ${response.status}): ${reason}.`,
          reason
        });
        return;
      }

      // Successful 2xx response
      const data = await response.json();

      // Case 2: The data is empty
      if (data.empty || !data.latest || !data.latest.value) {
        setFetchState({
          status: 'empty',
          sentence: 'No Consumer Price Index records were returned for this series.'
        });
        return;
      }

      // Success: live data available
      setFetchState({
        status: 'success',
        data
      });
      setLastRefreshedAt(new Date());
    } catch (networkErr: unknown) {
      // Case 4: The upstream is unreachable
      const errMsg = (networkErr as Error)?.message || 'Failed to fetch';
      setFetchState({
        status: 'unreachable',
        sentence: 'The SingStat service is currently unreachable due to a network connection failure.',
        reason: errMsg
      });
    }
  }, []);

  useEffect(() => {
    fetchCpiData();
  }, [fetchCpiData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation & Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">
                  Singapore National Statistics
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SingStat Live API
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Consumer Price Index (2024 as Base Year) • Resource ID M213751
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="view-health-button"
              type="button"
              onClick={() => setIsHealthOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-2xs transition cursor-pointer"
              title="Inspect upstream API status and credentials"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              API Health
            </button>

            <button
              id="refresh-cpi-button"
              type="button"
              onClick={fetchCpiData}
              disabled={fetchState.status === 'loading'}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchState.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Views for the 4 distinct cases */}
        {fetchState.status === 'loading' && (
          <StatusNotice
            type="loading"
            sentence={fetchState.sentence}
          />
        )}

        {fetchState.status === 'empty' && (
          <StatusNotice
            type="empty"
            sentence={fetchState.sentence}
            onRetry={fetchCpiData}
          />
        )}

        {fetchState.status === 'refused' && (
          <StatusNotice
            type="refused"
            sentence={fetchState.sentence}
            details={fetchState.reason}
            onRetry={fetchCpiData}
          />
        )}

        {fetchState.status === 'unreachable' && (
          <StatusNotice
            type="unreachable"
            sentence={fetchState.sentence}
            details={fetchState.reason}
            onRetry={fetchCpiData}
          />
        )}

        {/* Live Data Display */}
        {fetchState.status === 'success' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <CpiMetricCard
              latest={fetchState.data.latest}
              baseYear={fetchState.data.baseYear}
              frequency={fetchState.data.frequency}
              dataLastUpdated={fetchState.data.dataLastUpdated}
            />

            {/* Historical Trend Chart */}
            <CpiTrendChart data={fetchState.data.recentMonthly} />

            {/* Category Breakdown */}
            <CategoryBreakdown categories={fetchState.data.categories} />

            {/* Footnote / Methodology metadata */}
            {fetchState.data.footnote && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs text-slate-500 leading-relaxed shadow-2xs">
                <span className="font-semibold text-slate-700">Official Note: </span>
                {fetchState.data.footnote}
              </div>
            )}
          </div>
        )}

        {lastRefreshedAt && fetchState.status === 'success' && (
          <div className="text-right text-[11px] text-slate-400 mt-2">
            Last checked in dashboard: {lastRefreshedAt.toLocaleTimeString()}
          </div>
        )}
      </main>

      {/* Footer with exact provider's licence attribution */}
      <footer id="app-footer" className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Source Attribution: </span>
            Contains information from Consumer Price Index (CPI), 2024 As Base Year, Monthly (Table M213751) accessed from Singapore Department of Statistics (SingStat) which is made available under the terms of the{' '}
            <a
              href="https://data.gov.sg/open-data-licence"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-0.5"
            >
              Singapore Open Data Licence version 1.0
              <ExternalLink className="w-3 h-3 inline" />
            </a>
            .
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <div>
              Dataset Provider: Singapore Department of Statistics (SingStat) • Table M213751
            </div>
            <div>
              Cache-Control: s-maxage=86400, stale-while-revalidate=172800 (Monthly)
            </div>
          </div>
        </div>
      </footer>

      {/* Health Diagnostics Modal */}
      <HealthStatusModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
      />
    </div>
  );
}
