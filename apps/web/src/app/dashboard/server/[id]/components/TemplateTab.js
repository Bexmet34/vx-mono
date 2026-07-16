"use client";

import { Copy, Plus, Trash2, GripVertical, PlusCircle } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useState, useEffect } from "react";
import { 
  albionWeapons, 
  albionHeads, 
  albionChests, 
  albionShoes, 
  albionPotions, 
  albionFoods 
} from "@/data/albionItems";

export default function TemplateTab({ t, lang, settings, setSettings, selectedTemplateId, setSelectedTemplateId, isPremium, showToast }) {
  const selectedTemplate = settings.party_templates?.find(tpl => tpl.id === selectedTemplateId) || null;

  const [blocks, setBlocks] = useState([]);

  // Yalnızca şablon DEĞİŞTİĞİNDE blokları parse et.
  // selectedTemplate'i dependency olarak verirsek her harfte useEffect tetiklenir ve focus kaybolur.
  useEffect(() => {
    const template = settings.party_templates?.find(tpl => tpl.id === selectedTemplateId) || null;
    if (template) {
      const allRoles = [...(template.required_roles || []), ...(template.optional_roles || [])];
      const parsedBlocks = [];
      allRoles.forEach((line, index) => {
        const trimmed = line.trim();
        if(!trimmed) return;
        if (trimmed.startsWith("#HEADER:") || trimmed.startsWith("#")) {
          const text = trimmed.startsWith("#HEADER:") ? trimmed.substring(8).trim() : trimmed.substring(1).trim();
          parsedBlocks.push({ id: `blk_${index}_${Date.now()}`, type: "header", text });
        } else if (trimmed.includes(">")) {
          const [weaponPart, gearPart] = trimmed.split(">");
          const gears = gearPart ? gearPart.split("-").map(s => s.trim()) : [];
          parsedBlocks.push({
            id: `blk_${index}_${Date.now()}`,
            type: "role",
            weapon: weaponPart.trim(),
            head: gears[0] || "",
            chest: gears[1] || "",
            shoes: gears[2] || "",
            potion: gears[3] || "",
            food: gears[4] || ""
          });
        } else {
          parsedBlocks.push({
            id: `blk_${index}_${Date.now()}`,
            type: "role",
            weapon: trimmed,
            head: "", chest: "", shoes: "", potion: "", food: ""
          });
        }
      });
      setBlocks(parsedBlocks);
    } else {
      setBlocks([]);
    }
  }, [selectedTemplateId]);

  const handleUpdateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    const required_roles = newBlocks.map(b => {
      if (b.type === "header") {
        return `#${b.text}`;
      } else {
        const gearArr = [b.head, b.chest, b.shoes, b.potion, b.food].map(x => x || "");
        const hasGear = gearArr.some(x => x !== "");
        if (hasGear) {
          return `${b.weapon || "Unknown"} > ${gearArr.map(g => g || " ").join(" - ")}`;
        } else {
          return b.weapon || "Unknown";
        }
      }
    });
    
    if (!selectedTemplateId) return;
    setSettings(prev => ({
      ...prev,
      party_templates: prev.party_templates.map(tpl => tpl.id === selectedTemplateId ? { ...tpl, required_roles, optional_roles: [] } : tpl)
    }));
  };

  const addBlock = (type) => {
    const newBlock = type === "header" 
      ? { id: `blk_${Date.now()}_${Math.random()}`, type: "header", text: "" }
      : { id: `blk_${Date.now()}_${Math.random()}`, type: "role", weapon: "", head: "", chest: "", shoes: "", potion: "", food: "" };
    handleUpdateBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id, updates) => {
    handleUpdateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id) => {
    handleUpdateBlocks(blocks.filter(b => b.id !== id));
  };

  const handleCreateTemplate = () => {
    if (!isPremium && (settings.party_templates || []).length >= 5) {
      showToast(
        lang === 'tr' 
          ? "Freemium sunucular en fazla 5 şablon oluşturabilir! Fazlası için lütfen Premium pakete geçin." 
          : "Freemium servers can create a maximum of 5 templates! Upgrade to Premium for unlimited templates.", 
        "error"
      );
      return;
    }
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-slide-up">
      {/* Datalists for Autocomplete */}
      <datalist id="weapons-list">{albionWeapons.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="heads-list">{albionHeads.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="chests-list">{albionChests.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="shoes-list">{albionShoes.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="potions-list">{albionPotions.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="foods-list">{albionFoods.map(w => <option key={w} value={w} />)}</datalist>

      <div className="glass-panel relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-4 flex flex-col">
        <div className="p-6 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-highest/30">
          <h2 className="font-headline-md text-xl text-on-surface flex items-center gap-2 uppercase tracking-tight m-0">
            <Copy className="text-primary-container" /> {lang === 'en' ? 'Templates' : 'Şablonlar'}
            <InfoTooltip text={lang === 'en' ? 'Create reusable party setups. Use the /temp command in Discord to quickly start a party using these templates.' : 'Tekrar kullanılabilir parti ayarları oluşturun. Discord\'da /temp komutunu kullanarak bu şablonlarla saniyeler içinde parti kurabilirsiniz.'} />
          </h2>
          <button 
            className={`p-2 bg-surface-container border border-outline-variant rounded-sm transition-colors text-on-surface-variant ${(!isPremium && (settings.party_templates || []).length >= 5) ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-container hover:text-primary-container'}`} 
            onClick={handleCreateTemplate}
            title={!isPremium && (settings.party_templates || []).length >= 5 ? (lang === 'tr' ? 'Yeni şablonlar eklemek için Premium pakete geçin.' : 'Upgrade to Premium to add more templates.') : ''}
          >
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

      <div className="glass-panel p-8 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors md:col-span-8">
        {!selectedTemplate ? (
          <div className="h-full min-h-[400px] flex items-center justify-center text-on-surface-variant font-body-md bg-surface-container-lowest/50 border border-dashed border-outline-variant/50 rounded-sm">
            {lang === 'en' ? 'Select or create a template to edit.' : 'Düzenlemek için bir şablon seçin veya oluşturun.'}
          </div>
        ) : (
          <div className="animate-slide-up">
            <h3 className="font-headline-lg text-2xl text-on-surface mb-8 pb-4 border-b border-outline-variant/50 uppercase tracking-tight">{lang === 'en' ? 'Edit Template' : 'Şablonu Düzenle'}</h3>
            
            <div className="mb-6">
              <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {lang === 'en' ? 'Template Name' : 'Şablon Adı'}
                <InfoTooltip text={lang === 'en' ? 'Give your template a clear name (e.g., ZvZ Build, Fame Farm).' : 'Şablonunuza net bir isim verin (Örn: ZvZ Setup, Fame Farm).'} />
              </label>
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
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center text-sm font-label-bold text-on-surface-variant uppercase tracking-widest">
                  {lang === 'en' ? 'Party Content Builder' : 'Parti İçerik Oluşturucu'}
                  <InfoTooltip text={lang === 'en' ? 'Add headers and roles visually.' : 'Başlık ve roller ekleyerek partinizi görsel olarak kurun.'} />
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addBlock('header')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-sm text-sm font-label-bold text-on-surface hover:border-primary-container hover:text-primary-container transition-colors"
                  >
                    <PlusCircle size={14} /> {lang === 'en' ? 'Add Header' : 'Başlık Ekle'}
                  </button>
                  <button 
                    onClick={() => addBlock('role')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-container/20 border border-primary-container/50 rounded-sm text-sm font-label-bold text-primary-container hover:bg-primary-container hover:text-on-primary transition-colors"
                  >
                    <PlusCircle size={14} /> {lang === 'en' ? 'Add Role' : 'Rol Ekle'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {blocks.length === 0 ? (
                  <div className="p-8 text-center text-on-surface-variant font-body-md border border-dashed border-outline-variant/50 bg-surface-container-lowest/30 rounded-sm">
                    {lang === 'en' ? 'No roles added yet. Start by adding a header or a role.' : 'Henüz rol eklenmedi. Başlık veya rol ekleyerek başlayın.'}
                  </div>
                ) : blocks.map((block) => (
                  <div key={block.id} className="relative group flex items-start gap-2 bg-surface-container-high border border-outline-variant rounded-sm p-3 hover:border-primary-container/50 transition-colors">
                    
                    <div className="mt-2 text-on-surface-variant/50 cursor-grab active:cursor-grabbing hidden md:block">
                      <GripVertical size={18} />
                    </div>

                    <div className="flex-1 w-full">
                      {block.type === 'header' ? (
                        <input 
                          type="text" 
                          value={block.text}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          placeholder={lang === 'en' ? 'Header Name (e.g. Tank)' : 'Başlık Adı (Örn: Tank)'}
                          className="w-full bg-transparent border-b border-primary-container/50 focus:border-primary-container px-2 py-1 text-lg font-headline-md text-primary-container outline-none transition-colors"
                        />
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Weapon' : 'Silah'}</label>
                            <input 
                              list="weapons-list"
                              value={block.weapon}
                              onChange={(e) => updateBlock(block.id, { weapon: e.target.value })}
                              placeholder={lang === 'en' ? 'Role/Weapon' : 'Rol/Silah'}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Head' : 'Başlık'}</label>
                            <input 
                              list="heads-list"
                              value={block.head}
                              onChange={(e) => updateBlock(block.id, { head: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Chest' : 'Zırh'}</label>
                            <input 
                              list="chests-list"
                              value={block.chest}
                              onChange={(e) => updateBlock(block.id, { chest: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Shoes' : 'Ayakkabı'}</label>
                            <input 
                              list="shoes-list"
                              value={block.shoes}
                              onChange={(e) => updateBlock(block.id, { shoes: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Potion' : 'Pot'}</label>
                            <input 
                              list="potions-list"
                              value={block.potion}
                              onChange={(e) => updateBlock(block.id, { potion: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Food' : 'Yemek'}</label>
                            <input 
                              list="foods-list"
                              value={block.food}
                              onChange={(e) => updateBlock(block.id, { food: e.target.value })}
                              className="w-full bg-surface border border-outline-variant rounded-sm px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => removeBlock(block.id)}
                      className="mt-1 md:mt-2 p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
