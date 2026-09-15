import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { riskColors } from '@/data/mockData';
import type { SimResult, RiskZone, RiskLevel } from '@/types';
import { Play, Loader2, CloudRain, AlertTriangle, Route, Users, Gauge, TrendingUp, Wind, Droplets } from 'lucide-react';

function KpiCard({ icon: Icon, label, value, color }: { icon: typeof AlertTriangle; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col gap-1.5 flex-1 min-w-[140px]">
      <div className="flex items-center justify-between">
        <Icon className={`w-4 h-4 ${color}`} />
        <TrendingUp className="w-3 h-3 text-slate-600" />
      </div>
      <span className="text-2xl font-bold text-slate-100 leading-none">{value}</span>
      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

function simulateRainfall(rainfall: number): SimResult {
  let riskLevel: RiskLevel = 'low';
  let riskScore = 0.2;

  if (rainfall >= 350) {
    riskLevel = 'severe';
    riskScore = 0.85 + Math.random() * 0.12;
  } else if (rainfall >= 200) {
    riskLevel = 'high';
    riskScore = 0.6 + Math.random() * 0.2;
  } else if (rainfall >= 100) {
    riskLevel = 'moderate';
    riskScore = 0.4 + Math.random() * 0.15;
  } else {
    riskScore = 0.15 + Math.random() * 0.15;
  }

  return {
    riskLevel,
    riskScore,
    confidence: 0.858,
    factors: [
      { label: 'Rainfall 72h', value: rainfall },
      { label: 'Slope Angle', value: 28 + Math.random() * 15 },
      { label: 'Soil Moisture', value: Math.min(0.95, rainfall / 450) },
      { label: 'NDVI', value: 0.3 + Math.random() * 0.3 },
    ],
  };
}

function applySimulationToZones(zones: RiskZone[], rainfall: number): RiskZone[] {
  return zones.map((zone) => {
    const factor = rainfall / 300;
    const newScore = Math.min(0.99, zone.riskScore * (0.5 + factor * 0.7));
    let newLevel: RiskLevel = 'low';
    if (newScore >= 0.75) newLevel = 'severe';
    else if (newScore >= 0.55) newLevel = 'high';
    else if (newScore >= 0.35) newLevel = 'moderate';

    const roadBlocked = newLevel === 'severe' || (newLevel === 'high' && Math.random() > 0.5);
    return {
      ...zone,
      riskScore: newScore,
      riskLevel: newLevel,
      rainfall72h: Math.round(zone.rainfall72h * 0.4 + rainfall * 0.6),
      roadStatus: roadBlocked ? 'Blocked' : newLevel === 'moderate' ? 'Partially Clear' : 'Clear',
      lastUpdated: new Date().toISOString(),
    };
  });
}

export default function RightPanel({ onSimulate }: { onSimulate: (result: SimResult) => void }) {
  const { t, riskZones, setRiskZones, showToast } = useApp();
  const [rainfall, setRainfall] = useState(250);
  const [simulating, setSimulating] = useState(false);

  const activeZones = riskZones.filter((z) => z.riskLevel === 'severe' || z.riskLevel === 'high').length;
  const roadsBlocked = riskZones.filter((z) => z.roadStatus === 'Blocked').length;
  const totalResponders = 36;

  const handleRun = () => {
    setSimulating(true);
    setTimeout(() => {
      const result = simulateRainfall(rainfall);
      const updated = applySimulationToZones(riskZones, rainfall);
      setRiskZones(updated);
      onSimulate(result);
      setSimulating(false);
      showToast(`AI prediction complete: ${t(result.riskLevel)} risk detected`, 'warning');
    }, 1500);
  };

  return (
    <div className="w-full lg:w-80 xl:w-96 bg-slate-900/60 backdrop-blur-xl border-l border-slate-700/50 flex flex-col overflow-y-auto custom-scroll shrink-0">
      {/* KPI Cards */}
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live KPIs</h2>
        <div className="flex flex-wrap gap-3">
          <KpiCard icon={AlertTriangle} label={t('activeRiskZones')} value={activeZones} color="text-red-400" />
          <KpiCard icon={Route} label={t('roadsBlocked')} value={roadsBlocked} color="text-orange-400" />
          <KpiCard icon={Users} label={t('respondersDispatched')} value={totalResponders} color="text-emerald-400" />
        </div>
      </div>

      {/* XGBoost Simulation */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-emerald-400" />
              {t('xgboostSim')}
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
              {t('rocAuc')}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mb-4">Adjust rainfall and run prediction to update risk zones</p>

          {/* Rainfall slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                {t('antecedentRainfall')}
              </label>
              <span className="text-sm font-mono font-bold text-sky-400">{rainfall}mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={500}
              step={5}
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full accent-sky-500 h-1.5 rounded-full bg-slate-700 appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-600">0mm</span>
              <span className="text-[9px] text-slate-600">250mm</span>
              <span className="text-[9px] text-slate-600">500mm</span>
            </div>
          </div>

          {/* Risk preview bar */}
          <div className="mb-4">
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
              <div className="bg-emerald-500" style={{ width: '25%' }} />
              <div className="bg-yellow-500" style={{ width: '25%' }} />
              <div className="bg-orange-500" style={{ width: '25%' }} />
              <div className="bg-red-500" style={{ width: '25%' }} />
            </div>
            <div className="relative mt-1">
              <div
                className="absolute -top-0.5 w-0.5 h-3 bg-white rounded-full transition-all duration-200"
                style={{ left: `${(rainfall / 500) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={simulating}
            className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {simulating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running AI Prediction...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {t('runPrediction')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Weather Forecast */}
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('weatherForecast')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { day: 'Today', rain: rainfall, icon: CloudRain, temp: '24°C' },
            { day: 'Tomorrow', rain: Math.round(rainfall * 0.7), icon: CloudRain, temp: '26°C' },
            { day: 'Day 3', rain: Math.round(rainfall * 0.4), icon: Droplets, temp: '27°C' },
            { day: 'Day 4', rain: Math.round(rainfall * 0.2), icon: Wind, temp: '28°C' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.day} className="glass-panel rounded-lg p-2.5 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-medium">{f.day}</span>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-xs font-mono text-slate-200">{f.rain}mm</span>
                </div>
                <span className="text-[10px] text-slate-600">{f.temp}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Distribution Mini */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('riskDistribution')}</h3>
        <div className="space-y-2">
          {(['severe', 'high', 'moderate', 'low'] as const).map((level) => {
            const count = riskZones.filter((z) => z.riskLevel === level).length;
            const pct = (count / riskZones.length) * 100;
            return (
              <div key={level} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${riskColors[level].dot} shrink-0`} />
                <span className={`text-xs ${riskColors[level].text} w-20 shrink-0`}>{t(level)}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${riskColors[level].dot} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-mono text-slate-400 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
