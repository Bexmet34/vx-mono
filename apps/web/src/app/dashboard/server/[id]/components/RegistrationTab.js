"use client";

import { useState } from "react";
import { Settings, MessageSquare, Tag, Users, Send, Loader2 } from "lucide-react";

export default function RegistrationTab({ t, lang, settings, setSettings, discordChannels, discordRoles, handleSave, saving, guildId }) {
  const [sendingSetup, setSendingSetup] = useState(false);
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
            {lang === 'en' ? 'Given Role (Role assigned upon approval)' : 'Verilecek Rol (Kayıt onaylandığında verilecek)'}
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
      </div>
    </div>
  );
}
