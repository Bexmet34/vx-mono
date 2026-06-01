import React from 'react';
import { Copy, Plus, List, ChevronRight, Trash2 } from "lucide-react";
import SaveButton from './SaveButton';

export default function TemplateTab({ t, lang, settings, setSettings, selectedTemplateId, setSelectedTemplateId, handleSave, saving }) {
  return (
    <div className="templates-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 className="section-title" style={{ margin: 0 }}><Copy size={22} /> {t.dTemplates}</h2>
          <p className="dash-hint">Sunucunuzda hızlıca parti kurmak için hazır şablonlar oluşturun.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => {
          const newId = Date.now().toString();
          const newTpl = { id: newId, name: "Yeni Şablon", title: "", description: "", roles: "Tank\nHeal\nDPS" };
          setSettings({ ...settings, party_templates: [...settings.party_templates, newTpl] });
          setSelectedTemplateId(newId);
        }} style={{ borderRadius: '14px', padding: '0.8rem 1.5rem' }}>
          <Plus size={20} /> {lang === 'en' ? 'New Template' : 'Yeni Şablon'}
        </button>
      </div>

      <div className="template-management-layout">
        {/* Sidebar List */}
        <div className="template-sidebar">
          <div className="template-list">
            {settings.party_templates.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>Henüz şablon yok.</div>
            ) : settings.party_templates.map(t_item => (
              <button
                key={t_item.id}
                className={`template-list-item ${selectedTemplateId === t_item.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(t_item.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                  <List size={16} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t_item.name}</span>
                </div>
                <ChevronRight size={14} opacity={selectedTemplateId === t_item.id ? 1 : 0.3} />
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="template-editor">
          {selectedTemplateId ? (() => {
            const tplIndex = settings.party_templates.findIndex(t_item => t_item.id === selectedTemplateId);
            const tpl = settings.party_templates[tplIndex];
            if (!tpl) return null;
            return (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>{tpl.name}</h3>
                  <button type="button" onClick={() => {
                    setSettings({ ...settings, party_templates: settings.party_templates.filter(t_item => t_item.id !== tpl.id) });
                    setSelectedTemplateId(null);
                  }} className="btn-secondary" style={{ color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.2)', background: 'rgba(255, 77, 79, 0.05)' }}>
                    <Trash2 size={18} /> {lang === 'en' ? 'Delete' : 'Sil'}
                  </button>
                </div>

                <div className="dash-input-group">
                  <label className="dash-label">Şablon İsmi</label>
                  <input type="text" className="dash-input" value={tpl.name} onChange={(e) => { const nt = [...settings.party_templates]; nt[tplIndex].name = e.target.value; setSettings({ ...settings, party_templates: nt }); }} />
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Varsayılan Başlık</label>
                  <input type="text" className="dash-input" value={tpl.title} onChange={(e) => { const nt = [...settings.party_templates]; nt[tplIndex].title = e.target.value; setSettings({ ...settings, party_templates: nt }); }} />
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">Rol Listesi</label>
                  <textarea className="dash-textarea" rows={8} value={tpl.roles} onChange={(e) => { const nt = [...settings.party_templates]; nt[tplIndex].roles = e.target.value; setSettings({ ...settings, party_templates: nt }); }} style={{ fontSize: '0.95rem', background: 'rgba(0,0,0,0.3)', lineHeight: '1.6' }} placeholder="Tank&#10;Healer&#10;DPS" />
                  <p className="dash-hint">Her satıra bir rol gelecek şekilde yazın.</p>
                </div>

                {/* Save button immediately under the editor */}
                <div style={{ marginTop: '2rem' }}>
                   <SaveButton onClick={handleSave} saving={saving} t={t} />
                </div>
              </div>
            );
          })() : (
            <div className="empty-editor-state">
              <div style={{ background: 'var(--dash-accent-muted)', padding: '2rem', borderRadius: '50%', color: 'var(--dash-accent)' }}><Copy size={48} /></div>
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>{lang === 'en' ? 'Select a Template' : 'Bir Şablon Seçin'}</h3>
                <p>Düzenlemeye başlamak için listeden bir şablon seçin veya yeni bir tane oluşturun.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
