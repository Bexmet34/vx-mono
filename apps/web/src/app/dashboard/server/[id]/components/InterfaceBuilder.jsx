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

const DEFAULT_TITLE = 'Veyronix Voice Management';
const DEFAULT_DESC = 'You can customize and manage your temporary voice channel through this panel.\nUse commands for more options.';
const DEFAULT_FOOTER = 'Click the appropriate buttons below to perform actions.';

export default function InterfaceBuilder({ lang, discordChannels, guildId }) {
  const [activeButtons, setActiveButtons] = useState(DEFAULT_ACTIVE_BUTTONS);
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Editable Embed Content States
  const [embedTitle, setEmbedTitle] = useState(DEFAULT_TITLE);
  const [embedDesc, setEmbedDesc] = useState(DEFAULT_DESC);
  const [embedFooter, setEmbedFooter] = useState(DEFAULT_FOOTER);

  // Inactive buttons are all INTERFACE_BUTTONS not currently in activeButtons
  const inactiveButtons = INTERFACE_BUTTONS.filter(b => !activeButtons.includes(b.id)).map(b => b.id);

  const toggleButton = (id) => {
    if (activeButtons.includes(id)) {
      setActiveButtons(activeButtons.filter(btnId => btnId !== id));
    } else {
      setActiveButtons([...activeButtons, id]);
    }
  };

  const handleReset = () => {
    setActiveButtons(DEFAULT_ACTIVE_BUTTONS);
    setEmbedTitle(DEFAULT_TITLE);
    setEmbedDesc(DEFAULT_DESC);
    setEmbedFooter(DEFAULT_FOOTER);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItemIdx === null || draggedItemIdx === index) return;
    
    const items = [...activeButtons];
    const draggedItem = items[draggedItemIdx];
    items.splice(draggedItemIdx, 1);
    items.splice(index, 0, draggedItem);
    
    setDraggedItemIdx(index);
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
          0% { opacity: 0; transform: scale(0.9) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-headline-bold text-on-surface">
          {lang === 'tr' ? 'Arayüz Görünümü' : 'Interface View'}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {lang === 'tr' 
            ? 'Embed içeriğini düzenleyin, butonları seçip sıralayın, ardından gönderin.' 
            : 'Edit embed content, select & reorder buttons, then send.'}
        </p>
      </div>

      {/* ===== DISCORD EMBED PREVIEW ===== */}
      <div className="bg-[#313338] rounded-xl border border-[#1E1F22] p-4 flex flex-col gap-3 shadow-xl">

        {/* Bot Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#FF3366] flex items-center justify-center shadow">
              <Globe size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">VoiceForge</span>
            <span className="bg-[#5865F2] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">APP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[#FF9900]/20 text-[#FF9900] text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 border border-[#FF9900]/30">
              <Crown size={11} /> PREMIUM
            </div>
            <button
              onClick={handleReset}
              className="text-[#B5BAC1] hover:text-white hover:bg-[#383A40] p-1.5 rounded transition-colors"
              title={lang === 'tr' ? 'Varsayılana Sıfırla' : 'Reset to Default'}
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* ===== CANVAS: Embed box (READ-ONLY image-like preview) ===== */}
        <div className="flex gap-0 rounded-lg overflow-hidden bg-[#2B2D31] pointer-events-none select-none">
          {/* Red left border stripe */}
          <div className="w-1 bg-[#FF3366] shrink-0" />

          {/* Embed body */}
          <div className="flex flex-col gap-2 px-3 py-3 w-full">
            {/* Title */}
            <p className="text-white text-base font-bold tracking-wide leading-tight">
              {embedTitle || 'Voice Management'}
            </p>

            {/* Description */}
            <p className="text-[#DBDEE1] text-[13px] leading-relaxed whitespace-pre-line">
              {embedDesc}
            </p>

            {/* Active buttons rendered as image-like legend inside canvas */}
            {activeButtons.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
                    {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId) => {
                      const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
                      if (!btn) return null;
                      const Icon = btn.icon;
                      return (
                        <div
                          key={btn.id}
                          className="flex items-center justify-center gap-1 bg-[#232428] rounded py-1.5 px-1 border border-[#1E1F22]"
                        >
                          <Icon size={12} className={btn.color + " shrink-0"} />
                          <span className="text-[#DBDEE1] text-[9px] font-bold uppercase tracking-wider truncate">
                            {btn.label.en}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {embedFooter && (
              <p className="text-[#949BA4] text-[11px] mt-1 border-t border-[#1E1F22] pt-1.5">
                {embedFooter}
              </p>
            )}
          </div>
        </div>

        {/* ===== EDITABLE FIELDS (below the embed) ===== */}
        <div className="flex flex-col gap-2 pt-1">
          <label className="text-[#949BA4] text-[10px] uppercase tracking-wider font-bold">
            {lang === 'tr' ? 'Embed İçeriği' : 'Embed Content'}
          </label>
          <input
            type="text"
            value={embedTitle}
            onChange={(e) => setEmbedTitle(e.target.value)}
            className="bg-[#1E1F22] border border-[#3A3C40] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#FF3366] transition-colors placeholder:text-[#4E5058]"
            placeholder="Title..."
          />
          <textarea
            value={embedDesc}
            onChange={(e) => setEmbedDesc(e.target.value)}
            rows={2}
            className="bg-[#1E1F22] border border-[#3A3C40] rounded-lg px-3 py-2 text-[#DBDEE1] text-sm outline-none focus:border-[#FF3366] transition-colors resize-none placeholder:text-[#4E5058]"
            placeholder="Description..."
          />
          <input
            type="text"
            value={embedFooter}
            onChange={(e) => setEmbedFooter(e.target.value)}
            className="bg-[#1E1F22] border border-[#3A3C40] rounded-lg px-3 py-2 text-[#949BA4] text-xs outline-none focus:border-[#FF3366] transition-colors placeholder:text-[#4E5058]"
            placeholder="Footer..."
          />
        </div>

        {/* ===== DIVIDER ===== */}
        <div className="w-full h-px bg-[#1E1F22]" />

        {/* ===== ACTIVE BUTTONS POOL (draggable + click to remove) ===== */}
        <div className="flex flex-col gap-2">
          <label className="text-[#949BA4] text-[10px] uppercase tracking-wider font-bold">
            {lang === 'tr' ? 'Aktif Butonlar' : 'Active Buttons'}
            <span className="ml-1 text-[#5865F2]">({activeButtons.length}/15)</span>
          </label>

          {activeButtons.length === 0 ? (
            <p className="text-[#4E5058] text-xs italic text-center py-3">
              {lang === 'tr' ? 'Henüz aktif buton yok.' : 'No active buttons yet.'}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {Array.from({ length: Math.ceil(activeButtons.length / 5) }).map((_, rowIdx) => (
                <div key={rowIdx} className="grid grid-cols-5 gap-1.5">
                  {activeButtons.slice(rowIdx * 5, (rowIdx + 1) * 5).map((btnId, idxInRow) => {
                    const index = rowIdx * 5 + idxInRow;
                    const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
                    if (!btn) return null;
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDragEnd}
                        onClick={() => toggleButton(btn.id)}
                        title={`${btn.label[lang] || btn.label.en} — ${lang === 'tr' ? 'kaldırmak için tıkla' : 'click to remove'}`}
                        className={`animate-pop-in flex items-center justify-center gap-1 rounded py-2 px-1 cursor-grab active:cursor-grabbing select-none border transition-colors ${
                          draggedItemIdx === index
                            ? 'bg-[#FF3366]/20 border-[#FF3366] opacity-70'
                            : 'bg-[#232428] border-[#3A3C40] hover:border-red-500/60 hover:bg-red-500/10'
                        }`}
                      >
                        <Icon size={13} className={btn.color + " shrink-0"} />
                        <span className="text-[#DBDEE1] text-[9px] font-bold uppercase tracking-wider truncate">
                          {btn.label.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          <p className="text-[#4E5058] text-[10px]">
            {lang === 'tr' 
              ? 'Sürükleyerek sırala • Tıklayarak kaldır' 
              : 'Drag to reorder • Click to remove'}
          </p>
        </div>

        {/* ===== INACTIVE BUTTONS POOL ===== */}
        {inactiveButtons.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-[#949BA4] text-[10px] uppercase tracking-wider font-bold">
              {lang === 'tr' ? 'Pasif Butonlar' : 'Inactive Buttons'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {inactiveButtons.map((btnId) => {
                const btn = INTERFACE_BUTTONS.find(b => b.id === btnId);
                if (!btn) return null;
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.id}
                    onClick={() => toggleButton(btn.id)}
                    title={`${btn.label[lang] || btn.label.en} — ${lang === 'tr' ? 'eklemek için tıkla' : 'click to add'}`}
                    className="animate-pop-in flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1E1F22] border border-[#3A3C40] hover:border-green-500/60 hover:bg-green-500/10 transition-colors"
                  >
                    <Icon size={13} className={btn.color} />
                    <span className="text-[#6D6F78] text-[9px] font-bold uppercase tracking-wider">
                      {btn.label.en}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[#4E5058] text-[10px]">
              {lang === 'tr' ? 'Eklemek için tıkla' : 'Click to add'}
            </p>
          </div>
        )}
      </div>

      {/* ===== SEND SECTION ===== */}
      <div className="mt-auto pt-2 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-on-surface font-label-bold text-sm tracking-wide">
          <Send size={16} />
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
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : sendSuccess ? (
              <UserCheck size={20} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
