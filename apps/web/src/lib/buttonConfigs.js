import React from 'react';

export const BUTTON_DATA = {
  name: {
    id: 'name',
    label: { tr: 'ODA İSMİ', en: 'NAME' },
    color: '#ffffff',
    emoji: '📝',
    icon: (color = '#ffffff') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    )
  },
  limit: {
    id: 'limit',
    label: { tr: 'ODA LİMİTİ', en: 'LIMIT' },
    color: '#ffffff',
    emoji: '👥',
    icon: (color = '#ffffff') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  privacy: {
    id: 'privacy',
    label: { tr: 'GİZLİLİK', en: 'PRIVACY' },
    color: '#ffffff',
    emoji: '🛡️',
    icon: (color = '#ffffff') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <rect x="9" y="10" width="6" height="5" rx="1" stroke={color} strokeWidth="1.5" />
        <path d="M10 10V8a2 2 0 0 1 4 0v2" stroke={color} strokeWidth="1.5" />
      </svg>
    )
  },
  waiting_room: {
    id: 'waiting_room',
    label: { tr: 'BEKLEME ODASI', en: 'WAITING ROOM' },
    color: '#facc15',
    emoji: '🕒',
    icon: (color = '#facc15') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  chat: {
    id: 'chat',
    label: { tr: 'SOHBET', en: 'CHAT' },
    color: '#ffffff',
    emoji: '💬',
    icon: (color = '#ffffff') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  trusted: {
    id: 'trusted',
    label: { tr: 'GÜVENİLİR', en: 'TRUSTED' },
    color: '#22c55e',
    emoji: '🤝',
    icon: (color = '#22c55e') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <circle cx="18" cy="11" r="4" stroke="#22c55e" strokeWidth="1.8" />
        <polyline points="16.5 11 17.5 12 19.5 10" stroke="#22c55e" strokeWidth="2" />
      </svg>
    )
  },
  untrusted: {
    id: 'untrusted',
    label: { tr: 'GÜVENSİZ', en: 'UNTRUSTED' },
    color: '#ef4444',
    emoji: '⚠️',
    icon: (color = '#ef4444') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <circle cx="18" cy="11" r="4" stroke="#ef4444" strokeWidth="1.8" />
        <line x1="16" y1="9" x2="20" y2="13" stroke="#ef4444" strokeWidth="2" />
        <line x1="20" y1="9" x2="16" y2="13" stroke="#ef4444" strokeWidth="2" />
      </svg>
    )
  },
  invite: {
    id: 'invite',
    label: { tr: 'DAVET', en: 'INVITE' },
    color: '#22c55e',
    emoji: '📩',
    icon: (color = '#22c55e') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        <circle cx="18" cy="6" r="3.5" fill="#22c55e" stroke="none" />
      </svg>
    )
  },
  kick: {
    id: 'kick',
    label: { tr: 'SESTEN AT', en: 'KICK' },
    color: '#ef4444',
    emoji: '📵',
    icon: (color = '#ef4444') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
        <line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" strokeWidth="2.5" />
      </svg>
    )
  },
  region: {
    id: 'region',
    label: { tr: 'BÖLGE', en: 'REGION' },
    color: '#ffffff',
    emoji: '🌍',
    icon: (color = '#ffffff') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    )
  },
  block: {
    id: 'block',
    label: { tr: 'ENGELLE', en: 'BLOCK' },
    color: '#ef4444',
    emoji: '🚫',
    icon: (color = '#ef4444') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <circle cx="18" cy="11" r="4.5" stroke="#ef4444" strokeWidth="2" />
        <line x1="15" y1="14" x2="21" y2="8" stroke="#ef4444" strokeWidth="2" />
      </svg>
    )
  },
  unblock: {
    id: 'unblock',
    label: { tr: 'ENGELİ KALDIR', en: 'UNBLOCK' },
    color: '#22c55e',
    emoji: '✅',
    icon: (color = '#22c55e') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <circle cx="18" cy="11" r="4.5" stroke="#22c55e" strokeWidth="2" />
        <polyline points="15.5 11 17.5 13 20.5 9" stroke="#22c55e" strokeWidth="2" />
      </svg>
    )
  },
  claim: {
    id: 'claim',
    label: { tr: 'SAHİPLEN', en: 'CLAIM' },
    color: '#f59e0b',
    emoji: '👑',
    icon: (color = '#f59e0b') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z" />
      </svg>
    )
  },
  transfer: {
    id: 'transfer',
    label: { tr: 'ODAYI DEVRET', en: 'TRANSFER' },
    color: '#f97316',
    emoji: '🔀',
    icon: (color = '#f97316') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    )
  },
  delete: {
    id: 'delete',
    label: { tr: 'SİL', en: 'DELETE' },
    color: '#ef4444',
    emoji: '🗑️',
    icon: (color = '#ef4444') => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    )
  },
};
