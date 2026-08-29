import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Loader2, Save, X, Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@veyronix/database';

export default function AdminAnnouncementsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title_tr: '',
    title_en: '',
    content_tr: '',
    content_en: '',
    type: 'info',
    is_active: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title_tr || !formData.title_en) return alert('Başlıklar zorunludur.');
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...formData, id: editingId } : formData;

      const res = await fetch('/api/announcements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setShowModal(false);
        fetchAnnouncements();
      } else {
        const err = await res.json();
        alert(err.error || 'Hata oluştu');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        title_tr: item.title_tr,
        title_en: item.title_en,
        content_tr: item.content_tr,
        content_en: item.content_en,
        type: item.type,
        is_active: item.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        title_tr: '',
        title_en: '',
        content_tr: '',
        content_en: '',
        type: 'info',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertCircle size={16} style={{color: '#f87171'}} />;
      case 'warning': return <AlertTriangle size={16} style={{color: '#facc15'}} />;
      case 'success': return <CheckCircle2 size={16} style={{color: '#4ade80'}} />;
      default: return <Info size={16} style={{color: '#60a5fa'}} />;
    }
  };

  return (
    <div className="animate-slide-up">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h2 style={{fontSize: '1.5rem', fontWeight: '800'}}>Duyuru Yönetimi</h2>
          <p style={{color: 'var(--admin-text-muted)'}}>Dashboard üzerinde görünen duyuruları buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="admin-btn"
        >
          <Plus size={14} /> Yeni Duyuru
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "8rem" }}>
          <Loader2 className="spin" size={40} color="var(--admin-accent)" />
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem'}}>
          {announcements.map((a) => (
            <div key={a.id} style={{
              background: 'var(--admin-card)', 
              borderRadius: '16px', 
              border: `1px solid var(--admin-border)`, 
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              opacity: a.is_active ? 1 : 0.6,
              transition: 'transform 0.3s ease',
            }}>
              <div style={{ padding: '1.2rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--admin-text)' }}>
                  {getTypeIcon(a.type)}
                  {a.title_tr}
                </div>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                   <button onClick={() => openModal(a)} className="admin-action-btn">
                     <Edit3 size={14} />
                   </button>
                   <button onClick={() => handleDelete(a.id)} className="admin-action-btn danger">
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.content_tr || 'İçerik yok.'}
                </p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--admin-text-muted)', paddingTop: '1rem' }}>
                  <span>{new Date(a.created_at).toLocaleString('tr-TR')}</span>
                  {a.is_active ? <span className="admin-badge badge-active" style={{padding: '0.2rem 0.6rem'}}>Aktif</span> : <span className="admin-badge badge-passive" style={{padding: '0.2rem 0.6rem'}}>Pasif</span>}
                </div>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
             <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--admin-text-muted)', background: 'var(--admin-card)', borderRadius: '16px', border: '1px solid var(--admin-border)'}}>
               Henüz duyuru eklenmemiş.
             </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal animate-slide-up" style={{maxWidth: '800px'}} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header border-b border-[var(--admin-border)] mb-2 pb-4">
              <h3 className="admin-modal-title">{editingId ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                <X size={14} />
              </button>
            </div>
            
            <div className="admin-modal-body space-y-4" style={{maxHeight: '70vh', overflowY: 'auto'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label className="admin-input-label">TR Başlık</label>
                  <input
                    type="text"
                    value={formData.title_tr}
                    onChange={(e) => setFormData({...formData, title_tr: e.target.value})}
                    className="admin-input-field"
                    placeholder="Türkçe başlık..."
                  />
                </div>
                <div>
                  <label className="admin-input-label">EN Başlık</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                    className="admin-input-field"
                    placeholder="English title..."
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label className="admin-input-label">TR İçerik (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    value={formData.content_tr}
                    onChange={(e) => setFormData({...formData, content_tr: e.target.value})}
                    className="admin-input-field"
                    style={{resize: 'none', height: '120px'}}
                  />
                </div>
                <div>
                  <label className="admin-input-label">EN İçerik (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    value={formData.content_en}
                    onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                    className="admin-input-field"
                    style={{resize: 'none', height: '120px'}}
                  />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label className="admin-input-label">Duyuru Tipi / Renk</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="admin-input-field"
                  >
                    <option value="info">Mavi (Bilgi)</option>
                    <option value="warning">Sarı (Uyarı)</option>
                    <option value="danger">Kırmızı (Acil / Hata)</option>
                    <option value="success">Yeşil (Başarı / Güncelleme)</option>
                  </select>
                </div>
                <div style={{display: 'flex', alignItems: 'center', marginTop: '1.5rem'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: '600'}}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      style={{width: '20px', height: '20px', accentColor: 'var(--admin-accent)'}}
                    />
                    <span style={{fontSize: '0.9rem'}}>Aktif (Dashboard'da Göster)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer mt-3 pt-4 border-t border-[var(--admin-border)]">
              <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="admin-btn-primary"
              >
                {saving ? <Loader2 size={14} className="spin" /> : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
