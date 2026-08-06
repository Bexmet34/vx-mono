"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Play, Plus, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, Tag, Calendar, Layers } from "lucide-react";

export default function AdminBlogAutomationTab({ showToast }) {
  const [settings, setSettings] = useState({
    is_active: true,
    schedule_times: ['09:00', '15:00', '21:00'],
    posts_per_day: 3
  });
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // New Keyword Form State
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Albion Online');
  const [newPriority, setNewPriority] = useState(1);
  const [addingKeyword, setAddingKeyword] = useState(false);

  // Fetch Settings & Custom Keywords
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog-automation');
      const data = await res.json();
      if (res.ok) {
        if (data.settings) setSettings(data.settings);
        if (data.keywords) setKeywords(data.keywords);
      }
    } catch (err) {
      if (showToast) showToast('Veriler yüklenirken hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger Immediate Article Generation
  const handleTriggerNow = async () => {
    setTriggering(true);
    try {
      const res = await fetch('/api/admin/blog-automation/trigger', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        if (showToast) showToast(data.message || 'Yeni makale başarıyla yayınlandı!', 'success');
        fetchData(); // Refresh custom keyword list
      } else {
        if (showToast) showToast(data.error || 'Makale üretilemedi.', 'error');
      }
    } catch (err) {
      if (showToast) showToast(`Hata: ${err.message}`, 'error');
    } finally {
      setTriggering(false);
    }
  };

  // Add Custom Keyword
  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    setAddingKeyword(true);
    try {
      const res = await fetch('/api/admin/blog-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_keyword',
          keyword: newKeyword.trim(),
          category: newCategory,
          priority: newPriority
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (showToast) showToast('Özel anahtar kelime havuza eklendi!', 'success');
        setNewKeyword('');
        fetchData();
      } else {
        if (showToast) showToast(data.error || 'Ekleme başarısız.', 'error');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setAddingKeyword(false);
    }
  };

  // Delete Custom Keyword
  const handleDeleteKeyword = async (id) => {
    if (!confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`/api/admin/blog-automation?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (showToast) showToast('Anahtar kelime silindi.', 'success');
        setKeywords(prev => prev.filter(k => k.id !== id));
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  // Toggle Automation Status
  const handleToggleActive = async (newStatus) => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/blog-automation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          is_active: newStatus
        })
      });

      if (res.ok) {
        setSettings(prev => ({ ...prev, is_active: newStatus }));
        if (showToast) showToast(`Otomasyon ${newStatus ? 'Aktif' : 'Pasif'} yapıldı.`, 'success');
      }
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <Loader2 className="spin" size={32} color="var(--admin-accent)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Banner */}
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, rgba(88, 101, 242, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)', border: '1px solid rgba(88, 101, 242, 0.4)', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(88, 101, 242, 0.2)', color: '#5865F2', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>
              <Sparkles size={14} /> AI Blog Otomasyon Paneli
            </div>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontWeight: 'bold' }}>
              Otomatik SEO Blog İçerik Üreticisi
            </h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0', fontSize: '0.95rem' }}>
              Google Gemini 2.0 Flash ile günde 3 paylaşım otomatik yapılır veya dilediğiniz an tek tıkla makale ürettirebilirsiniz.
            </p>
          </div>

          {/* Action Button: Trigger Now */}
          <button
            onClick={handleTriggerNow}
            disabled={triggering}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: triggering ? 'rgba(88, 101, 242, 0.5)' : '#5865F2',
              color: '#fff',
              border: 'none',
              padding: '0.9rem 1.8rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: triggering ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(88, 101, 242, 0.4)',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            {triggering ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
            {triggering ? 'Makale Üretiliyor (15-30 sn)...' : '🚀 Şimdi Yapay Zeka İle Makale Üret'}
          </button>
        </div>
      </div>

      {/* Grid: Status Cards & Schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Automation Status Card */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#5865F2" /> Otomasyon Durumu
            </h3>
            <button
              onClick={() => handleToggleActive(!settings.is_active)}
              disabled={savingSettings}
              style={{
                background: settings.is_active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: settings.is_active ? '#10B981' : '#EF4444',
                border: `1px solid ${settings.is_active ? '#10B981' : '#EF4444'}`,
                padding: '0.3rem 0.8rem',
                borderRadius: '50px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {settings.is_active ? '● Aktif' : '○ Pasif'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span>Günlük Paylaşım Hedefi:</span>
              <strong style={{ color: '#fff' }}>Günde {settings.posts_per_day || 3} Makale</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span>Yapay Zeka Modeli:</span>
              <strong style={{ color: '#38BDF8' }}>Google Gemini 2.0 Flash (0 TL)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Görsel Motoru:</span>
              <strong style={{ color: '#F59E0B' }}>Pollinations AI (HD Art)</strong>
            </div>
          </div>
        </div>

        {/* Schedule Times Card */}
        <div className="admin-card">
          <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="#5865F2" /> Otomatik Paylaşım Saatleri
          </h3>
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            {(settings.schedule_times || ['09:00', '15:00', '21:00']).map((time, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '10px', textAlign: 'center', flex: 1, minWidth: '80px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {idx === 0 ? 'Sabah' : idx === 1 ? 'Öğlen' : 'Akşam'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>{time}</div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '0.2rem' }}>TSİ (UTC+3)</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Custom Keywords Form */}
      <div className="admin-card">
        <h3 style={{ fontSize: '1.2rem', color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} color="#5865F2" /> Özel Anahtar Kelime / Konu Ekleme Havuzu
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Buraya ekleyeceğiniz özel konular veya anahtar kelimeler, otomatik saatlerde yapay zeka tarafından <strong>öncelikli olarak</strong> işlenecek ve 1000+ kelimelik makalelere dönüştürülecektir.
        </p>

        <form onSubmit={handleAddKeyword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="admin-input-label">Anahtar Kelime veya Konu Başlığı</label>
            <input
              type="text"
              className="admin-input-field"
              placeholder="Örn: Albion Online 2026 PvP Dagger Build"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="admin-input-label">Kategori</label>
            <select
              className="admin-input-field"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <option value="Albion Online">Albion Online</option>
              <option value="Discord Rehberleri">Discord Rehberleri</option>
              <option value="Guild Yönetimi">Guild Yönetimi</option>
              <option value="Strateji">Strateji</option>
              <option value="Rehber">Genel Rehber</option>
            </select>
          </div>

          <div>
            <label className="admin-input-label">Öncelik Seviyesi</label>
            <select
              className="admin-input-field"
              value={newPriority}
              onChange={(e) => setNewPriority(parseInt(e.target.value))}
            >
              <option value={1}>Normal Öncelik</option>
              <option value={2}>🔥 Yüksek Öncelikli (İlk bu yazılır)</option>
            </select>
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={addingKeyword || !newKeyword.trim()}
            style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {addingKeyword ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
            Havuza Ekle
          </button>
        </form>
      </div>

      {/* Keywords List Table */}
      <div className="admin-card">
        <h3 style={{ fontSize: '1.1rem', color: '#fff', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="#5865F2" /> Bekleyen ve Kullanılan Konular ({keywords.length})
        </h3>

        {keywords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Henüz özel anahtar kelime eklenmedi. Sistem varsayılan 40+ konu havuzunu kullanıyor.
          </div>
        ) : (
          <div className="admin-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Konu / Anahtar Kelime</th>
                  <th>Kategori</th>
                  <th>Öncelik</th>
                  <th>Durum</th>
                  <th>Ekleme Tarihi</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map(kw => (
                  <tr key={kw.id}>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{kw.keyword}</td>
                    <td>
                      <span style={{ background: 'rgba(88, 101, 242, 0.15)', color: '#5865F2', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {kw.category || 'Genel'}
                      </span>
                    </td>
                    <td>
                      {kw.priority === 2 ? (
                        <span style={{ color: '#EF4444', fontWeight: 'bold', fontSize: '0.85rem' }}>🔥 Yüksek</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Normal</span>
                      )}
                    </td>
                    <td>
                      {kw.is_used ? (
                        <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          <CheckCircle2 size={14} /> Yayınlandı
                        </span>
                      ) : (
                        <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                          <Clock size={14} /> Sırada Bekliyor
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(kw.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteKeyword(kw.id)}
                        title="Sil"
                        style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#EF4444', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
