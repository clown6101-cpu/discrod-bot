import { Client, GatewayIntentBits } from 'discord.js';
import Gamedig from 'gamedig';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = process.env.SERVER_PORT;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    interaction.reply('Pong!');
  }

  if (interaction.commandName === 'status') {
    try {
      const state = await Gamedig.query({
        type: 'theisle',
        host: SERVER_IP,
        port: SERVER_PORT
      });

      interaction.reply({
        content: `🦖 **The Isle Evrima Server Status**
🟢 Status: Online
👥 Players: ${state.players.length}/${state.maxplayers}
📡 Ping: ${state.ping}ms
🌍 Map: ${state.map}`
      });
    } catch (error) {
      console.error('Gamedig error:', error.message);
      interaction.reply({
        content: `🦖 **The Isle Evrima Server Status**
🔴 Status: Offline or unreachable
Error: ${error.message}`
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
