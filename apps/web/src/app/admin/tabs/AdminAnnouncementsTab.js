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
      case 'danger': return <AlertCircle size={16} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Duyuru Yönetimi</h2>
          <p className="text-sm text-on-surface-variant">Dashboard üzerinde görünen duyuruları buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors font-semibold shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Yeni Duyuru
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.map((a) => (
            <div key={a.id} className={`p-4 rounded-xl border bg-surface-container border-outline-variant/30 relative flex flex-col gap-3 ${!a.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-on-surface">
                  {getTypeIcon(a.type)}
                  {a.title_tr}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openModal(a)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-3">{a.content_tr}</p>
              <div className="mt-auto pt-3 flex items-center justify-between text-[10px] text-outline-variant font-medium">
                <span>{new Date(a.created_at).toLocaleString('tr-TR')}</span>
                <span className={a.is_active ? 'text-green-500' : 'text-red-500'}>{a.is_active ? 'Aktif' : 'Pasif'}</span>
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <div className="col-span-full text-center py-12 text-on-surface-variant">Henüz duyuru eklenmemiş.</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface-container rounded-2xl w-full max-w-2xl border border-outline-variant/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/30 bg-surface-container-high">
              <h3 className="font-bold text-lg text-on-surface">{editingId ? 'Duyuru Düzenle' : 'Yeni Duyuru Ekle'}</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">TR Başlık</label>
                  <input
                    type="text"
                    value={formData.title_tr}
                    onChange={(e) => setFormData({...formData, title_tr: e.target.value})}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">EN Başlık</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">TR İçerik (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    value={formData.content_tr}
                    onChange={(e) => setFormData({...formData, content_tr: e.target.value})}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary custom-scrollbar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">EN İçerik (Opsiyonel)</label>
                  <textarea
                    rows={4}
                    value={formData.content_en}
                    onChange={(e) => setFormData({...formData, content_en: e.target.value})}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary custom-scrollbar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">Duyuru Tipi / Renk</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="info">Mavi (Bilgi)</option>
                    <option value="warning">Sarı (Uyarı)</option>
                    <option value="danger">Kırmızı (Acil / Hata)</option>
                    <option value="success">Yeşil (Başarı / Güncelleme)</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-surface bg-surface-container-high border-outline-variant"
                    />
                    <span className="text-sm font-semibold text-on-surface">Aktif (Dashboard'da Göster)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant/30 bg-surface-container-high flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
