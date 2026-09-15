import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import type { FieldReport } from '@/types';
import { Upload, MapPin, Camera, Send, FileText, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const incidentTypes: { value: FieldReport['type']; labelKey: string; icon: typeof Upload }[] = [
  { value: 'crack', labelKey: 'crack', icon: AlertCircle },
  { value: 'slope_movement', labelKey: 'slopeMovement', icon: AlertCircle },
  { value: 'blocked_road', labelKey: 'blockedRoad', icon: AlertCircle },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

export default function FieldReports() {
  const { t, reports, addReport, online, showToast } = useApp();
  const [type, setType] = useState<FieldReport['type']>('crack');
  const [description, setDescription] = useState('');
  const [gps, setGps] = useState<{ lat: number; lon: number } | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGPS = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setDetecting(false);
        },
        () => {
          setGps({ lat: 25.57 + (Math.random() - 0.5) * 2, lon: 92.5 + (Math.random() - 0.5) * 2 });
          setDetecting(false);
        },
        { timeout: 5000 }
      );
    } else {
      setGps({ lat: 25.57 + (Math.random() - 0.5) * 2, lon: 92.5 + (Math.random() - 0.5) * 2 });
      setDetecting(false);
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      const report: FieldReport = {
        id: Math.random().toString(36).slice(2),
        type,
        description: description.trim(),
        lat: gps?.lat ?? 25.57,
        lon: gps?.lon ?? 92.5,
        photoUrl: photoName || undefined,
        submittedAt: new Date().toISOString(),
        synced: online,
      };
      addReport(report);
      if (!online) {
        showToast(t('savedLocally'), 'warning');
      } else {
        showToast('Report submitted successfully', 'success');
      }
      setDescription('');
      setPhotoName(null);
      setGps(null);
      setSubmitting(false);
    }, 800);
  };

  const syncedCount = reports.filter((r) => r.synced).length;
  const pendingCount = reports.filter((r) => !r.synced).length;

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6 space-y-6">
      <div className="max-w-5xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <FileText className="w-5 h-5 text-sky-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{reports.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{t('totalReports')}</span>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{syncedCount}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{t('syncedReports')}</span>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <Clock className="w-5 h-5 text-orange-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{pendingCount}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{t('pendingSync')}</span>
          </div>
        </div>

        {/* Upload Form */}
        <div className="glass-panel rounded-2xl p-5 md:p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            {t('uploadReport')}
          </h2>
          <p className="text-xs text-slate-500 mb-5">Report landslide incidents with geo-tagged evidence</p>

          {/* Incident Type */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-400 mb-2 block">{t('incidentType')}</label>
            <div className="grid grid-cols-3 gap-2">
              {incidentTypes.map((it) => {
                const Icon = it.icon;
                return (
                  <button
                    key={it.value}
                    onClick={() => setType(it.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      type === it.value
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(it.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-400 mb-2 block">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what you observed..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
            />
          </div>

          {/* GPS + Photo */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">{t('autoDetectGPS')}</label>
              <button
                onClick={handleGPS}
                disabled={detecting}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-300 hover:border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
              >
                {detecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Detecting...
                  </>
                ) : gps ? (
                  <>
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs">{gps.lat.toFixed(4)}, {gps.lon.toFixed(4)}</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4" />
                    {t('autoDetectGPS')}
                  </>
                )}
              </button>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">{t('uploadPhoto')}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setPhotoName(e.target.files[0].name);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-300 hover:border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                {photoName ? (
                  <span className="truncate text-xs text-emerald-400">{photoName}</span>
                ) : (
                  t('uploadPhoto')
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim()}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t('submit')}
              </>
            )}
          </button>
          {!online && (
            <p className="text-[11px] text-orange-400 mt-2 text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3 h-3" />
              {t('offline')} — {t('savedLocally')}
            </p>
          )}
        </div>

        {/* Recent Reports */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-3">{t('recentReports')}</h3>
          {reports.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center">
              <p className="text-sm text-slate-500">{t('noReports')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="glass-panel rounded-xl p-3 flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    report.type === 'crack' ? 'bg-orange-500/15' : report.type === 'slope_movement' ? 'bg-red-500/15' : 'bg-yellow-500/15'
                  }`}>
                    <AlertCircle className={`w-4 h-4 ${
                      report.type === 'crack' ? 'text-orange-400' : report.type === 'slope_movement' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-200">{t(report.type === 'crack' ? 'crack' : report.type === 'slope_movement' ? 'slopeMovement' : 'blockedRoad')}</span>
                      {report.synced ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Synced</span>
                      ) : (
                        <span className="flex items-center gap-0.5 text-[10px] text-orange-400"><Clock className="w-3 h-3" /> Pending</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{report.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        {report.lat.toFixed(2)}, {report.lon.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-600">{timeAgo(report.submittedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
