"use client";

import React, { useState } from "react";
import {
  MessageSquare, UserX, Clock, Trash2, UserPlus,
  Shield, Lock, Unlock, EyeOff, Eye, Users, Type,
  Ban, ShieldCheck, Crown, ArrowRightLeft, ShieldAlert,
  Globe, Send, PhoneOff, UserCheck, RotateCcw
} from "lucide-react";

const INTERFACE_BUTTONS = [
  { id: 'name', label: { tr: 'ODA İSMİ', en: 'NAME' }, icon: Type, color: 'text-gray-300' },
  { id: 'limit', label: { tr: 'ODA LİMİTİ', en: 'LIMIT' }, icon: Users, color: 'text-gray-300' },
  { id: 'privacy', label: { tr: 'GİZLİLİK', en: 'PRIVACY' }, icon: Shield, color: 'text-gray-300' },
  { id: 'waiting_room', label: { tr: 'BEKLEME ODASI', en: 'WAITING ROOM' }, icon: Clock, color: 'text-yellow-400' },
  { id: 'chat', label: { tr: 'SOHBET', en: 'CHAT' }, icon: MessageSquare, color: 'text-gray-300' },
  
  { id: 'trusted', label: { tr: 'GÜVENİLİR', en: 'TRUSTED' }, icon: ShieldCheck, color: 'text-green-400' },
  { id: 'untrusted', label: { tr: 'GÜVENSİZ', en: 'UNTRUSTED' }, icon: ShieldAlert, color: 'text-red-400' },
  { id: 'invite', label: { tr: 'DAVET', en: 'INVITE' }, icon: UserPlus, color: 'text-green-400' },
  { id: 'kick', label: { tr: 'SESTEN AT', en: 'KICK' }, icon: PhoneOff, color: 'text-red-400' },
  { id: 'region', label: { tr: 'BÖLGE', en: 'REGION' }, icon: Globe, color: 'text-gray-300' },
  
  { id: 'block', label: { tr: 'ENGELLE', en: 'BLOCK' }, icon: Ban, color: 'text-red-400' },
  { id: 'unblock', label: { tr: 'ENGELİ KALDIR', en: 'UNBLOCK' }, icon: UserCheck, color: 'text-green-400' },
  { id: 'claim', label: { tr: 'SAHİPLİK', en: 'CLAIM' }, icon: Crown, color: 'text-yellow-500' },
  { id: 'transfer', label: { tr: 'ODAYI DEVRET', en: 'TRANSFER' }, icon: ArrowRightLeft, color: 'text-orange-400' },
  { id: 'delete', label: { tr: 'SİL', en: 'DELETE' }, icon: Trash2, color: 'text-red-500' },
];

const DEFAULT_ACTIVE_BUTTONS = [
  'name', 'limit', 'privacy', 'waiting_room', 'chat',
  'trusted', 'untrusted', 'invite', 'kick', 'region',
  'block', 'unblock', 'claim', 'transfer', 'delete'
];

export default function InterfaceBuilder({ lang, discordChannels, guildId }) {
  const [activeButtons, setActiveButtons] = useState(DEFAULT_ACTIVE_BUTTONS);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Editable Embed Content States
  const [embedTitle, setEmbedTitle] = useState(lang === 'tr' ? 'Veyronix Ses Yönetimi' : 'Veyronix Voice Management');
  const [embedDesc, setEmbedDesc] = useState(lang === 'tr' 
    ? 'Bu panel üzerinden geçici ses kanalınızı dilediğiniz gibi özelleştirebilir ve yönetebilirsiniz.\nDaha fazla seçenek için komutları kullanabilirsiniz.' 
    : 'You can customize and manage your temporary voice channel through this panel.\nUse commands for more options.');
  const [embedFooter, setEmbedFooter] = useState(lang === 'tr' 
    ? 'İşlem yapmak için aşağıdaki uygun butonlara tıklayın.' 
    : 'Click the appropriate buttons below to perform actions.');

  // Inactive buttons are all INTERFACE_BUTTONS not currently in activeButtons
  const inactiveButtons = INTERFACE_BUTTONS.filter(b => !activeButtons.includes(b.id)).map(b => b.id);

  const toggleButton = (id) => {
    if (activeButtons.includes(id)) {
      setActiveButtons(activeButtons.filter(btnId => btnId !== id));
    } else {
      setActiveButtons([...activeButtons, id]);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget);
    // Remove drag image logic for simplicity if it causes issues, but it should be fine
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIdx === null) return;
    const draggedOverItemIdx = index;
    
    if (draggedItemIdx === draggedOverItemIdx) {
      return;
    }
    
    const items = [...activeButtons];
    const draggedItem = items[draggedItemIdx];
    
    items.splice(draggedItemIdx, 1);
    items.splice(draggedOverItemIdx, 0, draggedItem);
    
    setDraggedItemIdx(draggedOverItemIdx);
    setActiveButtons(items);
  };

  const handleDragEnd = () => {
    setDraggedItemIdx(null);
  };

  const handleSend = async () => {
    if (!selectedChannel) return;
    setIsSending(true);
    setSendSuccess(false);

    try {
      const res = await fetch(`/api/send-tempvoice-interface/${guildId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel,
          buttons: activeButtons,
          lang: lang,
          embedTitle: embedTitle,
          embedDesc: embedDesc,
          embedFooter: embedFooter
        })
      });

      if (res.ok) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3000);
      } else {
        console.error("Failed to send interface");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: popIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-headline-bold text-on-surface">
          {lang === 'tr' ? 'Arayüz Görünümü' : 'Interface View'}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {lang === 'tr' 
            ? 'TempVoice Arayüzü ile etkileşime geçerek özelleştirme yapabilirsiniz. Bazı özellikler Premium gerektirir.' 
            : 'You can interact with and customize the TempVoice Interface. Some features require Premium.'}
        </p>
      </div>

      {/* Embed Preview Box */}
      <div className="bg-[#2B2D31] rounded-xl border border-outline-variant p-4 relative flex flex-col gap-4 shadow-xl">
        {/* Header (Author) */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#FF3366] flex items-center justify-center shadow-lg">
              <Globe size={20} className="text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm tracking-wide">TempVoice</span>
              <span className="bg-[#5865F2] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">APP</span>
              <button 
                onClick={() => setActiveButtons(DEFAULT_ACTIVE_BUTTONS)}
                className="text-[#B5BAC1] hover:text-[#DBDEE1] hover:bg-[#383A40] p-1 rounded transition-colors ml-1"
                title={lang === 'tr' ? 'Varsayılan Düzene Sıfırla' : 'Reset to Default Layout'}
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
          <div className="bg-[#FF9900]/20 text-[#FF9900] text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 border border-[#FF9900]/30 shadow-inner">
            <Crown size={12} /> PREMIUM
          </div>
        </div>

        {/* Embed Content */}
        <div className="flex gap-4 bg-[#2B2D31] rounded-lg">
          {/* Left Border */}
          <div className="w-1.5 bg-[#FF3366] rounded-l-lg shrink-0 self-stretch"></div>
          
          <div className="flex flex-col gap-3 p-3 pl-1 w-full bg-[#2B2D31] rounded-r-lg">
            <input 
              type="text"
              value={embedTitle}
              onChange={(e) => setEmbedTitle(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xl font-bold tracking-wide w-full hover:bg-white/5 focus:bg-white/5 rounded px-1 -ml-1 transition-colors"
              placeholder={lang === 'tr' ? 'Başlık girin...' : 'Enter title...'}
            />
            <textarea
              value={embedDesc}
              onChange={(e) => setEmbedDesc(e.target.value)}
              rows={3}
              className="bg-transparent border-none outline-none text-[#DBDEE1] text-sm leading-relaxed w-full resize-none hover:bg-white/5 focus:bg-white/5 rounded px-1 -ml-1 transition-colors"
              placeholder={lang === 'tr' ? 'Açıklama girin...' : 'Enter description...'}
            />
            
            {/* Active Buttons Legend (Inside Canvas - Simulating the Image) */}
            {activeButtons.length > 0 && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-5 gap-2">
                    {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId, idxInRow) => {
                      const index = rowIdx * 5 + idxInRow;
                      const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
                      if (!btn) return null;
                      const Icon = btn.icon;
                      
                      return (
                        <div
                          key={btn.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={handleDragEnd}
                          onClick={() => toggleButton(btn.id)}
                          className={`animate-pop-in flex items-center justify-center gap-1.5 bg-[#2B2D31] hover:bg-[#383A40] transition-colors rounded shadow-sm py-2 px-1 cursor-grab active:cursor-grabbing select-none border border-[#1E1F22] hover:border-[#1E1F22] ${draggedItemIdx === index ? 'opacity-50 ring-1 ring-[#FF3366]' : ''}`}
                        >
                          <Icon size={14} className={btn.color + " shrink-0"} />
                          <span className="text-[#DBDEE1] text-[10px] font-bold uppercase tracking-wider truncate">{btn.label[lang] || btn.label.en}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            <input 
              type="text"
              value={embedFooter}
              onChange={(e) => setEmbedFooter(e.target.value)}
              className="bg-transparent border-none outline-none text-[#949BA4] text-xs mt-2 w-full hover:bg-white/5 focus:bg-white/5 rounded px-1 -ml-1 transition-colors"
              placeholder={lang === 'tr' ? 'Alt başlık girin...' : 'Enter footer...'}
            />
          </div>
        </div>

        {/* Active Buttons (Outside Embed - Real Discord Components Simulation) */}
        {activeButtons.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-5 gap-2">
                {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId) => {
                  const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
                  if (!btn) return null;
                  const Icon = btn.icon;
                  return (
                    <div
                      key={btn.id}
                      className="w-full h-10 rounded flex items-center justify-center bg-[#2B2D31] border border-[#1E1F22] shadow-sm"
                      title={btn.label[lang] || btn.label.en}
                    >
                      <Icon size={18} className={btn.color} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-[#1E1F22]"></div>

        {/* Inactive Buttons Pool */}
        <div className="flex flex-wrap gap-2 mt-2">
          {inactiveButtons.map((btnId) => {
            const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
            if (!btn) return null;
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => toggleButton(btn.id)}
                className="animate-pop-in w-11 h-9 rounded flex items-center justify-center bg-[#2B2D31] border border-[#1E1F22] hover:bg-[#383A40] transition-colors shadow-sm"
                title={btn.label[lang] || btn.label.en}
              >
                <Icon size={18} className={btn.color} />
              </button>
            );
          })}
        </div>

        <p className="text-[#949BA4] text-[11px] mt-1">
          {lang === 'tr' 
            ? 'İstediğiniz bir butonu devre dışı bırakmak için üzerine tıklayın. Yerlerini düzenlemek için sürüklemeyi deneyin.' 
            : 'Click on a button to disable it. Try dragging to rearrange their positions.'}
        </p>
      </div>

      {/* Send Section */}
      <div className="mt-auto pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
          <Send size={18} />
          {lang === 'tr' ? 'Arayüzü Gönder' : 'Send Interface'}
        </div>
        
        <div className="flex gap-2">
          <select 
            className="flex-1 bg-surface-container/30 border border-outline-variant rounded-lg p-3 text-sm text-on-surface focus:border-primary-container hover:border-primary-container outline-none transition-all shadow-inner"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
          >
            <option value="" disabled className="text-on-surface-variant">
              {lang === 'tr' ? 'Metin Kanalı Seçin' : 'Select Text Channel'}
            </option>
            {discordChannels?.filter(c => c.type === 0).map(c => (
              <option key={c.id} value={c.id} className="bg-surface-container-highest">
                # {c.name}
              </option>
            ))}
          </select>
          
          <button 
            onClick={handleSend}
            disabled={!selectedChannel || isSending || activeButtons.length === 0}
            className={`w-14 rounded-lg flex items-center justify-center transition-all ${
              !selectedChannel || isSending || activeButtons.length === 0
                ? 'bg-surface-container border border-outline-variant text-on-surface-variant cursor-not-allowed opacity-70'
                : sendSuccess
                  ? 'bg-green-500/20 text-green-500 border border-green-500/50 hover:bg-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                  : 'bg-surface-container-highest border border-outline-variant hover:border-primary-container text-on-surface hover:text-primary-container shadow-md'
            }`}
          >
            {isSending ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : sendSuccess ? (
              <UserCheck size={20} />
            ) : (
              <Send size={20} className={!selectedChannel || activeButtons.length === 0 ? '' : 'ml-1'} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
