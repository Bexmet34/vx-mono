import { AlertCircle, Clock, CalendarClock, Zap, Dices, Gift } from "lucide-react";

export default function DropTab({ lang, t, settings, setSettings, saving, saveSettings }) {
  const isEn = lang === 'en';

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExactMinutesChange = (minute) => {
    let current = settings.exact_minutes || [];
    if (typeof current === 'string') {
      try { current = JSON.parse(current); } catch (e) { current = []; }
    }
    
    if (current.includes(minute)) {
      current = current.filter(m => m !== minute);
    } else {
      current = [...current, minute].sort((a, b) => a - b);
    }
    updateSettings('exact_minutes', current);
  };

  const exactMinutes = Array.isArray(settings.exact_minutes) 
    ? settings.exact_minutes 
    : (typeof settings.exact_minutes === 'string' ? JSON.parse(settings.exact_minutes || "[]") : []);

  const scheduleType = settings.schedule_type || 'exact_minutes';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface/50 p-6 rounded-2xl border border-white/5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Gift className="text-primary" />
            {isEn ? 'Random Drop System' : 'Rastgele Ganimet Sistemi'}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
            {isEn 
              ? 'Configure how and when random loot drops in your server. You can schedule them at exact minutes, set an hourly probability, or make them completely random.'
              : 'Sunucunuzda rastgele ganimetlerin nasıl ve ne zaman düşeceğini yapılandırın. Belirli dakikalarda düşmesini planlayabilir, saatlik bir ihtimal belirleyebilir veya tamamen rastgele yapabilirsiniz.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {settings.is_enabled ? (isEn ? 'System Active' : 'Sistem Aktif') : (isEn ? 'System Disabled' : 'Sistem Kapalı')}
          </span>
          <button
            onClick={() => updateSettings('is_enabled', !settings.is_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.is_enabled ? 'bg-primary' : 'bg-surface-variant'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.is_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {settings.is_enabled && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Schedule Type */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface/50 p-5 rounded-2xl border border-white/5">
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Clock size={16} />
                {isEn ? 'Trigger Type' : 'Tetiklenme Türü'}
              </h3>
              
              <div className="space-y-3">
                {/* Exact Minutes Option */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'exact_minutes' ? 'bg-primary/10 border-primary/30' : 'bg-surface border-white/5 hover:bg-surface-variant/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="schedule_type" 
                      checked={scheduleType === 'exact_minutes'}
                      onChange={() => updateSettings('schedule_type', 'exact_minutes')}
                      className="accent-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <CalendarClock size={14} className="text-primary" />
                      {isEn ? 'Exact Minutes' : 'Kesin Dakikalar'}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">
                      {isEn ? 'Drops trigger exactly at the specified minutes of every hour (e.g. xx:15, xx:45).' : 'Ganimetler her saatin belirlediğiniz dakikalarında kesin olarak düşer (örn: xx:15).'}
                    </div>
                  </div>
                </label>

                {/* Hourly Chance Option */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'hourly_chance' ? 'bg-primary/10 border-primary/30' : 'bg-surface border-white/5 hover:bg-surface-variant/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="schedule_type" 
                      checked={scheduleType === 'hourly_chance'}
                      onChange={() => updateSettings('schedule_type', 'hourly_chance')}
                      className="accent-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Dices size={14} className="text-primary" />
                      {isEn ? 'Hourly Chance' : 'Saatlik İhtimal'}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">
                      {isEn ? 'Rolls a dice every hour at xx:00. Drops only if it hits the percentage chance.' : 'Her saat başı (xx:00) zar atılır. Sadece şans tutarsa düşer.'}
                    </div>
                  </div>
                </label>

                {/* Random Interval Option */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'random_interval' ? 'bg-primary/10 border-primary/30' : 'bg-surface border-white/5 hover:bg-surface-variant/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="schedule_type" 
                      checked={scheduleType === 'random_interval'}
                      onChange={() => updateSettings('schedule_type', 'random_interval')}
                      className="accent-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Zap size={14} className="text-primary" />
                      {isEn ? 'Random Interval' : 'Rastgele Aralık'}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">
                      {isEn ? 'Drops at completely random times between a minimum and maximum wait time.' : 'Belirlediğiniz minimum ve maksimum süre arasında tamamen rastgele bir zamanda düşer.'}
                    </div>
                  </div>
                </label>

                {/* Activity Based (Legacy) Option */}
                <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${scheduleType === 'activity' ? 'bg-primary/10 border-primary/30' : 'bg-surface border-white/5 hover:bg-surface-variant/50'}`}>
                  <div className="mt-1">
                    <input 
                      type="radio" 
                      name="schedule_type" 
                      checked={scheduleType === 'activity'}
                      onChange={() => updateSettings('schedule_type', 'activity')}
                      className="accent-primary"
                    />
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <AlertCircle size={14} className="text-warning" />
                      {isEn ? 'Activity Based (Legacy)' : 'Aktiflik Modu (Eski)'}
                    </div>
                    <div className="text-xs text-on-surface-variant mt-1">
                      {isEn ? 'Triggers based on chat messages (silence breaks or high activity bursts).' : 'Kanaldaki mesajlaşma trafiğine (uzun süren sessizliğin bozulması vb.) göre tetiklenir.'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Settings based on Type */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface/50 p-6 rounded-2xl border border-white/5 min-h-[300px]">
              
              {scheduleType === 'exact_minutes' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{isEn ? 'Select Drop Minutes' : 'Düşme Dakikalarını Seçin'}</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {isEn 
                        ? 'Select at which minutes of the hour the drop should occur. You can select multiple. (e.g. selecting 15 and 45 will drop a reward twice every hour)' 
                        : 'Saatin hangi dakikalarında ganimet düşmesini istiyorsanız seçin. Birden fazla seçebilirsiniz. (Örn: 15 ve 45 seçerseniz her saat iki kez düşer)'}
                    </p>
                    
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                      {[...Array(60)].map((_, i) => {
                        const isSelected = exactMinutes.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => handleExactMinutesChange(i)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected 
                                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] scale-105' 
                                : 'bg-surface hover:bg-surface-variant border border-white/5'
                            }`}
                          >
                            {i.toString().padStart(2, '0')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'hourly_chance' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{isEn ? 'Hourly Drop Probability' : 'Saatlik Düşme İhtimali'}</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {isEn 
                        ? 'Set the percentage chance for a drop to occur at the start of every hour (xx:00).' 
                        : 'Her saat başı (xx:00) ganimet düşme ihtimalini yüzde olarak belirleyin.'}
                    </p>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex-1">
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={settings.hourly_chance_pct || 25}
                          onChange={(e) => updateSettings('hourly_chance_pct', parseInt(e.target.value))}
                          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                          <span>1% ({isEn ? 'Rare' : 'Nadir'})</span>
                          <span>50%</span>
                          <span>100% ({isEn ? 'Always' : 'Her Saat'})</span>
                        </div>
                      </div>
                      <div className="bg-surface px-4 py-3 rounded-xl border border-white/5 font-bold text-2xl text-primary w-24 text-center">
                        %{settings.hourly_chance_pct || 25}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'random_interval' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{isEn ? 'Random Time Interval' : 'Rastgele Zaman Aralığı'}</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {isEn 
                        ? 'Define a minimum and maximum wait time between drops. The bot will pick a random time between these values.' 
                        : 'Ganimetler arasındaki minimum ve maksimum bekleme süresini (dakika) belirleyin. Bot bu iki değer arasında tamamen rastgele bir süre bekleyecektir.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{isEn ? 'Minimum Wait (Minutes)' : 'Minimum Bekleme (Dakika)'}</label>
                        <input
                          type="number"
                          min="1"
                          value={settings.random_interval_min || 30}
                          onChange={(e) => updateSettings('random_interval_min', parseInt(e.target.value))}
                          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{isEn ? 'Maximum Wait (Minutes)' : 'Maksimum Bekleme (Dakika)'}</label>
                        <input
                          type="number"
                          min={settings.random_interval_min || 30}
                          value={settings.random_interval_max || 120}
                          onChange={(e) => updateSettings('random_interval_max', parseInt(e.target.value))}
                          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                        />
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>
                        {isEn 
                          ? `A drop will occur randomly anywhere between ${settings.random_interval_min || 30} and ${settings.random_interval_max || 120} minutes after the previous one.` 
                          : `Bir ganimet düştükten sonra, bir sonraki ganimet ${settings.random_interval_min || 30} ile ${settings.random_interval_max || 120} dakika arasında rastgele bir zamanda düşecektir.`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {scheduleType === 'activity' && (
                <div className="space-y-6 animate-fade-in opacity-80">
                  <div>
                    <h3 className="text-lg font-bold mb-2">{isEn ? 'Activity Settings (Legacy)' : 'Aktiflik Ayarları (Eski)'}</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      {isEn 
                        ? 'These settings only apply when the activity-based legacy system is used.' 
                        : 'Bu ayarlar sadece eski sohbet trafiğine dayalı sistem kullanıldığında geçerlidir.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-on-surface-variant">{isEn ? 'Drop Chance' : 'Düşme Şansı'}</label>
                        <select
                          value={settings.drop_chance || 'medium'}
                          onChange={(e) => updateSettings('drop_chance', e.target.value)}
                          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-primary/50 outline-none"
                        >
                          <option value="low">{isEn ? 'Low' : 'Düşük'}</option>
                          <option value="medium">{isEn ? 'Medium' : 'Orta'}</option>
                          <option value="high">{isEn ? 'High' : 'Yüksek'}</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-on-surface-variant">{isEn ? 'Cooldown (Mins)' : 'Bekleme Süresi (Dk)'}</label>
                        <input
                          type="number"
                          value={settings.cooldown_minutes || 15}
                          onChange={(e) => updateSettings('cooldown_minutes', parseInt(e.target.value))}
                          className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-primary/50 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* General Drop Settings (Reward Type, Target Channels) */}
            <div className="bg-surface/50 p-6 rounded-2xl border border-white/5">
              <h3 className="text-lg font-bold mb-4">{isEn ? 'Reward Configuration' : 'Ödül Yapılandırması'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEn ? 'Reward Type' : 'Ödül Türü'}</label>
                  <select
                    value={settings.reward_type || 'coin'}
                    onChange={(e) => updateSettings('reward_type', e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                  >
                    <option value="coin">Coin</option>
                    <option value="xp">XP</option>
                    <option value="role">{isEn ? 'Special Role' : 'Özel Rol'}</option>
                  </select>
                </div>
                
                {settings.reward_type !== 'role' ? (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isEn ? 'Reward Amount' : 'Ödül Miktarı'}</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.reward_amount || 100}
                      onChange={(e) => updateSettings('reward_amount', parseInt(e.target.value))}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{isEn ? 'Reward Role ID' : 'Ödül Rol ID'}</label>
                    <input
                      type="text"
                      placeholder="Role ID"
                      value={settings.reward_role_id || ''}
                      onChange={(e) => updateSettings('reward_role_id', e.target.value)}
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-medium">{isEn ? 'Target Channels (IDs separated by comma)' : 'Hedef Kanallar (Virgülle ayrılmış ID\'ler)'}</label>
                <textarea
                  placeholder="123456789012345678, 987654321098765432"
                  value={Array.isArray(settings.channel_ids) ? settings.channel_ids.join(', ') : (settings.channel_ids || '')}
                  onChange={(e) => {
                    const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id.length > 0);
                    updateSettings('channel_ids', ids);
                  }}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none min-h-[100px] resize-y font-mono"
                />
                <p className="text-xs text-on-surface-variant">
                  {isEn 
                    ? 'Drops will only appear in these channels. If using time-based schedules, drops will be sent to all these channels simultaneously.' 
                    : 'Ganimetler sadece bu kanallarda belirir. Zaman tabanlı programlarda, ganimetler bu kanalların hepsine aynı anda gönderilir.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button is handled by the parent component using settings and setSettings */}
    </div>
  );
}
