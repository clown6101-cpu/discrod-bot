const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  (async () => {
    try {
      await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
      console.log('Slash commands registered');
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on('interactionCreate', (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  
  if (interaction.commandName === 'ping') {
    interaction.reply('Pong!');
  }
});

client.login(process.env.DISCORD_TOKEN);
