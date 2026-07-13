import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, Calendar, User, MessageSquare, AlertTriangle, X } from "lucide-react";

export default function TicketHistoryTab({ t, lang, guildId, showToast, isPremium }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ticket/history/${guildId}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets || []);
      } else {
        showToast(data.error || 'Geçmiş alınamadı', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [guildId]);

  const handleDelete = async (id) => {
    if (!confirm(lang === 'tr' ? 'Bu kaydı kalıcı olarak silmek istediğinize emin misiniz?' : 'Are you sure you want to permanently delete this record?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ticket/history/${guildId}?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(lang === 'tr' ? 'Kayıt silindi.' : 'Record deleted.', 'success');
        setTickets(tickets.filter(t => t.id !== id));
      } else {
        const data = await res.json();
        showToast(data.error || 'Silinemedi', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 animate-fade-in pb-12">
      <div className="bg-surface-variant p-6 rounded-md border border-white/5 shadow-sm relative group">
        <h3 className="font-headline-md text-lg text-on-surface mb-6 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="text-primary-container" size={20}/> 
          {lang === 'tr' ? 'Kapatılmış Ticket Geçmişi' : 'Closed Ticket History'}
        </h3>
        
        {loading ? (
           <div className="flex justify-center p-12 text-primary-container"><Loader2 size={32} className="animate-spin" /></div>
        ) : tickets.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-12 text-on-surface-variant bg-surface rounded border border-white/5">
              <MessageSquare size={48} className="opacity-20 mb-4" />
              <p>{lang === 'tr' ? 'Henüz kapatılmış bir ticket bulunmuyor.' : 'No closed tickets found yet.'}</p>
           </div>
        ) : (
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-on-surface-variant font-label-bold bg-surface/50">
                   <th className="p-4 rounded-tl-sm">ID</th>
                   <th className="p-4">{lang === 'tr' ? 'Kullanıcı' : 'User'}</th>
                   <th className="p-4">{lang === 'tr' ? 'Konu' : 'Topic'}</th>
                   <th className="p-4">{lang === 'tr' ? 'Kapatan' : 'Closed By'}</th>
                   <th className="p-4">{lang === 'tr' ? 'Tarih' : 'Date'}</th>
                   <th className="p-4 text-right rounded-tr-sm">{lang === 'tr' ? 'İşlemler' : 'Actions'}</th>
                 </tr>
               </thead>
               <tbody>
                 {tickets.map(ticket => (
                   <tr key={ticket.id} className="border-b border-white/5 hover:bg-surface/50 transition-colors text-sm">
                     <td className="p-4 font-mono text-xs text-on-surface-variant">#{ticket.id}</td>
                     <td className="p-4">
                        <div className="flex items-center gap-2">
                           <User size={14} className="text-primary-container" />
                           {ticket.owner_name || ticket.owner_id}
                        </div>
                     </td>
                     <td className="p-4"><span className="bg-surface border border-white/10 px-2 py-1 rounded text-xs">{ticket.topic || 'Genel'}</span></td>
                     <td className="p-4 text-on-surface-variant">{ticket.closed_by || 'Bilinmiyor'}</td>
                     <td className="p-4 text-on-surface-variant flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(ticket.closed_at || ticket.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')}
                     </td>
                     <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedTranscript(ticket)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition-colors" title="Oku">
                               <Eye size={16} />
                            </button>
                            <button onClick={() => handleDelete(ticket.id)} disabled={deleting} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors disabled:opacity-50" title="Sil">
                               <Trash2 size={16} />
                            </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}
      </div>

      {selectedTranscript && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 md:p-8 animate-fade-in">
           <div className="bg-[#313338] max-w-[800px] w-full max-h-[90vh] rounded-md shadow-2xl flex flex-col border border-white/10 relative overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#2b2d31]">
                 <div className="flex items-center gap-3">
                    <Hash size={24} className="text-gray-400" />
                    <div>
                        <h2 className="font-bold text-white text-lg leading-tight">ticket-{selectedTranscript.owner_name}</h2>
                        <span className="text-xs text-gray-400">{lang === 'tr' ? 'Ticket Dökümü' : 'Ticket Transcript'}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTranscript(null)} className="text-gray-400 hover:text-white transition-colors p-1"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                 {!selectedTranscript.transcript || selectedTranscript.transcript.length === 0 ? (
                    <div className="text-center text-gray-400 p-8">{lang === 'tr' ? 'Döküm verisi boş.' : 'Transcript is empty.'}</div>
                 ) : (
                    selectedTranscript.transcript.map((msg, idx) => (
                       <div key={idx} className="flex gap-4 group hover:bg-[#2b2d31]/50 p-1 -mx-2 px-2 rounded">
                          <img src={msg.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-10 h-10 rounded-full mt-0.5 object-cover" alt="avatar" />
                          <div className="flex-1 min-w-0">
                             <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-medium text-white">{msg.author}</span>
                                <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                             </div>
                             <div className="text-[#dbdee1] whitespace-pre-wrap break-words text-[15px] leading-[1.375rem]">{msg.content}</div>
                             {msg.embeds && msg.embeds.map((embed, i) => (
                                 <div key={i} className="mt-2 border-l-4 border-[#5865F2] bg-[#2b2d31] p-3 rounded">
                                     {embed.title && <div className="font-bold text-white mb-1">{embed.title}</div>}
                                     {embed.description && <div className="text-sm text-gray-300 whitespace-pre-wrap">{embed.description}</div>}
                                 </div>
                             ))}
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
