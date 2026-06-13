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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-slide-up">
      <div className="glass-panel relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-4 flex flex-col">
        <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-highest/30">
          <h2 className="font-headline-md text-xl text-on-surface flex items-center gap-2 uppercase tracking-tight m-0"><Copy className="text-primary-container" /> {lang === 'en' ? 'Templates' : 'Şablonlar'}</h2>
          <button className="p-2 bg-surface-container border border-outline-variant hover:border-primary-container hover:text-primary-container rounded-sm transition-colors text-on-surface-variant" onClick={handleCreateTemplate}>
             <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[300px] max-h-[500px]">
          {(!settings.party_templates || settings.party_templates.length === 0) ? (
            <div className="p-8 text-center text-on-surface-variant font-body-md">{lang === 'en' ? 'No templates yet.' : 'Henüz şablon yok.'}</div>
          ) : (
            settings.party_templates.map(tpl => (
              <div 
                key={tpl.id} 
                className={`flex justify-between items-center p-4 border-b border-outline-variant/30 cursor-pointer transition-colors group ${selectedTemplateId === tpl.id ? 'bg-primary-container/10 border-l-2 border-l-primary-container' : 'hover:bg-white/5 border-l-2 border-l-transparent'}`}
                onClick={() => setSelectedTemplateId(tpl.id)}
              >
                <div className={`font-label-bold ${selectedTemplateId === tpl.id ? 'text-primary-container' : 'text-on-surface'}`}>{tpl.name}</div>
                <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="glass-panel p-8 relative overflow-hidden border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-8">
        {!selectedTemplate ? (
          <div className="h-full min-h-[400px] flex items-center justify-center text-on-surface-variant font-body-md bg-surface-container-lowest/50 border border-dashed border-outline-variant/50 rounded-sm">
            {lang === 'en' ? 'Select or create a template to edit.' : 'Düzenlemek için bir şablon seçin veya oluşturun.'}
          </div>
        ) : (
          <div className="animate-slide-up">
            <h3 className="font-headline-lg text-2xl text-on-surface mb-8 pb-4 border-b border-outline-variant/50 uppercase tracking-tight">{lang === 'en' ? 'Edit Template' : 'Şablonu Düzenle'}</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">{lang === 'en' ? 'Template Name' : 'Şablon Adı'}</label>
              <input 
                type="text" 
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
                value={selectedTemplate.name || ""} 
                onChange={(e) => handleUpdateTemplate({ name: e.target.value })} 
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">{lang === 'en' ? 'Description' : 'Açıklama'}</label>
              <textarea 
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y" 
                rows={2}
                value={selectedTemplate.description || ""} 
                onChange={(e) => handleUpdateTemplate({ description: e.target.value })} 
                placeholder={lang === 'en' ? 'Optional description for this party...' : 'Bu parti için isteğe bağlı açıklama...'}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-6">
                <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">{lang === 'en' ? 'Required Roles' : 'Gerekli Roller'}</label>
                <textarea 
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y" 
                  rows={5}
                  value={localReq} 
                  onChange={handleReqChange} 
                />
                <p className="text-xs font-body-md text-on-surface-variant mt-2">{lang === 'en' ? 'One per line. E.g. Tank\nHealer\nDPS' : 'Her satıra bir tane. Örn: Tank\nHealer\nDPS'}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">{lang === 'en' ? 'Optional Roles' : 'İsteğe Bağlı Roller'}</label>
                <textarea 
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y" 
                  rows={5}
                  value={localOpt} 
                  onChange={handleOptChange} 
                />
                <p className="text-xs font-body-md text-on-surface-variant mt-2">{lang === 'en' ? 'One per line.' : 'Her satıra bir tane.'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
