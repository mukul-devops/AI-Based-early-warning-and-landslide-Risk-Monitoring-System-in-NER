import { useApp } from '@/context/AppContext';
import { riskColors } from '@/data/mockData';
import { BarChart3, TrendingUp, Activity, Target, Layers, Gauge } from 'lucide-react';

const featureImportanceData = [
  { feature: 'Rainfall 72h', importance: 0.409, color: 'bg-sky-500' },
  { feature: 'Pore Pressure Index', importance: 0.19, color: 'bg-orange-500' },
  { feature: 'Elevation', importance: 0.138, color: 'bg-teal-500' },
  { feature: 'Shear Stress Index', importance: 0.106, color: 'bg-emerald-500' },
  { feature: 'Slope Angle', importance: 0.101, color: 'bg-yellow-500' },
  { feature: 'Extreme Rain Flag', importance: 0.056, color: 'bg-slate-500' },
];

const modelMetrics = [
  { label: 'ROC-AUC', value: '0.858', icon: Target, color: 'text-emerald-400' },
  { label: 'Precision', value: '0.82', icon: Activity, color: 'text-sky-400' },
  { label: 'Recall', value: '0.79', icon: TrendingUp, color: 'text-orange-400' },
  { label: 'F1-Score', value: '0.80', icon: Gauge, color: 'text-teal-400' },
];

export default function AIAnalytics() {
  const { t, riskZones } = useApp();

  const distribution = (['severe', 'high', 'moderate', 'low'] as const).map((level) => ({
    level,
    count: riskZones.filter((z) => z.riskLevel === level).length,
  pct: (riskZones.filter((z) => z.riskLevel === level).length / riskZones.length) * 100,
  avgScore: riskZones.filter((z) => z.riskLevel === level).reduce((sum, z) => sum + z.riskScore, 0) / Math.max(1, riskZones.filter((z) => z.riskLevel === level).length),
  }));

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t('analytics')}</h2>
            <p className="text-xs text-slate-500">XGBoost model insights & risk analysis</p>
          </div>
        </div>

        {/* Model Performance */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('modelPerformance')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {modelMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="glass-panel rounded-xl p-4">
                  <Icon className={`w-5 h-5 ${m.color} mb-2`} />
                  <span className="text-2xl font-bold text-slate-100 font-mono">{m.value}</span>
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              {t('riskDistribution')}
            </h3>
            <div className="space-y-3">
              {distribution.map((d) => (
                <div key={d.level}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${riskColors[d.level].text}`}>{t(d.level)}</span>
                    <span className="text-xs text-slate-500">{d.count} zones · avg {(d.avgScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${riskColors[d.level].dot} transition-all duration-700`}
                      style={{ width: `${Math.max(d.pct, 5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Importance */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {t('featureImportance')}
            </h3>
            <div className="space-y-2.5">
              {featureImportanceData.map((f) => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-28 shrink-0">{f.feature}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full rounded-full ${f.color} transition-all duration-700`} style={{ width: `${f.importance * 100}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slate-300 w-10 text-right">{(f.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Zone Risk Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-bold text-slate-200">Zone Risk Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-700/30">
                  <th className="text-left px-5 py-2 font-medium">{t('zoneName')}</th>
                  <th className="text-left px-3 py-2 font-medium">{t('riskLevel')}</th>
                  <th className="text-right px-3 py-2 font-medium">Score</th>
                  <th className="text-right px-3 py-2 font-medium hidden sm:table-cell">{t('rainfall')}</th>
                  <th className="text-right px-3 py-2 font-medium hidden sm:table-cell">{t('slopeAngle')}</th>
                  <th className="text-right px-3 py-2 font-medium hidden md:table-cell">{t('soilMoisture')}</th>
                  <th className="text-right px-5 py-2 font-medium hidden md:table-cell">{t('population')}</th>
                </tr>
              </thead>
              <tbody>
                {riskZones
                  .sort((a, b) => b.riskScore - a.riskScore)
                  .map((zone) => (
                    <tr key={zone.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-2.5 text-slate-200 font-medium">{zone.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${riskColors[zone.riskLevel].text}`}>
                          <span className={`w-2 h-2 rounded-full ${riskColors[zone.riskLevel].dot}`} />
                          {t(zone.riskLevel)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-300">{(zone.riskScore * 100).toFixed(0)}%</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400 hidden sm:table-cell">{zone.rainfall72h}mm</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400 hidden sm:table-cell">{zone.slopeAngle}°</td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-400 hidden md:table-cell">{(zone.soilMoisture * 100).toFixed(0)}%</td>
                      <td className="px-5 py-2.5 text-right font-mono text-slate-400 hidden md:table-cell">{zone.population.toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
