import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
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
        type: 'protocol-valve',
        host: SERVER_IP,
        port: SERVER_PORT
      });

      interaction.reply({
        content: `🦖 **The Isle Evrima Server Status**\n🟢 Status: Online\n👥 Players: ${state.players.length}/${state.maxplayers}\n📡 Ping: ${state.ping}ms\n🌍 Map: ${state.map}`
      });
    } catch (error) {
      console.error('Gamedig error:', error.message);
      interaction.reply({
        content: `🦖 **The Isle Evrima Server Status**\n🔴 Status: Offline or unreachable\nError: ${error.message}`
      });
    }
  }

  if (interaction.commandName === 'map') {
    try {
      const state = await Gamedig.query({
        type: 'protocol-valve',
        host: SERVER_IP,
        port: SERVER_PORT
      });

      interaction.reply({
        content: `🌍 **Current Map**: ${state.map}`
      });
    } catch (error) {
      console.error('Gamedig error:', error.message);
      interaction.reply({
        content: `Error fetching map: ${error.message}`
      });
    }
  }

  if (interaction.commandName === 'status-channel') {
    try {
      const state = await Gamedig.query({
        type: 'protocol-valve',
        host: SERVER_IP,
        port: SERVER_PORT
      });

      const channel = client.channels.cache.get(process.env.STATUS_CHANNEL_ID);
      if (!channel) {
        interaction.reply('Error: Status channel not found');
        return;
      }

      await channel.send({
        content: `🦖 **The Isle Evrima Server Status**\n🟢 Status: Online\n👥 Players: ${state.players.length}/${state.maxplayers}\n📡 Ping: ${state.ping}ms\n🌍 Map: ${state.map}`
      });

      interaction.reply('✅ Status posted to channel');
    } catch (error) {
      console.error('Gamedig error:', error.message);
      interaction.reply({
        content: `Error: ${error.message}`
      });
    }
  }
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!'
  },
  {
    name: 'status',
    description: 'Shows The Isle Evrima server status'
  },
  {
    name: 'map',
    description: 'Shows the current map'
  },
  {
    name: 'status-channel',
    description: 'Posts server status to the status channel'
  }
];

(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
})();

client.login(process.env.DISCORD_TOKEN);
