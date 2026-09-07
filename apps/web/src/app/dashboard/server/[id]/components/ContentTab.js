"use client";

import { Layout } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useLanguage } from "@/context/LanguageContext";

export default function ContentTab({ 
  settings, setSettings, 
  guildId, showToast, discordChannels, discordRoles
}) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Content System Settings */}
      <div className="glass-panel p-3 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        <h2 className="font-headline-lg text-[10px] text-on-surface mb-3 flex items-center gap-2 uppercase tracking-tight">
          <Layout className="text-primary-container" /> {lang === 'tr' ? 'Content Sistemi Ayarları' : 'Content System Settings'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Sistem Modu Seçimi' : 'System Mode Selection'}
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.system_mode || "command"}
              onChange={(e) => setSettings({ ...settings, system_mode: e.target.value })}
            >
              <option value="command">{lang === 'tr' ? 'Sadece Komut Modu (Mevcut)' : 'Command Only Mode (Default)'}</option>
              <option value="fixed_channel">{lang === 'tr' ? 'Sabit Kanal ve Buton Modu' : 'Fixed Channel & Button Mode'}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
              {lang === 'tr' ? 'Kanal Otomatik Temizleme (Boş Kanallar)' : 'Auto-Delete Party Channels'}
              <InfoTooltip text={lang === 'tr' ? 'Oluşturulma tarihinin üzerinden bu süre geçen Content kanalları otomatik silinir.' : 'Party channels older than this duration will be deleted automatically.'} />
            </label>
            <select
              className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
              value={settings.auto_delete_party_hours || 0}
              onChange={(e) => setSettings({ ...settings, auto_delete_party_hours: parseInt(e.target.value) })}
            >
              <option value={0}>{lang === 'tr' ? 'Kapalı' : 'Disabled'}</option>
              <option value={1}>{lang === 'tr' ? '1 Saat Sonra Sil' : 'Delete after 1 Hour'}</option>
              <option value={3}>{lang === 'tr' ? '3 Saat Sonra Sil' : 'Delete after 3 Hours'}</option>
              <option value={6}>{lang === 'tr' ? '6 Saat Sonra Sil' : 'Delete after 6 Hours'}</option>
              <option value={12}>{lang === 'tr' ? '12 Saat Sonra Sil' : 'Delete after 12 Hours'}</option>
              <option value={24}>{lang === 'tr' ? '24 Saat Sonra Sil' : 'Delete after 24 Hours'}</option>
            </select>
          </div>
        </div>

        {settings.system_mode === 'fixed_channel' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-down">
            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Sabit Mesaj Kanalı' : 'Fixed Message Channel'}
                <InfoTooltip text={lang === 'tr' ? 'Sabit butonlu mesajın atılacağı kanal.' : 'The channel where the fixed message will be sent.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.fixed_message_channel_id || ""}
                onChange={(e) => setSettings({ ...settings, fixed_message_channel_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? 'Kanal Seçin...' : 'Select Channel...'}</option>
                {(discordChannels || []).filter(c => c.type === 0 || c.type === 5).map(c => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Hedef Kategori' : 'Target Category'}
                <InfoTooltip text={lang === 'tr' ? 'Yeni açılacak content kanallarının konulacağı kategori.' : 'Category where new content channels will be created.'} />
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.target_category_id || ""}
                onChange={(e) => setSettings({ ...settings, target_category_id: e.target.value })}
              >
                <option value="">{lang === 'tr' ? 'Kategori Seçin...' : 'Select Category...'}</option>
                {(discordChannels || []).filter(c => c.type === 4).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Kanal İsim Formatı' : 'Channel Name Format'}
              </label>
              <select
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                value={settings.channel_name_format || "name_title"}
                onChange={(e) => setSettings({ ...settings, channel_name_format: e.target.value })}
              >
                <option value="name_title">{lang === 'tr' ? 'İsim - Başlık (Örn: ali-zvz)' : 'Name - Title (e.g. ali-zvz)'}</option>
                <option value="title_only">{lang === 'tr' ? 'Sadece Başlık (Örn: zvz)' : 'Title Only (e.g. zvz)'}</option>
                <option value="title_name">{lang === 'tr' ? 'Başlık - İsim (Örn: zvz-ali)' : 'Title - Name (e.g. zvz-ali)'}</option>
                <option value="type_title">{lang === 'tr' ? 'Kategori/Tür - Başlık (Örn: zvz-avalonda-zvz)' : 'Type - Title (e.g. zvz-avalonda-zvz)'}</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                  {lang === 'tr' ? 'Kapatma Yetkisi Olan Roller' : 'Content Close Roles'}
                  <InfoTooltip text={lang === 'tr' ? 'Bu rollere sahip kişiler, parti sahibi olmasalar bile açık partileri kapatabilir.' : 'Users with these roles can close active parties even if they are not the owner.'} />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(() => {
                  let currentRoles = [];
                  try {
                    currentRoles = typeof settings.content_close_roles === 'string' 
                      ? JSON.parse(settings.content_close_roles) 
                      : (settings.content_close_roles || []);
                  } catch(err) {}
                  
                  const selectsToRender = [...currentRoles, ""];
                  if (selectsToRender.length > 5) selectsToRender.length = 5;
                  
                  return selectsToRender.map((roleId, index) => (
                    <div key={index} className="relative mb-2">
                      <label className="flex items-center justify-between text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                        <span>{lang === 'tr' ? `Yetkili Rol ${index + 1}` : `Authorized Role ${index + 1}`}</span>
                        {index < currentRoles.length && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newRoles = [...currentRoles];
                              newRoles.splice(index, 1);
                              setSettings({ ...settings, content_close_roles: JSON.stringify(newRoles) });
                            }}
                            className="text-[10px] text-error hover:text-error/80 transition-colors font-label-bold uppercase"
                          >
                            {lang === 'tr' ? 'Kaldır' : 'Remove'}
                          </button>
                        )}
                      </label>
                      <select
                        className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md"
                        value={roleId}
                        onChange={(e) => {
                          const val = e.target.value;
                          const newRoles = [...currentRoles];
                          if (index === currentRoles.length) {
                             if (val && !newRoles.includes(val)) newRoles.push(val);
                          } else {
                             if (!val) {
                               newRoles.splice(index, 1);
                             } else {
                               newRoles[index] = val;
                             }
                          }
                          setSettings({ ...settings, content_close_roles: JSON.stringify(newRoles) });
                        }}
                      >
                        <option value="">{lang === 'tr' ? 'Rol Seçin...' : 'Select Role...'}</option>
                        {(discordRoles || []).map(r => (
                          <option key={r.id} value={r.id}>@{r.name}</option>
                        ))}
                      </select>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'tr' ? 'Sabit Mesaj İçeriği' : 'Fixed Message Content'}
              </label>
              <textarea
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md h-24 custom-scrollbar"
                placeholder={lang === 'tr' ? "Lütfen bir parti oluşturmak için aşağıdaki butonları kullanın..." : "Please use the buttons below to create a party..."}
                value={settings.fixed_message_content || ""}
                onChange={(e) => setSettings({ ...settings, fixed_message_content: e.target.value })}
              />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <button
                className="px-3 py-1.5 bg-primary-container text-on-primary border border-primary-container rounded-sm font-label-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 tactical-glow"
                onClick={async () => {
                   if(!settings.fixed_message_channel_id) return showToast(lang === 'tr' ? "Lütfen kanal seçin!" : "Please select a channel!", "error");
                   const res = await fetch(`/api/guild-settings/${guildId}/send-fixed-message`, { method: "POST" });
                   if (res.ok) showToast(lang === 'tr' ? "Sabit mesaj gönderildi!" : "Fixed message sent!", "success");
                   else showToast(lang === 'tr' ? "Mesaj gönderilirken hata oluştu." : "Error sending message.", "error");
                }}
              >
                {lang === 'tr' ? 'Sabit Mesajı Gönder/Güncelle' : 'Send/Update Fixed Message'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
