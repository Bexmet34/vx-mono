const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const { generateKillboardImage } = require('./src/utils/killboardImage');
require('dotenv').config({ path: '.env' });

async function sendKillboard() {
  const res = await fetch("https://gameinfo-ams.albiononline.com/api/gameinfo/players/4R-VhZWaQCO9LbxHEhmhCw/kills", { headers: { "User-Agent": "Mozilla/5.0" } });
  const data = await res.json();
  const event = data[0];

  const buffer = await generateKillboardImage(event, false);
  const attachment = new AttachmentBuilder(buffer, { name: 'killboard.png' });

  const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
  client.login(process.env.DISCORD_TOKEN);
  
  client.on('ready', async () => {
    // Veyronix Sunucu ID'si genelde 1021430097615536128 veya support_server
    const vGuild = client.guilds.cache.find(g => g.name.toLowerCase().includes('veyronix') || g.id === '1082239904169336902');
    if(!vGuild) {
       const guild = client.guilds.cache.first();
       const channel = guild.channels.cache.find(c => c.isTextBased());
       await channel.send({ content: "Yeni Killboard KILL (Öldürme) Testi (Melyrion)", files: [attachment] });
       console.log("Sent to " + guild.name);
    } else {
       const channel = vGuild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(client.user).has('SendMessages'));
       await channel.send({ content: "Yeni Killboard KILL (Öldürme) Testi (Melyrion)", files: [attachment] });
       console.log("Sent to Veyronix");
    }
    client.destroy();
  });
}
sendKillboard().catch(console.error);
