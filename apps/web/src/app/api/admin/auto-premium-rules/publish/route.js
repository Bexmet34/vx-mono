import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing rule ID" }, { status: 400 });

    const { data: rule } = await supabase.from('auto_premium_rules').select('*').eq('id', id).single();
    if (!rule) {
      return NextResponse.json({ error: "Rule not found." }, { status: 404 });
    }

    let requiredServers = rule.discord_servers || [];
    if (typeof requiredServers === 'string') {
        try { requiredServers = JSON.parse(requiredServers); } catch(e) { requiredServers = requiredServers.split(','); }
    }
    requiredServers = Array.isArray(requiredServers) ? requiredServers.map(s => String(s).trim()).filter(Boolean) : [];

    let requiredGuilds = rule.albion_guilds || [];
    if (typeof requiredGuilds === 'string') {
        try { requiredGuilds = JSON.parse(requiredGuilds); } catch(e) { requiredGuilds = requiredGuilds.split(','); }
    }
    requiredGuilds = Array.isArray(requiredGuilds) ? requiredGuilds.map(s => String(s).trim()).filter(Boolean) : [];

    if (requiredServers.length === 0) {
      return NextResponse.json({ error: "Bu kuralda hiçbir Discord sunucusu tanımlı değil." }, { status: 400 });
    }

    const partnerServerId = requiredServers[0];

    // Trigger Bot API
    const botApiUrl = `http://localhost:${process.env.BOT_API_PORT || 3005}/api/partner/publish`;
    const botRes = await fetch(botApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerServerId,
        albionGuilds: requiredGuilds,
        ruleName: rule.rule_name,
        supportChannelId: '1538575675856789544'
      })
    });

    if (!botRes.ok) {
        const botErr = await botRes.json().catch(() => ({ error: 'Bilinmeyen bot hatası' }));
        return NextResponse.json({ error: botErr.error || 'Bot işlemi başarısız oldu.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API /admin/auto-premium-rules/publish Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
