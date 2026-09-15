import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { riskColors } from '@/data/mockData';
import type { RiskLevel, AlertMessage, Language } from '@/types';
import { Siren, Users, Clock, MapPin, Radio, Truck, Send, MessageSquare, Phone, Volume2, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

const statusConfig: Record<string, { labelKey: string; color: string; icon: typeof Truck }> = {
  pending: { labelKey: 'pending', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', icon: Clock },
  en_route: { labelKey: 'enRoute', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', icon: Truck },
  on_site: { labelKey: 'onSite', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: Radio },
};

const severityLevels: RiskLevel[] = ['severe', 'high', 'moderate', 'low'];

function generateAlertMessages(zoneName: string, level: RiskLevel, lang: Language): AlertMessage {
  const templates: Record<Language, Record<RiskLevel, AlertMessage>> = {
    en: {
      severe: {
        sms: `RED ALERT: ${zoneName} - Severe landslide imminent. Evacuate immediately to nearest shelter. NDRF teams en route. Do not use roads.`,
        whatsapp: `RED ALERT: ${zoneName}\n\nSevere landslide imminent. Evacuate immediately to nearest shelter.\n\nNDRF teams are en route.\nDo NOT use roads.\n\nStay tuned for updates.`,
        voice: `Attention. This is a severe landslide red alert for ${zoneName}. Evacuate immediately. Do not use roads. Move to the nearest shelter. NDRF teams are on the way.`,
      },
      high: {
        sms: `ORANGE ALERT: ${zoneName} - High landslide risk. Prepare for evacuation. Avoid slope areas and blocked roads.`,
        whatsapp: `ORANGE ALERT: ${zoneName}\n\nHigh landslide risk detected.\nPrepare for evacuation.\nAvoid slope areas and blocked roads.\n\nMonitor updates closely.`,
        voice: `This is a high risk landslide alert for ${zoneName}. Prepare for evacuation. Avoid slopes and blocked roads. Stay alert for further instructions.`,
      },
      moderate: {
        sms: `YELLOW ADVISORY: ${zoneName} - Moderate landslide risk. Stay cautious near slopes. Monitor weather updates.`,
        whatsapp: `YELLOW ADVISORY: ${zoneName}\n\nModerate landslide risk.\nStay cautious near slopes.\nMonitor weather updates.\n\nReport any ground cracks to authorities.`,
        voice: `Advisory for ${zoneName}. Moderate landslide risk. Stay cautious near slopes. Report any ground cracks to authorities.`,
      },
      low: {
        sms: `GREEN: ${zoneName} - Low landslide risk. Conditions stable. Normal activity may resume.`,
        whatsapp: `GREEN: ${zoneName}\n\nLow landslide risk. Conditions stable.\nNormal activity may resume.\n\nContinue to stay informed.`,
        voice: `Update for ${zoneName}. Low landslide risk. Conditions are stable. Normal activity may resume.`,
      },
    },
    as: {
      severe: {
        sms: `ৰেড এলাৰ্ট: ${zoneName} - গুৰুতৰ ভূস্খলন আসন্ন। তৎক্ষণাৎ খালি হওক। NDRF দল পথত। ৰাস্তা ব্যৱহাৰ নকৰিব।`,
        whatsapp: `ৰেড এলাৰ্ট: ${zoneName}\n\nগুৰুতৰ ভূস্খলন আসন্ন।\nতৎক্ষণাৎ খালি হওক।\n\nNDRF দল পথত।\nৰাস্তা ব্যৱহাৰ নকৰিব।`,
        voice: `${zoneName} ত গুৰুতৰ ভূস্খলন ৰেড এলাৰ্ট। তৎক্ষণাৎ খালি হওক। ৰাস্তা ব্যৱহাৰ নকৰিব।`,
      },
      high: {
        sms: `অৰেঞ্জ এলাৰ্ট: ${zoneName} - উচ্চ ভূস্খলন বিপদ। খালি হবলৈ প্ৰস্তুত হওক।`,
        whatsapp: `অৰেঞ্জ এলাৰ্ট: ${zoneName}\n\nউচ্চ ভূস্খলন বিপদ।\nখালি হবলৈ প্ৰস্তুত হওক।\n\nঢাল অঞ্চল আঁতৰ কৰক।`,
        voice: `${zoneName} ত উচ্চ ভূস্খলন বিপদ। খালি হবলৈ প্ৰস্তুত হওক।`,
      },
      moderate: {
        sms: `হলুদ পৰামৰ্শ: ${zoneName} - মধ্যম ভূস্খলন বিপদ। ঢালৰ ওচৰত সাৱধান থাকক।`,
        whatsapp: `হলুদ পৰামৰ্শ: ${zoneName}\n\nমধ্যম ভূস্খলন বিপদ।\nঢালৰ ওচৰত সাৱধান থাকক।`,
        voice: `${zoneName} ত মধ্যম ভূস্খলন বিপদ। ঢালৰ ওচৰত সাৱধান থাকক।`,
      },
      low: {
        sms: `সেউজীয়া: ${zoneName} - নিম্ন বিপদ। অৱস্থা স্থিৰ।`,
        whatsapp: `সেউজীয়া: ${zoneName}\n\nনিম্ন বিপদ। অৱস্থা স্থিৰ।`,
        voice: `${zoneName} ত নিম্ন ভূস্খলন বিপদ। অৱস্থা স্থিৰ।`,
      },
    },
    kha: {
      severe: {
        sms: `RED ALERT: ${zoneName} - Severe landslide imminent. Evacuate immediately. Do not use roads.`,
        whatsapp: `RED ALERT: ${zoneName}\n\nSevere landslide imminent.\nEvacuate immediately.\nDo not use roads.`,
        voice: `Severe landslide red alert for ${zoneName}. Evacuate immediately. Do not use roads.`,
      },
      high: {
        sms: `ORANGE ALERT: ${zoneName} - High landslide risk. Prepare for evacuation.`,
        whatsapp: `ORANGE ALERT: ${zoneName}\n\nHigh landslide risk.\nPrepare for evacuation.`,
        voice: `High risk landslide alert for ${zoneName}. Prepare for evacuation.`,
      },
      moderate: {
        sms: `YELLOW ADVISORY: ${zoneName} - Moderate landslide risk. Stay cautious near slopes.`,
        whatsapp: `YELLOW ADVISORY: ${zoneName}\n\nModerate landslide risk.\nStay cautious near slopes.`,
        voice: `Advisory for ${zoneName}. Moderate landslide risk. Stay cautious.`,
      },
      low: {
        sms: `GREEN: ${zoneName} - Low landslide risk. Conditions stable.`,
        whatsapp: `GREEN: ${zoneName}\n\nLow landslide risk. Conditions stable.`,
        voice: `Update for ${zoneName}. Low landslide risk. Conditions are stable.`,
      },
    },
  };
  return templates[lang][level];
}

export default function AlertDispatch() {
  const { t, alerts, riskZones, addAlert, showToast, user, language, updateRoadStatus } = useApp();
  const [selectedZone, setSelectedZone] = useState(riskZones[0]?.id || '');
  const [selectedSeverity, setSelectedSeverity] = useState<RiskLevel>('severe');
  const [previewLang, setPreviewLang] = useState<Language>(language);
  const [dispatching, setDispatching] = useState(false);
  const [sirenZone, setSirenZone] = useState<string | null>(null);

  const isOfficer = user?.role === 'officer';

  const zone = riskZones.find((z) => z.id === selectedZone);
  const alertMessages = zone ? generateAlertMessages(zone.name, selectedSeverity, previewLang) : null;

  const totalResponders = alerts.reduce((sum, a) => sum + a.responders, 0);

  const evacuationQueue = [...riskZones]
    .filter((z) => z.riskLevel === 'severe' || z.riskLevel === 'high')
    .map((z) => ({
      ...z,
      priorityScore: z.riskScore * (z.population / 10000),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const handleBroadcastSms = () => {
    if (!zone) return;
    setDispatching(true);
    setTimeout(() => {
      addAlert({
        id: Math.random().toString(36).slice(2),
        zoneId: zone.id,
        zoneName: zone.name,
        riskLevel: selectedSeverity,
        message: `Bulk SMS broadcast via CDAC/IMD gateway — ${zone.name}`,
        dispatchedAt: new Date().toISOString(),
        responders: 0,
        status: 'pending',
      });
      showToast(`${t('broadcastSent')} — ${new Date().toLocaleTimeString()}`, 'success');
      setDispatching(false);
    }, 1200);
  };

  const handleDispatchSdrf = () => {
    if (!zone) return;
    setDispatching(true);
    setTimeout(() => {
      addAlert({
        id: Math.random().toString(36).slice(2),
        zoneId: zone.id,
        zoneName: zone.name,
        riskLevel: selectedSeverity,
        message: `SDRF team dispatched to ${zone.name}`,
        dispatchedAt: new Date().toISOString(),
        responders: 8 + Math.floor(Math.random() * 12),
        status: 'en_route',
      });
      showToast(`${t('sdrfDispatched')} ${zone.name} — ${new Date().toLocaleTimeString()}`, 'warning');
      setDispatching(false);
    }, 1200);
  };

  const handleSiren = (zoneName: string) => {
    setSirenZone(zoneName);
    showToast(`${t('sirenActivated')} ${zoneName}`, 'warning');
    setTimeout(() => setSirenZone(null), 3000);
  };

  const roadStatusOptions = ['Blocked', 'Partially Clear', 'Single Lane Open', 'Fully Clear'];

  return (
    <div className="flex-1 overflow-y-auto custom-scroll p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <Siren className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{t('alertDispatch')}</h2>
            <p className="text-xs text-slate-500">Active emergency response coordination</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-panel rounded-xl p-4">
            <Siren className="w-5 h-5 text-red-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{alerts.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">Active Alerts</span>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <Users className="w-5 h-5 text-emerald-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{totalResponders}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{t('responders')}</span>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <Truck className="w-5 h-5 text-sky-400 mb-2" />
            <span className="text-2xl font-bold text-slate-100">{alerts.filter((a) => a.status === 'en_route').length}</span>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wide">{t('enRoute')}</span>
          </div>
        </div>

        {/* Multilingual Alert Generator */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            {t('alertGenerator')}
          </h3>

          {/* Zone + Severity selectors */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t('selectZone')}</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
              >
                {riskZones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">{t('alertSeverity')}</label>
              <div className="grid grid-cols-4 gap-1.5">
                {severityLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedSeverity(level)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all ${
                      selectedSeverity === level
                        ? `${riskColors[level].bg} ${riskColors[level].text} border ${riskColors[level].border}`
                        : 'bg-slate-800/50 border border-slate-700/30 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Language preview tabs */}
          <div className="flex gap-1.5 mb-3">
            {([
              { value: 'en', label: 'English' },
              { value: 'as', label: 'অসমীয়া' },
              { value: 'kha', label: 'Khasi' },
            ] as const).map((l) => (
              <button
                key={l.value}
                onClick={() => setPreviewLang(l.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  previewLang === l.value
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-500 border border-slate-700/30 hover:text-slate-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Message previews */}
          {alertMessages && (
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide">{t('smsPreview')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{alertMessages.sms}</p>
                <div className="mt-2 pt-2 border-t border-slate-700/30 text-[9px] text-slate-600 font-mono">
                  {alertMessages.sms.length} chars · CDAC Gateway
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">{t('whatsappPreview')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{alertMessages.whatsapp}</p>
                <div className="mt-2 pt-2 border-t border-slate-700/30 text-[9px] text-slate-600 font-mono">
                  WhatsApp Business API
                </div>
              </div>
              <div className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">{t('voicePreview')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{alertMessages.voice}</p>
                <div className="mt-2 pt-2 border-t border-slate-700/30 text-[9px] text-slate-600 font-mono">
                  IVR · TTS Engine
                </div>
              </div>
            </div>
          )}

          {/* Dispatch Actions */}
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              onClick={handleBroadcastSms}
              disabled={dispatching}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold hover:from-sky-400 hover:to-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {dispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {t('broadcastSms')}
            </button>
            <button
              onClick={handleDispatchSdrf}
              disabled={dispatching}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold hover:from-red-400 hover:to-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {dispatching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              {t('dispatchSdrf')}
            </button>
          </div>
        </div>

        {/* Evacuation Priority Matrix */}
        <div className="glass-panel rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            {t('evacuationMatrix')}
          </h3>
          <div className="space-y-2">
            {evacuationQueue.map((z, idx) => {
              const colors = riskColors[z.riskLevel];
              return (
                <div key={z.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <span className="text-lg font-bold text-slate-600 w-6 text-center">#{idx + 1}</span>
                  <div className={`w-2 h-10 rounded-full ${colors.dot}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-slate-200 block">{z.name}</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-500">
                        {t('riskProbability')}: <span className="font-mono text-slate-300">{(z.riskScore * 100).toFixed(0)}%</span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {t('populationDensity')}: <span className="font-mono text-slate-300">{(z.population / 1000).toFixed(0)}k</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-orange-400">{z.priorityScore.toFixed(1)}</span>
                    <span className="text-[9px] text-slate-600 block uppercase">{t('priorityScore')}</span>
                  </div>
                  <button
                    onClick={() => handleSiren(z.name)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-semibold border transition-all shrink-0 ${
                      sirenZone === z.name
                        ? 'bg-red-500/30 border-red-500/50 text-red-300 animate-pulse'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Officer-only: Dispatch Matrix & Road Clearance */}
        {isOfficer && (
          <>
            {/* Road Clearance Status */}
            <div className="glass-panel rounded-2xl p-5 mb-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-sky-400" />
                {t('roadClearance')}
              </h3>
              <div className="space-y-2">
                {riskZones.filter((z) => z.roadStatus !== 'Clear').map((z) => (
                  <div key={z.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-slate-200">{z.roadName}</span>
                      <span className="text-xs text-slate-500 ml-2">{z.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                      z.roadStatus === 'Blocked' ? 'text-red-400 bg-red-500/10' : 'text-orange-400 bg-orange-500/10'
                    }`}>{z.roadStatus}</span>
                    <select
                      value={z.roadStatus}
                      onChange={(e) => {
                        updateRoadStatus(z.id, e.target.value);
                        showToast(`${t('roadStatusUpdate')}: ${z.roadName} → ${e.target.value}`, 'success');
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/40 text-xs text-slate-300 focus:outline-none focus:border-sky-500/50"
                    >
                      {roadStatusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast Override */}
            <div className="glass-panel rounded-2xl p-5 mb-6 border border-red-500/20">
              <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-2">
                <Siren className="w-4 h-4 text-red-400" />
                {t('broadcastOverride')}
              </h3>
              <p className="text-[10px] text-slate-500 mb-3">Manually trigger emergency siren for any active zone</p>
              <div className="flex flex-wrap gap-2">
                {riskZones.filter((z) => z.riskLevel === 'severe' || z.riskLevel === 'high').map((z) => (
                  <button
                    key={z.id}
                    onClick={() => handleSiren(z.name)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      sirenZone === z.name
                        ? 'bg-red-500/30 border-red-500/50 text-red-300 animate-pulse'
                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {z.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Active Alert Cards */}
        <div>
          <h3 className="text-sm font-bold text-slate-200 mb-3">Active Dispatch Log</h3>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const colors = riskColors[alert.riskLevel];
              const status = statusConfig[alert.status];
              const StatusIcon = status.icon;
              return (
                <div key={alert.id} className={`glass-panel rounded-2xl p-4 border ${colors.border}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                        <Siren className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-slate-100">{alert.zoneName}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {t(alert.riskLevel)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.zoneName}
                          </span>
                          {alert.responders > 0 && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {alert.responders} {t('responders')}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(alert.dispatchedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${status.color} shrink-0`}>
                      <StatusIcon className="w-3 h-3" />
                      {t(status.labelKey)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {alerts.length === 0 && (
            <div className="glass-panel rounded-xl p-12 text-center">
              <Siren className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No active alerts. All zones stable.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
