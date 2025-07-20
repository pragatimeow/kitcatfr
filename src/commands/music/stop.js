const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  name: 'stop',
  description: '⏹ Stop the music and leave the voice channel',
  aliases: ['leave', 'disconnect'],
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('⏹ Stop the music and leave the voice channel'),

  async executeSlash(interaction) {
    const player = interaction.client.kazagumo.players.get(interaction.guild.id);
    if (!player) return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });

    player.destroy();

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setTitle('⏹ Music Stopped')
      .setDescription('Left the voice channel and cleared the queue.');

    await interaction.reply({ embeds: [embed] });
  },

  async executePrefix(message) {
    const player = message.client.kazagumo.players.get(message.guild.id);
    if (!player) return message.reply('❌ Nothing is playing right now.');

    player.destroy();

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setTitle('⏹ Music Stopped')
      .setDescription('Left the voice channel and cleared the queue.');

    await message.channel.send({ embeds: [embed] });
  },
};
