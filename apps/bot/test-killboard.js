// Test Script for Killboard
require('dotenv').config({ path: __dirname + '/../.env' });
const { Client, GatewayIntentBits } = require('discord.js');
const { runKillboardCheck } = require('./src/services/killboardService');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`Bot logged in as ${client.user.tag}`);
  console.log('Running Killboard Test...');
  try {
    await runKillboardCheck(client);
    console.log('Killboard check completed!');
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN).catch(console.error);
