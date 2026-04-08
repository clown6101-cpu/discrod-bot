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
