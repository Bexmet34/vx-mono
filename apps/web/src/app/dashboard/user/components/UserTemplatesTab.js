"use client";

import { Copy, Plus, Trash2, GripVertical, PlusCircle, Minus, ClipboardPaste, Sparkles } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { parseTextToBlocks } from "@/utils/templateParser";

export default function UserTemplatesTab({ t, lang, templates, setTemplates, isPremium, showToast }) {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const selectedTemplate = templates.find(tpl => tpl.id === selectedTemplateId) || null;

  const [blocks, setBlocks] = useState([]);
  const [dragInfo, setDragInfo] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showImportBox, setShowImportBox] = useState(false);
  const [importText, setImportText] = useState("");
  
  // Dynamic Supabase item lists
  const [albionWeapons, setAlbionWeapons] = useState([]);
  const [albionHeads, setAlbionHeads] = useState([]);
  const [albionChests, setAlbionChests] = useState([]);
  const [albionShoes, setAlbionShoes] = useState([]);
  const [albionCapes, setAlbionCapes] = useState([]);
  const [albionOffhands, setAlbionOffhands] = useState([]);
  const [albionPotions, setAlbionPotions] = useState([]);
  const [albionFoods, setAlbionFoods] = useState([]);
  const [albionSwaps, setAlbionSwaps] = useState([]);

  useEffect(() => {
    fetch('/api/albion-items')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAlbionWeapons(data.weapons || []);
          setAlbionHeads(data.heads || []);
          setAlbionChests(data.chests || []);
          setAlbionShoes(data.shoes || []);
          setAlbionCapes(data.capes || []);
          setAlbionOffhands(data.offhands || []);
          setAlbionPotions(data.potions || []);
          setAlbionFoods(data.foods || []);
          setAlbionSwaps(data.swaps || []);
        }
      })
      .catch(err => console.error("Failed to fetch items:", err));
  }, []);

  const prevTemplateIdRef = useRef(null);

  // Yalnızca şablon DEĞİŞTİĞİNDE blokları parse et.
  useEffect(() => {
    if (selectedTemplateId !== prevTemplateIdRef.current) {
      prevTemplateIdRef.current = selectedTemplateId;
      if (selectedTemplate) {
        // party_roles is a \n separated string
        const allRoles = selectedTemplate.party_roles ? selectedTemplate.party_roles.split('\n') : [];
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
            const head = gears[0] || "";
            const chest = gears[1] || "";
            const shoes = gears[2] || "";
            const offhand = gears[3] || "";
            const potion = gears[4] || "";
            const food = gears[5] || "";
            const swap = gears[6] || "";
            const cape = gears[7] || "";
            
            let visibleFields = 1;
            if (swap) visibleFields = 9;
            else if (offhand) visibleFields = 8;
            else if (food) visibleFields = 7;
            else if (potion) visibleFields = 6;
            else if (cape) visibleFields = 5;
            else if (shoes) visibleFields = 4;
            else if (chest) visibleFields = 3;
            else if (head) visibleFields = 2;
            else if (gears.length > 0) visibleFields = gears.length + 1;

            parsedBlocks.push({
              id: `blk_${index}_${Date.now()}`,
              type: "role",
              weapon: weaponPart.trim(),
              head,
              chest,
              shoes,
              offhand,
              potion,
              food,
              swap,
              cape,
              visibleFields
            });
          } else {
            parsedBlocks.push({
              id: `blk_${index}_${Date.now()}`,
              type: "role",
              weapon: trimmed,
              head: "", chest: "", shoes: "", cape: "", offhand: "", potion: "", food: "", swap: "",
              visibleFields: 1
            });
          }
        });
        setBlocks(parsedBlocks);
      } else {
        setBlocks([]);
      }
    }
  }, [selectedTemplateId, selectedTemplate]);

  const saveToBackend = async (method, body, successMsg, errMsg) => {
    try {
      const res = await fetch('/api/user-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast(successMsg, "success");
        return { success: true, data };
      } else {
        showToast(data.error || errMsg, "error");
        return { success: false };
      }
    } catch (err) {
      showToast(errMsg, "error");
      return { success: false };
    }
  };

  const handleUpdateBlocks = async (newBlocks) => {
    setBlocks(newBlocks);
    const required_roles = newBlocks.map(b => {
      if (b.type === "header") {
        return `#${b.text}`;
      } else {
        const gearArr = [b.head, b.chest, b.shoes, b.offhand, b.potion, b.food, b.swap, b.cape].map(x => x || "");
        const hasGear = gearArr.some(x => x !== "");
        if (hasGear) {
          const filledGears = gearArr.filter(g => g && g.trim() !== "");
          return `${b.weapon || "Unknown"} > ${filledGears.join(" - ")}`;
        } else {
          return b.weapon || "Unknown";
        }
      }
    });
    
    if (!selectedTemplate) return;
    
    const newRolesText = required_roles.join('\n');
    
    // Update local state first for fast UI
    setTemplates(prev => prev.map(tpl => tpl.id === selectedTemplateId ? { ...tpl, party_roles: newRolesText } : tpl));

    // Update backend (throttled/debounced ideally, but doing it on each update for simplicity)
    await fetch('/api/user-templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedTemplateId,
        templateName: selectedTemplate.template_name,
        header: selectedTemplate.party_header,
        description: selectedTemplate.party_description,
        rolesText: newRolesText
      })
    });
  };

    const addBlock = (type) => {
      const newBlock = type === "header" 
        ? { id: `blk_${Date.now()}_${Math.random()}`, type: "header", text: "" }
        : { id: `blk_${Date.now()}_${Math.random()}`, type: "role", weapon: "", head: "", chest: "", shoes: "", cape: "", offhand: "", potion: "", food: "", swap: "", visibleFields: 1 };
      handleUpdateBlocks([...blocks, newBlock]);
    };

  const updateBlock = (id, updates) => {
    handleUpdateBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBlock = (id) => {
    handleUpdateBlocks(blocks.filter(b => b.id !== id));
  };

  const handleCreateTemplate = async () => {
    if (!isPremium && templates.length >= 5) {
      router.push('/premium');
      return;
    }
    
    const { success, data } = await saveToBackend('POST', {
      templateName: "New Template",
      header: "New Party",
      description: "",
      rolesText: "Role 1"
    }, lang === 'tr' ? 'Şablon eklendi' : 'Template created', lang === 'tr' ? 'Şablon eklenemedi' : 'Failed to create template');

    if (success && data) {
      setTemplates(prev => [...prev, data]);
      setSelectedTemplateId(data.id);
    }
  };

  const handleUpdateTemplateField = async (updates) => {
    if (!selectedTemplate) return;
    
    // Local Update
    const updatedTemplate = { ...selectedTemplate, ...updates };
    setTemplates(prev => prev.map(tpl => tpl.id === selectedTemplateId ? updatedTemplate : tpl));

    // Backend Update
    await fetch('/api/user-templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selectedTemplateId,
        templateName: updatedTemplate.template_name,
        header: updatedTemplate.party_header,
        description: updatedTemplate.party_description,
        rolesText: updatedTemplate.party_roles
      })
    });
  };

  const handleDeleteTemplate = async (id) => {
    const { success } = await saveToBackend('DELETE', null, lang === 'tr' ? 'Şablon silindi' : 'Template deleted', lang === 'tr' ? 'Silinemedi' : 'Failed to delete');
    // For DELETE, need to pass ID in query
    if (!success) {
      const res = await fetch(`/api/user-templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(lang === 'tr' ? 'Şablon silindi' : 'Template deleted', "success");
        setTemplates(prev => prev.filter(tpl => tpl.id !== id));
        if (selectedTemplateId === id) setSelectedTemplateId(null);
      } else {
        showToast(lang === 'tr' ? 'Silinemedi' : 'Failed to delete', "error");
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 animate-slide-up">
      {/* Datalists for Autocomplete */}
      <datalist id="weapons-list">
        {albionWeapons.map(w => {
          const match = w.match(/^(.*?) \((.*?)\)$/);
          return match ? <option key={w} value={match[1]}>{match[1]} ({match[2]})</option> : <option key={w} value={w} />;
        })}
      </datalist>
      <datalist id="heads-list">{albionHeads.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="chests-list">{albionChests.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="shoes-list">{albionShoes.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="capes-list">{albionCapes.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="offhands-list">
        {albionOffhands.map(w => {
          const match = w.match(/^(.*?) \((.*?)\)$/);
          return match ? <option key={w} value={match[1]}>{match[1]} ({match[2]})</option> : <option key={w} value={w} />;
        })}
      </datalist>
      <datalist id="potions-list">{albionPotions.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="foods-list">{albionFoods.map(w => <option key={w} value={w} />)}</datalist>
      <datalist id="swaps-list">
        {albionSwaps.map(w => {
          const match = w.match(/^(.*?) \((.*?)\)$/);
          return match ? <option key={w} value={match[1]}>{match[1]} ({match[2]})</option> : <option key={w} value={w} />;
        })}
      </datalist>

      <div className="glass-panel relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors flex flex-col">
        <div className="p-3 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container-highest/30">
          <h2 className="font-headline-md text-xs text-on-surface flex items-center gap-2 uppercase tracking-tight m-0">
            <Copy className="text-primary-container" /> {lang === 'en' ? 'My Templates' : 'Şablonlarım'}
            <InfoTooltip text={lang === 'en' ? 'Create personal reusable party setups. Use the /mytemps command in Discord.' : 'Kişisel, tekrar kullanılabilir parti ayarları oluşturun. Discord\'da /mytemps komutu ile görebilirsiniz.'} />
          </h2>
          <button 
            className="p-2 bg-surface-container border border-outline-variant rounded-sm transition-colors text-on-surface-variant hover:border-primary-container hover:text-primary-container"
            onClick={handleCreateTemplate}
            title={!isPremium && templates.length >= 5 ? (lang === 'tr' ? 'Daha fazla şablon eklemek için Premium pakete geçin.' : 'Upgrade to Premium to add more templates.') : ''}
          >
             <Plus size={14} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
          {(!templates || templates.length === 0) ? (
            <div className="p-2 text-center text-on-surface-variant font-body-md">{lang === 'en' ? 'No templates yet.' : 'Henüz şablon yok.'}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
              {templates.map(tpl => (
                <div 
                  key={tpl.id} 
                  className={`flex justify-between items-center p-2 border rounded-sm cursor-pointer transition-colors group ${selectedTemplateId === tpl.id ? 'bg-primary-container/10 border-primary-container' : 'border-outline-variant/30 hover:bg-white/5 hover:border-outline-variant'}`}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                >
                  <div className={`font-label-bold ${selectedTemplateId === tpl.id ? 'text-primary-container' : 'text-on-surface'}`}>{tpl.template_name}</div>
                  <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-sm transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl.id); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel p-2 relative overflow-visible border border-outline-variant hover:border-primary-container/50 transition-colors">
        {!selectedTemplate ? (
          <div className="h-full min-h-[400px] flex items-center justify-center text-on-surface-variant font-body-md bg-surface-container-lowest/50 border border-dashed border-outline-variant/50 rounded-sm">
            {lang === 'en' ? 'Select or create a template to edit.' : 'Düzenlemek için bir şablon seçin veya oluşturun.'}
          </div>
        ) : (
          <div className="animate-slide-up">
            <h3 className="font-headline-lg text-[10px] text-on-surface mb-2 pb-4 border-b border-outline-variant/50 uppercase tracking-tight">{lang === 'en' ? 'Edit Template' : 'Şablonu Düzenle'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mb-3">
              <div>
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Template Name (Menu)' : 'Şablon Adı (Menü)'}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
                  value={selectedTemplate.template_name || ""} 
                  onChange={(e) => handleUpdateTemplateField({ template_name: e.target.value })} 
                />
              </div>

              <div>
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">
                  {lang === 'en' ? 'Party Header (Title)' : 'Parti Başlığı (Discord)'}
                </label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md" 
                  value={selectedTemplate.party_header || ""} 
                  onChange={(e) => handleUpdateTemplateField({ party_header: e.target.value })} 
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest mb-2">{lang === 'en' ? 'Description' : 'Açıklama'}</label>
              <textarea 
                className="w-full bg-surface-container-high border border-outline-variant rounded-sm px-2 py-1.5 text-on-surface focus:outline-none focus:border-primary-container transition-colors font-body-md resize-y" 
                rows={2}
                value={selectedTemplate.party_description || ""} 
                onChange={(e) => handleUpdateTemplateField({ party_description: e.target.value })} 
                placeholder={lang === 'en' ? 'Optional description for this party...' : 'Bu parti için isteğe bağlı açıklama...'}
              />
            </div>
            
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center text-[10px] font-label-bold text-on-surface-variant uppercase tracking-widest">
                  {lang === 'en' ? 'Party Content Builder' : 'Parti İçerik Oluşturucu'}
                  <InfoTooltip text={lang === 'en' ? 'Add headers and roles visually.' : 'Başlık ve roller ekleyerek partinizi görsel olarak kurun.'} />
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowImportBox(!showImportBox)}
                    className={`flex items-center gap-1 px-3 py-1.5 border rounded-sm text-[10px] font-label-bold transition-colors ${showImportBox ? 'bg-primary-container text-on-primary border-primary-container' : 'bg-surface-container border-outline-variant text-on-surface hover:border-primary-container hover:text-primary-container'}`}
                  >
                    <ClipboardPaste size={14} /> {lang === 'en' ? 'Import Text' : 'Metinden Aktar'}
                  </button>
                  <button 
                    onClick={() => addBlock('header')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-container border border-outline-variant rounded-sm text-[10px] font-label-bold text-on-surface hover:border-primary-container hover:text-primary-container transition-colors"
                  >
                    <PlusCircle size={14} /> {lang === 'en' ? 'Add Header' : 'Başlık Ekle'}
                  </button>
                  <button 
                    onClick={() => addBlock('role')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary-container/20 border border-primary-container/50 rounded-sm text-[10px] font-label-bold text-primary-container hover:bg-primary-container hover:text-on-primary transition-colors"
                  >
                    <PlusCircle size={14} /> {lang === 'en' ? 'Add Role' : 'Rol Ekle'}
                  </button>
                </div>
              </div>

              {showImportBox && (
                <div className="mb-3 p-3 bg-surface-container-high border border-primary-container/40 rounded-sm animate-pop-in shadow-sm">
                  <label className="block text-[10px] uppercase text-primary-container font-label-bold mb-2">
                    {lang === 'en' ? 'Paste Discord LFG Text Here' : 'Discord Şablonunu Buraya Yapıştırın'}
                  </label>
                  <textarea
                    className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-2 text-[11px] text-on-surface focus:outline-none focus:border-primary-container transition-colors custom-scrollbar mb-2"
                    rows={4}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. TANK : Iron Root (blueflame torch...)\n@user1 - Healer\n...' : 'Örn: TANK : Iron Root (blueflame torch...)\n@isim - Şifacı\n...'}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setShowImportBox(false)}
                      className="px-3 py-1.5 bg-surface border border-outline-variant text-on-surface-variant text-[10px] font-label-bold rounded-sm hover:text-on-surface transition-colors"
                    >
                      {lang === 'en' ? 'Cancel' : 'İptal'}
                    </button>
                    <button 
                      onClick={() => {
                        const parsed = parseTextToBlocks(importText, { albionWeapons, albionHeads, albionChests, albionShoes, albionOffhands, albionPotions, albionFoods, albionSwaps });
                        if (parsed.length > 0) {
                          handleUpdateBlocks([...blocks, ...parsed]);
                          setImportText("");
                          setShowImportBox(false);
                          showToast(lang === 'en' ? `${parsed.length} blocks imported!` : `${parsed.length} satır aktarıldı!`, 'success');
                        } else {
                          showToast(lang === 'en' ? 'No valid blocks found.' : 'Geçerli bir şablon bulunamadı.', 'error');
                        }
                      }}
                      className="px-3 py-1.5 bg-primary-container text-on-primary text-[10px] font-label-bold rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      {lang === 'en' ? 'Parse & Import' : 'Analiz Et ve Ekle'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {blocks.length === 0 ? (
                  <div className="p-2 text-center text-on-surface-variant font-body-md border border-dashed border-outline-variant/50 bg-surface-container-lowest/30 rounded-sm">
                    {lang === 'en' ? 'No roles added yet. Start by adding a header or a role.' : 'Henüz rol eklenmedi. Başlık veya rol ekleyerek başlayın.'}
                  </div>
                ) : blocks.map((block, index) => (
                  <div key={block.id} className="relative">
                    {dragOverIndex === index && (
                      <div className="absolute -top-2 left-0 right-0 h-1 bg-primary-container z-10 rounded-full shadow-[0_0_8px_rgba(255,215,0,0.8)]"></div>
                    )}
                    
                    <div 
                      draggable
                      onDragStart={(e) => {
                        let count = 1;
                        if (block.type === 'header') {
                          for (let i = index + 1; i < blocks.length; i++) {
                            if (blocks[i].type === 'header') break;
                            count++;
                          }
                        }
                        setDragInfo({ startIndex: index, count });
                        e.dataTransfer.setData("text/plain", index);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isBottom = (e.clientY - rect.top) > (rect.height / 2);
                        setDragOverIndex(isBottom ? index + 1 : index);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!dragInfo || dragOverIndex === null) return;
                        if (dragOverIndex >= dragInfo.startIndex && dragOverIndex <= dragInfo.startIndex + dragInfo.count) {
                          setDragInfo(null);
                          setDragOverIndex(null);
                          return;
                        }
                        const newBlocks = [...blocks];
                        const itemsToMove = newBlocks.splice(dragInfo.startIndex, dragInfo.count);
                        let insertIndex = dragOverIndex;
                        if (dragOverIndex > dragInfo.startIndex) {
                          insertIndex -= dragInfo.count;
                        }
                        newBlocks.splice(insertIndex, 0, ...itemsToMove);
                        handleUpdateBlocks(newBlocks);
                        setDragInfo(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragInfo(null);
                        setDragOverIndex(null);
                      }}
                      className={`relative group flex items-start gap-2 bg-surface-container-high border border-outline-variant rounded-sm p-3 transition-all duration-200 
                        ${dragInfo?.startIndex === index ? 'opacity-40 border-primary-container' : 'hover:border-primary-container/50'}
                        ${dragInfo && index > dragInfo.startIndex && index < dragInfo.startIndex + dragInfo.count ? 'opacity-40' : ''}
                      `}
                    >
                      <div className="mt-2 text-on-surface-variant/50 cursor-grab active:cursor-grabbing hidden md:block">
                        <GripVertical size={14} />
                      </div>

                      <div className="flex-1 w-full">
                        {block.type === 'header' ? (
                          <input 
                            type="text" 
                            value={block.text}
                            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                            placeholder={lang === 'en' ? 'Header Name (e.g. Tank)' : 'Başlık Adı (Örn: Tank)'}
                            className="w-full bg-transparent border-b border-primary-container/50 focus:border-primary-container px-2 py-1 text-[10px] font-headline-md text-primary-container outline-none transition-colors"
                          />
                        ) : (
                          <div className="flex flex-wrap items-end gap-2 relative">
                            <div className="flex-1 min-w-[120px]">
                              <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Weapon' : 'Silah'}</label>
                              <input 
                                list="weapons-list"
                                value={block.weapon}
                                onChange={(e) => updateBlock(block.id, { weapon: e.target.value })}
                                placeholder={lang === 'en' ? 'Role/Weapon' : 'Rol/Silah'}
                                className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                              />
                            </div>
                            
                            {(block.visibleFields || 1) >= 2 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Head' : 'Başlık'}</label>
                                <input 
                                  list="heads-list"
                                  value={block.head}
                                  onChange={(e) => updateBlock(block.id, { head: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 3 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Chest' : 'Zırh'}</label>
                                <input 
                                  list="chests-list"
                                  value={block.chest}
                                  onChange={(e) => updateBlock(block.id, { chest: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 4 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Shoes' : 'Ayakkabı'}</label>
                                <input 
                                  list="shoes-list"
                                  value={block.shoes}
                                  onChange={(e) => updateBlock(block.id, { shoes: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 5 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Cape' : 'Pelerin'}</label>
                                <input 
                                  list="capes-list"
                                  value={block.cape || ""}
                                  onChange={(e) => updateBlock(block.id, { cape: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 6 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Potion' : 'Pot'}</label>
                                <input 
                                  list="potions-list"
                                  value={block.potion || ""}
                                  onChange={(e) => updateBlock(block.id, { potion: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 7 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Food' : 'Yemek'}</label>
                                <input 
                                  list="foods-list"
                                  value={block.food || ""}
                                  onChange={(e) => updateBlock(block.id, { food: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 8 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Offhand' : 'İkincil El'}</label>
                                <input 
                                  list="offhands-list"
                                  value={block.offhand || ""}
                                  onChange={(e) => updateBlock(block.id, { offhand: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            {(block.visibleFields || 1) >= 9 && (
                              <div className="flex-1 min-w-[100px] animate-pop-in">
                                <label className="block text-[10px] uppercase text-on-surface-variant mb-1 ml-1">{lang === 'en' ? 'Swap' : 'Değişimlik'}</label>
                                <input 
                                  list="swaps-list"
                                  value={block.swap || ""}
                                  onChange={(e) => updateBlock(block.id, { swap: e.target.value })}
                                  className="w-full bg-surface border border-outline-variant rounded-sm px-2 py-1.5 text-[10px] text-on-surface focus:outline-none focus:border-primary-container transition-colors"
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-1 shrink-0 mb-1">
                              {(block.visibleFields || 1) > 1 && (
                                <button 
                                  onClick={() => {
                                    const fields = ['weapon', 'head', 'chest', 'shoes', 'cape', 'potion', 'food', 'offhand', 'swap'];
                                    const currentCount = block.visibleFields || 1;
                                    const fieldToClear = fields[currentCount - 1];
                                    updateBlock(block.id, { [fieldToClear]: "", visibleFields: Math.max(1, currentCount - 1) });
                                  }}
                                  className="p-1.5 bg-surface border border-outline-variant text-on-surface-variant hover:text-error hover:border-error/50 hover:bg-error/10 rounded-sm transition-colors shadow-sm"
                                  title={lang === 'tr' ? 'Son kutuyu kaldır' : 'Remove last field'}
                                >
                                  <Minus size={14} />
                                </button>
                              )}
                              {(block.visibleFields || 1) < 9 && (
                                <button 
                                  onClick={() => updateBlock(block.id, { visibleFields: (block.visibleFields || 1) + 1 })}
                                  className="p-1.5 bg-primary-container/20 border border-primary-container/50 text-primary-container hover:bg-primary-container hover:text-on-primary rounded-sm transition-colors shadow-sm"
                                  title={lang === 'tr' ? 'Yeni kutu ekle' : 'Add new field'}
                                >
                                  <Plus size={14} />
                                </button>
                              )}
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
                    
                    {index === blocks.length - 1 && dragOverIndex === blocks.length && (
                      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-primary-container z-10 rounded-full shadow-[0_0_8px_rgba(255,215,0,0.8)]"></div>
                    )}
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
