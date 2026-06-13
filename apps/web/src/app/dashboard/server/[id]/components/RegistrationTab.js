"use client";

import { useState } from "react";
import { Settings, MessageSquare, Tag, Users, Send, Loader2 } from "lucide-react";

export default function RegistrationTab({ t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving, guildId, registeredCount = 0 }) {
  const [sendingSetup, setSendingSetup] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const textChannels = (discordChannels || []).filter(c => c.type === 0);
  const categories = (discordChannels || []).filter(c => c.type === 4);

  const handleSendSetup = async () => {
    if (!settings.registration_channel_id) {
      alert("Please select a welcome channel first.");
      return;
    }
    setSendingSetup(true);
    try {
      const res = await fetch(`/api/register/setup/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (res.ok) alert(lang === 'en' ? "Setup message sent successfully!" : "Kurulum mesajı başarıyla gönderildi!");
      else alert(data.error || "Failed to send setup message.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingSetup(false);
    }
  const handleSync = async () => {
    if (!settings.albion_guild_id) {
      alert(lang === 'en' ? "Please set your guild in General settings first!" : "Lütfen önce Genel ayarlardan guildinizi seçin!");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch(`/api/register/sync/${guildId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) alert(lang === 'en' ? "Sync process started in background." : "Senkronizasyon işlemi arka planda başlatıldı.");
      else alert(data.error || "Failed to start sync.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bentoGrid">
      {/* Settings Section */}
      <div className="bentoBox span6" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <h2 className="bentoTitle">
          <Settings size={24} style={{ color: 'var(--accent-color)' }} />
          {lang === 'en' ? 'Registration Config' : 'Kayıt Ayarları'}
        </h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>
          {lang === 'en' 
            ? 'Set up an automated registration system. Users click "Register", enter their details, and a private ticket channel is created for staff to review their Albion stats.' 
            : 'Otomatik bir kayıt sistemi kurun. Kullanıcılar "Kayıt Ol" butonuna tıklar, bilgilerini girer ve yetkililerin Albion istatistiklerini incelemesi için özel bir ticket kanalı açılır.'}
        </p>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Enable Registration System' : 'Kayıt Sistemini Aktifleştir'}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.registration_enabled || false}
                onChange={(e) => setSettings({ ...settings, registration_enabled: e.target.checked })}
              />
              <span className="slider"></span>
            </label>
            <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
              {settings.registration_enabled 
                ? (lang === 'en' ? 'System is Active' : 'Sistem Aktif') 
                : (lang === 'en' ? 'System is Disabled' : 'Sistem Kapalı')}
            </span>
          </div>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Welcome Channel (Where the button will be sent)' : 'Karşılama Kanalı (Butonun atılacağı kanal)'}
          </label>
          <select
            className="select"
            value={settings.registration_channel_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_channel_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
            {textChannels.map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Ticket Category (Where private tickets will open)' : 'Ticket Kategorisi (Özel biletlerin açılacağı kategori)'}
          </label>
          <select
            className="select"
            value={settings.registration_category_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_category_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Category' : 'Kategori Seçin'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Staff Role (Who can view the tickets)' : 'Yetkili Rolü (Biletleri kimler görebilir)'}
          </label>
          <select
            className="select"
            value={settings.registration_staff_role_ids || ""}
            onChange={(e) => setSettings({ ...settings, registration_staff_role_ids: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Given Role 1 (Assigned on button 1)' : 'Verilecek Rol 1 (Kayıt onaylandığında verilecek)'}
          </label>
          <select
            className="select"
            value={settings.registration_given_role_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_given_role_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Given Role 2 (Assigned on button 2)' : 'Verilecek Rol 2 (Kayıt onaylandığında verilecek)'}
          </label>
          <select
            className="select"
            value={settings.registration_given_role_id_2 || ""}
            onChange={(e) => setSettings({ ...settings, registration_given_role_id_2: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Given Role 3 (Assigned on button 3)' : 'Verilecek Rol 3 (Kayıt onaylandığında verilecek)'}
          </label>
          <select
            className="select"
            value={settings.registration_given_role_id_3 || ""}
            onChange={(e) => setSettings({ ...settings, registration_given_role_id_3: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Unregistered Role (Role to remove upon approval)' : 'Kayıtsız Rolü (Onaylanınca otomatik alınacak)'}
          </label>
          <select
            className="select"
            value={settings.registration_unregistered_role_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_unregistered_role_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Auto Role on Join (Given immediately on join)' : 'Otomatik Rol (Sunucuya girene anında verilir)'}
          </label>
          <select
            className="select"
            value={settings.auto_role_on_join_id || ""}
            onChange={(e) => setSettings({ ...settings, auto_role_on_join_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
            {(discordRoles || []).map(r => (
              <option key={r.id} value={r.id}>@{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Message Setup Section */}
      <div className="bentoBox span6" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <h2 className="bentoTitle">
          <MessageSquare size={24} style={{ color: 'var(--accent-color)' }} />
          {lang === 'en' ? 'Welcome Message' : 'Karşılama Mesajı'}
        </h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>
          {lang === 'en' 
            ? 'Customize the message that will be sent along with the "Register" button.' 
            : '"Kayıt Ol" butonu ile birlikte gönderilecek mesajı özelleştirin.'}
        </p>

        <div className="inputGroup" style={{ flexGrow: 1 }}>
          <label className="label">
            {lang === 'en' ? 'Message Text' : 'Buton Mesaj Metni'}
          </label>
          <textarea
            className="textarea"
            rows={4}
            placeholder={lang === 'en' ? 'Welcome! Click the button below to register.' : 'Hoşgeldiniz! Kayıt olmak için aşağıdaki butona tıklayın.'}
            value={settings.registration_welcome_message || ""}
            onChange={(e) => setSettings({ ...settings, registration_welcome_message: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }}></div>
        
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-color)' }}>
          {lang === 'en' ? 'Post-Registration Settings' : 'Kayıt Sonrası İşlemler'}
        </h3>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Log Channel (Where approve/reject results are sent)' : 'Log Kanalı (Onay/Red sonuçlarının atılacağı kanal)'}
          </label>
          <select
            className="select"
            value={settings.registration_log_channel_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_log_channel_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
            {textChannels.map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup">
          <label className="label">
            {lang === 'en' ? 'Public Welcome Channel (Where new members are announced)' : 'Genel Karşılama Kanalı (Yeni üyelerin duyurulacağı kanal)'}
          </label>
          <select
            className="select"
            value={settings.registration_welcome_channel_id || ""}
            onChange={(e) => setSettings({ ...settings, registration_welcome_channel_id: e.target.value })}
          >
            <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
            {textChannels.map(c => (
              <option key={c.id} value={c.id}>#{c.name}</option>
            ))}
          </select>
        </div>

        <div className="inputGroup" style={{ flexGrow: 1 }}>
          <label className="label">
            {lang === 'en' ? 'Public Welcome Message' : 'Genel Karşılama Mesajı'}
          </label>
          <textarea
            className="textarea"
            rows={3}
            placeholder={lang === 'en' ? 'Welcome to the guild, {user} ({gamenickname})!' : 'Aramıza hoş geldin {user}! Oyun içi adın: {gamenickname}'}
            value={settings.registration_welcome_message_text || ""}
            onChange={(e) => setSettings({ ...settings, registration_welcome_message_text: e.target.value })}
            style={{ resize: 'vertical' }}
          />
          <p style={{fontSize: '0.75rem', color: '#aaa', marginTop: '0.3rem'}}>
            {lang === 'en' ? 'Variables: {user}, {gamenickname}, {realname}, {age}' : 'Değişkenler: {user}, {gamenickname}, {realname}, {age}'}
          </p>
        </div>

        <button 
          className="dockItem" 
          style={{ width: '100%', justifyContent: 'center', background: 'var(--accent-color)', color: '#000', marginTop: '1rem', padding: '1rem' }} 
          onClick={handleSendSetup} 
          disabled={!settings.registration_channel_id || sendingSetup}
        >
          {sendingSetup ? <Loader2 size={18} className="spin"/> : <Send size={18}/>} 
          {lang === 'en' ? 'Send Setup Message to Channel' : 'Kurulum Mesajını Kanala Gönder'}
        </button>
        <p className="hint" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          {lang === 'en' 
            ? 'Save your settings first, then click this button to send the persistent message with the Register button.' 
            : 'Önce ayarları kaydedin, ardından butonu içeren sabit mesajı göndermek için buraya tıklayın.'}
        </p>

        {/* Total Registered Count */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
            {lang === 'en' ? `Total Registered Members: ${registeredCount}` : `Toplam Kayıtlı Üye: ${registeredCount}`}
          </div>
        </div>
      </div>

      {/* Auto Check System Section */}
      <div className="bentoBox span12" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <h2 className="bentoTitle">
          <Users size={24} style={{ color: 'var(--accent-color)' }} />
          {lang === 'en' ? 'Guild Leave Auto-Check System' : 'Guild Ayrılık Kontrol Sistemi'}
        </h2>
        <p className="hint" style={{ marginBottom: '1.5rem' }}>
          {lang === 'en' 
            ? 'Automatically cross-checks registered users with your Albion guild roster. Removes roles if they leave.' 
            : 'Kayıtlı kullanıcıları Albion guild listenizle otomatik karşılaştırır. Ayrılanların yetkilerini alır.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div className="inputGroup">
              <label className="label">
                {lang === 'en' ? 'Enable Auto-Check' : 'Sistemi Aktif Et'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.auto_check_enabled || false}
                    onChange={(e) => setSettings({ ...settings, auto_check_enabled: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
                  {settings.auto_check_enabled 
                    ? (lang === 'en' ? 'Enabled' : 'Aktif') 
                    : (lang === 'en' ? 'Disabled' : 'Kapalı')}
                </span>
              </div>
            </div>

            <div className="inputGroup">
              <label className="label">
                {lang === 'en' ? 'Check Interval (Days, Min 3)' : 'Kontrol Aralığı (Gün, Min 3)'}
              </label>
              <input
                type="number"
                min="3"
                className="input"
                value={settings.auto_check_interval || 3}
                onChange={(e) => {
                  let val = parseInt(e.target.value);
                  if (isNaN(val)) val = 3;
                  if (val < 3) val = 3;
                  setSettings({ ...settings, auto_check_interval: val });
                }}
              />
            </div>

            <div className="inputGroup">
              <label className="label">
                {lang === 'en' ? 'Guild Tag (Max 5 chars, will strip [TAG])' : 'Guild Tagi (Max 5 harf, isimden [TAG] silinecek)'}
              </label>
              <input
                type="text"
                maxLength="5"
                className="input"
                placeholder={lang === 'en' ? 'e.g. ABCDE' : 'Örn: TAG'}
                value={settings.auto_check_guild_tag || ""}
                onChange={(e) => setSettings({ ...settings, auto_check_guild_tag: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="inputGroup">
              <label className="label">
                {lang === 'en' ? 'Role for Leavers' : "Guild'den Çıkanlara Verilecek Rol"}
              </label>
              <select
                className="select"
                value={settings.auto_check_custom_role_id || ""}
                onChange={(e) => setSettings({ ...settings, auto_check_custom_role_id: e.target.value })}
              >
                <option value="">{lang === 'en' ? 'Use Default Unregistered Role' : 'Varsayılan Kayıtsız Rolünü Kullan'}</option>
                {(discordRoles || []).map(r => (
                  <option key={r.id} value={r.id}>@{r.name}</option>
                ))}
              </select>
            </div>

            <div className="inputGroup">
              <label className="label">
                {lang === 'en' ? 'Report Log Channel' : 'Rapor/Log Kanalı'}
              </label>
              <select
                className="select"
                value={settings.auto_check_log_channel_id || ""}
                onChange={(e) => setSettings({ ...settings, auto_check_log_channel_id: e.target.value })}
              >
                <option value="">{lang === 'en' ? 'Select Channel' : 'Kanal Seçin'}</option>
                {textChannels.map(c => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div className="inputGroup" style={{ marginTop: '2rem' }}>
              <label className="label" style={{ color: 'var(--accent-color)' }}>
                {lang === 'en' ? 'Backward Compatibility Sync' : 'Geriye Dönük Senkronizasyon (Sync)'}
              </label>
              <p className="hint" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
                {lang === 'en' 
                  ? 'Adds existing old members to the database safely. (Requires Guild to be set in General Settings)' 
                  : 'Eski kayıtlı üyelerinizi sisteme güvenle dahil eder. (Genel ayarlardan guild seçilmiş olması zorunludur)'}
              </p>
              <button 
                className="dockItem" 
                style={{ width: '100%', justifyContent: 'center', background: settings.albion_guild_id ? '#3b82f6' : 'rgba(255,255,255,0.1)', color: '#fff' }} 
                onClick={handleSync} 
                disabled={syncing}
              >
                {syncing ? <Loader2 size={18} className="spin"/> : <Users size={18}/>} 
                {lang === 'en' ? (settings.albion_guild_id ? 'Start Sync Process' : 'Set Guild in General Settings First') : (settings.albion_guild_id ? 'Senkronizasyon İşlemini Başlat' : 'Önce Genel Ayarlardan Guild Seçin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
