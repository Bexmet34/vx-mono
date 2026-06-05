"use client";

import { Copy, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function TemplateTab({ t, lang, settings, setSettings, selectedTemplateId, setSelectedTemplateId }) {
  const selectedTemplate = settings.party_templates?.find(tpl => tpl.id === selectedTemplateId) || null;

  const [localReq, setLocalReq] = useState("");
  const [localOpt, setLocalOpt] = useState("");

  useEffect(() => {
    if (selectedTemplate) {
      setLocalReq((selectedTemplate.required_roles || []).join("\n"));
      setLocalOpt((selectedTemplate.optional_roles || []).join("\n"));
    }
  }, [selectedTemplateId]);

  const handleCreateTemplate = () => {
    const newTemplate = { id: `tpl_${Date.now()}`, name: "New Template", required_roles: [], optional_roles: [] };
    setSettings({ ...settings, party_templates: [...(settings.party_templates || []), newTemplate] });
    setSelectedTemplateId(newTemplate.id);
  };

  const handleUpdateTemplate = (updates) => {
    if (!selectedTemplateId) return;
    setSettings(prev => ({
      ...prev,
      party_templates: prev.party_templates.map(tpl => tpl.id === selectedTemplateId ? { ...tpl, ...updates } : tpl)
    }));
  };

  const handleDeleteTemplate = (id) => {
    setSettings(prev => ({
      ...prev,
      party_templates: prev.party_templates.filter(tpl => tpl.id !== id)
    }));
    if (selectedTemplateId === id) setSelectedTemplateId(null);
  };

  const handleReqChange = (e) => {
    setLocalReq(e.target.value);
    handleUpdateTemplate({ required_roles: e.target.value.split("\n").map(r => r.trim()).filter(Boolean) });
  };

  const handleOptChange = (e) => {
    setLocalOpt(e.target.value);
    handleUpdateTemplate({ optional_roles: e.target.value.split("\n").map(r => r.trim()).filter(Boolean) });
  };

  return (
    <div className="bentoGrid">
      <div className="bentoBox span4" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="bentoTitle" style={{ margin: 0 }}><Copy /> {lang === 'en' ? 'Templates' : 'Şablonlar'}</h2>
          <button className="dockItem" style={{ padding: '0.4rem', borderRadius: '8px' }} onClick={handleCreateTemplate}>
             <Plus size={18} />
          </button>
        </div>
        
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {(!settings.party_templates || settings.party_templates.length === 0) ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>{lang === 'en' ? 'No templates yet.' : 'Henüz şablon yok.'}</div>
          ) : (
            settings.party_templates.map(tpl => (
              <div 
                key={tpl.id} 
                className={`listItem ${selectedTemplateId === tpl.id ? 'active' : ''}`}
                style={{ margin: 0, borderRadius: 0, border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: selectedTemplateId === tpl.id ? 'rgba(252,163,17,0.1)' : 'transparent' }}
                onClick={() => setSelectedTemplateId(tpl.id)}
              >
                <div style={{ fontWeight: 600, color: selectedTemplateId === tpl.id ? 'var(--accent-color)' : '#fff' }}>{tpl.name}</div>
                <button className="btnIcon" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bentoBox span8">
        {!selectedTemplate ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            {lang === 'en' ? 'Select or create a template to edit.' : 'Düzenlemek için bir şablon seçin veya oluşturun.'}
          </div>
        ) : (
          <div>
            <h3 className="bentoTitle" style={{ fontSize: '1.25rem' }}>{lang === 'en' ? 'Edit Template' : 'Şablonu Düzenle'}</h3>
            <div className="inputGroup">
              <label className="label">{lang === 'en' ? 'Template Name' : 'Şablon Adı'}</label>
              <input 
                type="text" 
                className="input" 
                value={selectedTemplate.name} 
                onChange={(e) => handleUpdateTemplate({ name: e.target.value })} 
              />
            </div>
            
            <div className="inputGroup">
              <label className="label">{lang === 'en' ? 'Required Roles (one per line)' : 'Gerekli Roller (Her satıra bir tane)'}</label>
              <textarea 
                className="textarea" 
                rows={5}
                value={localReq} 
                onChange={handleReqChange} 
                style={{ resize: 'vertical' }}
              />
              <p className="hint">{lang === 'en' ? 'E.g. Tank\nHealer\nDPS' : 'Örn: Tank\nHealer\nDPS'}</p>
            </div>

            <div className="inputGroup">
              <label className="label">{lang === 'en' ? 'Optional Roles (one per line)' : 'İsteğe Bağlı Roller (Her satıra bir tane)'}</label>
              <textarea 
                className="textarea" 
                rows={3}
                value={localOpt} 
                onChange={handleOptChange} 
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
