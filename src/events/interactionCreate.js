module.exports = {
  name: "interactionCreate",
  async execute(_, interaction) {
    if (!interaction.isChatInputCommand()) return;
    const cmd = interaction.client.slashCommands.get(interaction.commandName);
    if (cmd?.executeSlash) {
      try { await cmd.executeSlash(interaction); }
      catch (e) { interaction.reply({ content: "Error occurred", ephemeral: true }); }
    }
  }
};
