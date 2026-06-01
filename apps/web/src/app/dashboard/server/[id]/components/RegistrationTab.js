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
      <div className="bentoBox span12" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
        <h2 className="bentoTitle">
          <Users size={24} style={{ color: 'var(--accent-color)' }} />
          {lang === 'en' ? 'Registration System' : 'Kayıt Sistemi'}
          <span style={{ marginLeft: '1rem', background: 'var(--accent-color)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>BETA</span>
        </h2>
        <p className="hint">
          {lang === 'en' 
            ? 'Set up an automated registration system. Users click "Register", enter their details, and a private ticket channel is created for staff to review their Albion stats.' 
            : 'Otomatik bir kayıt sistemi kurun. Kullanıcılar "Kayıt Ol" butonuna tıklar, bilgilerini girer ve yetkililerin Albion istatistiklerini incelemesi için özel bir ticket kanalı açılır.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
          <div>
            <div className="inputGroup">
              <label>
                <Settings size={16} /> 
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
              <label>
                <MessageSquare size={16} /> 
                {lang === 'en' ? 'Welcome Channel (Where the button will be sent)' : 'Karşılama Kanalı (Butonun atılacağı kanal)'}
              </label>
              <select
                className="selectInput"
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
              <label>
                <Tag size={16} /> 
                {lang === 'en' ? 'Ticket Category (Where private tickets will open)' : 'Ticket Kategorisi (Özel biletlerin açılacağı kategori)'}
              </label>
              <select
                className="selectInput"
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
              <label>
                <Users size={16} /> 
                {lang === 'en' ? 'Staff Role (Who can view the tickets)' : 'Yetkili Rolü (Biletleri kimler görebilir)'}
              </label>
              <select
                className="selectInput"
                value={settings.registration_staff_role_ids || ""}
                onChange={(e) => setSettings({ ...settings, registration_staff_role_ids: e.target.value })}
              >
                <option value="">{lang === 'en' ? 'Select Role' : 'Rol Seçin'}</option>
                {(discordRoles || []).map(r => (
                  <option key={r.id} value={r.id}>@{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="inputGroup">
              <label>
                <MessageSquare size={16} /> 
                {lang === 'en' ? 'Welcome Message Text' : 'Karşılama Mesajı Metni'}
              </label>
              <textarea
                className="textInput"
                rows={10}
                placeholder={lang === 'en' ? 'Welcome! Click the button below to register.' : 'Hoşgeldiniz! Kayıt olmak için aşağıdaki butona tıklayın.'}
                value={settings.registration_welcome_message || ""}
                onChange={(e) => setSettings({ ...settings, registration_welcome_message: e.target.value })}
                style={{ resize: 'vertical' }}
              />
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
      </div>
    </div>
  );
}
