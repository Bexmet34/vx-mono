import { useState, useEffect } from "react";
import { Loader2, Trash2, Eye, Calendar, User, MessageSquare, AlertTriangle, X, Hash, Search, Filter } from "lucide-react";

export default function TicketHistoryTab({ t, lang, guildId, showToast, isPremium }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // New state variables for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

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

  // Filter logic
  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      term === "" || 
      ticket.id.toString().includes(term) || 
      (ticket.owner_name && ticket.owner_name.toLowerCase().includes(term)) ||
      (ticket.owner_id && ticket.owner_id.includes(term)) ||
      (ticket.topic && ticket.topic.toLowerCase().includes(term)) ||
      (ticket.closed_by && ticket.closed_by.toLowerCase().includes(term));

    if (!matchesSearch) return false;
    if (timeFilter === "all") return true;

    const ticketDate = new Date(ticket.closed_at || ticket.created_at);
    const now = new Date();
    
    if (timeFilter === "day") {
      const oneDay = 24 * 60 * 60 * 1000;
      return (now - ticketDate) < oneDay;
    }
    if (timeFilter === "week") {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      return (now - ticketDate) < oneWeek;
    }
    if (timeFilter === "month") {
      return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear();
    }
    if (timeFilter === "year") {
      return ticketDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-4 animate-fade-in pb-12">
      <div className="bg-surface-variant p-4 rounded-lg border border-white/5 shadow-md relative group">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-white/5 pb-4">
          <h3 className="font-headline-md text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="text-primary-container" size={18}/> 
            {lang === 'tr' ? 'Kapatılmış Ticket Geçmişi' : 'Closed Ticket History'}
          </h3>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-70" size={14} />
              <input 
                type="text" 
                placeholder={lang === 'tr' ? 'Kullanıcı, ID veya Konu ara...' : 'Search user, ID or topic...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary-container focus:bg-surface text-on-surface transition-all"
              />
            </div>
            
            <div className="relative w-full sm:w-auto min-w-[140px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-70">
                <Filter size={14} />
              </div>
              <select 
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-md pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-primary-container focus:bg-surface text-on-surface appearance-none cursor-pointer transition-all"
              >
                <option value="all">{lang === 'tr' ? 'Tüm Zamanlar' : 'All Time'}</option>
                <option value="day">{lang === 'tr' ? 'Son 24 Saat (Bugün)' : 'Last 24 Hours (Today)'}</option>
                <option value="week">{lang === 'tr' ? 'Son 1 Hafta' : 'Last 1 Week'}</option>
                <option value="month">{lang === 'tr' ? 'Bu Ay' : 'This Month'}</option>
                <option value="year">{lang === 'tr' ? 'Bu Yıl' : 'This Year'}</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-70">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
           <div className="flex justify-center p-8 text-primary-container"><Loader2 size={32} className="animate-spin" /></div>
        ) : filteredTickets.length === 0 ? (
           <div className="flex flex-col items-center justify-center p-10 text-on-surface-variant bg-surface/30 rounded-lg border border-white/5 border-dashed">
              <MessageSquare size={48} className="opacity-20 mb-3" />
              <p className="text-sm font-medium">
                {searchTerm || timeFilter !== 'all' 
                  ? (lang === 'tr' ? 'Arama kriterlerinize uygun ticket bulunamadı.' : 'No tickets match your search criteria.')
                  : (lang === 'tr' ? 'Henüz kapatılmış bir ticket bulunmuyor.' : 'No closed tickets found yet.')}
              </p>
           </div>
        ) : (
           <div className="overflow-x-auto rounded-lg border border-white/5">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-on-surface-variant font-label-bold bg-surface/80">
                    <th className="p-3">ID</th>
                    <th className="p-3">{lang === 'tr' ? 'Kullanıcı' : 'User'}</th>
                    <th className="p-3">{lang === 'tr' ? 'Konu' : 'Topic'}</th>
                    <th className="p-3">{lang === 'tr' ? 'Kapatan' : 'Closed By'}</th>
                    <th className="p-3">{lang === 'tr' ? 'Tarih' : 'Date'}</th>
                    <th className="p-3 text-right">{lang === 'tr' ? 'İşlemler' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="border-b border-white/5 hover:bg-surface/50 transition-colors text-xs">
                      <td className="p-3 font-mono text-xs text-on-surface-variant">#{ticket.id}</td>
                      <td className="p-3">
                         <div className="flex items-center gap-2 font-medium text-on-surface">
                            <div className="bg-primary-container/20 p-1.5 rounded-full text-primary-container">
                              <User size={14} />
                            </div>
                            {ticket.owner_name || ticket.owner_id}
                         </div>
                      </td>
                      <td className="p-3">
                        <span className="bg-surface border border-white/10 px-2.5 py-1 rounded-md text-xs font-medium text-on-surface-variant shadow-sm">
                          {ticket.topic || 'Genel'}
                        </span>
                      </td>
                      <td className="p-3 text-on-surface-variant">{ticket.closed_by || 'Bilinmiyor'}</td>
                      <td className="p-3 text-on-surface-variant flex items-center gap-1.5 mt-1">
                         <Calendar size={14} className="opacity-70" />
                         {new Date(ticket.closed_at || ticket.created_at).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                           year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                         })}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelectedTranscript(ticket)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-md transition-colors" title="Oku">
                               <Eye size={16} />
                            </button>
                            <button onClick={() => handleDelete(ticket.id)} disabled={deleting} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-md transition-colors disabled:opacity-50" title="Sil">
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
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 md:p-3 animate-fade-in">
           <div className="bg-[#313338] max-w-[800px] w-full max-h-[90vh] rounded-md shadow-2xl flex flex-col border border-white/10 relative overflow-hidden">
              <div className="p-2 border-b border-white/10 flex justify-between items-center bg-[#2b2d31]">
                 <div className="flex items-center gap-2">
                    <Hash size={16} className="text-gray-400" />
                    <div>
                        <h2 className="font-bold text-white text-xs leading-tight">ticket-{selectedTranscript.owner_name}</h2>
                        <span className="text-[10px] text-gray-400">{lang === 'tr' ? 'Ticket Dökümü' : 'Ticket Transcript'}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTranscript(null)} className="text-gray-400 hover:text-white transition-colors p-1"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-4">
                 {!selectedTranscript.transcript || selectedTranscript.transcript.length === 0 ? (
                    <div className="text-center text-gray-400 p-3">{lang === 'tr' ? 'Döküm verisi boş.' : 'Transcript is empty.'}</div>
                 ) : (
                    selectedTranscript.transcript.map((msg, idx) => (
                       <div key={idx} className="flex gap-2 group hover:bg-[#2b2d31]/50 p-1 -mx-2 px-2 rounded">
                          <img src={msg.avatar || "https://cdn.discordapp.com/embed/avatars/0.png"} className="w-10 h-7 rounded-full mt-0.5 object-cover" alt="avatar" />
                          <div className="flex-1 min-w-0">
                             <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-medium text-white text-sm">{msg.author}</span>
                                <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                             </div>
                             <div className="text-[#dbdee1] whitespace-pre-wrap break-words text-[15px] leading-[1.375rem]">{msg.content}</div>
                             {msg.embeds && msg.embeds.map((embed, i) => (
                                 <div key={i} className="mt-2 border-l-4 border-[#5865F2] bg-[#2b2d31] p-3 rounded">
                                     {embed.title && <div className="font-bold text-white mb-1">{embed.title}</div>}
                                     {embed.description && <div className="text-[10px] text-gray-300 whitespace-pre-wrap">{embed.description}</div>}
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
