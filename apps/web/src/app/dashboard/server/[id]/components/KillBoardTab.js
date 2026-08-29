import React from 'react';
import { Skull, Crosshair, AlertTriangle, Info, Save } from 'lucide-react';
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";

export default function KillboardTab({ t, settings, setSettings, discordChannels, handleSave, saving }) {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-headline-md text-on-surface flex items-center gap-2 mb-2">
          <Skull className="text-primary-container" size={24} />
          {lang === 'tr' ? 'Albion Killboard (Ölüm & Öldürme)' : 'Albion Killboard'}
        </h2>
        <p className="font-body-md text-on-surface-variant">
          {lang === 'tr'
            ? 'Albion Online kill/death etkinliklerini, üyeleriniz oyunda öldüğünde veya öldürdüğünde Discord sunucunuzdaki özel kanallara otomatik olarak gönderin.'
            : 'Automatically send Albion Online kill/death events to your Discord channels when your members die or get a kill.'}
        </p>
      </div>

      {/* Main Settings */}
      <div className="bg-surface-container border border-outline-variant rounded-md p-4 space-y-4">
        <h3 className="text-lg font-headline-sm text-on-surface border-b border-outline-variant pb-2 mb-4">
          {lang === 'tr' ? 'Kanal Ayarları' : 'Channel Settings'}
        </h3>

        {!settings.albion_guild_id && (
          <div className="bg-error/10 border border-error/20 p-3 rounded-md flex gap-3 items-start mb-4">
            <AlertTriangle className="text-error mt-0.5" size={18} />
            <div>
              <p className="text-error font-body-md font-semibold text-sm">
                {lang === 'tr' ? 'Albion Guild Seçilmedi!' : 'No Albion Guild Selected!'}
              </p>
              <p className="text-error/80 text-xs mt-1">
                {lang === 'tr' 
                  ? 'Lütfen önce Genel sekmesinden bir Albion Guild seçin. Aksi takdirde bildirimler çalışmayacaktır.' 
                  : 'Please select an Albion Guild from the General tab first. Otherwise, notifications will not work.'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kill Channel */}
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Kill (Öldürme) Kanalı' : 'Kill Channel'}
              <InfoTooltip text={lang === 'tr' ? 'Lonca üyeleriniz birini öldürdüğünde bildirimlerin gönderileceği kanal.' : 'Channel where notifications will be sent when your guild members kill someone.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.killboard_kill_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, killboard_kill_channel_id: e.target.value })}
            >
              <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
              {(discordChannels || []).filter(c => c.type === 0 || c.type === 5).map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>

          {/* Death Channel */}
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Death (Ölüm) Kanalı' : 'Death Channel'}
              <InfoTooltip text={lang === 'tr' ? 'Lonca üyeleriniz öldüğünde bildirimlerin gönderileceği kanal.' : 'Channel where notifications will be sent when your guild members die.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.killboard_death_channel_id || ""}
              onChange={(e) => setSettings({ ...settings, killboard_death_channel_id: e.target.value })}
            >
              <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
              {(discordChannels || []).filter(c => c.type === 0 || c.type === 5).map(c => (
                <option key={c.id} value={c.id}>#{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-primary-container/10 border border-primary-container/20 p-3 rounded-md flex gap-3 items-start mt-4">
          <Info className="text-primary-container mt-0.5" size={18} />
          <div>
            <p className="text-on-surface font-body-md text-sm">
              {lang === 'tr' 
                ? 'İpucu: Kill ve Death bildirimlerini aynı kanala göndermek isterseniz, her iki seçenek için de aynı kanalı seçebilirsiniz.' 
                : 'Tip: If you want to send Kill and Death notifications to the same channel, you can select the same channel for both options.'}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
