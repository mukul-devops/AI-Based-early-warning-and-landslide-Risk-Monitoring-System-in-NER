import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Tooltip } from 'react-leaflet';
import { useApp } from '@/context/AppContext';
import { riskColors } from '@/data/mockData';
import type { RiskZone, SimResult } from '@/types';
import { AlertTriangle, Route, Users, CloudRain, Loader2 } from 'lucide-react';

const NER_CENTER: [number, number] = [25.57, 92.5];
const NER_ZOOM = 7;

function getRiskLabel(level: string, t: (key: string) => string): string {
  const map: Record<string, string> = { severe: 'severe', high: 'high', moderate: 'moderate', low: 'low' };
  return t(map[level] || level);
}

function RiskPopup({ zone, t, onPrioritize }: { zone: RiskZone; t: (key: string) => string; onPrioritize: () => void }) {
  const colors = riskColors[zone.riskLevel] || riskColors['low'];
  return (
    <div className="min-w-[200px]">
      <div className={`px-3 py-2 rounded-t-lg ${colors.bg} border-b ${colors.border}`}>
        <h3 className="font-bold text-sm text-slate-100">{zone.name}</h3>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{t('riskLevel')}</span>
          <span className={`text-xs font-bold ${colors.text}`}>{getRiskLabel(zone.riskLevel, t)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Score</span>
          <span className="text-xs font-mono text-slate-200">{(zone.riskScore * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><Route className="w-3 h-3" /> {zone.roadName}</span>
          <span className={`text-xs font-semibold ${
            zone.roadStatus === 'Blocked' ? 'text-red-400' : zone.roadStatus === 'Partially Clear' ? 'text-orange-400' : 'text-emerald-400'
          }`}>{zone.roadStatus}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><CloudRain className="w-3 h-3" /> 72h</span>
          <span className="text-xs font-mono text-slate-200">{zone.rainfall72h}mm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1"><Users className="w-3 h-3" /> {t('population')}</span>
          <span className="text-xs font-mono text-slate-200">{zone.population.toLocaleString()}</span>
        </div>
        <button
          onClick={onPrioritize}
          className="w-full mt-2 px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {t('prioritizeResponse')}
        </button>
      </div>
    </div>
  );
}

export default function LiveMap({ simResult }: { simResult: SimResult | null }) {
  const { t, riskZones, setRiskZones, addAlert, showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    setLoading(true);
    fetch(`${apiUrl}/api/risk-zones`)
      .then((res) => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then((data: any) => {
        // FIX: Detect GeoJSON and flatten it into the array format React expects
        if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          const formattedZones: RiskZone[] = data.features.map((feature: any, index: number) => {
            
            // Map the Python backend string (e.g. "High Alert") to the frontend color key ("high")
            let rawRisk = feature.properties?.risk_level || feature.properties?.riskLevel || 'low';
            let mappedRisk = 'low';
            if (rawRisk.toLowerCase().includes('severe')) mappedRisk = 'severe';
            else if (rawRisk.toLowerCase().includes('high')) mappedRisk = 'high';
            else if (rawRisk.toLowerCase().includes('moderate')) mappedRisk = 'moderate';

            return {
              id: feature.id || feature.properties?.id || String(index),
              name: feature.properties?.location_name || feature.properties?.name || 'Unknown Zone',
              lat: feature.geometry.coordinates[1], // GeoJSON stores [longitude, latitude]
              lon: feature.geometry.coordinates[0],
              riskLevel: mappedRisk as RiskZone['riskLevel'],
              riskScore: feature.properties?.risk_score || feature.properties?.riskScore || 0.1,
              roadName: feature.properties?.road_name || feature.properties?.roadName || 'Local Road',
              roadStatus: feature.properties?.road_status || feature.properties?.roadStatus || 'Clear',
              rainfall72h: feature.properties?.rainfall_72h || feature.properties?.rainfall72h || 0,
              population: feature.properties?.population || 1000,
            };
          });
          setRiskZones(formattedZones);
        } else if (Array.isArray(data)) {
          // Fallback just in case it is already an array
          setRiskZones(data);
        } else {
          setRiskZones([]);
        }
        setError(false);
      })
      .catch((err) => {
        console.error("Map Data Fetch Error:", err);
        setError(true);
        setRiskZones([]); // Pass empty array to prevent crash on failure
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrioritize = (zone: RiskZone) => {
    addAlert({
      id: Math.random().toString(36).slice(2),
      zoneId: zone.id,
      zoneName: zone.name,
      riskLevel: zone.riskLevel,
      message: `Priority response dispatched for ${zone.name}.`,
      dispatchedAt: new Date().toISOString(),
      responders: Math.ceil(zone.population / 2000),
      status: 'pending',
    });
    showToast(`Priority response dispatched for ${zone.name}`, 'warning');
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={NER_CENTER}
        zoom={NER_ZOOM}
        className="h-full w-full z-0"
        scrollWheelZoom
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
        />
        {riskZones.map((zone) => {
          const colors = riskColors[zone.riskLevel] || riskColors['low'];
          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lon]}
              radius={2500}
              pathOptions={{
                color: colors.hex,
                fillColor: colors.hex,
                fillOpacity: 0.5,
                weight: 2,
              }}
            >
              <Popup className="dark-popup">
                <RiskPopup zone={zone} t={t} onPrioritize={() => handlePrioritize(zone)} />
              </Popup>
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent className="zone-label">
                <span className="font-semibold text-[11px]">{zone.name}</span>
              </Tooltip>
            </Circle>
          );
        })}
      </MapContainer>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-[500] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading risk zones...</p>
          </div>
        </div>
      )}

      {/* Error/fallback badge */}
      {error && !loading && (
        <div className="absolute top-4 left-4 z-[500] glass-panel border border-orange-500/30 px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-300">Using cached risk zone data</span>
        </div>
      )}

      {/* Simulation result badge */}
      {simResult && (
        <div className="absolute top-4 right-4 z-[500] glass-panel border border-emerald-500/30 px-4 py-3 rounded-xl animate-fade-in max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${riskColors[simResult.riskLevel].dot}`} />
            <span className="text-xs font-bold text-slate-200">{t('simulationResult')}</span>
          </div>
          <p className={`text-sm font-semibold ${riskColors[simResult.riskLevel].text}`}>
            {getRiskLabel(simResult.riskLevel, t)} · {(simResult.riskScore * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">{t('confidence')}: {(simResult.confidence * 100).toFixed(1)}%</p>
        </div>
      )}

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 z-[500] glass-panel rounded-xl px-4 py-3">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Risk Legend</p>
        <div className="flex flex-col gap-1.5">
          {(['severe', 'high', 'moderate', 'low'] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${riskColors[level].dot}`} />
              <span className={`text-xs ${riskColors[level].text}`}>{getRiskLabel(level, t)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}