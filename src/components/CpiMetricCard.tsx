import { TrendingDown, TrendingUp, Calendar, Hash, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { CpiLatest } from '../types';

interface CpiMetricCardProps {
  latest: CpiLatest;
  baseYear: string;
  frequency: string;
  dataLastUpdated: string | null;
}

export function CpiMetricCard({ latest, baseYear, frequency, dataLastUpdated }: CpiMetricCardProps) {
  const isMomPositive = latest.momPercent > 0;
  const isMomZero = latest.momPercent === 0;

  const isYoyPositive = latest.yoyPercent > 0;
  const isYoyZero = latest.yoyPercent === 0;

  return (
    <div id="cpi-summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
      {/* Primary Headline CPI Card */}
      <div id="cpi-headline-card" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Current Consumer Price Index
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {latest.period}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-mono">
              {latest.value.toFixed(3)}
            </span>
            <span className="text-xs font-medium text-slate-500">
              points
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Base Year {baseYear} = 100 • {frequency}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Updated {dataLastUpdated || 'Latest release'}
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            All Items
          </span>
        </div>
      </div>

      {/* Month-on-Month Inflation */}
      <div id="cpi-mom-card" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Month-on-Month (MoM)
          </span>
          <span className="text-xs text-slate-400">
            vs {latest.prevPeriod || 'Previous month'}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${
              isMomZero ? 'text-slate-700' : isMomPositive ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {isMomPositive ? `+${latest.momPercent.toFixed(2)}%` : `${latest.momPercent.toFixed(2)}%`}
            </span>
            <div className={`p-1 rounded-full ${
              isMomZero ? 'bg-slate-100 text-slate-600' : isMomPositive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isMomPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : isMomZero ? (
                <span className="w-4 h-4 inline-block text-center">—</span>
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {latest.momChange >= 0 ? `+${latest.momChange.toFixed(3)}` : latest.momChange.toFixed(3)} index points change
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Short-term price movement</span>
          <span className="font-medium text-slate-700">
            {isMomPositive ? 'Price increase' : isMomZero ? 'Unchanged' : 'Price decrease'}
          </span>
        </div>
      </div>

      {/* Year-on-Year Inflation */}
      <div id="cpi-yoy-card" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Year-on-Year (YoY) Inflation
          </span>
          <span className="text-xs text-slate-400">
            vs {latest.yoyPeriod || '12 months prior'}
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl sm:text-4xl font-bold tracking-tight font-mono ${
              isYoyZero ? 'text-slate-700' : isYoyPositive ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {isYoyPositive ? `+${latest.yoyPercent.toFixed(2)}%` : `${latest.yoyPercent.toFixed(2)}%`}
            </span>
            <div className={`p-1 rounded-full ${
              isYoyZero ? 'bg-slate-100 text-slate-600' : isYoyPositive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              {isYoyPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : isYoyZero ? (
                <span className="w-4 h-4 inline-block text-center">—</span>
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {latest.yoyChange >= 0 ? `+${latest.yoyChange.toFixed(3)}` : latest.yoyChange.toFixed(3)} index points change over 1 year
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span>Headline inflation rate</span>
          <span className="font-medium text-slate-700">Annual trajectory</span>
        </div>
      </div>
    </div>
  );
}
