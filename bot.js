import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { Rcon } from 'rcon-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const SERVER_IP = process.env.SERVER_IP;
const SERVER_PORT = process.env.SERVER_PORT;
const RCON_PASSWORD = process.env.RCON_PASSWORD;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

async function queryServer() {
  const rcon = new Rcon({
    host: SERVER_IP,
    port: parseInt(SERVER_PORT),
    password: RCON_PASSWORD
  });

  try {
    await rcon.connect();
    
    // Get player data
    const playersResponse = await rcon.send('getplayerd');
    const mapResponse = await rcon.send('MAP');
    
    // Parse "Players: X/Y" format
    const playerMatch = playersResponse.match(/Players:\s*(\d+)\/(\d+)/);
    const currentPlayers = playerMatch ? playerMatch[1] : '0';
    const maxPlayers = playerMatch ? playerMatch[2] : '50';
    
    // Parse map response
    const map = mapResponse.trim();
    
    await rcon.end();
    
    return {
      online: true,
      map: map,
      players: `${currentPlayers}/${maxPlayers}`,
      currentPlayers: parseInt(currentPlayers),
      maxPlayers: parseInt(maxPlayers)
    };
  } catch (error) {
    console.error('RCON error:', error.message);
    return {
      online: false,
      error: error.message
    };
  }
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    interaction.reply('Pong!');
  }

  if (interaction.commandName === 'status') {
    const status = await queryServer();
    
    if (!status.online) {
      interaction.reply({
        content: `🦖 **The Isle Evrima Server Status**\n🔴 Status: Offline\nError: ${status.error}`
      });
      return;
    }

    interaction.reply({
      content: `🦖 **The Isle Evrima Server Status**\n🟢 Status: Online\n👥 Players: ${status.players}\n🌍 Map: ${status.map}`
    });
  }

  if (interaction.commandName === 'map') {
    const status = await queryServer();
    
    if (!status.online) {
      interaction.reply(`Error: ${status.error}`);
      return;
    }

    interaction.reply({
      content: `🌍 **Current Map**: ${status.map}`
    });
  }

  if (interaction.commandName === 'status-channel') {
    const status = await queryServer();
    
    const channel = client.channels.cache.get(process.env.STATUS_CHANNEL_ID);
    if (!channel) {
      interaction.reply('Error: Status channel not found');
      return;
    }

    if (!status.online) {
      await channel.send({
        content: `🦖 **The Isle Evrima Server Status**\n🔴 Status: Offline\nError: ${status.error}`
      });
      interaction.reply('✅ Status posted to channel (offline)');
      return;
    }

    await channel.send({
      content: `🦖 **The Isle Evrima Server Status**\n🟢 Status: Online\n👥 Players: ${status.players}\n🌍 Map: ${status.map}`
    });

    interaction.reply('✅ Status posted to channel');
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
