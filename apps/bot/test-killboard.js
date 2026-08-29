require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { runKillboardCheck } = require('./src/services/killboardService');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log('Bot logged in as', client.user.tag);
  console.log('Running killboard check manually...');
  try {
    await runKillboardCheck(client);
    console.log('Killboard check completed successfully.');
  } catch (err) {
    console.error('Killboard check failed:', err);
  }
  setTimeout(() => process.exit(0), 10000); // give it time to finish sending
});

client.login(process.env.DISCORD_TOKEN);
