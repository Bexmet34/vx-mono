import { notFound } from "next/navigation";
import CtaBanner from "@/components/CtaBanner";
import Link from "next/link";
import { Shield, Users, Sword, Skull, Trophy } from "lucide-react";

import { fetchAlbion } from "@/utils/albion";

export const revalidate = 600; // Cache guild page for 10 minutes (ISR)

const REGIONS = {
  europe: "https://gameinfo-ams.albiononline.com/api/gameinfo",
  americas: "https://gameinfo.albiononline.com/api/gameinfo",
  asia: "https://gameinfo-sgp.albiononline.com/api/gameinfo",
};

// Fetch Guild from Albion API
async function getGuild(server, guildId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    return await fetchAlbion(`${baseUrl}/guilds/${guildId}`);
  } catch (err) {
    console.error("Error fetching guild:", err);
    return null;
  }
}

// Fetch Guild Members from Albion API
async function getGuildMembers(server, guildId) {
  const baseUrl = REGIONS[server.toLowerCase()] || REGIONS.europe;
  try {
    const data = await fetchAlbion(`${baseUrl}/guilds/${guildId}/members`);
    return data || [];
  } catch (err) {
    console.error("Error fetching guild members:", err);
    return [];
  }
}

export default async function GuildProfilePage({ params }) {
  const { server, guildId } = await params;
  
  const [guild, members] = await Promise.all([
    getGuild(server, guildId),
    getGuildMembers(server, guildId)
  ]);
  
  if (!guild) {
    notFound();
  }

  // Sort members by Kill Fame descending to get "Top Killers"
  const topMembers = members ? members.sort((a, b) => (b.KillFame || 0) - (a.KillFame || 0)).slice(0, 15) : [];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-32 text-white">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/15 border border-primary-container/30 text-primary-container text-xs font-bold uppercase tracking-wider mb-2">
          <Shield size={14} /> {server.toUpperCase()} SUNUCUSU
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight break-words">
          {guild.Name}
        </h1>
        {guild.AllianceName && (
          <p className="text-on-surface-variant text-sm mt-1">
            [{guild.AllianceTag}] {guild.AllianceName}
          </p>
        )}
      </div>

      {/* Guild Stats Card */}
      <div className="bg-[#12141c]/95 border border-primary-container/30 rounded-2xl p-5 sm:p-8 mb-10 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          
          <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-4">
            <div className="text-xs font-bold text-on-surface-variant flex items-center justify-center gap-1.5 mb-1">
              <Sword size={15} className="text-emerald-400" /> Kill Fame
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400">
              {guild.killFame?.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/40 border border-red-500/30 rounded-xl p-4">
            <div className="text-xs font-bold text-on-surface-variant flex items-center justify-center gap-1.5 mb-1">
              <Skull size={15} className="text-red-400" /> Death Fame
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-red-400">
              {guild.DeathFame?.toLocaleString()}
            </div>
          </div>

          <div className="bg-black/40 border border-primary-container/30 rounded-xl p-4">
            <div className="text-xs font-bold text-on-surface-variant flex items-center justify-center gap-1.5 mb-1">
              <Users size={15} className="text-primary-container" /> Üye Sayısı
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-primary-container">
              {guild.MemberCount || members?.length || 0}
            </div>
          </div>

        </div>
      </div>

      {/* Top 15 Killers Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-primary-container" />
          <h2 className="text-lg sm:text-xl font-bold text-white">
            En Çok Kill Alan Üyeler (Top 15 Killers)
          </h2>
        </div>

        {topMembers.length > 0 ? (
          <div className="bg-[#0f1118]/90 border border-outline-variant/30 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-xl">
            {topMembers.map((member, index) => (
              <Link 
                href={`/player/${server}/${member.Id}`} 
                key={member.Id}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-white text-xs sm:text-sm truncate hover:text-primary-container">{member.Name}</div>
                    <div className="text-[10px] text-on-surface-variant">Fame Oranı: {member.FameRatio?.toFixed(2) || 0}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                    {member.KillFame?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">Kill Fame</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-surface-container-high/40 rounded-2xl border border-outline-variant/30 text-on-surface-variant text-xs">
            Üye verisi bulunamadı.
          </div>
        )}
      </div>

      <CtaBanner />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const { server, guildId } = await params;
  const guild = await getGuild(server, guildId);
  
  if (!guild) return { title: "Guild Not Found" };
  
  return {
    title: `${guild.Name} | Albion Online Lonca Profili | Veyronix`,
    description: `Albion Online Loncası: ${guild.Name}. Kill Fame: ${guild.killFame?.toLocaleString()}, Üye Sayısı: ${guild.MemberCount} on ${server}.`,
    openGraph: {
      title: `${guild.Name} | Guild Profile`,
      description: `Server: ${server.toUpperCase()} | Members: ${guild.MemberCount}\nKill Fame: ${guild.killFame?.toLocaleString()}`,
      siteName: 'Veyronix',
      type: 'website',
    }
  };
}
