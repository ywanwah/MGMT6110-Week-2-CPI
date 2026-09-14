import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { CategoryData } from '../types';

interface CategoryBreakdownProps {
  categories: CategoryData[];
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div id="cpi-categories-section" className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs my-6">
      <div className="pb-4 mb-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
          Key Expenditure Categories
        </h2>
        <p className="text-xs text-slate-500">
          Price changes across major Singapore Consumer Price Index basket groups
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Latest Index</th>
              <th className="py-2.5 px-3 text-right">MoM Change</th>
              <th className="py-2.5 px-3 text-right">YoY Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {categories.map((cat) => {
              const mom = cat.momPercent;
              const yoy = cat.yoyPercent;

              return (
                <tr key={cat.seriesNo} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span>{cat.name}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                    {cat.value !== null ? cat.value.toFixed(3) : '—'}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {mom !== null ? (
                      <span className={`inline-flex items-center gap-0.5 font-mono font-medium ${
                        mom > 0 ? 'text-rose-600' : mom < 0 ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {mom > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : mom < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                        {mom > 0 ? `+${mom.toFixed(2)}%` : `${mom.toFixed(2)}%`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {yoy !== null ? (
                      <span className={`inline-flex items-center gap-0.5 font-mono font-medium ${
                        yoy > 0 ? 'text-rose-600' : yoy < 0 ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {yoy > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : yoy < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                        {yoy > 0 ? `+${yoy.toFixed(2)}%` : `${yoy.toFixed(2)}%`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
